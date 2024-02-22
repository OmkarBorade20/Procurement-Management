const service=require('../service/admin')

module.exports.allUsers=async(req,res,next)=>{
    try{
        await service.allUsers(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller Admin allUsers ${e}`)
        next(e);
    }
}

module.exports.setAuthority=async(req,res,next)=>{
    try{
        await service.setAuthority(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller Admin setAuthority ${e}`)
        next(e);
    }
}


module.exports.fetchMapping=async(req,res,next)=>{
    try{
        await service.fetchMapping(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller Admin fetchMapping ${e}`)
        next(e);
    }
}


module.exports.fetchProcumentManagers=async(req,res,next)=>{
    try{
        await service.fetchProcumentManagers(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller Admin fetchProcumentManagers ${e}`)
        next(e);
    }
}

module.exports.fetchInspectionManagers=async(req,res,next)=>{
    try{
        await service.fetchInspectionManagers(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller Admin fetchInspectionManagers ${e}`)
        next(e);
    }
}
