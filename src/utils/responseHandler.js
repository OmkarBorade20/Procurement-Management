const responseHandler=(req,res,next)=>{
    let statuscode=req.res.statuscode||200;
    let response={};
    if(req.res.filepath!=undefined)
    {
        res.status(statuscode)
        res.download(req.res.filepath)
    }
    else if(req.res.message!=undefined || req.res.data!=undefined)
    {
        response={
            message:req.res.message,
            data:req.res.data!=undefined?req.res.data:[]
        }

        if (response.data.length==0)
            delete response.data;
        
        res.status(statuscode);
        res.send(response);
    }
    else 
    {
        next()
    }
}

module.exports=responseHandler