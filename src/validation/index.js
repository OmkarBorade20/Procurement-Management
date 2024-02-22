const {ValidationError}=require('yup')

const {login_schema,signup_schema,order_schema,checklist_schema,checklist_update_schema,authority_schema,clientmanage_schema,linkchecklist_schema,checklist_status_schema}=require('./schemas')


module.exports.login=(req,res,next)=>{
    const { body } = req;
    try {
        login_schema.validateSync(body, { abortEarly: false, stripUnknown: true });
        next();
      } catch (e) {
            let response={ "Invalid-Payload": e.errors };
           return res.status(400).send(response);
      }
}

module.exports.signup=(req,res,next)=>{
    const { body } = req;
    try {
        signup_schema.validateSync(body, { abortEarly: false, stripUnknown: true });
        next();
      } catch (e) {
            let response={ "Invalid-Payload": e.errors };
           return res.status(400).send(response);
      }
}


module.exports.orderCreate=(req,res,next)=>{

    const { body } = req;
    try {
        order_schema.validateSync(body, { abortEarly: false, stripUnknown: true });
        next();
      } catch (e) {
            let response={ "Invalid-Payload": e.errors };
           return res.status(400).send(response);
      }
    
}

module.exports.checklistCreate=(req,res,next)=>{

    const { body } = req;
    try {
        checklist_schema.validateSync(body, { abortEarly: false, stripUnknown: true });
        next();
      } catch (e) {
            let response={ "Invalid-Payload": e.errors };
           return res.status(400).send(response);
      }
    
}


module.exports.checklistUpdate=(req,res,next)=>{

    const { body } = req;
    try {
        checklist_update_schema.validateSync(body, { abortEarly: false, stripUnknown: true });
        next();
      } catch (e) {
            let response={ "Invalid-Payload": e.errors };
           return res.status(400).send(response);
      }
    
}

module.exports.checklistStatus=(req,res,next)=>{

    const { body } = req;
    try {
        checklist_status_schema.validateSync(body, { abortEarly: false, stripUnknown: true });
        next();
      } catch (e) {
            let response={ "Invalid-Payload": e.errors };
           return res.status(400).send(response);
      }
    
}

module.exports.authority=(req,res,next)=>{

    const { body } = req;
    try {
        authority_schema.validateSync(body, { abortEarly: false, stripUnknown: true });
        next();
      } catch (e) {
            let response={ "Invalid-Payload": e.errors };
           return res.status(400).send(response);
      }
    
}


module.exports.clientManage=(req,res,next)=>{

    const { body } = req;
    try {
        clientmanage_schema.validateSync(body, { abortEarly: false, stripUnknown: true });
        next();
      } catch (e) {
            let response={ "Invalid-Payload": e.errors };
           return res.status(400).send(response);
      }
    
}

module.exports.checklistLink=(req,res,next)=>{

  const { body } = req;
  try {
    linkchecklist_schema.validateSync(body, { abortEarly: false, stripUnknown: true });
      next();
    } catch (e) {
          let response={ "Invalid-Payload": e.errors };
         return res.status(400).send(response);
    }
  
}

