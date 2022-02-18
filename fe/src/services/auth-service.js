import api from "./api";
import TokenService from "./token-service";
import { createBrowserHistory } from 'history';

class AuthService {

   static async loginDemo() {
      let ret = await api.get('auth/signin-demo/');
      TokenService.updateLocalUser(ret.data);      
   }

   static logout(backToHome) {
      TokenService.deleteLocalUser();
      if (backToHome) {
         createBrowserHistory().push('/');
         window.location.reload();
      }      
   }

   static async signUpEmail(username, email) {
      let ret = await api.post('auth/signup-email', {
         description: username,
         email: email
      });
      TokenService.updateLocalUser(ret.data);
   }

   static async getLoginByEmail(email) {
      let ret = await api.get(`/auth/signin-email/${email}`);
      TokenService.updateLocalUser(ret.data);
      return ret;
   }

   static checkEmailExists(email) {
      return api.get(`/auth/check-email/${email}`);
   }

   static getLocalSavedUser() {
      return TokenService.getLocalUser();
   }

}

export default AuthService;