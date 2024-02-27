const express=require('express')
const router=express.Router();
const controller=require('../controllers/controller.js')
const responseHandler=require('../utils/responseHandler')
const errHandler=require('../utils/errorHandler')
const auth=require('../helperModules/authentication.js')

const clientrouter=require('./client-routes.js')
const orderrouter=require('./order-routes.js')
const checklistrouter=require('./checklist-routes.js')
const adminrouter=require('./admin-routes.js')

const {validation}=require('../validation/index.js')
const {login_schema,signup_schema}=require('../validation/schemas.js')


//all client Routes
router.use('/client',clientrouter);

//all admin Routes
router.use('/admin',adminrouter);

//all order Routes
router.use('/order',orderrouter);

//all checklist Routes
router.use('/checklist',checklistrouter)

//authentication Routes
router.post('/login',validation(login_schema),controller.login);
router.get('/refreshToken',controller.refreshToken)
router.post('/signup',validation(signup_schema),auth.tokenValidate,auth.allowedRoutes,controller.signup);



router.use(responseHandler)
router.use(errHandler)

//Handel Unkown Routes
router.all('*', (req, res) => {
    res.status(404).send(`Url:${req.originalUrl} Not Found.`);
}) 


module.exports=router;