import api from "../services/api";

class MenuController {

   static loadMenu(onMenuLoaded) {
      api.get('/products/menu/')
      .then((ret) => {
         onMenuLoaded(ret.data);
      });
   }
   
}

export default MenuController;