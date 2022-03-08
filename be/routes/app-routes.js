const authController = require('../controllers/auth-controller')

module.exports = (app, handleRequestDB, express)   => {      
   app.use('/common/img', [authController.verifyClientVersion], express.static('./media/img/common/'));        
}