const mongo=require('../repository/mongorepo')
const common=require('../helperModules/commonUtiles')
const path=require('path')
const fs=require('fs')
const queries=require('../queries/index')



module.exports.create=async(req,res)=>{
    
   let input=req.body;
   let checklist_id=common.generate_id();

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

    let data={
        "checklist-id":checklist_id,
        "order-id":"",
        "client-name":client_details[0]["client-name"],
        "Question-1":input["Question-1"],
        "Answere-1":"",
        "Question-2":input["Question-2"],
        "Answere-2":"",
        "Question-3":input["Question-3"],
        "Answere-3":"",
        "Question-4":input["Question-4"],
        "Answere-4":"",
        "Question-5":input["Question-5"],
        "Answere-5":"",
        "client-instruction":client_details[0]["instructions"],
        "Answere-client":"",
        "attach-files":[],
        "procurement-manager":req.user.email,
        "inspection-manager":input["inspection-manager"],
        "created_by":req.user.email,
        "created_on":new Date()
    }

    //check if entered inspection manager is valid or not.
    let pm_im_query=[...queries.pm_ims_query];
    let match={
        $match:{
            "pm":req.user.email
        }
    }
    pm_im_query.unshift(match);

    let pm_im_data=await mongo.aggregation("role-mapping",pm_im_query);
    console.log(pm_im_data);

    if(pm_im_data.length==0)
    {
        req.res.message="PM Is Not Present In Role Mapping.!"
        return req;
    }

    if(!pm_im_data[0].Inpection_Manager_names.includes(input["inspection-manager"]))
    {
        req.res.statuscode=401;
        req.res.message=`Inspection Manager [${input["inspection-manager"]}]: is Not Alloted Under: Procurement Manager [${req.user.email}],contact Admin Team.!`
        req.res.data=[{
            "message":`${req.user.email} [${pm_im_data[0].Inspection_Manager_Details.length}] :InspectionManagers are Under You .!`,
            "Inspection Managers":pm_im_data[0].Inpection_Manager_names,
            "data":pm_im_data[0].Inspection_Manager_Details
        }]
        return req;
    }


    let insert=await mongo.insertOne('checklists',data)
    console.log("checklists",insert)

   req.res.message=`CheckList #${checklist_id} Generated!.`
    return req;  
}

module.exports.viewChecklist=async(req,res)=>{
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

       let data=await mongo.findQuery("checklists",query)

       req.res.message=`CheckList Found [${data.length}]`;
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

module.exports.link=async(req,res)=>{
    let input=req.body;

    //fetch 
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


    //check if entered order id is valid.
    let checklist=data[0].checklist_details.filter(e=>e["checklist-id"]==input["checklist-id"])
    if(checklist.length==0)
    {
        req.res.message=`${input["checklist-id"]} no such CheckList Id Present for Client ${data[0]["client-name"]}`
        return req;
    }
    //check that the cheklist is not attached to some othe order id.
    if(checklist[0]["order-id"]!='')
    {
        req.res.message=`Checklist #${input["checklist-id"]} is Already Mapped to OrederID #${checklist[0]["order-id"]}, Create Another Checklist or Contact Admin Team.!`
        return req;
    }

    //update in checklist and order collection.

    let order_q={
        "order-id":input["order-id"]
    }
    let approval_obj={
        "description":"Linked with CheckList.",
        "PM-comment":input["procurement-manager-comment"],
        "action_by":req.user.email,
        "action_on":new Date()
    }
    let set_order_data={
        "$set":{
            "current_status":"Sent To Inspection Manager.",
            "checklist-id":input["checklist-id"],
            "inspection-manager":checklist[0]["inspection-manager"],
            "updated_by":req.user.email,
            "updated_on":new Date()
        },
        $push:{
            "checkList":checklist[0],
            "approval_workflow":approval_obj
        }
    }

   
    let update_order=await mongo.updateOne("orders",order_q,set_order_data)

    let checklist_q={
        "checklist-id":input["checklist-id"]
    }
    let set_checklist_data={
        "$set":{
            "order-id":input["order-id"],
            "updated_by":req.user.email,
            "updated_on":new Date()
        }
    }

    let update_checklist=await mongo.updateOne("checklists",checklist_q,set_checklist_data)

    console.log("update_checklist :",update_checklist ,"update_order :",update_order)

    req.res.message=`ChecklistID #${input["checklist-id"]} is Linked With OrderID #${input["order-id"]}.!`;
    return req;  
}

module.exports.update=async(req,res)=>{
let input=req.body;

//check if checklistid is valild or not.
let q={
"checklist-id":input["checklist-id"]
}
let checklist=await mongo.findQuery("checklists",q);


if(checklist.length==0)
{
    req.res.message=`#${input["checklist-id"]} is not Valid.!`
    return req;
}

//check if inspection manager logged in is same as assigned one.
if(checklist[0]["inspection-manager"]!=req.user.email)
{
    req.res.statuscode=401;
    req.res.message=`#${input["checklist-id"]} is Under Inspection Manager :${checklist[0]["inspection-manager"]}!`
    return req;
}

//also check if order current status is "Sent To Procurement Manager."
let order=await mongo.findQuery("orders",{"order-id":checklist[0]["order-id"]});
if (!["Sent To Inspection Manager.","Sentback to Inspection Manager."].includes(order[0]["current_status"]))
{
    req.res.statuscode=401;
    req.res.message=`Order Id #${order[0]["order-id"]} Linked With Checklist #${input["checklist-id"]} is currently ${order[0]["current_status"]} !.`
    return req;
}

//inspection manager will answere all question and update the status of order id.

let query={
    "checklist-id":input["checklist-id"]
}
let data={
    $set:{
        "Answere-1":input["Answere-1"],
        "Answere-2":input["Answere-2"],
        "Answere-3":input["Answere-3"],
        "Answere-4":input["Answere-4"],
        "Answere-5":input["Answere-5"],
        "Answere-client":input["Answere-client"],
        "updated_by":req.user.email,
        "updated_on":new Date()
    }
}
let update=await mongo.updateOne("checklists",query,data)
console.log("update",update)

//fetch checklist again.
 checklist=await mongo.findQuery("checklists",q);

//also update in order collection.
let order_query={
    "order-id":checklist[0]["order-id"]
}
let obj={
   
    "description":"Inspection Manager Updated Checklist and submited To Procument Manager.",
    "action_by":req.user.email,
    "action_date":new Date()
}
let order_data={
    $set:{
        "updated_by":req.user.email,
        "checkList":checklist,
        "updated_on":new Date(),
        "current_status":"Sent To Procurement Manager."
    },
    $push:{
       
        "approval_workflow":obj
    }
}
    let order_update=await mongo.updateOne("orders",order_query,order_data);
    console.log("order_update",order_update)

    //if

    req.res.message=`Checklist #${input["checklist-id"]} : Updated By Inspection Manager :${req.user.email}.! `
    return req;  
}

module.exports.approve=async(req,res,message,flag)=>{
    let input=req.body;

    //fetch checklist and order id.
    let query_checklist=[...queries.checklist_order];
    query_checklist.unshift({"$match":{"checklist-id":input["checklist-id"]}});

    let checklist=await mongo.aggregation("checklists",query_checklist)
    console.log("checklist",checklist)


    //check if enterd checklist is valid or not.
    if(checklist.length==0)
    {
        req.res.message=`checklist #${input["checklist-id"]} is not valid!.`
        return req;
    }

    //check if logged in user is right pm or not.
    if(checklist[0]["procurement-manager"]!=req.user.email)
    {
        req.res.statuscode=401;
        req.res.message=`checklist #${input["checklist-id"]} is Under ProcureMent Manager :${checklist[0]["procurement-manager"]}!.`
        return req;
    }

    //check the current status of the order id .
    if (checklist[0]["order_data"][0].current_status!="Sent To Procurement Manager.")
    {
        req.res.statuscode=401;
        req.res.message=`Current Status :${checklist[0]["order_data"][0].current_status} ,You can Only Approve Those OrderId Which are Sent to Procurement Manager.`
        return req;
    }

    //update the status of order and also update in checklist.
    let checklist_q={
        "checklist-id":input["checklist-id"]
    }
    let checklist_data={
        "$set":{
            "status":message,
            "approval_comment":input["Remark"],
            "updated_by":req.user.email,
            "updated_on":new Date()
        
        }
    }
    let checklist_update=await mongo.updateOne("checklists",checklist_q,checklist_data)
    console.log("check list",checklist_update)


    let order_q={
        "checklist-id":input["checklist-id"]
    }
    let updated_checklist=await mongo.findQuery("checklists",order_q)
    let order_data={
        $set:{
            "current_status":message,
            "updated_by":req.user.email,
            "updated_on":new Date(),
            "checkList":updated_checklist
        },
        $push:{
            "approval_workflow":{"description":message,"comment":input["Remark"],"action_by":req.user.email,"action_on":new Date()}
        }
    }
    let order_update=await mongo.updateOne("orders",order_q,order_data)
    console.log("orders",order_update)

    req.res.message=`Checklist #${input["checklist-id"]} is ${flag?'Approved.':'RevertedBack.'}`
    return req;
}



module.exports.uploadDocs=async(req,res)=>{
    let input=req.body;

     //fetch checklist and order id.
     let query_checklist=[...queries.checklist_order];
     query_checklist.unshift({"$match":{"checklist-id":parseInt(input["checklist-id"])}});
 
     let checklist=await mongo.aggregation("checklists",query_checklist)
     console.log("checklist",checklist)
 
 
     //check if enterd checklist is valid or not.
     if(checklist.length==0)
     {
         req.res.message=`checklist #${input["checklist-id"]} is not valid!.`
         return req;
     }
 
     //check if logged in user is right pm or not.
     if(checklist[0]["inspection-manager"]!=req.user.email)
     {
         req.res.statuscode=401;
         req.res.message=`checklist #${input["checklist-id"]} is Under Inspection Manager :${checklist[0]["inspection-manager"]}!.`
         return req;
     }
 
     //check the current status of the order id .
     if (!["Sent To Inspection Manager.","Sentback to Inspection Manager."].includes(checklist[0]["order_data"][0].current_status))
     {
         req.res.statuscode=401;
         req.res.message=`Current Status :${checklist[0]["order_data"][0].current_status} ,You can Only upload docs for those checklist Which are Sent to Inspection Manager.`
         return req;
     }

    //upload File
    let files=req.files.uploadedFile;
    let des=path.join(__dirname,'..','..','/Uploads')
    des=des+`/${files.name}`

    //copying to destination folder.
    await files.mv(des);


    //update in file upload collection.
    let id=common.generate_id();
    let data={
        "file-id":`File${id}`,
        "checklist-id":parseInt(input["checklist-id"]),
        "file-buffer":files.data,
        "type":"checklist attachment.",
        "file-name":files.name,
        "uploaded-by":req.user.name,
        "upload-date":new Date(),
        "email":req.user.email,

    }
    let insert=await mongo.insertOne('upload-files',data)
    console.log(insert)
 
     //update the file details in checklist.
     let checklist_q={
         "checklist-id":parseInt(input["checklist-id"])
     }
     let checklist_data={

         "$push":{"attach-files":{"_id":insert.insertedId,"file-id":`File${id}`,"uploaded_by":req.user.name,"uploaded_on":new Date()}}
         
     }
     let checklist_update=await mongo.updateOne("checklists",checklist_q,checklist_data)
     console.log("check list",checklist_update)

    req.res.message="File Uploaded Sucessfully"
    return req;  
}

module.exports.downloadDocs=async(req,res)=>{
  let fileid=req.params.fileid;

     //fetch file from upload files.
     let query={
        "file-id":fileid
     }
 
     let data=await mongo.findQuery("upload-files",query);
     console.log("data",data)

     if(data.length==0)
     {
        req.res.message=`No Data Found for File-id :${fileid}.!`
        return req;
     }

     //write file to downloads folder.
     let destination=path.join(__dirname,'..','..','/Downloads')
     destination=destination+`/${data[0]["file-name"]}`

     fs.writeFileSync(destination,data[0]["file-buffer"].buffer)

    req.res.filepath=destination;
    return req;  
}