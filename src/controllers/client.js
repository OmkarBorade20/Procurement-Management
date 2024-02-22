
const service=require('../service/client')

module.exports.fetchDetails=async(req,res,next)=>{
    try{
        await service.fetchDetails(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller fetchDetails ${e}`)
        next(e);
    }
}

module.exports.manageDetails=async(req,res,next)=>{
    try{
        await service.manageDetails(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller manageDetails ${e}`)
        next(e);
    }
}

module.exports.getTransactions=async(req,res,next)=>{
    try{
        await service.getTransactions(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller getTransactions ${e}`)
        next(e);
    }
}

module.exports.clientUploadChecklist=async(req,res,next)=>{
    try{
        await service.clientUploadChecklist(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller clientUploadChecklist ${e}`)
        next(e);
    }
}

