const { ErBadRequest, ErNotFound, ErUnprocEntity } = require("../services/error_classes");
const UtilsLib = require("../services/utils_lib");
const ProductController = require("./product-controller");




const SQL_SEL_VALID_CART = `
      select
         1
      from
         cart crt
      where
         crt.id_cart  = ?
         and not exists
                     (
                        select
                           1
                        from
                           sale_order sal
                        where
                           sal.id_cart = crt.id_cart                     
                     )               
   `;

const SQL_INS_CART = `
      insert into cart
      (
         id_cart,
         created_at
      )
      values
      (
         ?,
         sysdate()
      )
   `;

const SQL_INS_CART_ITEM = `
      insert into cart_item
      (
         id_cart,
         id_product,
         id_size,
         quantity,
         price,
         offer_discount,
         total_value
      )   
      values(?, ?, ?, ?, ?, ?, ?)
   `;


const SQL_SEL_CART = `
      select 
         itm.id_cart_item,
         itm.id_product,
         itm.id_size,
         itm.quantity,
         itm.price,
         itm.offer_discount,
         itm.total_value,
         prd.description,
         prd.id_image,
         siz.description size,
         brd.description brand,
         round(sum(itm.total_value) over(), 2) cart_total_value,
         round(sum(itm.offer_discount) over(), 2) cart_total_discount,
         round(sum(itm.offer_discount) over(), 2) cart_items_discount,
         0 cart_code_discount,
         row_number() over(order by itm.id_cart_item) sequence
      from 
         cart_item  itm
      left join product prd on (itm.id_product = prd.id_product)
      left join size siz on (itm.id_size = siz.id_size)
      left join brand brd on (prd.id_brand = brd.id_brand)
      where
         itm.id_cart = ?
   `;

const SQL_SEL_ITEM_CART = `
      select
         itm.id_product
      from
         cart_item itm
      where
         itm.id_cart_item = ?
   `;

const SQL_SEL_CHECK_CART = `
      select
         case
            when exists
                     (
                        select
                           1
                        from
                           sale_order sal
                        where
                           sal.id_cart = crt.id_cart
                     ) then
               1
            else
               0
         end in_a_sale
      from
         cart crt
      where
         crt.id_cart = ?
   `;

class CartController {

   static async getCartIdValidNT(idCart, conn) {
      let rows;            
      if (idCart) {
         rows =  await conn.query(SQL_SEL_VALID_CART, [idCart], conn);
         if (rows.length > 0) {
            return idCart;            
         }
      }       
      const idRet = await UtilsLib.getUniqueString(20, conn);
      await conn.query(SQL_INS_CART, [idRet]);
      return idRet;
   }


   static async addItemToCart(product, conn) {
      let transStarted = false;
      try {
         const prd = await ProductController.getProductByIdNT(product.id_product, conn);
         if (!prd.sizes.find((itm) => product.id_size)) {
            throw new ErBadRequest('The specified size does not exists for this product!');
         }
         await conn.beginTransaction();
         transStarted = true;
         const idCart = await CartController.getCartIdValidNT(product.id_cart, conn);
         const insRow = await conn.query(SQL_INS_CART_ITEM, [
            idCart,
            product.id_product,
            product.id_size,
            product.quantity > 0 ? product.quantity : 1,
            prd.original_price,            
            UtilsLib.roundTo(prd.discount_value * (product.quantity > 0 ? product.quantity : 1), 2),
            UtilsLib.roundTo(prd.final_price * (product.quantity > 0 ? product.quantity : 1), 2)
         ]);            
         await conn.commit();
         return await CartController.getCartFromIdNT(idCart, conn);
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

   static async checkCartIsModifiable(idCart, conn) {
      const rows = await conn.query(SQL_SEL_CHECK_CART, [idCart]);
      if (rows.length > 0) {
         if (rows[0].in_a_sale) {
            throw new ErUnprocEntity('The cart is already in a sales order. Changes are not allowed!');
         }
         return;
      }
      throw new ErNotFound('Cart not found!');
   }

   static async delItemFromCart(idCart, idItem, conn) {
      let transStarted = false;
      try {
         await CartController.checkCartIsModifiable(idCart, conn);
         await conn.beginTransaction();
         transStarted = true;
         const rows = await conn.query(`
               delete from cart_item
               where id_cart_item = ?         
               and id_cart = ?
            `, [idItem, idCart]);
         if (rows.affectedRows > 0) {
            await conn.commit();
            try {
               let ret = await CartController.getCartFromIdNT(idCart, conn);
               return ret;
            } catch (err) {
               if (err instanceof ErNotFound) {
                  return CartController.getEmptyCart(idCart);
               }
               throw err;
            }            
         } else {
            throw new ErNotFound('Cart item not found!');
         }
      } catch (err) {
         if (transStarted) {
            await conn.rollback();
         }
         throw err;
      } finally {
         await conn.close();
      }
   }

   static async delCart(idCart, conn) {
      try {
         await CartController.checkCartIsModifiable(idCart, conn);
         await conn.query(`
            delete from cart 
            where id_cart = ?
            `, [idCart]);
      } finally {
         await conn.close();
      }
   }

   static async getItemCart(idItem, conn) {
      const rows = await conn.query(SQL_SEL_ITEM_CART, [idItem]);
      if (rows.length > 0) {
         return {id_product: rows[0].id_product};
      }
      throw new ErNotFound('Item not found!');
   }

   static async updateCartItem(item, conn) {
      let transStarted = false;
      try {
         await CartController.checkCartIsModifiable(item.id_cart, conn);
         if (!(item.quantity > 0)) {
            throw new ErBadRequest('The new quantity was not provided!');
         }
         if (!item.id) {
            throw new ErBadRequest('The item id was not provided!');
         }
         if (!item.id_cart) {
            throw new ErBadRequest('The cart id was not provided!');
         }
         await conn.beginTransaction();
         const cartItm = await CartController.getItemCart(item.id, conn);
         const prd = await ProductController.getProductByIdNT(cartItm.id_product, conn);
         transStarted = true;
         const rows = await conn.query(`
               update  
                  cart_item
               set
                  quantity = ?,
                  offer_discount = ?,
                  total_value = ?
               where id_cart_item = ?         
               and id_cart = ?
            `, [item.quantity, 
               UtilsLib.roundTo(prd.discount_value * item.quantity, 2),
               UtilsLib.roundTo(prd.final_price * item.quantity, 2),
               item.id, item.id_cart]);
         if (rows.affectedRows > 0) {
            await conn.commit();
            return await CartController.getCartFromIdNT(item.id_cart, conn);            
         } else {
            throw new ErNotFound('Cart item not found!');
         }
      } catch (err) {
         if (transStarted) {
            await conn.rollback();
         }
         throw err;
      } finally {
         await conn.close();
      }
   }

   static getEmptyCart(idCart) {
      return {
         id: idCart,
         total_value: 0,
         total_discount: 0,
         subtotal: 0,
         items_discount: 0,
         code_discount: 0,
         items: []
      };
   }

   static async getCartFromIdNT(idCart, conn) {
      const rows = await conn.query(SQL_SEL_CART, [idCart]);
      if (rows.length > 0) {
         const ret = CartController.getEmptyCart(idCart);
         ret.total_value = rows[0].cart_total_value;
         ret.total_discount = rows[0].cart_total_discount;         
         ret.items_discount = rows[0].cart_items_discount;         
         ret.code_discount = rows[0].cart_code_discount;         
         ret.subtotal = UtilsLib.roundTo( ret.total_value + ret.total_discount, 2);         
         ret.items = rows.map((itm) => ({
            id: itm.id_cart_item,
            description: itm.description,
            size: itm.size,
            quantity: itm.quantity,
            price: itm.price,
            discount: itm.offer_discount,
            brand: itm.brand,
            total_value: itm.total_value,
            image: `/products/img/${itm.id_image}.png`,
         }));
         return ret;            
      }
      throw new ErNotFound('Cart not found!');
   }

   static async getCart(idCart, conn) {
      try {
         return await CartController.getCartFromIdNT(idCart, conn);
      } finally {
         await conn.close();
      }
       
   }

   static addItemToCartReq(req, res, conn) {
      CartController.addItemToCart(req.body, conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }
   
   static updateCartItemReq(req, res, conn) {
      CartController.updateCartItem(req.body, conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }
   

   static getCartReq(req, res, conn) {
      CartController.getCart(req.params.id, conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }

   static delItemFromCartReq(req, res, conn) {
      CartController.delItemFromCart(req.query.cart, req.params.id, conn) 
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }

}



module.exports = CartController;