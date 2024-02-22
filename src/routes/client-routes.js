const express=require('express')
const clientRouter=express.Router();
const clientController=require('../controllers/client')
const auth=require('../helperModules/authentication')
const errHandler=require('../utils/errorHandler')
const responseHandler=require('../utils/responseHandler')
const validate=require('../validation/index')

clientRouter.get('/fetchDetails',auth.tokenValidate,auth.allowedRoutes,clientController.fetchDetails)
clientRouter.patch('/manageDetails',validate.clientManage,auth.tokenValidate,auth.allowedRoutes,clientController.manageDetails)
clientRouter.post('/clientUploadChecklist',auth.tokenValidate,auth.allowedRoutes,clientController.clientUploadChecklist)


clientRouter.use(errHandler)
clientRouter.use(responseHandler)

//handeling unknown routes.
clientRouter.all('*', (req, res) => {
    res.status(404).send(`Url:${req.originalUrl} Not Found.`);
})

module.exports=clientRouter;