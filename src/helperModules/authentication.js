const jwt=require('jsonwebtoken')
const mongo=require('../repository/mongorepo')


    require('dotenv').config()


const genrateToken= (userdata)=>{

 const token=jwt.sign({data: userdata}, process.env.JWT_TOKEN_SECRET, { expiresIn: '3H' });
 const refreshToken=jwt.sign({email: userdata.email}, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '1Y' });

 return {
    "Token":token,
    "refreshToken":refreshToken
 }
}

module.exports={genrateToken};


module.exports.tokenValidate=(req,res,next)=>{
   try {
      if(req.headers.token==undefined)
         return res.status(400).send({"message":"kindly pass token in Headers."});
      
       let decode=jwt.verify(req.headers.token, process.env.JWT_TOKEN_SECRET);
       //setting users data in req object
       req.user=decode.data;
      next()
    } catch(err) {
      if (err.message=='jwt expired'){
         console.log(err)
         return res.status(401).send({"message":"Make Sure Passed Token is Not Expired."})
      }
      else {
         console.log("Error :",err)
         next(err.message)
      }
         
     
    }
}


module.exports.refreshToken=async (token)=>{

   try {
   const decode=jwt.verify(token,process.env.JWT_REFRESH_TOKEN_SECRET);

   //check if the refresh token passed in a valid db registerd user.
   let query={"email":decode.email}
   let dbRecord=await mongo.findQuery("users-details",query);
  
      //if no such user present in DB.
      if(dbRecord.length==0)
      { 
        req.res.statuscode=404;
        req.res.message=`Refresh Token Passed for the user ${decode.email} is not Present in System. !`;
        return req;
      }

      //generate new Tokens.
      return genrateToken(dbRecord[0]);


   }catch(e){
      console.log(e)

   }

}

module.exports.allowedRoutes=async(req,res,next)=>{

   //maintain all the routes accoring to roles.
   let AdminRoutes=['/signup','/setAuthority','/fetchProcumentManagers','/fetchInspectionManagers','/allUsers',"/fetchMapping","/viewOrders","/viewChecklist","/create","/link","/approve","/sendback","/updatestatus","/downloadDocs"]
   let ProcurementManagerRoutes=['/signup','/CreateOrder','/approveChecklist','/sentbackChecklist','/create','/viewOrders',"/viewChecklist","/link","/approve","/sendback","/updatestatus","/downloadDocs"]
   let InspectionManagerRoutes=['/checkChecklist','/approveChecklist','/viewOrders',"/viewChecklist","/update","/uploadDocs","/downloadDocs"] 
   let ClientRoutes=['/fetchDetails','/manageDetails','/getTransactions','/clientUploadChecklist','/viewOrders',"/viewChecklist","/downloadDocs"]

   let user_type=req.user.userType;
   let current_route=req.url.split('/').length>2?`/${req.url.split('/')[1]}`:req.url;

   let value;
   switch(user_type)
   {
      case "Admin":
         value=AdminRoutes.includes(current_route);
         break;
      case "ProcurementManager":
         value=ProcurementManagerRoutes.includes(current_route);
         break;
      case "InspectionManager":
         value=InspectionManagerRoutes.includes(current_route);
         break;
      case "Client":
         value=ClientRoutes.includes(current_route);
         break;
      default :
         res.status(401).send({"Message":`${req.user.name} you are accessing Restricted Route !.`})

   }
      if(value)
         next()
      else
         res.status(401).send({"Message":`${req.user.name} you are accessing Restricted Route ${current_route} !.`})
}