const authController = require('../controllers/auth-controller')
const controller = require('../controllers/product-controller');

module.exports = (app, handleRequestDB, express)   => {   
   
   app.use('/products/img', express.static('./media/img/done'));  
   app.get('/products/filters',  (req, res) => handleRequestDB(req, res, controller.getProductFiltersReq));   
   app.get('/products/menu',  (req, res) => handleRequestDB(req, res, controller.getMenuOptionsReq));      
   app.get('/products/',  (req, res) => handleRequestDB(req, res, controller.getProductsReq));   
   app.get('/products/id/:id',  (req, res) => handleRequestDB(req, res, controller.getProductByIdReq));   
   app.get('/products/generate-ratings/',  (req, res) => handleRequestDB(req, res, controller.generateRatingsReq) );
}