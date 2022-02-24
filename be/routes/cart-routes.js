const authController = require('../controllers/auth-controller')
const controller = require('../controllers/cart-controller');

module.exports = (app, handleRequestDB, express)   => {   
   app.post('/carts/',  [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.addItemToCartReq));      
   app.get('/carts/id/:id', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.getCartReq));         
   app.post('/carts/items/', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.updateCartItemReq));      
   app.delete('/carts/items/:id', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.delItemFromCartReq));      
   
}