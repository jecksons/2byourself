import { useContext, useEffect, useState, useCallback } from "react";
import CartController from "../../../controllers/cart-controller";
import {BsHandbag} from 'react-icons/bs';
import api from "../../../services/api";
import utils from "../../../services/utils";
import CartContext from "../../../store/cart-context";
import NotFoundSurface from "../../controls/not-found-surface";
import OrderSummary from "../../controls/order-summary";
import QuantityEdit from "../../controls/quantity-edit";
import SurfaceLoading from "../../controls/surface-loading";
import './styles.css';
import {ErrorToast} from "../../controls/toast";
import AppMainContainer from "../../controls/app-main-container";
import ProductController from "../../../controllers/product-controller";
import { useNavigate } from "react-router-dom";

const SS_LOADING = 0;
const SS_LOADED = 1;
const SS_ERROR = 2;

const InitialUpdateItemState = {quantity: false, remove: false};

export function CartItemEditable({item, onUpdateAction, showAsCard = true}) {

   const [quantity, setQuantity] = useState(item.quantity);
   const [updateState, setUpdateState] = useState(InitialUpdateItemState);

   const onChangeRejected = useCallback(() => {
      setUpdateState(InitialUpdateItemState);
      setQuantity(item.quantity);     
   }, [item.quantity]);

   const handleQuantitySet = useCallback((newValue) => {
      setUpdateState(p => ({...p, quantity: true}));
      setQuantity(newValue);      
      onUpdateAction({type: 'update', value: newValue, id: item.id}, onChangeRejected);
   }, [onUpdateAction, item.id, onChangeRejected]);   

   const handleRemoveItem = useCallback(() => {
      setUpdateState(p => ({...p, remove: true}));
      onUpdateAction({type: 'remove', id: item.id}, onChangeRejected);
   }, [onUpdateAction, item.id, onChangeRejected]);
      
   return (
      <li className={`row-1 align-start ${showAsCard ? 'card-square' : ''} width-100 border-box card-cart-item`}>
         <div className="row-1 just-start">
            <div className="container-img-cart-item">
               <img src={`${api.defaults.baseURL}${item.imageSmall}`} style={{maxWidth: 72, maxHeight: 72}} alt={item.description} />      
            </div>         
            <div className="col-05 align-start min-width-8 ">
               <label className="font-bold font-75 color-grey">{item.brand}</label>
               <a className='btn-link font-87' href={ProductController.getProductUri(item.id_product, item.description, item.brand )}  >{item.description}</a>
               <label className="font-75">Size: {item.size}</label>
               {
                  item.discount > 0 ? 
                     <div className="row-05 align-start">
                        <label className="font-bold font-75 color-grey font-strike" >USD {item.price.toFixed(2)}</label>
                        <label className="font-bold">USD {utils.roundTo(item.total_value / item.quantity, 2).toFixed(2)}</label>
                     </div> : 
                     <label className="font-bold">USD {item.price.toFixed(2)}</label>
               }            
            </div>
         </div>      
         <div className="row align-start gap-105 product-item-amount ">
            <div className="col-05">
               <label className="font-75">Quantity</label>
               <QuantityEdit quantity={quantity} onChangeQuantity={handleQuantitySet} />
               <div className="min-height-2 row align-center just-center">
                  {
                     updateState.remove ? 
                        <SurfaceLoading size={16} /> : 
                        <button className="btn link-small" onClick={handleRemoveItem}>Remove</button>
                  }            
               </div>            
            </div>
            <div className="col-05 align-end">
               <label className="font-bold font-75 color-grey">Total</label>
               <div className="row min-width-4 align-center just-end">
                  {
                     updateState.quantity ? 
                        <div><SurfaceLoading size={16}/> </div> : 
                        <div className="col-05 align-end">
                           <label className="font-bold">{item.total_value.toFixed(2)}</label>         
                           {
                              item.discount > 0 && 
                                 <div className="col gap-025 align-end">
                                    <label className="color-prim font-75 font-bold"> - ${item.discount.toFixed(2)}</label>                        
                                    <label className="color-prim font-75 font-bold">{ utils.roundTo(item.discount / (item.quantity * item.price) * 100, 0).toFixed(0)}% OFF</label>                        
                                 </div>
                           }                        
                        </div>                     
                  }            
               </div>            
            </div>
         </div>
      </li>
   )
}

export default function Cart(props) {

   const {cartInfo, setCartInfo} = useContext(CartContext);
   const [screenState, setScreenState] = useState(SS_LOADING);
   const [errorMessage, setErrorMessage] = useState(null);
   const [cartData, setCartData] = useState(null);
   const cartId = cartInfo ? cartInfo.id : null;
   const navigate = useNavigate();

   useEffect(() => {
      document.title = '2BYourself - Cart';
   }, []);

   useEffect(() => {
      if (cartData && screenState === SS_LOADED) {
         if (cartData.items.length === 0) {
            navigate('/');
         }
      }
   }, [cartData, screenState, navigate]);

   useEffect(() => {
      if (!cartId ) {
         setErrorMessage({title: 'There are no products choosed yet.', message: 'Select some products to show them here.'});
         setScreenState(SS_ERROR);
         return;
      }
      const cancelToken = api.getCancelToken();
      const fetchCart = async () => {
         try {
            const ret = await CartController.getCart(cartId);            
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
   }, [cartId]);

   const handleUpdateCartItem = useCallback((action, onReject) => {      
      if (action.type === 'update') {
         CartController.updateCartItem(cartId, action.id, action.value)
         .then((ret) => {
            setCartInfo(ret.data);
            setCartData(ret.data);
         })
         .catch((err) => {
            ErrorToast.fire(
               {
                  title: `The quantity can't be updated.`,
                  text: utils.getHTTPError(err),
                  icon: 'error'
               }
            );
            onReject();
         });
      } else if (action.type === 'remove') {
         CartController.deleteCartItem(cartId, action.id)
         .then((ret) => {
            setCartInfo(ret.data);
            setCartData(ret.data);
         })
         .catch((err) => {
            ErrorToast.fire(
               {
                  title: `The item can't be deleted.`,
                  text: utils.getHTTPError(err),
                  icon: 'error'
               }
            );
            onReject();
         });
      }
   }, [cartId, setCartInfo]);
   

   return <AppMainContainer>
      <div className="parent-cart" >      
         <div className="row-05  just-start width-100 border-bottom-grey pad-1-0 color-prim-4 border-box ">
            <BsHandbag size={24} />
            <h1 className="color-prim-4" >Shopping Bag</h1>            
         </div>
         <section className="col gap-105">
            {screenState === SS_LOADING ? <SurfaceLoading /> :
               (
                  screenState === SS_ERROR ? <NotFoundSurface title={errorMessage.title} message={errorMessage.message} /> : 
                     (
                        screenState === SS_LOADED &&                        
                           <div className="row gap-105 align-start flex-wrap ">
                              <ol className="col-05 flex-1 ">
                                 {cartData.items.map((itm) => <CartItemEditable key={itm.id + (itm.total_value / 100)}  item={itm}  onUpdateAction={handleUpdateCartItem} /> )}
                              </ol> 
                              <OrderSummary cartInfo={cartData} />                           
                           </div>
                     )
               )            
            }
         </section>
      </div>
   </AppMainContainer>

}

// 