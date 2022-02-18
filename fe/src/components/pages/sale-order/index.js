import {useState, useCallback, useEffect} from 'react';
import AppHeader from '../../controls/app-header';
import {useParams} from 'react-router-dom';
import api from '../../../services/api';
import SaleController from '../../../controllers/sale-controller';
import utils from '../../../services/utils';
import SurfaceLoading from '../../controls/surface-loading';
import NotFoundSurface from '../../controls/not-found-surface';
import SaleStatus from '../../../models/sale-status';
import {TiTick} from 'react-icons/ti';
import './styles.css';
import AppMainContainer from '../../controls/app-main-container';


const LS_LOADING = 0;
const LS_LOADED = 1;
const LS_ERROR = 2;


function OrderTimeline({steps}) {

   steps.forEach((itm) => {
      itm.statusObj = new SaleStatus(itm.id_sale_status);
   });

   return <div className='card-item col-05 timeline-sale-order min-width-50 '>
      <div className='row-05 just-start width-100'>
         <label className='font-bold font-125'>Timeline</label>         
      </div>
      <ol className='row-05 width-100 pad-05 just-evenly'>
         {
            steps.map((itm, idx) => <li key={idx} className='col-05 min-width-7'>
               <img  src={itm.statusObj.getImg()} style={{maxWidth: 32, maxHeight: 32}} />               
               <div className={`timeline-circle-grey${itm.event_date ? '-tick' : ''}`}>
                  {
                     itm.event_date ?
                        <TiTick size={16} /> :
                        ' '
                  }                
               </div>
               <label className='font-87 font-bold'>{itm.statusObj.toString()}</label>
               {
                  itm.event_date ?
                     <div className='col-05  min-height-3 just-start'>
                        <label className='font-87 color-grey '>
                           {utils.getDateToStrShow(itm.event_date, false)}
                        </label>
                        <label className='font-87 color-grey'>
                           {utils.getTimeToStrShow(itm.event_date)}
                        </label>
                     </div> :
                        <div className='col-05  min-height-3'> </div>
               }
            </li>)
         }
      </ol>
   </div>
}

function OrderItems({items}) {

   /* 
"id": 1733,
            "description": "Blue Casual Shirt",
            "size": "M",
            "quantity": 1,
            "price": 47.5,
            "discount": 0,
            "brand": "The Bell",
            "total_value": 47.5,
            "image": "/products/img/4.png"   
   */

   return <div className='card-item  col pad-1-0-0 just-start gap-0 flex-1'>
   <div className='row-05 just-start width-100-1 border-bottom-grey pad-0-1-1'>
      <label className='font-bold font-87'>ITEMS</label>         
   </div>
   <ol className='col pad-0-1-1 align-start width-100-1'>
      {items.map((itm) => <li key={itm.id} className='row-1 width-100 just-start align-start border-bottom-grey-2 pad-1-0'>
         <div className='container-img-cart-item'>
            <img  src={`${api.defaults.baseURL}${itm.image}`} style={{maxWidth: 72, maxHeight: 72}}/>
         </div>
         <div className='col-05 align-start just-start'>
            <label className='font-75 color-grey font-bold'>{itm.brand}</label>
            <label >{itm.description}</label>
            <div className='row-1'>
               <label className='font-75'>Size: {itm.size}</label>
               <label className='font-75'> Quantity: {itm.quantity}</label>
            </div>            
            <div className='row-1'>
               <label className='font-75'>Price: {itm.price.toFixed(2)}</label>
               {(itm.discount > 0) && 
                  <label className='font-75'>Discount: {itm.discount.toFixed(2)}</label>}
            </div>
            <label className='font-bold font-87'>${itm.total_value.toFixed(2)}</label>            
         </div>               
      </li>)}
   </ol>
</div>
}

function OrderDetails({orderData}) {
   return <div className='card-item col-1 pad-1-0-0 flex-1'>
   <div className='row-05 just-start width-100-1 border-bottom-grey pad-0-1-1'>
      <label className='font-bold font-87'>DETAILS</label>         
   </div>
   <div className='col-05 width-100-1 pad-0-1 '>
      <div className='row-1 width-100'>
         <label className='font-87'>Payment Method:</label>
         <label className='font-bold font-87'>{orderData.payment_method}</label>
      </div>
      <div className='row-1 width-100'>
         <label className='font-87'>Subtotal:</label>
         <label className='font-bold font-87'>{orderData.items_value.toFixed(2)}</label>
      </div>
      <div className='row-1 width-100'>
         <label className='font-87'>Discount:</label>
         <label className='font-bold font-87'>{(orderData.discount_code_value + orderData.offer_discount_value).toFixed(2)}</label>
      </div>
      <div className='row-1 width-100'>
         <label className='font-87'>Shipping:</label>
         <label className='font-bold font-87'>{orderData.freight_value.toFixed(2)}</label>
      </div>
   </div>
   <div className='row-1 pad-1 width-100-1 back-grey-2 border-radius-6-bottom'>
      <label className='font-bold'>TOTAL</label>
      <label  className='font-bold'>${orderData.total_value.toFixed(2)}</label>
   </div>   
</div>
}

function SaleOrderInfo(props) {
   return <section className='col-1'>
      <OrderTimeline steps={props.orderData.history} />
      <div className='row-1 align-start width-100'>
         <OrderDetails {...props} />
         <OrderItems items={props.orderData.items}  />
      </div>
   </section>

}

export default function SaleOrder(props) {

   const {orderId} = useParams();
   const [loadState, setLoadState] = useState({state: LS_LOADING, errorMessage: '', orderData: null});
   

   useEffect(() => {
      const cancelToken = api.getCancelToken();
      const fetchOrder = async () => {
         try {
            const ret = await SaleController.getSale(orderId);
            setLoadState({state: LS_LOADED, errorMessage: '', orderData: ret.data});
         } catch (err) {
            if (!api.isCancel(err)) {
               if (err.request && err.request.status === 404) {
                  setLoadState({state: LS_ERROR, errorMessage: 'Order not found'});
               } else {
                  setLoadState({state: LS_ERROR, errorMessage: utils.getHTTPError(err)});
               }
            }
         }       
      }
      setLoadState(p =>  ({...p, state: LS_LOADING}));
      fetchOrder();
      return () => cancelToken.cancel();
   }, [orderId]);

   return <AppMainContainer>
      <section className="col flex-1 just-start gap-105 pad-105 min-width-35" >               
         <header className="row-05   width-100 border-bottom-grey pad-1 color-prim-4 ">
            <h1 className="color-prim-4" >Order {orderId}</h1>            
         </header>
         {
            loadState.state === LS_LOADING ? 
               <SurfaceLoading /> : 
               (
                  loadState.state === LS_LOADED ? 
                     <SaleOrderInfo  orderData={loadState.orderData} /> : 
                     (
                        loadState.state === LS_ERROR &&
                           <NotFoundSurface title='Something went wrong' message={loadState.errorMessage}  />
                     )
               )
         }              
      </section>
   </AppMainContainer>;

}