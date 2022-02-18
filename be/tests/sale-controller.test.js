const controller = require('../controllers/sale-controller'),
   cartController = require('../controllers/cart-controller'),
   connFactory = require('../services/connection-db'),
   prdController = require('../controllers/product-controller'),
   dotenv = require('dotenv');

dotenv.config();

const config = require('../config');
const { ErBadRequest, ErNotFound, ErUnprocEntity } = require('../services/error_classes');
const UtilsLib = require('../services/utils_lib');
const [Sale] = require('../models/sale');

const id_user_demo = 1;

test('Get payment methods.', async () => {
   expect.assertions(1);   
   const payments = await controller.getPaymentMethods(connFactory.getConnection(config));
   expect(payments.length).toBeGreaterThan(0);
});

test('Fail to save sale whithout an email.', async () => {
   expect.assertions(1);
   let conn = connFactory.getConnection(config);
   const payments = await controller.getPaymentMethods(conn);
   conn = connFactory.getConnection(config);
   const products = await prdController.getProducts({}, conn);
   if (products.results.length > 1) {
      conn = connFactory.getConnection(config);
      const prdOne = await prdController.getProductByIdNT(products.results[0].id, conn);
      let cart = await cartController.addItemToCart({id_product: prdOne.id, id_size: prdOne.sizes[0].id, quantity: 2}, conn);
      const sale = new Sale({
         id_cart: cart.id,
         id_payment_method: payments[0].id,         
      });
      conn = connFactory.getConnection(config);
      try {
         await controller.saveSale(sale, id_user_demo, conn);
      } catch (err) {
         expect(err.message).toMatch('email is mandatory');
      }      
   }   
});



test('Save a sale.', async () => {
   expect.assertions(3);
   let conn = connFactory.getConnection(config);
   const payments = await controller.getPaymentMethods(conn);
   conn = connFactory.getConnection(config);
   const products = await prdController.getProducts({}, conn);
   if (products.results.length > 1) {      
      const prdCount = UtilsLib.getRandomInt(2, products.results.length);
      let i = 0;
      let cart = {id: 0};
      while (i < prdCount) {
         conn = connFactory.getConnection(config);
         const prdOne = await prdController.getProductByIdNT(UtilsLib.getRandomElement(products.results).id, conn);
         cart = await cartController.addItemToCart({id_product: prdOne.id, id_size: prdOne.sizes[0].id, quantity: UtilsLib.getRandomInt(1, 10), id_cart: cart.id }, conn);      
         i++;
      }      
      let sale = new Sale({
         id_cart: cart.id,
         id_payment_method: payments[0].id,         
         email: 'jeckson.es@gmail.com',
         freight_value: UtilsLib.getRandomInt(0, 100)
      });
      conn = connFactory.getConnection(config);
      sale = await controller.saveSale(sale, id_user_demo, conn);
      expect(sale.id).toBeGreaterThan(0);
      conn = connFactory.getConnection(config);
      let saleQuery = await controller.getSaleOrder(sale.id, id_user_demo, conn);      
      expect(saleQuery.items.length).toBe(prdCount);
      conn = connFactory.getConnection(config);
      await controller.deleteSaleOrder(sale.id, id_user_demo, conn);      
      try {
         conn = connFactory.getConnection(config);
         await controller.getSaleOrder(sale.id, id_user_demo, conn);      
      } catch(err) {
         expect(err).toBeInstanceOf(ErNotFound);
      }
   }   
});


test('Get sales from user.', async () => {
   expect.assertions(3);
   let conn = connFactory.getConnection(config);
   const payments = await controller.getPaymentMethods(conn);
   conn = connFactory.getConnection(config);
   const products = await prdController.getProducts({}, conn);
   if (products.results.length > 1) {      
      const prdCount = UtilsLib.getRandomInt(2, products.results.length);
      let i = 0;
      let cart = {id: 0};
      while (i < prdCount) {
         conn = connFactory.getConnection(config);
         const prdOne = await prdController.getProductByIdNT(UtilsLib.getRandomElement(products.results).id, conn);
         cart = await cartController.addItemToCart({id_product: prdOne.id, id_size: prdOne.sizes[0].id, quantity: UtilsLib.getRandomInt(1, 10), id_cart: cart.id }, conn);      
         i++;
      }      
      let sale = new Sale({
         id_cart: cart.id,
         id_payment_method: payments[0].id,         
         email: 'jeckson.es@gmail.com'
      });
      conn = connFactory.getConnection(config);
      sale = await controller.saveSale(sale, id_user_demo, conn);
      expect(sale.id).toBeGreaterThan(0);      
      conn = connFactory.getConnection(config);
      let saleQuery = await controller.getUserOrders(id_user_demo, {}, conn);            
      expect(saleQuery.results.length).toBeGreaterThan(0);
      expect(saleQuery.results[0].id).toBe(sale.id);
      conn = connFactory.getConnection(config);
      await controller.deleteSaleOrder(sale.id, id_user_demo, conn);            
   }   
});




test('Advance all sale stages.', async () => {
   expect.assertions(3);
   let conn = connFactory.getConnection(config);
   const payments = await controller.getPaymentMethods(conn);
   conn = connFactory.getConnection(config);
   const products = await prdController.getProducts({}, conn);
   if (products.results.length > 1) {      
      const prdCount = UtilsLib.getRandomInt(2, products.results.length);
      let i = 0;
      let cart = {id: 0};
      while (i < prdCount) {
         conn = connFactory.getConnection(config);
         const prdOne = await prdController.getProductByIdNT(UtilsLib.getRandomElement(products.results).id, conn);
         cart = await cartController.addItemToCart({id_product: prdOne.id, id_size: prdOne.sizes[0].id, quantity: UtilsLib.getRandomInt(1, 10), id_cart: cart.id }, conn);      
         i++;
      }      
      let sale = new Sale({
         id_cart: cart.id,
         id_payment_method: UtilsLib.getRandomElement(payments).id,         
         email: 'jeckson.es@gmail.com'
      });
      conn = connFactory.getConnection(config);
      sale = await controller.saveSale(sale, id_user_demo, conn);
      expect(sale.id).toBeGreaterThan(0);
      expect(sale.finished).toBe(false);
      const timesToAdvance = sale.history.length -1;      
      i = 0;
      while (i < timesToAdvance) {
         conn = connFactory.getConnection(config);
         await controller.advanceOrderStatus(sale.id, id_user_demo, conn);
         i++;
      }
      conn = connFactory.getConnection(config);
      let saleQuery = await controller.getSaleOrder(sale.id, id_user_demo, conn);      
      expect(saleQuery.finished).toBe(true);
      conn = connFactory.getConnection(config);
      await controller.deleteSaleOrder(sale.id, id_user_demo, conn);            
   }   
});



test('Fail to order the same cart more than once.', async () => {
   expect.assertions(2);
   let conn = connFactory.getConnection(config);
   const payments = await controller.getPaymentMethods(conn);
   conn = connFactory.getConnection(config);
   const products = await prdController.getProducts({}, conn);
   if (products.results.length > 1) {      
      const prdCount = UtilsLib.getRandomInt(2, products.results.length);
      let i = 0;
      let cart = {id: 0};
      while (i < prdCount) {
         conn = connFactory.getConnection(config);
         const prdOne = await prdController.getProductByIdNT(UtilsLib.getRandomElement(products.results).id, conn);
         cart = await cartController.addItemToCart({id_product: prdOne.id, id_size: prdOne.sizes[0].id, quantity: UtilsLib.getRandomInt(1, 10), id_cart: cart.id }, conn);      
         i++;
      }      
      let sale = new Sale({
         id_cart: cart.id,
         id_payment_method: UtilsLib.getRandomElement(payments).id,         
         email: 'jeckson.es@gmail.com'
      });
      conn = connFactory.getConnection(config);
      const saleOne = await controller.saveSale(sale, id_user_demo, conn);
      expect(saleOne.id).toBeGreaterThan(0);
      conn = connFactory.getConnection(config);
      try {
         await controller.saveSale(sale, id_user_demo, conn);
      } catch(err) {
         expect(err.message).toMatch('cart is no longer available');         
      }      
      conn = connFactory.getConnection(config);
      await controller.deleteSaleOrder(saleOne.id, id_user_demo, conn);            
   }   
});