import {useParams} from 'react-router-dom';
import { useCallback, useEffect, useState, useRef, useContext } from "react";
import api from "../../../services/api";
import utils from "../../../services/utils";
import SurfaceLoading from '../../controls/surface-loading';
import NotFoundSurface from "../../controls/not-found-surface";
import checkSuccess from '../../../media/check.png';
import './styles.css';
import ProductRating from "../../controls/product-rating";
import QuantityEdit from "../../controls/quantity-edit";
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';
import { useLocalStorage } from "../../../hooks/utils-hooks";
import { ProductCardId } from "../../controls/product-card";
import {BsChevronRight, BsChevronLeft } from 'react-icons/bs';
import CartContext from "../../../store/cart-context";
import CartController from "../../../controllers/cart-controller";
import ButtonActionPrimary from "../../controls/button-action";
import {BsHandbag} from 'react-icons/bs';
import { ErrorToast } from "../../controls/toast";
import ItemFormError from "../../controls/item-form-error";
import AppMainContainer from '../../controls/app-main-container';
import ProductController from '../../../controllers/product-controller';


const LS_LOADING = 0;
const LS_LOADED = 1;
const LS_ERROR = 2;

function BagAddedNotification(){
   return <div className="col-05 item-highlight pad-1 width-100-1">
      <div className="row-05 img-animate">
         <label className="font-87">Item successfully added to bag.</label>
         <img src={checkSuccess}  width={16} height={16} alt="success" />
      </div>
      <a href="/cart" className="btn-action-secundary font-75"><BsHandbag size={16} />  My Bag</a>
   </div>
}

function ProductImage({imgUrl}) {
   const [selImg, setSelImg] = useState(0);
//style={{minHeight: 400}}
//
   return <div className="col-05 width-100 align-start  flex-1">
      <div className="row-05 width-100 just-center flex-1"   >
         <InnerImageZoom 
               height={400} 
               zoomScale={1}             
               className={`img-product-zoom ${selImg === 1 ? `img-flip ` : ' '}`}
                src={`${api.defaults.baseURL}${imgUrl}`}   />    
      </div>      
      <div className="row-05 just-start pad-1">
         <div 
            onClick={() => setSelImg(0)}
            className={`parent-img-product-small ${selImg === 0 ? 'img-selected' : '' }`}>
            <img src={`${api.defaults.baseURL}${imgUrl}`} alt="product small 1" />
         </div>
         <div 
            className={`parent-img-product-small ${selImg === 1 ? 'img-selected' : '' } `}
            onClick={() => setSelImg(1)}
            >
            <img className="img-flip" src={`${api.defaults.baseURL}${imgUrl}`} alt="product small 2" />
         </div>
      </div>
   </div>
}

function ProductReviews({userRating}) {

   const ratDist = userRating.distribuition;

   return <div className="row gap-105 align-start flex-wrap" >
      <ol className="col-05 col-reverse align-start">
         {ratDist.map((itm) => {
            return (
               <li key={itm.rating} className="row-05 just-start">
                  <label className="width-4 text-right">{itm.rating} stars</label>
                  <div className="rating-bar" style={{width: '35vw', maxWidth: 224, height: 8}}>
                     {itm.ratio > 0 &&  <div style={{width: `${Math.round(itm.ratio * 100)}%`, height: 8 }}> </div>}               
                  </div>
                  <label>{itm.total}</label>
               </li>
            )
         } )}
      </ol>
      <div className="col-05 just-start align-start">
         <ProductRating value={Math.round(userRating.rating_average)} maxValue={5} size={20} />         
         <label className="font-2 font-bold"> {userRating.rating_average.toFixed(1)} </label>
         <label className="font-75">Average among {userRating.ratings} user reviews.</label>
      </div>
   </div>
}

const CardWidth = 256;

function RecentlyVisited({productId, lastVisited}) {

   const refList = useRef(null);
   const [navButtons, setNavButtons] = useState({left: false, right: false});

   const IdsToShow = lastVisited.reduce((prev, curr) => {
      if (prev.length < 10) {
          if (curr !== productId) {
             prev.push(curr);
          }
      }
      return prev;
   }, []);

   const onScrollItems = useCallback(() => {
      setNavButtons({
         left: refList.current.scrollLeft > 0,
         right: ((refList.current.scrollWidth - refList.current.scrollLeft) > refList.current.clientWidth)
      });     
   }, []);

   useEffect(() => {      
      const timout = setTimeout(() => {
         onScrollItems();
      }, 100);
      return () => clearTimeout(timout);
   }, [onScrollItems]);

   useEffect(() => {
      window.addEventListener('resize', onScrollItems);
      return () => window.removeEventListener('resize', onScrollItems);      
   }, [onScrollItems]);
   
   const handleNavRight = useCallback(() => {
      const remWidth =  (refList.current.scrollWidth - refList.current.scrollLeft) - refList.current.clientWidth;
      let incX = remWidth;
      const itemsByPage = Math.trunc(refList.current.clientWidth / CardWidth);
      if (remWidth > (CardWidth * itemsByPage))  {         
         incX = CardWidth * itemsByPage;
         const diffAdjust = (Math.trunc(refList.current.scrollLeft / CardWidth) * CardWidth);
         incX += diffAdjust;
      }  else {
         incX += refList.current.scrollLeft;
      }
      refList.current.scroll({
         left: incX,
         top: 0,
         behavior: 'smooth'
      });     
   }, []);

   const handleNavLeft = useCallback(() => {
      const remWidth =  refList.current.scrollLeft;
      let incX = remWidth;
      const itemsByPage = Math.trunc(refList.current.clientWidth / CardWidth);
      if (remWidth > (CardWidth * itemsByPage))  {         
         incX = (CardWidth * itemsByPage * -1) ;
         let diffAdjust = (Math.trunc(refList.current.scrollLeft / CardWidth) * CardWidth);
         if (refList.current.scrollLeft > diffAdjust) {
            diffAdjust += CardWidth;
         }
         incX += diffAdjust;         
      }  else {
         incX = 0;
      }
      refList.current.scroll({
         left: incX,
         top: 0,
         behavior: 'smooth'
      });     
   }, []);

   
   return (IdsToShow.length > 0) && (
      <section className="col-05 align-start main-content-width">      
         <header className="row-05 width-100">
            <h3>Last Visited</h3>
            <div className="row-05">
               {<button className={`btn-icon btn-icon-circle ${navButtons.left ? ' ' : 'btn-disabled'} `} onClick={navButtons.left ? handleNavLeft : null}><BsChevronLeft size={16} /> </button>}
               {<button className={`btn-icon btn-icon-circle ${navButtons.right ? ' ' : 'btn-disabled'}`} onClick={navButtons.right ?  handleNavRight : null}><BsChevronRight size={16} /></button>}        
            </div>
         </header>
         <ol className="last-visited-list scroll-h scroll-hidden" ref={refList} onScroll={onScrollItems}>         
            {IdsToShow.map((itm) => <ProductCardId key={itm} productId={itm} /> )}         
         </ol>
      </section>
   )
}

function ProductSize({productSizes, selectedSizeId, onSelectSize}) {

   return productSizes.length > 0 && <ol className="row-05 flex-wrap just-start">
      {productSizes.map((itm) => <button 
         className={`btn btn-size-option${selectedSizeId === itm.id ? '-selected' : ''}`}
         key={itm.id} onClick={() => onSelectSize(itm.id)}>{itm.description}</button>)}
   </ol>
}

function AddProduct({productId, selectedSize, quantity}) {

   const {cartInfo, setCartInfo} = useContext(CartContext);
   const [posting, setPosting] = useState(false);
   const [itemAdded, setItemAdded] = useState(false);
   const [prodAddError, setProdAddError] = useState('');
   
   const handleAddItem = useCallback(() => {
      if (selectedSize) {
         setProdAddError('');
         setPosting(true);
         CartController.addProduct({id_product: productId, id_size: selectedSize, quantity: quantity}, cartInfo.id)
         .then((ret) => {
            setCartInfo(p => ret.data);     
            setPosting(false);
            setItemAdded(true);
            setTimeout(() => setItemAdded(false), 7000);
         })
         .catch((err) => {
            setPosting(false);
            ErrorToast.fire({
               title: 'Unable to add the item!',
               icon: 'error',
               text: utils.getHTTPError(err)
            });
         })
      } else {
         setProdAddError('Please select a size!');
      }
   }, [selectedSize, quantity, productId, cartInfo.id, setCartInfo, setItemAdded, setProdAddError]);   

   return (
      <div className="col-05 width-100">
         <ButtonActionPrimary 
                  processing={posting}
                  onClick={handleAddItem}
                  caption='Add To Bag'
                  fullSize={true}
            />
         <ItemFormError  message={prodAddError} />
         {itemAdded && <BagAddedNotification/>}      
      </div>
   ) 
}

export default function ProductDetail(props) {

   const {productId} = useParams();
   const [loadingProduct, setLoadingProduct] = useState(LS_LOADING);
   const [errorMessage, setErrorMessage] = useState(null);
   const [productData, setProductData] = useState(null);
   const [selectedSize, setSelectedSize] = useState(null);
   const [quantityAdd, setQuantityAdd] = useState(1);
   const [lastProdIds, setLastProdIds] = useLocalStorage('last-products', []);
   
   
   useEffect(() => {
      setLoadingProduct(LS_LOADING);
      const cancelToken = api.getCancelToken();
      const fetchProd = async () => {
         try {
            const ret = await api.get(`/products/id/${productId}`);
            setProductData(ret.data);
            setLoadingProduct(LS_LOADED);
            setSelectedSize(null);
            setLastProdIds(p =>  [ret.data.id, ...p.filter((el) => el !== ret.data.id)] )
         } catch (err) {
            if (!api.isCancel(err)) {
               if (err.response &&  err.response.status === 404)  {
                  setErrorMessage({title: 'Product not found!', subtitle: 'Please verify the selected product.'});
                  setLoadingProduct(LS_ERROR);                  
                  return;
               }
               setErrorMessage({title: 'Error on product loading!', subtitle: utils.getHTTPError(err) });
               setLoadingProduct(LS_ERROR);               
            }
         }
      }   
      fetchProd();
      return () => cancelToken.cancel();

   },  [productId, setLastProdIds])

   return <AppMainContainer>
      {
         loadingProduct === LS_LOADING ?
            <SurfaceLoading  /> :
            (
               loadingProduct === LS_LOADED ?               
                  <section className='product-parent-info'> 
                     <div className="row-1 just-start width-100">
                        <a className='link underline-hover' href={ProductController.getProductFiltersUri(productData.genre)} >{productData.genre.description}  </a>
                        <label>-</label>
                        <a className='link underline-hover' href={ProductController.getProductFiltersUri(productData.genre, productData.category)} >{productData.category.description}  </a>
                        <label>-</label>
                        <a className='link underline-hover' href={ProductController.getProductFiltersUri(productData.genre, productData.category, productData.brand)} >{productData.brand.description}  </a>                        
                     </div>
                     <section className="card-item main-content-width">                     
                        <div className="row-05 align-start flex-wrap">
                           <ProductImage  imgUrl={productData.image} />                           
                           <div className="product-main-info">
                              <div className="col-05 align-start">
                                 <a className='no-decoration color-grey font-bold underline-hover' href={ProductController.getProductFiltersUri(null, null, productData.brand)}>{productData.brand.description}</a>
                                 <h1>{productData.description}</h1>
                                 <div className="row-05">
                                    <ProductRating value={Math.round(productData.user_rating.rating_average)} maxValue={5} />
                                    {productData.user_rating.ratings > 0 && <label className="lb-75">({productData.user_rating.ratings})</label>} 
                                 </div>
                              </div>                              
                              {
                                 productData.discount ? 
                                    (
                                       <div className="col-05 align-start">
                                          <label className="prd-original-price">USD {productData.original_price.toFixed(2)}</label>
                                          <div className="row-05 align-start">
                                             <label className="prd-price-discount">USD {productData.final_price.toFixed(2)}</label>
                                             <label className="prd-discount">{productData.discount}% OFF</label>
                                          </div>
                                       </div>
                                    ) : 
                                    <label className="font-105 font-bold">USD {productData.final_price.toFixed(2)}</label>
                              }                       
                              <div className="col-05 align-start">
                                 <label>Size:</label>
                                 <ProductSize selectedSizeId={selectedSize} onSelectSize={setSelectedSize}  productSizes={productData.sizes} />
                              </div>
                              <div className="col-05 align-start">
                                 <label>Quantity:</label>
                                 <QuantityEdit quantity={quantityAdd} onChangeQuantity={setQuantityAdd} />
                              </div>                              
                              {
                                 (productData.final_price * quantityAdd) >= 100 ? 
                                    <label className="success-color font-bold"> This item provides free shipping!</label> : 
                                    <label className="font-bold">${(100 - (productData.final_price * quantityAdd)).toFixed(2)} remaining for free shipping.</label>  

                              }                                                    
                              <AddProduct productId={productId}  selectedSize={selectedSize} quantity={quantityAdd}  /> 
                              <div className="col-05 align-start">
                                 <label className="font-75">Returns are accepted within 30 days from purchase date.</label>
                                 <label className="font-75">Please call customer service for returns.</label>
                              </div>                                                                   
                           </div>
                        </div>                        
                        <div className="col-05 pad-1 align-start line-top">
                           <h3>Product Details</h3>
                           <p>A versatile part of your casual collection, this product give you just enough stretch for all-day comfort.<br/><br/>
                              Imported<br/>
                              - Zipper and button fly;<br/> 
                              - Cotton/elastane;<br/> 
                              - Whiskering and fading</p>
                        </div>
                        <div className="col-05 pad-1 align-start line-top gap-1">
                           <h3>Customer Reviews</h3>
                           <ProductReviews  userRating={productData.user_rating} />
                        </div>
                     </section>                     
                     <RecentlyVisited productId={productId} lastVisited={lastProdIds} />
                  </section>
                   :
                  <NotFoundSurface title={errorMessage.title} message={errorMessage.subtitle} />
            )
      } 
   </AppMainContainer> ;
}