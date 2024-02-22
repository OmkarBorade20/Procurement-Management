const mongo=require('../repository/mongorepo')
const common=require('../helperModules/commonUtiles')
const path=require('path')
const queries=require('../queries/index')


module.exports.allUsers=async(req,res)=>{

    const users=await mongo.find('users-details')
  
    req.res.message=`Users found ${users.length}`
    req.res.data=users;
    return req;
  
  }
  
module.exports.setAuthority=async(req,res)=>{
   let input=req.body;
  
    //find all procurement Managers List.
    let pm_query=queries.pm_query;
    let pms=await mongo.aggregation("users-details",pm_query)
    pms=pms.map(e=>e.email)
  
  
      //find all admins Managers List.
    let admin_query=queries.admin_query;
    let admins=await mongo.aggregation("users-details",admin_query)
    admins=admins.map(e=>e.email)
  
    //find all inspection Manager List.
    let im_query=queries.im_query;
    let ims=await mongo.aggregation("users-details",im_query)
    ims=ims.map(e=>e.email)
    
  
  //find all inspection Manager Details along with Pms.
   let pm_ims_query=queries.pm_ims_query;
   let pm_ims=await mongo.aggregation("role-mapping",pm_ims_query)
  
   let all_ims=pm_ims.map(e=> e["Inpection_Manager_names"])
   all_ims=all_ims.flat(Infinity);
  
   //check if input pm is valid or not 
   if(!(pms.includes(input.pm) || admins.includes(input.pm))){
    req.statuscode=200;
    req.res.message=`${input.pm} Email is Not Registerd as ProcurementManager contact Admin.`
    return req;
   }
  
  
    //check if input Im is valid or not 
    if(!ims.includes(input.im)){
      req.statuscode=200;
      req.res.message=`${input.im}: Email is Not Registerd as InspectionManager contact Admin.`
      return req;
     }
  
  
   if (input.assign)
   {
      //Assign.
    if(im_already_present(pm_ims,input.pm,input.im) || all_ims.includes(input.im))
    {
      req.res.message=`${input.im} is already Mapped`
      return req;
    }
   
     let mapping={
      $set:{
        "updated_by":req.user.email,
        "updated_on":new Date()
      },
      $push:{"ims":input.im}
     }
  
     let query={
      "pm":input.pm
     }
    MappData=await mongo.findOneAndUpdate("role-mapping",query,mapping)
   }
   else 
   {
    //unAssign.
    let mapping={
      $set:{
        "updated_by":req.user.email,
        "updated_on":new Date()
      },
      $pull:{"ims":input.im},
    };
  
    let query={
      "pm":input.pm
    }
     MappData=await mongo.findOneAndUpdate("role-mapping",query,mapping)
   }
  
    //add mapping of insepection manager to procurement Manager.
  
  
   req.res.message=input.assign?`PM [${input.pm}] => IM [${input.im}] Mapping Done Sucessfully.!`: `IM [${input.im}]  x PM [${input.pm}]   Removed Sucessfully.!`
   return req;
  
  }
  
  function im_already_present(data,pm,im)
  {
    let found_pm=data.filter(e=>e["Procurement-Manager"]===pm);
  
    if(found_pm.length==0 && found_pm[0]?.Inpection_Manager_names?.includes(im))
        return true;
    else
        return false;
  }

module.exports.fetchProcumentManagers=async(req,res)=>{

    let query=queries.pm_details_query;
    let data=await mongo.aggregation('users-details',query)
    
    req.res.message=data.length!=0?`Sucessfully fetched [${data.length}] ProcumentManagers.`:"No ProcureMent Manager Found."
    req.res.data=data;
    return req;  
  }
  
module.exports.fetchMapping=async(req,res)=>{
    let query;
    let data=[];
  
    if (req.params.email!=undefined)
    {
      let match={"$match":{
        "pm":req.params.email
      }}
      query=[...queries.pm_ims_query];
      query.unshift(match);
        
      
      data=await mongo.aggregation('role-mapping',query)
    }
    else{
      query=queries.pm_ims_query;
       data=await mongo.aggregation('role-mapping',query)
    }
  
    req.res.message=data.length!=0?`Sucessfully fetched [${data.length}] ProcumentManagers and Inspection Managers Mapped.`:"No ProcureMent Manager Found."
    req.res.data=data;
    return req;  
  } 
  
module.exports.fetchInspectionManagers=async(req,res)=>{
  
    let query=queries.im_details_query;
    let data=await mongo.aggregation('users-details',query)
    
    req.res.message=data.length!=0?`Sucessfully fetched [${data.length}] Inspection Managers.`:"No Inspection Manager Found."
    req.res.data=data;
    return req;  
   
  }
  

