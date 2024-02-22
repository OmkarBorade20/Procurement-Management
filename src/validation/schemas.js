const yup=require('yup')



const email_regex=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const mobile_regex=/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/


const userTypes= {
    InspectionManager : 'InspectionManager',
    Admin : 'Admin',
    ProcurementManager : 'ProcurementManager',
    Client:'Client'
  }

const login_schema=yup.object({

    "email":yup.string().matches(email_regex,'Email Enterd is Invalid.').required().trim(),
    "password":yup.string().required().trim()
    
}).required()

const signup_schema=yup.object({

    "name":yup.string().required().trim(),
    "gender":yup.string().required().trim(),
    "email":yup.string().matches(email_regex,'Email Enterd is Invalid.').required().trim(),
    "password":yup.string().required().trim(),
    "mobileNo":yup.string().matches(mobile_regex,'Mobile Number is Invalid.').required().trim(),
    //"mobileNo":yup.string().phone(),
    "userType": yup.string().oneOf([userTypes.InspectionManager, userTypes.Admin,userTypes.ProcurementManager,userTypes.Client])
    
}).required()


const order_schema=yup.object({

    "client-name":yup.string().required().trim(),
    "pick-up-Date":yup.string().required().trim(),
    "pick-up-time":yup.string().required().trim(),
    "expected-delivery-time":yup.number().required(),
    "checklist-id":yup.string().optional().trim(),
})

const checklist_schema=yup.object({

    "client-name":yup.string().required().trim(),
    "Question-1":yup.string().required().trim(),
    "Question-2":yup.string().required().trim(),
    "Question-3":yup.string().required().trim(),
    "Question-4":yup.string().required().trim(),
    "Question-5":yup.string().required().trim(),
    "inspection-manager":yup.string().matches(email_regex,'Email Enterd is Invalid.').required().trim(),
})


const checklist_update_schema=yup.object({
    "checklist-id":yup.number().required(),
    "Answere-1":yup.string().required().trim(),
    "Answere-2":yup.string().required().trim(),
    "Answere-3":yup.string().required().trim(),
    "Answere-4":yup.string().required().trim(),
    "Answere-5":yup.string().required().trim(),
    "Answere-client":yup.string().required().trim()
})

const checklist_status_schema=yup.object({

    "checklist-id":yup.number().required(),
    "Remark":yup.string().required().trim(),
})


const authority_schema=yup.object({

    "assign":yup.boolean().required(),
    "pm":yup.string().matches(email_regex,'Email Enterd for Procurement Manager is Invalid.').required().trim(),
    "im":yup.string().matches(email_regex,'Email Enterd for Inspection Manager is Invalid.').required().trim(),
})

const clientmanage_schema=yup.object({

    "type": yup.string().required().trim(),
    "client-name": yup.string().required().trim(),
    "client-cotactNo": yup.number().required(),
    "client-address": yup.string().required().trim(),
    "product": yup.string().required().trim(),
    "description": yup.string().required().trim(),
    "shipping-address": yup.string().required().trim(),
    "instructions": yup.string().required().trim(),
})

const linkchecklist_schema=yup.object({
    "order-id":yup.number().required(),
    "checklist-id":yup.number().required(),
    "procurement-manager-comment":yup.string().required().trim(),
})

module.exports={
    login_schema,
    signup_schema,
    order_schema,
    checklist_schema,
    checklist_update_schema,
    checklist_status_schema,
    authority_schema,
    clientmanage_schema,
    linkchecklist_schema
}



