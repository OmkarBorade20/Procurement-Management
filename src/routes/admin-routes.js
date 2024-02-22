const express=require('express')
const router=express.Router();
const adminController=require('../controllers/admin.js')
const auth=require('../helperModules/authentication.js')
const errHandler=require('../utils/errorHandler')
const responseHandler=require('../utils/responseHandler')

const validate=require('../validation/index.js')

//only Admin can Access this
router.get('/allUsers',auth.tokenValidate,auth.allowedRoutes,adminController.allUsers);
router.patch('/setAuthority',validate.authority,auth.tokenValidate,auth.allowedRoutes,adminController.setAuthority)
router.get('/fetchMapping',auth.tokenValidate,auth.allowedRoutes,adminController.fetchMapping)
router.get('/fetchMapping/:email',auth.tokenValidate,auth.allowedRoutes,adminController.fetchMapping)
router.get('/fetchProcumentManagers',auth.tokenValidate,auth.allowedRoutes,adminController.fetchProcumentManagers)
router.get('/fetchInspectionManagers',auth.tokenValidate,auth.allowedRoutes,adminController.fetchInspectionManagers)


router.use(errHandler)
router.use(responseHandler)

//Handel Unkown Routes
router.all('*', (req, res) => {
    res.status(404).send(`Url:${req.originalUrl} Not Found.`);
}) 

module.exports=router;