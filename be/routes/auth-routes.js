const authController = require('../controllers/auth-controller')

module.exports = (app, handleRequestDB) => {   
   
   app.get('/auth/signin-demo/', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, authController.signInDemo));
   app.get('/auth/signin/', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, authController.signIn));
   app.get('/auth/signin-email/:email', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, authController.signInEmail));
   app.get('/auth/check-email/:email', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, authController.emailVerify));
   app.post('/auth/signup-email/', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, authController.signUpEmail));
   app.post('/auth/refresh-token/', [authController.verifyClientVersion], (req, res) => handleRequestDB(req, res, authController.refreshTokenReq));   

}

