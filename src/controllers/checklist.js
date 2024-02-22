const service=require('../service/checklist')

module.exports.create=async(req,res,next)=>{
    try{
        await service.create(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller CheckList create ${e}`)
        next(e);
    }
}

module.exports.link=async(req,res,next)=>{
    try{
        await service.link(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller CheckList link ${e}`)
        next(e);
    }
}


module.exports.update=async(req,res,next)=>{
    try{
        await service.update(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller CheckList update ${e}`)
        next(e);
    }
}
module.exports.approve=async(req,res,next)=>{
    try{
        
        let message="Approved By Procurement Manager."
        await service.approve(req,res,message,true);
        next();
    }catch(e){
        console.log(`Error in Controller CheckList approve ${e}`)
        next(e);
    }
}

module.exports.sendback=async(req,res,next)=>{
    try{
        let message="Sentback to Inspection Manager."
        await service.approve(req,res,message);
        next();
    }catch(e){
        console.log(`Error in Controller CheckList sendback ${e}`)
        next(e);
    }
}


module.exports.uploadDocs=async(req,res,next)=>{
    try{
        await service.uploadDocs(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller CheckList uploadDocs ${e}`)
        next(e);
    }
}




module.exports.downloadDocs=async(req,res,next)=>{
    try{
        await service.downloadDocs(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller CheckList downloadDocs ${e}`)
        next(e);
    }
}

module.exports.viewChecklist=async(req,res,next)=>{
    try{
        await service.viewChecklist(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller CheckList viewChecklist ${e}`)
        next(e);
    }
}

