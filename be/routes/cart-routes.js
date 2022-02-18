const authController = require('../controllers/auth-controller')
const controller = require('../controllers/cart-controller');

module.exports = (app, handleRequestDB, express)   => {   
   app.post('/carts/',  (req, res) => handleRequestDB(req, res, controller.addItemToCartReq));      
   app.get('/carts/id/:id',  (req, res) => handleRequestDB(req, res, controller.getCartReq));         
   app.post('/carts/items/',  (req, res) => handleRequestDB(req, res, controller.updateCartItemReq));      
   app.delete('/carts/items/:id',  (req, res) => handleRequestDB(req, res, controller.delItemFromCartReq));      
   
}