
const mongo=require('../repository/mongorepo')
const bcrypt=require('bcrypt')
const auth=require('../helperModules/authentication')
const queries=require('../queries/index')
const path=require('path')




module.exports.login=async(req,res)=>{

  let input=req.body;
  let query={
    "email":input.email
  }

  //fetch user from Db.
  let dbuser=  await mongo.findQuery("users-details",query)

    //if no such user present in DB.
    if(dbuser.length==0)
    { 
      req.res.statuscode=404;
      req.res.message=`Connect with Adming Team ${input.email} Email Not Found !`;
      return req;
    }

  //check the password
  let check=await bcrypt.compare(input.password, dbuser[0].password);

  //if password dosent match.
  if(!check)
  { 
    req.res.statuscode=401;
    req.res.message="Please Check Your Credentals.!";
    return req;
  }
 

 //remove password from encoded data
 delete dbuser[0].password;

 //if credentials are valid then generate a token;
const tokenData=auth.genrateToken(dbuser[0]);

req.res.message=`Welcome ${dbuser[0].name} !.`
req.res.data=[tokenData];
return req;

}

function registerRolecheck(role,inputuserType){
  let admin_userRoles=["Admin","ProcurementManager","InspectionManager","Client"];
  let pm_userRoles=["InspectionManager","Client"];
  let allowed=false;
  switch(role){
    case 'Admin':
      allowed=admin_userRoles.includes(inputuserType);
      break;
    case 'ProcurementManager':
      allowed=pm_userRoles.includes(inputuserType);
      break;
    case 'InspectionManager':
        allowed=false;
        break;
    default:
      allowed=false;
      break;
  }
  return allowed;
}

module.exports.signup=async(req,res)=>{

  let input=req.body;
  let allowed_userRoles=["Admin","ProcurementManager","InspectionManager","Client"];

  //input Role Validation.
  if(!allowed_userRoles.includes(input.userType))
    {
      req.res.statuscode=400;
      req.res.message=`Only this [${allowed_userRoles}] Roles are Allowed `
      return req;
    }

  let user={
    "name":input.name,
    "gender":input.gender,
    "email":input.email,
    "password":input.password,
    "mobileNo":input.mobileNo,
    "userType":input.userType,
    "registeredBy":req.user.name,
    "registeredPersonRole":req.user.userType
  }

  //only adming , pm can register all roles.

  if(!registerRolecheck(req.user.userType,input.userType))
  {
        req.res.message=`You cannot Provide Access to:${input.userType} Role, kindly contact Admin Team.`;
        return req;
  }

//check in db if user is already Registerd or Not.
let query={"email":input.email}
let dbuser=await mongo.findQuery("users-details",query)



if(dbuser.length!=0)
{
  req.res.statuscode=409;
  req.res.message=`Contact Admin Team, Email ${input.email} Already Registerd As Position:${dbuser[0].userType}`
  return req;
}


  //hashing the password and saving in db.
  let hash=await bcrypt.hash(input.password,10);

  user["password"]=hash;
  await mongo.insertOne("users-details",user)

  //add pm in role mapping collection.
  if(input.userType=="ProcurementManager" && req.user.userType==="Admin"){
    await add_pm_in_RoleMapping(input.email,req.user.email)
  }

   //add pm in role mapping collection.
   if(input.userType=="InspectionManager" && req.user.userType==="Admin"){
    await map_ims_admin(req.user.email,input.email)
  }

    req.res.statuscode=201;
    req.res.message=`${input.email} : User Registerd SucessFully..`
    return req;  
}


async function add_pm_in_RoleMapping(pmemail,created_by){

  //if role being registerd is Procurement Manager then add the same in role mapping collection.
  let roles={
    "pm":pmemail,
    "ims":[],
    "created_by":created_by,
    "created_on":new Date()
  }
  await mongo.insertOne("role-mapping",roles)

}

async function map_ims_admin(admin,im){
  //find admin in mapping collection.
  let query={
    "pm":admin
  }

  let data=await mongo.findQuery('role-mapping',query)
  if(data.length!=0)
  {
    //add the inspection manager to admin.
    let query={
      "pm":admin
    }
    let data={
      $push:{"ims":im},
      $set:{
        "updated_by":admin,
        "updated_on":new Date()
      }
    }
    await mongo.updateOne('role-mapping',query,data)
  }
  else 
  {
    // insert admin as pm and map im directly to him
    let data={
      "pm":admin,
      "im":[im],
      "created_by":admin,
      "created_on":new Date()
    }
    await mongo.insertOne('role-mapping',data)
  }
}

module.exports.refreshToken=async(req,res)=>{

  const token=req.headers.refreshtoken;
  const newToken=await auth.refreshToken(token);

  req.res.message=`new Tokens Generated.`
  req.res.data=[newToken];
  return req;
}



