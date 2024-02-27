const express=require('express')
const router=express.Router();
const checklistController=require('../controllers/checklist.js')
const auth=require('../helperModules/authentication.js')
const errHandler=require('../utils/errorHandler')
const responseHandler=require('../utils/responseHandler')

const {validation}=require('../validation/index.js')
const {checklist_schema,checklist_status_schema,checklist_update_schema,checklistLink}=require('../validation/schemas.js')

//only pm can link orders with checklist
router.patch('/link',validation(checklistLink),auth.tokenValidate,auth.allowedRoutes,checklistController.link)

//only pm can create checklist.
router.post('/create',validation(checklist_schema),auth.tokenValidate,auth.allowedRoutes,checklistController.create)
router.patch('/sendback',validation(checklist_status_schema),auth.tokenValidate,auth.allowedRoutes,checklistController.sendback)
router.patch('/approve',validation(checklist_status_schema),auth.tokenValidate,auth.allowedRoutes,checklistController.approve)
router.get('/viewChecklist',auth.tokenValidate,auth.allowedRoutes,checklistController.viewChecklist)


//inspection manager will update checklist with answeres.
router.patch('/update',validation(checklist_update_schema),auth.tokenValidate,auth.allowedRoutes,checklistController.update)
router.post('/uploadDocs',auth.tokenValidate,auth.allowedRoutes,checklistController.uploadDocs)
router.get('/downloadDocs/:fileid',auth.tokenValidate,auth.tokenValidate,auth.allowedRoutes,checklistController.downloadDocs)


router.use(errHandler)
router.use(responseHandler)

//Handel Unkown Routes
router.all('*', (req, res) => {
    res.status(404).send(`Url:${req.originalUrl} Not Found.`);
}) 

module.exports=router;