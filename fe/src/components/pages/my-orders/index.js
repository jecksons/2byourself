import AppHeader from "../../controls/app-header";
import {useParams} from 'react-router-dom';
import { useCallback, useEffect, useState, useRef, useContext } from "react";
import api from "../../../services/api";
import utils from "../../../services/utils";
import SurfaceLoading from '../../controls/surface-loading';
import NotFoundSurface from "../../controls/not-found-surface";
import './styles.css';
import SaleController from "../../../controllers/sale-controller";
import SaleStatus from '../../../models/sale-status';
import {MdOutlineArrowForwardIos} from 'react-icons/md';
import PageTrack from "../../controls/page-track";
import AppMainContainer from "../../controls/app-main-container";

const LS_LOADING = 0;
const LS_LOADED = 1;
const LS_ERROR = 2;

function OrderItem({item}) {

   const statusOrder = new SaleStatus(item.id_sale_status);

   return <a className="card-item width-100 pad-1-0 min-width-35 surface-hover cursor-pointer no-decoration" href={`/orders/${item.id}`}>
      <div className="row-1 border-bottom-grey pad-0-1-05">
         <label className="font-87">{utils.getDateToStrShow(item.created_at, true, true)}</label>
         <label className="font-1012 font-bold"># {item.id}</label>
      </div>
      <div className="row-1 align-start pad-0-1">
         <label className="font-bold font-1012">{statusOrder.toString()}</label>
         <div className="row-1 flex-1">
            <div className="row-1 flex-1">
               {
                  item.image_sample.length &&
                     <ul className="row gap-025 align-start " >
                        {
                           item.image_sample.map((itm, idx) => <li key={idx} className="col card-square-small just-center align-center" style={{height: 60, width: 60}} >
                              <img  src={`${api.defaults.baseURL}${itm}`}  style={{maxHeight: 56, maxWidth: 56, overflowX: 'hidden'}} alt="product sample" />
                           </li> )
                        }
                        {
                           item.items > 3 &&
                              <div className="col card-square-small align-center just-center "  style={{height: 60, width: 60}}>
                                 <label className="font-125 font-bold color-prim-4" >+{item.items-3}</label>
                              </div>
                        }
                     </ul>               
               }
            </div>            
            <div className="col-05 align-start">
               <label className="font-75">Delivery forecast:</label>         
               <label className="font-bold">{utils.getDateToStrShow(item.delivery_forecast, false)}</label>         
            </div>            
            <MdOutlineArrowForwardIos size={24} />
         </div>         
      </div>      
   </a>
}

const OrdersPageSize = 10;

export default function MyOrders(props) {

   const [loadState, setLoadState] = useState({state: LS_LOADING, errorMessage: ''});
   const [searchData, setSearchData] = useState(null);
   const [ordersOffset, setOrdersOffset] = useState(0);
   
   useEffect(() => {
      setLoadState( p => ({...p, state: LS_LOADING}));
      const cancelToken = api.getCancelToken();
      const fetchOrders = async () => {
         try {
            const ret = await SaleController.getSales(ordersOffset, OrdersPageSize);
            setSearchData(ret.data)
            setLoadState({state: LS_LOADED, errorMessage: ''});
            
         } catch (err) {
            if (!api.isCancel(err)) {               
               setLoadState({state: LS_ERROR, errorMessage: utils.getHTTPError(err)});              
            }
         }
      }   
      fetchOrders();
      return () => cancelToken.cancel();
   },  [ordersOffset]);

   return <AppMainContainer>
      <div className="col-1 min-width-35">
         <header className="row-05   width-100 border-bottom-grey pad-1 color-prim-4 ">
            <h1 className="color-prim-4" >My Orders</h1>            
            {(searchData && searchData.results.length > 0) && <PageTrack pageSize={OrdersPageSize} rowOffset={ordersOffset} onSelectOffset={(val) => setOrdersOffset(val)} rowTotal={searchData.metadata.total} /> } 
         </header>
         {
            loadState.state === LS_LOADING ?
               <SurfaceLoading  /> :
               (
                  loadState.state === LS_LOADED ?               
                     (
                        searchData.results.length > 0 ?
                           <ol className="col-05">
                              {searchData.results.map((itm) => <OrderItem  key={itm.id} item={itm} />  )}
                           </ol>  : 
                           <NotFoundSurface title={'There are no orders yet'} message={'After a purchase, the order will appear here'} />                            
                     )                     
                     :
                     <NotFoundSurface title={'Unable to load the orders'} message={loadState.errorMessage} />
               )
         }      
         <footer className="row-05   width-100 border-top-grey just-end pad-1">
            {(searchData && searchData.results.length > 0)  && <PageTrack pageSize={OrdersPageSize} rowOffset={ordersOffset} onSelectOffset={(val) => setOrdersOffset(val)} rowTotal={searchData.metadata.total} /> } 
         </footer>
      </div>
   </AppMainContainer>
}