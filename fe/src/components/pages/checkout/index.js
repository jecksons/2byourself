import { useContext, useEffect, useState, useCallback } from "react";
import CartController from "../../../controllers/cart-controller";
import {initialState as initialCartState} from '../../../store/cart-context';
import checkSuccess from '../../../media/check.png';
import api from "../../../services/api";
import utils from "../../../services/utils";
import CartContext from "../../../store/cart-context";
import AppHeader from "../../controls/app-header";
import NotFoundSurface from "../../controls/not-found-surface";
import OrderSummary from "../../controls/order-summary";
import {ErrorToast} from '../../controls/toast';
import SurfaceLoading from "../../controls/surface-loading";
import './styles.css';
import SaleController from "../../../controllers/sale-controller";
import ButtonActionPrimary from "../../controls/button-action";
import UserContext from "../../../store/user-context";
import LoginControl from "../../controls/login-control";

const SS_LOADING = 0;
const SS_LOADED = 1;
const SS_ERROR = 2;


function SingleOptionSelect({options, childRender, onSelect, value}) {
   
   const ItemRender = childRender;  
   const handleSelItem = useCallback((itm) => {
     if (onSelect) {
         onSelect(itm);
      }     
   }, [onSelect]);      

   return <ul className="col gap-025 ">
      {options.map((itm, idx) => 
         <li className={`row-1 just-start width-100-1 checkout-option ${value === itm ? 'item-highlight' : ''}`} key={itm.description} onClick={() => handleSelItem(itm)} >
            <div className={`checkout-chk-item${value === itm ? '-selected' : ''}`}> </div>
            <ItemRender  item={itm} />
         </li> )}
   </ul>   
}

function DeliveryItem({item}) {
   const daysToDelivery = `${item.dayRange.length > 0 ?  
         (item.dayRange.length > 1 ? item.dayRange[0] + ' - ' + item.dayRange[1] : 
         item.dayRange[0]) : ''} days to delivery`;
   return <div className="row-1 width-100">
         <div className="col-05 align-start">
            <label className="font-87">{item.description}</label>
            <label className="color-grey font-75">{daysToDelivery}</label>
         </div>
         <label className="font-bold">
            {item.value ? `$${item.value.toFixed(2)}` : 'Free'}
         </label>
      </div>;
}

function PaymentItem({item}) {
   return <div className="row-05 width-100">         
         <label className="font-87">{item.description}</label>         
         <img height={32} width={32} src={`${api.defaults.baseURL}${item.image}`} alt="payment option" />                  
      </div>;
}

function CheckoutSelectOption({
      title, 
      options, 
      onReqPageChange, 
      onSelect, 
      value, 
      childRender, 
      nextOptionCaption = 'Next', 
      processingStatus = false}) {
   return <div className="col-1 width-100 flex-1" >
      <strong>
         {title}
      </strong>
      {
         options.dataState === SS_LOADED ? 
            <SingleOptionSelect options={options.items} childRender={childRender} onSelect={onSelect} value={value}  /> : 
            (
               options.dataState === SS_LOADING ? 
                  <SurfaceLoading /> : 
                  (
                     options.dataState === SS_ERROR &&
                        <NotFoundSurface title={'Unable to load the options'} message={options.errorMessage} />
                  )
            )
      }      
      <div className="row-05 width-100">
         <button className="btn-action-secundary btn-action-secundary-big" onClick={() => onReqPageChange(-1)}>
            Back
         </button>
         <ButtonActionPrimary  
            caption={nextOptionCaption} onClick={() => onReqPageChange(1)}  
            minWidth={128}
            disabled={!value} 
            processing={processingStatus} />                  
      </div>      
   </div>

}

function TabPageItem({caption, selected, isLast}) {
   return <div className={`${isLast  ? '' : (`step-before-end${selected ? '-sel' : ''}`)}   tab-header-checkout${selected ? '-selected' : ''}`}>
      {caption}
   </div>
}

const CheckoutStrTabs = [
   'Identification',
   'Delivery',
   'Payment'
]

function CheckoutPage({idCart, cartValue, onSelectFreightValue, onSuccessSale}) {

   const {userInfo} = useContext(UserContext);
   const [userIsLogged] = useState(userInfo);
   const [selTab, setSelTab] = useState(userIsLogged ? 1 : 0);
   const [paymentOptions, setPaymentOptions] = useState({dataState: SS_LOADING, items: []});
   const [deliveryOptions, setDeliveryOptions] = useState({dataState: SS_LOADING, items: []});
   const [selPayment, setSelPayment] = useState(null);
   const [selDelivery, setSelDelivery] = useState(null);
   const [saleStatus, setSaleStatus] = useState(SS_LOADED);

   const handleSelDelivery = useCallback((newValue) => {
      setSelDelivery(newValue);
      if (newValue) {
         onSelectFreightValue(newValue.value);
      } else {
         onSelectFreightValue(null);
      }     
   }, [setSelDelivery, onSelectFreightValue ]);   
   
   useEffect(() => {
      const cancelToken = api.getCancelToken();
      const fetchPayments = async () => {
         try {
            const ret = await SaleController.getPaymentOptions();
            setPaymentOptions({dataState: SS_LOADED, items: ret.data});
         } catch (err) {
            if (!api.isCancel(err)) {
               setPaymentOptions({dataState: SS_ERROR, items: [], errorMessage: utils.getHTTPError(err)});
            }
         }
      }
      setPaymentOptions(p => ({...p, dataState: SS_LOADING}));
      fetchPayments();
      return () => cancelToken.cancel();
   }, []);

   useEffect(() => {
      const cancelToken = api.getCancelToken();
      const fetchDeliveries = async () => {
         try {
            const ret = await SaleController.getDeliveryOptions(idCart);
            setDeliveryOptions({dataState: SS_LOADED, items: ret.data});
         } catch (err) {
            if (!api.isCancel(err)) {
               setDeliveryOptions({dataState: SS_ERROR, items: [], errorMessage: utils.getHTTPError(err)});
            }
         }
      }
      setDeliveryOptions(p => ({...p, dataState: SS_LOADING}));
      fetchDeliveries();
      return () => cancelToken.cancel();
   }, [idCart, cartValue]);

   const handlePageIndex = useCallback((stepAdd) => {
      if (stepAdd === 1 && (selTab === 2) ) {
         setSaleStatus(SS_LOADING);
         SaleController.saveSale({
            id_cart: idCart,
            id_payment_method: selPayment.id,
            freight_value: selDelivery.value,
            days_to_delivery: selDelivery.dayRange.length > 0 ? selDelivery.dayRange[selDelivery.dayRange.length-1] : null
         })
         .then((ret) => {       
            onSuccessSale();
         })
         .catch((err) => {
            setSaleStatus(SS_LOADED);
            ErrorToast.fire({
               title: `Unable to save the sale`,
               text: utils.getHTTPError(err),
               icon: "error"
            });
         });
         
      } else {
         setSelTab(p => ((p + stepAdd >= 0) &&  (p + stepAdd < CheckoutStrTabs.length)) ? (p + stepAdd) : p);     
      }           
   }, [selTab, setSelTab, onSuccessSale, idCart, selDelivery, selPayment]);
   
   return (
      <section className="checkout-main">
         <header className="row flex-wrap">
            {
               CheckoutStrTabs.map((itm, idx, ar) => (userIsLogged && idx === 0) ? null :  
                  <TabPageItem 
                     key={idx}
                     caption={CheckoutStrTabs[idx] }  
                     selected={selTab === idx} 
                     isLast={idx === ar.length-1} />  )
            }         
         </header>
         <div className="card-square col flex-1 align-center just-center" >
            {  
               {
                  0: (
                        <div className="parent-login-checkout" >
                           <LoginControl onNext={() => handlePageIndex(1)}  />                        
                        </div>
                     ),
                  1: <CheckoutSelectOption 
                        title={'Please confirm the delivery option'} 
                        options={deliveryOptions} 
                        onReqPageChange={handlePageIndex} 
                        onSelect={handleSelDelivery} 
                        value={selDelivery} 
                        childRender={DeliveryItem}  />,
                  2: <CheckoutSelectOption 
                        title={'Please confirm the payment method'} 
                        options={paymentOptions} 
                        onReqPageChange={handlePageIndex} 
                        value={selPayment}
                        onSelect={setSelPayment}
                        nextOptionCaption='Finish'
                        processingStatus={saleStatus === SS_LOADING}
                        childRender={PaymentItem} />
               }[selTab]            
            }         
         </div>
      </section>
   )

}

function SuccessSale(){
   return <section className="col just-start card-square gap-5 max-width-40">
      <div className="col-1 align-start">
         <div>
            <div className="row-05 just-start ex-anim">
               <h1  style={{whiteSpace: 'break-spaces'}}>Your order was confirmed</h1>
               <img height={32} width={32} src={checkSuccess} alt="success sale"/>            
            </div>         
         </div>               
         <p>We're glad you have found products that you like.<br/><br/>
            You can follow your orders on the “My Orders” option menu, and on every stage until the final delivery, you will be aware of the steps through your email.
         </p>
      </div>
      <div className="row gap-025 just-end width-100 flex-wrap success-sale-bottom">
         <a href="/my-orders"  className="btn-action-secundary btn-action-secundary-big">My Orders</a>
         <a href="/"  className="btn-action-primary">Continue Shopping</a>
      </div>      
   </section>
}

export default function Checkout(props) {

   const {cartInfo, setCartInfo} = useContext(CartContext);
   const [screenState, setScreenState] = useState(SS_LOADING);
   const [errorMessage, setErrorMessage] = useState(null);
   const [cartData, setCartData] = useState(null);
   const idCart = cartInfo ? cartInfo.id : null;
   const [deliveryPrice, setDeliveryPrice] = useState(null);
   const [showSuccessSale, setShowSuccessSale] = useState(false);

   useEffect(() => {
      if (showSuccessSale) {
         return;
      }
      if (!idCart ) {
         setErrorMessage({title: 'There are no products choosed yet.', message: 'Select some products to show them here.'});
         setScreenState(SS_ERROR);
         return;
      }
      const cancelToken = api.getCancelToken();
      const fetchCart = async () => {
         try {
            const ret = await CartController.getCart(idCart);            
            setCartData(ret.data);
            setScreenState(SS_LOADED);
         } catch (err) {
            if (!api.isCancel(err)) {
               if (err.request && err.request.status === 404) {
                  setErrorMessage({title: `This cart isn't available.`, message: 'Try to select some products to show them here.'});
               } else {
                  setErrorMessage({title: 'Something wrong happened.', message: utils.getHTTPError(err)});
               }               
               setScreenState(SS_ERROR);
            }
         }
      }
      setScreenState(SS_LOADING);
      fetchCart();
      return () => cancelToken.cancel();     
   }, [idCart, showSuccessSale]);

   const onSuccessSale = useCallback(() => {      
      setShowSuccessSale(true);     
      setCartInfo({...initialCartState});
   }, [setShowSuccessSale, setCartInfo]);
     
   return <main className="col background height-full just-start" >
      <AppHeader withoutMenu />
      <div className="col flex-1 just-start gap-1 pad-105" >      
         <section className="col gap-105">
            {screenState === SS_LOADING ? <SurfaceLoading /> :
               (
                  screenState === SS_ERROR ? <NotFoundSurface title={errorMessage.title} message={errorMessage.message} /> : 
                     (
                        screenState === SS_LOADED &&                                                   
                           (
                              showSuccessSale ? 
                                 <SuccessSale /> : 
                                 <div className="row-1  align-start flex-wrap ">         
                                    <CheckoutPage  
                                       idCart={idCart} 
                                       cartValue={cartData ? cartData.total_value : 0}  
                                       onSelectFreightValue={setDeliveryPrice} 
                                       onSuccessSale={onSuccessSale}
                                        /> 
                                    <OrderSummary cartInfo={cartData} showActions={false} deliveryPrice={deliveryPrice} />
                                 </div>
                           )                           
                     )
               )            
            }
         </section>
      </div>
   </main>

}