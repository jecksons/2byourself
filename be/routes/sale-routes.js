const authController = require('../controllers/auth-controller')
const controller = require('../controllers/sale-controller');

module.exports = (app, handleRequestDB, express)   => {   
   app.use('/sales/img', [authController.verifyClientVersion], express.static('./media/img/sales'));  
   app.get('/sales/delivery-options/:id', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.getDeliveryOptionsReq));         
   app.get('/sales/payment-options/', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.getPaymentMethodsReq));              
   app.post('/sales/', [authController.verifyToken], (req, res) => handleRequestDB(req, res, controller.saveSaleReq));
   app.get('/sales/', [authController.verifyToken], (req, res) => handleRequestDB(req, res, controller.getUserOrdersReq));
   app.get('/sales/id/:id', [authController.verifyToken], (req, res) => handleRequestDB(req, res, controller.getSaleOrderReq));   
   app.get('/sales/htmlitem', [], (req, res) => handleRequestDB(req, res, controller.getSaleHtmlReq));   
   
}