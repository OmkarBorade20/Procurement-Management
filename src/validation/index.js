const {ValidationError}=require('yup')




module.exports.validation=(schema)=>{

  return (req,res,next)=>{
    const { body } = req;
    try {
      schema.validateSync(body, { abortEarly: false, stripUnknown: true });
        next();
      } catch (e) {
            let response={ "Invalid-Payload": e.errors };
           return res.status(400).send(response);
      }
  }

}
