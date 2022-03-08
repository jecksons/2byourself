const authController = require('../controllers/auth-controller')
const controller = require('../controllers/product-controller');

module.exports = (app, handleRequestDB, express)   => {   
   
   app.use('/products/img', [authController.verifyClientVersion], express.static('./media/img/products/normal'));  
   app.use('/products/img/small/', [authController.verifyClientVersion], express.static('./media/img/products/small'));  
   app.get('/products/filters',  [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.getProductFiltersReq));   
   app.get('/products/menu', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.getMenuOptionsReq));      
   app.get('/products/', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.getProductsReq));   
   app.get('/products/id/:id', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.getProductByIdReq));   
   app.get('/products/generate-ratings/', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.generateRatingsReq) );
   app.get('/products/search-text-options/', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, controller.getProductsOptionsByTextReq) );   
}