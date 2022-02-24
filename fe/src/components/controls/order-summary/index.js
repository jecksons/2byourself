import PropTypes from 'prop-types';
import "./styles.css";


function OrderSummary({cartInfo, showActions = true, deliveryPrice = null}) {
   
   return (
      <section className="card-square no-pad cart-order-summary">
         <div className="border-bottom-grey">
            <div className="row pad-1  ">
               <label className="font-bold font-1012">Order Summary</label>         
            </div>
         </div>
         <div className="col pad-0-1   ">
            <div className="col-05 border-bottom-grey pad-1-0 align-start width-100  ">
               <label >
                  Discount Code
               </label>
               < div className="row-05 width-100 coupon-container">
                  <input style={{flex: 2}} />                  
                  <button className="btn-action-secundary">Apply</button>
               </div>
            </div>
            <div className="col-05 pad-1-0 width-100 ">
               <div className="row-1 width-100">
                  <label className="font-87">Subtotal</label>
                  <label className="font-87">{cartInfo.subtotal.toFixed(2)}</label>
               </div>            
               <div className="row-1 width-100 ">
                  <label className="font-87">Items discount</label>
                  <label className="font-87">{cartInfo.items_discount.toFixed(2)}</label>
               </div>
               <div className="row-1 width-100 ">
                  <label className="font-87">Code discount</label>
                  <label className="font-87">{cartInfo.code_discount.toFixed(2)}</label>
               </div>
               {deliveryPrice >= 0 && 
                  <div className="row-1 width-100 ">
                     <label className="font-87">Shipping</label>
                     <label className="font-87">{(deliveryPrice ?? 0).toFixed(2)}</label>
                  </div>
               }
            </div>  
         </div>      
         <div className='order-summary-total-container'>
            <div className="col-1 pad-1 back-grey-2 flex-1">
               <div className="row-1 width-100">
                  <label>TOTAL</label>
                  <label className="font-bold">{(cartInfo.total_value + (deliveryPrice ?? 0)).toFixed(2)}</label>
               </div>
               <div className="row-1 width-100">            
                  <label className="color-prim">You saved</label>
                  <label className="color-prim">{cartInfo.total_discount.toFixed(2)}</label>
               </div>         
            </div>
            {showActions &&
               <div className="col-05 pad-1 width-100-1 flex-1 back-surface">
                  <a className="btn-action-primary width-100-2 " href="/checkout">Proceed To Checkout</a>
                  <a className="link-small" href="/">Continue Shopping</a>
               </div>      
            }      
         </div>

         
      </section>
   )
}


OrderSummary.propTypes = {
   cartInfo: PropTypes.object, 
   showActions: PropTypes.bool, 
   deliveryPrice: PropTypes.number
}

export default OrderSummary;

/*
     

*/