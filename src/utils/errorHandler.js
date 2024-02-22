
const errHandler=(err,req,res,next)=>{
    let statuscode=500;
    let response={};
    if(err)
    {
        response={
            error:"Error Caused.",
            data:JSON.stringify(err.message)
        }
    }

    res.status(statuscode).send(response);
}

module.exports=errHandler