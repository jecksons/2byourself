const [  Sale, 
         SS_DELIVERED, 
         SS_ORDERED, 
         SS_PAYMENT_PENDING, 
         SS_PREPARATION_TO_SHIP,
         SS_IN_TRANSPORTATION] = require("../models/sale");
const { ErBadRequest, ErNotFound, ErUnprocEntity } = require("../services/error_classes");
const UtilsLib = require("../services/utils_lib");
const userController = require("./user-controller");
const CartController = require("./cart-controller");

const SQL_INS_SALE = `
      insert into sale_order
      (
         created_at,
         id_user,
         email,
         items_value,
         id_discount_code,
         discount_code_value,
         offer_discount_value,
         freight_value,
         total_value,
         id_cart,
         id_sale_status,
         id_payment_method,
         delivery_forecast
      )
      values(sysdate(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   `;

const SQL_INS_SALE_HISTORY = `
      insert into sale_order_history
      (
         id_sale_order,
         event_date,
         id_sale_status
      )
      values(?, sysdate(), ?)
   `;

const SQL_SEL_ORDER = `
      select 
         sal.id_sale_order,
         sal.created_at,
         sal.email,
         sal.items_value,
         sal.id_discount_code,
         sal.discount_code_value,
         sal.offer_discount_value,
         sal.total_value,
         sal.freight_value,
         sal.id_cart,
         sal.id_sale_status current_status,
         pay.description payment_method,
         his.event_date,
         his.id_sale_status,
         sta.description status_description
      from 
         sale_order sal
      left join sale_order_history his on (sal.id_sale_order = his.id_sale_order)
      left join sale_status sta on (his.id_sale_status = sta.id_sale_status) 
      left join payment_method pay on (sal.id_payment_method = pay.id_payment_method)
      where
         sal.id_sale_order = ?
         and sal.id_user = ?
      order by 
         his.id_sale_order_history
   `;


const SQL_SEL_USER_ORDERS = `
      with
         sal as
         (
            select 
               sal.id_sale_order,
               sal.created_at,
               sal.total_value,
               sal.id_sale_status,
               sal.id_cart,
               sal.delivery_forecast,
               row_number() over(order by sal.id_sale_order desc) rn,
               count(1) over() sales_count
            from 
               sale_order sal
            where
               sal.id_user = ?
         ),
         agp as
         (
            select
               sal.*,
               (
                  select
                     max(hst.id_sale_order_history)
                  from
                     sale_order_history hst
                  where
                     hst.id_sale_order = sal.id_sale_order
               ) last_history,
               (
                  select
                     count(1)
                  from
                     cart_item itm
                  where
                     itm.id_cart = sal.id_cart
               ) items
            from
               sal
            where
               sal.rn between ? and ?
         ),
         ima as
         (
            select 
               itm.id_cart,
               row_number() over(partition by itm.id_cart order by itm.id_cart_item) rn_img,
               prd.id_image
            from          
               cart_item itm
            join agp on (agp.id_cart = itm.id_cart)
            left join product prd on ( prd.id_product = itm.id_product)
         ),
         img as
         (
            select
               *
            from
               ima
            where
               rn_img <= 3
         )  
      select
         agp.*,
         im1.id_image image_1,
         im2.id_image image_2,
         im3.id_image image_3,
         hst.event_date
      from
         agp
         left join sale_order_history hst on (agp.last_history = hst.id_sale_order_history)
         left join img im1 on (im1.id_cart = agp.id_cart and im1.rn_img = 1)
         left join img im2 on (im2.id_cart = agp.id_cart and im2.rn_img = 2)
         left join img im3 on (im3.id_cart = agp.id_cart and im3.rn_img = 3)
      order by
         agp.rn
   `;

class SaleController {

   static async getDiscountFromDiscountCode(discountCode, conn) {
      const rows = await conn.query(`
            select 
               discount
            from
               discount_code
            where
               id_discount_code = ?
      `, [discountCode]);
      if (rows.length > 0) {
         return rows[0].discount;
      }
      throw new ErNotFound('Discount code not found!');
   }

   static async validateSale(sale, user, conn) {
      if (!user.email) {
         if (!UtilsLib.validateEmail(sale.email)) {
            throw new ErBadRequest('For anonymous user, the email is mandatory!');
         }
      }
      if (!sale.id_payment_method) {
         throw new ErBadRequest('The payment method was not informed!');
      }
      if (!sale.id_cart) {
         throw new ErBadRequest('The cart id was not informed!');
      }
      const rows = await conn.query(`
            select
               1
            from
               sale_order sal
            where
               sal.id_cart = ?
         `, [sale.id_cart]);
      if (rows.length > 0) {
         throw new ErBadRequest('This cart is no longer available!');
      }
   }

   static async calculateSale(sale, conn) {
      const cart = await CartController.getCartFromIdNT(sale.id_cart, conn);
      sale.items_value = cart.total_value + cart.total_discount;            
      sale.offer_discount_value = cart.total_discount;
      sale.discount_code_value = 0;
      if (sale.id_discount_code) {
         const percDiscount = await SaleController.getDiscountFromDiscountCode(sale.id_discount_code, conn);
         sale.discount_code_value =  UtilsLib.roundTo((sale.items_value - sale.offer_discount_value) * (percDiscount / 100), 2);
      }
      sale.total_value = sale.items_value - sale.offer_discount_value + sale.freight_value - sale.discount_code_value;
      sale.id_sale_status = SS_ORDERED;
      if (!sale.delivery_forecast) {
         sale.delivery_forecast = UtilsLib.getTruncDate(new Date());
         if (sale.days_to_delivery) {
            sale.delivery_forecast = UtilsLib.addDays(sale.delivery_forecast, sale.days_to_delivery);
         }
      }
   }

   static async insertSaleHistory(idSale, idSaleStatus, conn) {
      await conn.query(SQL_INS_SALE_HISTORY, [idSale, idSaleStatus]);
   }

   static async insertSale(sale, conn) {
      const rows = await conn.query(SQL_INS_SALE,
            [
               sale.id_user,
               sale.email,
               sale.items_value,
               sale.id_discount_code,
               sale.discount_code_value,
               sale.offer_discount_value,
               sale.freight_value,
               sale.total_value,
               sale.id_cart,
               sale.id_sale_status,
               sale.id_payment_method,
               sale.delivery_forecast
            ]
         );
      sale.id = rows.insertId;      
      await SaleController.insertSaleHistory(sale.id, sale.id_sale_status, conn);
   }

   static async saveSale(sale, idUser, conn) {      
      let transStarted = false;
      try {
         if (!(sale instanceof Sale)) {
            throw new ErBadRequest('The sale must be from Sale class.');
         }
         const saleUser = await userController.getUserById(idUser, conn, true);
         await SaleController.validateSale(sale, saleUser, conn);
         sale.id_user = saleUser.id;
         await SaleController.calculateSale(sale, conn);
         await conn.beginTransaction();
         await SaleController.insertSale(sale, conn);         
         await conn.commit();
         return await SaleController.getSaleOrderNT(sale.id, sale.id_user, conn);
      } catch (err) {
         if (transStarted) {
            await conn.rollback();
         }
         throw err;
      }
      finally {
         await conn.close();
      }
   }

   static getSaleHistoryPath(creationDate) {
      const statusList = [
         SS_ORDERED,
         SS_PAYMENT_PENDING,
         SS_PREPARATION_TO_SHIP,
         SS_IN_TRANSPORTATION,
         SS_DELIVERED
      ];
      let ret = [];
      let currDate = creationDate;
      statusList.forEach((itm) => {
         ret.push({
            id_sale_status: itm,
            expected_date: currDate
         });
         currDate = UtilsLib.addDays(currDate, 1);
      });        
      return ret;
   }

   static async advanceOrderStatus(idSale, idUser, conn) {
      let transStarted = false;
      try {
         let currSale = await SaleController.getSaleOrderNT(idSale, idUser, conn, false);
         if (currSale.finished) {
            throw new ErUnprocEntity('The sales order has already been delivered!')
         }         
         for (let i = 0; i < currSale.history.length; i++) {
            if (!currSale.history[i].event_date) {
               await conn.beginTransaction();
               transStarted = true;
               await conn.query(`
                     update
                        sale_order
                     set
                        id_sale_status = ?
                     where
                        id_sale_order = ?               
                  `, [currSale.history[i].id_sale_status, idSale]);
               await SaleController.insertSaleHistory(idSale, currSale.history[i].id_sale_status, conn);
               await conn.commit();
               currSale = await SaleController.getSaleOrderNT(idSale, idUser, conn, false);
               return {
                  id: currSale.id,
                  finished: currSale.finished,
                  history: currSale.history
               };
            }
         }
         throw new ErUnprocEntity('No valid status found to advance!');
      } catch (err) {
         if (transStarted) {
            await conn.rollback();
         }
         throw err;
      }      
      finally {
         await conn.close();
      }
   }

   static async getSaleOrderNT(idSale, idUser, conn, includeItems = true)  {
      const rows = await conn.query(SQL_SEL_ORDER, [idSale, idUser]);
      if (rows.length > 0) {
         let sal = {
            id: rows[0].id_sale_order,
            created_at: rows[0].created_at,
            email: rows[0].email,
            items_value: rows[0].items_value,
            discount_code: rows[0].id_discount_code,
            discount_code_value: rows[0].discount_code_value,
            offer_discount_value: rows[0].offer_discount_value,
            freight_value: rows[0].freight_value,
            total_value: rows[0].total_value,
            payment_method: rows[0].payment_method,
            id_cart: rows[0].id_cart,
            id_sale_status: rows[0].current_status,
            history: [],
            items: [],
            finished: rows[0].current_status === SS_DELIVERED
         };
         let hstPath = SaleController.getSaleHistoryPath(sal.created_at);
         rows.forEach((itm) => {
            if (itm.id_sale_status) {
               const itmHst = hstPath.find((hpt) => hpt.id_sale_status === itm.id_sale_status);
               if (itmHst) {
                  itmHst.event_date = itm.event_date;
               }
            }
         });
         sal.history = hstPath;
         if (includeItems) {
            const cartInfo = await CartController.getCartFromIdNT(sal.id_cart, conn);
            sal.items = cartInfo.items;
         }         
         return sal;
      }
      throw new ErNotFound('Sales order not found!');      
   }

   static async getSaleOrder(idSale, idUser, conn)  {      
      try {
         return await SaleController.getSaleOrderNT(idSale, idUser, conn);
      } finally {
         await conn.close();
      }
   }
   
   static async getUserOrders(idUser, query, conn)  {
      try {
         const ret = {
            metadata: {
               total: 0,
               count: 0,
               limit: parseInt(query.limit) > 0 ? parseInt(query.limit) : 20,
               offset: parseInt(query.offset) >= 0 ? parseInt(query.offset) : 0,
            },
            results: []
         };
         const rows = await conn.query(SQL_SEL_USER_ORDERS, [idUser, ret.metadata.offset + 1, ret.metadata.offset + ret.metadata.limit]);
         if (rows.length > 0) {
            ret.metadata.total = rows[0].sales_count;
            ret.metadata.count = rows.length;            
            ret.results = rows.map((itm) => {
               const itmRet = {
                  id: itm.id_sale_order,
                  created_at: itm.created_at,
                  total_value: itm.total_value,
                  id_sale_status: itm.id_sale_status,
                  items: itm.items,
                  delivery_forecast: itm.delivery_forecast,
                  last_status_change: itm.event_date,
                  image_sample: []
               }
               if (itm.image_1) {
                  itmRet.image_sample.push(`/products/img/small/${itm.image_1}.webp`);
               }
               if (itm.image_2) {
                  itmRet.image_sample.push(`/products/img/small/${itm.image_2}.webp`);
               }
               if (itm.image_3) {
                  itmRet.image_sample.push(`/products/img/small/${itm.image_3}.webp`);
               }
               return itmRet;
            });
         }
         return ret;
      } finally {
         await conn.close();
      }      
   }

   static async deleteSaleOrder(idSale, idUser, conn)  {
      try {
         const rows = await conn.query(`
            delete from sale_order
            where 
               id_sale_order = ?
               and id_user = ?
         `, [idSale, idUser]);
         if (rows.affectedRows > 0) {
            return {message: 'Successfuly deleted!'};
         }
         throw new ErNotFound('Sales order not found!');
      } finally {
         await conn.close();
      }      
   }

   static async getPaymentMethods(conn) {
      try {
         const rows = await conn.query(`
            select 
               id_payment_method,
               description,
               image
            from 
               payment_method
            order by    
               id_payment_method         
         `);
         if (rows.length > 0) {
            return rows.map((itm) => ({
               id: itm.id_payment_method, 
               description: itm.description,
               image: itm.image
            }));
         }
         return [];
      } finally {
         await conn.close();
      }     
   }

   static async getDeliveryOptions(idCart, conn) {
      try {
         const cart = await CartController.getCartFromIdNT(idCart, conn);
         if (cart.total_value > 0) {
            const priceTable = [
               {fixed: 10, perc: 5, description: 'Express Delivery', value: 0, dayRange: [5, 7]},
               {fixed: 15, perc: 7, description: 'Mail Posting', value: 0, dayRange: [2, 3]},
               {fixed: 25, perc: 9, description: 'ZZ Delivery', value: 0, dayRange: [2]},
            ];
            priceTable.forEach((itm, idx) => {
               if (idx === 0 && (cart.total_value >= 100)) {
                  itm.value = 0;
               } else {
                  itm.value = UtilsLib.roundTo(itm.fixed + (cart.total_value * (itm.perc / 100)), 2);
               }
            });
            return priceTable;
         } else {
            throw new ErUnprocEntity('The cart value has no value!');
         }
      } finally {
         await conn.close();
      }
   }

   static getPaymentMethodsReq(req, res, conn) {
      SaleController.getPaymentMethods(conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }

   static getDeliveryOptionsReq(req, res, conn) {
      SaleController.getDeliveryOptions(req.params.id, conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }

   static saveSaleReq(req, res, conn) {
      const sale = new Sale(req.body);
      SaleController.saveSale(sale, req.id_user, conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }

   static getUserOrdersReq(req, res, conn) {      
      SaleController.getUserOrders(req.id_user, req.query, conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }

   static getSaleOrderReq(req, res, conn) {      
      SaleController.getSaleOrder(req.params.id, req.id_user,  conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }


   

}

module.exports = SaleController;