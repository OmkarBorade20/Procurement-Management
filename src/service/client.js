
const mongo=require('../repository/mongorepo')
const common=require('../helperModules/commonUtiles')
const path=require('path')



module.exports.fetchDetails=async(req,res)=>{
    
    let query={
        "proprietor-email":req.user.email
    }
    let dbdata=await mongo.findQuery("client-details",query)

    
    req.res.message=dbdata.length==0?`Client Details Not Present.`:`Client Details Fetched.`
    req.res.data=dbdata;
    return req;  
}

module.exports.manageDetails=async(req,res)=>{

    let input=req.body;
    let message='';

    //api can Edit as well as add Details.
    if(input.type=="create")
        message=await create(req)
    else 
        message=await update(req)
    
    req.res.message=message;
    return req;  
}

async function create(req)
{
    //check if client has already filled the details.
    let query={
        "proprietor-email":req.user.email
    }
    let db_email=await mongo.findQuery('client-details',query)

    if (db_email.length!=0)
        return `Client Details are Already Added.`
       
    let client_details={
        "proprietor-name":req.user.name,
        "proprietor-email":req.user.email,
        "proprietor-mobileNo":req.user.mobileNo,
        "created-by":req.user.name,
        "created-on":new Date(),
    }

    let rem_data=req.body;
    delete rem_data["type"];

    client_details={...client_details,...rem_data}

    await mongo.insertOne('client-details',client_details) 
    return`Client Details Added Sucessfully.`;
    
}

async function update(req)
{

    let data={
        "proprietor-name":req.user.name,
        "proprietor-mobileNo":req.user.mobileNo,
        "updated-by":req.user.name,
        "updated-on":new Date(),
    }

    let rem_data=req.body;
    delete rem_data["type"];

    data={...data,...rem_data}
    let query={
        "proprietor-email":req.user.email
    }
    let update_client_details={
        $set:data
    }


    await mongo.updateOne('client-details',query,update_client_details)
    return `Client Details updated Sucessfully.`;
}


module.exports.getTransactions=async(req,res)=>{
let data=req.params;
 console.log(data)   
}


module.exports.clientUploadChecklist=async(req,res)=>
{
    let query={
        "proprietor-email":req.user.email
    }
    let dbdata=await mongo.findQuery("client-details",query)

    if(dbdata.length==0)
    {
        req.res.message=`Kindly Add Client Details Before Uploading Checklist.`
        return req;
    }

    let id=dbdata[0]._id.toString();

    let files=req.files.uploadedFile;
    let des=path.join(__dirname,'..','..','/Uploads')
    des=des+`/${files.name}`
    
    await files.mv(des);

    //only text files Allowed
    if(files.mimetype!="application/octet-stream")
    {
        req.res.statuscode=400;
        req.res.message=`Only Text Files are Allowed .`
        return req;
    }
        
    //add the buffer file to Db.
    let data={
        "client-id":id,
        "file-buffer":files.data,
        "type":"client",
        "file-name":files.name,
        "uploaded-by":req.user.name,
        "upload-date":new Date(),
        "email":req.user.email
    }
    let insert=await mongo.insertOne('upload-files',data)
    console.log(insert)
 

    req.res.statuscode=200;
    req.res.message=`File Uploaded Sucessfully.`
    return req;
}