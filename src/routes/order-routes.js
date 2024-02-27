const express=require('express')
const router=express.Router();
const orderController=require('../controllers/order.js')
const auth=require('../helperModules/authentication.js')
const errHandler=require('../utils/errorHandler')
const responseHandler=require('../utils/responseHandler')
const {validation}=require('../validation/index.js')

const {order_schema }=require('../validation/schemas.js')

//admin can view all orders and pm / im /clients can only view Respective orders.
router.get('/viewOrders',auth.tokenValidate,auth.allowedRoutes,orderController.fetchOrders)

//pm will create order
router.post('/create',validation(order_schema),auth.tokenValidate,auth.allowedRoutes,orderController.create)

// pm / im /admin can update status of order
router.patch('/updatestatus',auth.tokenValidate,auth.allowedRoutes,orderController.updatestatus)



router.use(errHandler)
router.use(responseHandler)

//Handel Unkown Routes
router.all('*', (req, res) => {
    res.status(404).send(`Url:${req.originalUrl} Not Found.`);
}) 

module.exports=router;