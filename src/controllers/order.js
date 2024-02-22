const service=require('../service/order')
module.exports.create=async(req,res,next)=>{
    try{
        await service.create(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller order create ${e}`)
        next(e);
    }
}

module.exports.updatestatus=async(req,res,next)=>{
    try{
        await service.updatestatus(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller order updatestatus ${e}`)
        next(e);
    }
}

module.exports.fetchOrders=async(req,res,next)=>{
    try{
        await service.fetchOrders(req,res);
        next();
    }catch(e){
        console.log(`Error in Controller order fetchOrders ${e}`)
        next(e);
    }
}


