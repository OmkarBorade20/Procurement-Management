const service=require('../service/service')




module.exports.login=async(req,res,next)=>{
    try{
        await service.login(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller login ${e}`)
        next(e);
    }
}


module.exports.signup=async(req,res,next)=>{
    try{
        await service.signup(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller signup ${e}`)
        next(e);
    }
}

module.exports.refreshToken=async(req,res,next)=>{
    try{
        await service.refreshToken(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller refreshToken ${e}`)
        next(e);
    }
}


