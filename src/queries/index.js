
//query to fetch all pm names from user details
let pm_query=[{
    "$match": { userType: "ProcurementManager" }
  },{
    "$project":{
      "name":1,
      "email":1
    }
  }]

  //query to fetch all Admin names from user details
let admin_query=[{
  "$match": { userType: "Admin" }
},{
  "$project":{
    "name":1,
    "email":1
  }
}]

  //query to fetch all pm names from user details
  let pm_details_query=[{
    "$match": { userType: "ProcurementManager" }
  },{
    "$project":{
      "_id":0,
      "password":0,
    }
  }]

  //query to fetch all pms from user details
  let im_details_query=[{
    "$match": { userType: "InspectionManager" }
  },{
    "$project":{
      "_id":0,
      "password":0,
    }
  }]

  //query to fetch all pms from user details
  let im_query=[{
      "$match": { userType: "InspectionManager" }
    },{
      "$project":{
        "name":1,
        "email":1
      }
    }]


  //fetch all active pms and ims mapping.
  let pm_ims_query=[
    {
        $lookup:
           {
              from: "users-details",
              localField: "ims",
              foreignField: "email",
              as: "Inspection_Manager_Details"
          }
     }
 ,{ $unset: "Inspection_Manager_Details.password" }
 ,{
   $project:{
    "Procurement-Manager": "$pm",
    "Inpection_Manager_names":"$ims",
    "Inspection_Manager_Details":1
    
    
   }
 }
  ] 
//fetch client details
  let client_details=[
      {
          $lookup:
             {
                from: "users-details",
                localField: "users-details",
                foreignField: "proprietor-email",
                as: "client_proprietor_details"
            }
       }
   ,{ $unset: "client_proprietor_details.password" }
  
  ] 

//order checklist based on client name.
  let order_checklist=[
    {
        $lookup:
           {
              from: "checklists",
              localField: "client-name",
              foreignField: "client-name",
              as: "checklist_details"
          }
     }

] 
  
//fetch checklist and orders data based on checklist id.
let checklist_order=[
  {
      $lookup:
         {
            from: "orders",
            localField: "checklist-id",
            foreignField: "checklist-id",
            as: "order_data"
        }
   }
] 
  module.exports={
    pm_query,
    im_query,
    pm_ims_query,
    pm_details_query,
    im_details_query,
    admin_query,
    client_details,
    order_checklist,
    checklist_order
  }