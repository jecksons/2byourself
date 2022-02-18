class TokenService{

   static getLocalAccessToken() {
      return TokenService.getLocalUser()?.accessToken;      
   }

   static getLocalRefreshToken() {      
      return TokenService.getLocalUser()?.refreshToken;      
   }

   static updateLocalAccessToken(token){
      let user = TokenService.getLocalUser();
      if (user) {
         user.accessToken = token;
         localStorage.setItem('user', JSON.stringify(user));
      }
   }

   static getLocalUser() {
      return JSON.parse(localStorage.getItem('user'));
   }

   static updateLocalUser(user){
      localStorage.setItem('user', JSON.stringify(user));
   }

   static deleteLocalUser(){
      localStorage.removeItem('user');
   }
   
}

export default TokenService;