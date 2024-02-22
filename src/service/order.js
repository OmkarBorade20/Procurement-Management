const mongo=require('../repository/mongorepo')
const common=require('../helperModules/commonUtiles')
const queries=require('../queries/index')

module.exports.create=async (req,res)=>{
    let input=req.body;
    //fetch client details
    let query={
        "client-name":input["client-name"],
    }
    let client_details=await mongo.findQuery("client-details",query)
    console.log("client_details :",client_details)

    if(client_details.length==0)
    {
        req.res.message=`${input["client-name"]} : Client is Not Registerd,Contact Admin Team.!`;
        return req;
    }

    //fetch checklist details.
    let checklist=[];
    let checklistid="";
    if(input["checklist-id"]!= undefined && input["checklist-id"] !='')
    {
        checklistid=input["checklist-id"];
        let q={
            "checklist-id":checklistid
        }
        checklist=await mongo.findQuery("checklists",q)
        //checklist validation.
        if (checklist.length==0)
        {
            req.res.message=`Entered Checklist id is not a valid one.`
            return req;
        }

        //entered checklist id and pm creation must be same .
        if(checklist[0]["procurement-manager"]!=req.user.email)
        {
            req.res.message=`Checklist #${input["checklist-id"]} is Under Procurement Manager: ${checklist[0]["procurement-manager"]}.!`
            return req;
        }

          //checklist entered should not be already Mapped with another Order ID..
          if(checklist[0]["order-id"]!='')
          {
              req.res.message=`Checklist #${input["checklist-id"]} is Already Mapped To OrderID: ${checklist[0]["order-id"]}.!`
              return req;
          }
    }

  
    let order_id=common.generate_id();
    let approval_obj=[{
        "description":"Order Created and Linked with CheckList.",
        "action_by":req.user.email,
        "action_on":new Date()
    }]
    let order={
        "order-id":order_id,
        "client-name":input["client-name"],
        "client-details":client_details[0],
        "checklist-id":checklistid,
        "checkList":checklist,
        "pick-up-Date": input["pick-up-Date"],
        "pick-up-time":input["pick-up-time"],
        "expected-delivery-time":input["expected-delivery-time"],
        "approval_workflow":checklist.length!=0?approval_obj:[{"setp":1,"description":"PM created orderID."}],
        "procurement-manager":req.user.email,
        //"inspection-manager":input.inspectionmanager,
        "current_status":checklist.length!=0?"Sent To Inspection Manager.":"order created",
        "created_by":req.user.email,
        "created_on":new Date(),

    }
    let insert=await mongo.insertOne("orders",order)
     console.log("insert",insert)

    //if checklist is valid then also do the mapping in CheckList.
    if(checklist.length!=0)
    {
        let checklist_q={
            "checklist-id":input["checklist-id"]
        }
        let set_checklist_data={
            "$set":{
                "order-id":order_id,
                "updated_by":req.user.email,
                "updated_on":new Date()
            }
        }
        await mongo.updateOne("checklists",checklist_q,set_checklist_data)
    }

    req.res.message=`Order #${order_id}  Created.`;
    return req;

}



module.exports.updatestatus=async (req,res)=>{
    let input=req.body;
    //check if status is [Approved By Procurement Manager.]

   //fetch checklist and order id.
   let query=[...queries.order_checklist];
   let _filter={
       "$match":{
           "order-id":input["order-id"]
       }
   }
   query.unshift(_filter);

   let data=await mongo.aggregation("orders",query);
   //check if entered order id is valid.
   if (data.length==0)
   {
       req.res.message=`${input["order-id"]} no such Order Id Present.`
       return req;
   }
 
   //check if pm who is linking the check list is also same as pm order.
   if(req.user.email!=data[0]["procurement-manager"])
   {
       req.res.statuscode=401;
       req.res.message=`OrderId #${input["order-id"]} is under ProcurementManager: ${data[0]["procurement-manager"]}.!`
       return req;
   }

   //check if status is [Approved By Procurement Manager.].
   if(!["Approved By Procurement Manager.","in Transit."].includes(data[0]["current_status"]))
   {
       req.res.statuscode=401;
       req.res.message=`OrderId #${input["order-id"]} status is: ${data[0]["current_status"]},only [Approved By Procurement Manager.,in Transit] are allowed.!`
       return req;
   }
  let order_q={
      "order-id":input["order-id"]
  }
 
  let order_data={
      $set:{
          "current_status":input["status"],
          "updated_by":req.user.email,
          "updated_on":new Date()
      },
      $push:{
          "approval_workflow":{"description":input["status"],"comment":input["Remark"],"action_by":req.user.email,"action_on":new Date()}
      }
  }
  let order_update=await mongo.updateOne("orders",order_q,order_data)
  console.log("orders",order_update)

  req.res.message=`OrderID #${input["order-id"]} is Updated !.`
  return req;
  

}

module.exports.fetchOrders=async (req,res)=>{
    let role=req.user.userType;
    let query;

   switch(role){
    case 'Admin':
    //fetch all orders for admin.
    query={};
        break;
    case 'ProcurementManager':
        //fetch all orders that are tagged to pm.
    query={
        "procurement-manager":req.user.email
    };
        break;
    case 'InspectionManager':
        //fetch all orders that are tagged to im.
    query={
            "inspection-manager":req.user.email
        };
        break;
    case 'Client':
        //fetch all orders linked to client.
       let client_data=await fetchClientDetails(req.user.email);
       if(client_data.length==0)
       {
        req.res.message=`No CLient Data Found Registerd with ${req.user.email}`
        return req;
       }
    query={
            "client-name":client_data[0]["client-name"]
        };
        break;

    default :
        req.res.message=`Wrong User Type :${role}.`
        return req;
   }

   let data=await mongo.findQuery("orders",query)

    req.res.message=`Orders Found [${data.length}]`;
    req.res.data=data;
    return req;
}

async function fetchClientDetails(email)
{
    let query=[...queries.client_details];
    let match={
        $match:{
            "proprietor-email":email
        }
    }
    query.unshift(match) ;

    let data=await mongo.aggregation("client-details",query);
    console.log("data",data)
    return data;
    
}