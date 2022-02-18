import api from "../services/api";

class CartController {

   static addProduct(product, cartId) {
      return api.post('/carts/', {...product, id_cart: cartId});      
   }

   static getCart(cartId) {
      return api.get(`/carts/id/${cartId}`);
   }

   static updateCartItem(cartId, cartItemId, quantity) {
      return api.post('/carts/items/', {id_cart: cartId, id: cartItemId, quantity: quantity});
   }

   static deleteCartItem(cartId, cartItemId) {
      return api.delete(`/carts/items/${cartItemId}/?cart=${cartId}`);
   }

}

export default CartController;