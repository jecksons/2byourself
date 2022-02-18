const controller = require('../controllers/cart-controller'),
   connFactory = require('../services/connection-db'),
   prdController = require('../controllers/product-controller'),
   dotenv = require('dotenv');

dotenv.config();

const config = require('../config');
const { ErBadRequest, ErNotFound, ErUnprocEntity } = require('../services/error_classes');
const UtilsLib = require('../services/utils_lib');

const id_user_demo = 1;

test('Fail to get an unexisting cart.', async () => {
   expect.assertions(1);
   let conn = connFactory.getConnection(config);
   try {
      await controller.getCart('321321', conn);      
   } catch (err) {
      expect(err).toBeInstanceOf(ErNotFound);
   }
});


test('Add item to a new cart, compares and remove the cart.', async () => {
   expect.assertions(3);
   let conn = connFactory.getConnection(config);
   const prods = await prdController.getProducts({}, conn);
   if (prods.results.length > 0) {
      conn = connFactory.getConnection(config);
      const prd = await prdController.getProductById(prods.results[0].id, conn);
      conn = connFactory.getConnection(config);
      const cart = await controller.addItemToCart({id_product: prd.id, quantity: 1, id_size: prd.sizes[0].id}, conn);
      expect(cart.items.length).toBe(1);
      conn = connFactory.getConnection(config);
      const cartQuery = await controller.getCart(cart.id, conn);
      expect(cart.id).toBe(cartQuery.id);
      conn = connFactory.getConnection(config);
      await controller.delCart(cart.id, conn);
      conn = connFactory.getConnection(config);
      try {
         await controller.getCart(cart.id, conn);      
      } catch (err) {
         expect(err).toBeInstanceOf(ErNotFound);
      }
   }
});


test('Delete item from a cart.', async () => {
   expect.assertions(6);
   let conn = connFactory.getConnection(config);
   const prods = await prdController.getProducts({}, conn);
   if (prods.results.length > 1) {
      conn = connFactory.getConnection(config);
      /* get two products */
      const prdOne = await prdController.getProductByIdNT(prods.results[0].id, conn);
      const prdTwo = await prdController.getProductByIdNT(prods.results[1].id, conn);      
      /* add them to a new cart */
      let cart = await controller.addItemToCart({id_product: prdOne.id, quantity: 1, id_size: prdOne.sizes[0].id}, conn);
      expect(cart.items.length).toBe(1);
      conn = connFactory.getConnection(config);
      cart = await controller.addItemToCart({id_product: prdTwo.id, quantity: 5, id_size: prdTwo.sizes[0].id, id_cart: cart.id}, conn);
      expect(cart.items.length).toBe(2);
      /* remove one of them */
      conn = connFactory.getConnection(config);
      cart = await controller.delItemFromCart(cart.id, cart.items[0].id, conn);
      expect(cart.items.length).toBe(1);
      /* retrieves the cart to ensure the item was deleted. */
      conn = connFactory.getConnection(config);
      let cartQuery = await controller.getCart(cart.id, conn);
      expect(cart.items.length).toBe(cartQuery.items.length);
      /* remove the remaining item */
      conn = connFactory.getConnection(config);
      cart = await controller.delItemFromCart(cart.id, cart.items[0].id, conn);      
      expect(cart.items.length).toBe(0);
      conn = connFactory.getConnection(config);
      /* remove the cart */
      await controller.delCart(cart.id, conn);
      conn = connFactory.getConnection(config);
      try {
         /* ensure the cart was deleted */
         await controller.getCart(cart.id, conn);      
      } catch (err) {
         expect(err).toBeInstanceOf(ErNotFound);
      }
   }
});


test('Fail to update an item with invalid quantity.', async () => {
   expect.assertions(2);
   let conn = connFactory.getConnection(config);
   const prods = await prdController.getProducts({}, conn);
   if (prods.results.length > 1) {
      conn = connFactory.getConnection(config);
      const prdOne = await prdController.getProductByIdNT(prods.results[0].id, conn);
      /* add them to a new cart */      
      let cart = await controller.addItemToCart({id_product: prdOne.id, quantity: 2, id_size: prdOne.sizes[0].id}, conn);
      expect(cart.items.length).toBe(1);      
      conn = connFactory.getConnection(config);
      /* try to change the quantity */
      try {
         await controller.updateCartItem({id: cart.items[0].id, id_cart: cart.id, quantity: 0}, conn);
      } catch (err) {
         expect(err).toBeInstanceOf(ErBadRequest);
      }
      conn = connFactory.getConnection(config);
      /* remove the cart */
      await controller.delCart(cart.id, conn);      
   }
});

test('Update an item from cart.', async () => {
   expect.assertions(3);
   let conn = connFactory.getConnection(config);
   const prods = await prdController.getProducts({}, conn);
   if (prods.results.length > 1) {
      conn = connFactory.getConnection(config);
      const prdOne = await prdController.getProductByIdNT(prods.results[0].id, conn);
      /* add them to a new cart */
      let cart = await controller.addItemToCart({id_product: prdOne.id, quantity: 2, id_size: prdOne.sizes[0].id}, conn);
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].quantity).toBe(2);
      conn = connFactory.getConnection(config);
      /* change the quantity */
      cart = await controller.updateCartItem({id: cart.items[0].id, id_cart: cart.id, quantity: 5}, conn);
      /* get the updated info */
      conn = connFactory.getConnection(config);
      let cartQuery = await controller.getCart(cart.id, conn);
      expect(cartQuery.items[0].quantity).toBe(5);      
      conn = connFactory.getConnection(config);
      /* remove the cart */
      await controller.delCart(cart.id, conn);      
   }
});

