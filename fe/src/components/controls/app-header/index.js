import logo from '../../../media/logo_transparent.png';
import airplane from '../../../media/plane.png';
import {BsHandbag, BsHandbagFill} from 'react-icons/bs';
import {useLocation, useNavigate} from 'react-router-dom';
import './styles.css';
import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import CartContext from '../../../store/cart-context';
import MenuContext from '../../../store/menu-context';
import UserContext from '../../../store/user-context';
import {IoIosArrowDown, IoIosArrowUp, IoIosSearch, IoMdMenu, IoMdClose} from  'react-icons/io';
import {BiExit, BiNews} from 'react-icons/bi';
import AuthService from '../../../services/auth-service';
import CartController from "../../../controllers/cart-controller";
import { CartItemEditable } from '../../pages/cart';
import utils from "../../../services/utils";
import {ErrorToast} from "../../controls/toast";
import api from '../../../services/api';
import ProductController from '../../../controllers/product-controller';

function HiddenMenuOverlay({show}) {
   return <div className={`overlay-header-menu  ${show ? 'show' : ''}`}> </div>
}

function HiddenMenu({sender, onHoverMenu}) {

   return <section 
      onMouseEnter={() => onHoverMenu(sender)}  
      onMouseLeave={() => onHoverMenu(null)}
      className={`hidden-header-menu ${sender ? 'show-menu' : ''}`}>
      <div className='align-start grid-equal-row gap-5'>
         {
            sender && 
               sender.items.map((itm, idx) => <div className='col-1 just-start align-start min-width-8 ' key={idx}>
                  {sender.description !== itm.description && <label className='font-bold'>{itm.description}</label>}
                  <nav key={idx} className='col-05 align-start width-100'>
                     {
                        itm.items.map((lnk, idx) => <a 
                           key={idx}
                           className='font-87 no-decoration underline-hover width-100 white-nowrap'
                           href={`/products/?${(sender.id && sender.filter) ? `${sender.filter}=${sender.id}-${sender.description}` : ''}&${itm.filter}=${lnk.id}-${lnk.description}`}> 
                           {lnk.description}
                        </a>)
                     }
                  </nav>
               </div> )            
         }      
      </div>
      
   </section>
}

function HeaderMenuItem({info, onHoverMenu, selItem}) {

   return <div className='header-item-menu'>
      {
         (info.filter && info.id) ?  
            <a onMouseEnter={() => onHoverMenu(info)}                 
               className={`btn link-item-menu ${(selItem && selItem === info) ?  'selected' : '' }`}
               href={`/products/?${info.filter}=${info.id}-${info.description}`}>{info.description} </a> : 
            <button 
               onMouseEnter={() => onHoverMenu(info)}                 
               className={`btn link-item-menu ${(selItem && selItem === info) ?  'selected' : '' }`}
            >{info.description}</button>      
      }      
   </div>;
}

function UserButton(props) {
   const {userInfo, reloadUserInfo} = useContext(UserContext);
   const [isOver, setIsOver] = useState(false);
   const navigate = useNavigate();
   const location = useLocation();
   const [nameToShow, setNameToShow] = useState('');

   useEffect(() => {
      if (userInfo) {
         let arName = userInfo.description.split(' ');
         if (arName.length > 0) {
            let currName = arName[0];
            if (currName.length > 15) {
               currName = currName.substr(0, 13) + '...';
            }
            setNameToShow(currName);
            return;
         }
         setNameToShow('<unnamed>');
         return;
      }
      setNameToShow('Entrar')      
   }, [userInfo]);


   const handleLogoff = useCallback(() => {
      AuthService.logout();
      reloadUserInfo();
      if (location.pathname === '/') {
         window.location.reload();
      } else {
         navigate('/');
      }            
   }, [navigate, location, reloadUserInfo]);

   return (
      <div className='parent-expand-user-header' onMouseEnter={() => setIsOver(true)} onMouseLeave={() => setIsOver(false)} >
         <div className={`${(isOver && userInfo) ? 'parent-user-header-expanded' : 'parent-user-header'}`}>
            <div className='row-05 '>
               <button 
                  onClick={userInfo ? null : () =>  navigate('/login') }
                  className='btn-link no-decoration underline-hover color-white' >                  
                  {nameToShow}
               </button>
               {userInfo && 
                     (
                        isOver ? 
                           <IoIosArrowUp  /> :
                           <IoIosArrowDown color='#fff'  />                         
                     )
                  }
            </div>
            <div className='col-1 user-options'>
               <a className='btn-link no-decoration font-87 underline-hover row-1 just-start width-100' href='/my-orders'><BiNews size={16} /> My Orders</a>
               <button 
                  className='btn-link font-87 underline-hover row-1 just-start width-100'
                  onClick={handleLogoff}>
                     <BiExit size={16}/> Exit
               </button>
            </div>
         </div>      

      </div>
      
   );
}



function CartContent({show}) {

   const {cartInfo, setCartInfo} = useContext(CartContext);
   const cartId = cartInfo ? cartInfo.id : null;

   const handleUpdateCartItem = useCallback((action, onReject) => {      
      if (action.type === 'update') {
         CartController.updateCartItem(cartId, action.id, action.value)
         .then((ret) => {
            setCartInfo(ret.data);
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

   return (cartInfo && (cartInfo.items.length > 0)) && (
      <div className={`parent-cart-header ${show ? 'show' : ''} `}>
         <div className={`content-cart-header `} >
            <ul className='col-05 cart-header-list'>
               {
                  cartInfo.items.map((itm) => <CartItemEditable  
                     key={itm.id + (itm.total_value / 100)}  
                     showAsCard={false}
                     item={itm}  
                     onUpdateAction={handleUpdateCartItem}/> )
               }
            </ul>
            <div className='row-1 align-start ' >
               <div className='row-05 just-end flex-1' >
                  <label className='color-grey'>Total</label>
                  <label className='font-105 font-bold'>${cartInfo.total_value.toFixed(2)}</label>
               </div>
               <div className='flex-1'>
                  <a className="btn-action-primary width-100 " href="/checkout">Checkout</a>
               </div>
            </div>
         </div>
      </div>

   )
}


function CartButton({cartInfo, cartQtd}) {

   const [showCart, setShowCart] = useState(false);
   const navigate = useNavigate();

   return (
      <div className='pos-relative' onMouseEnter={() => setShowCart(true)} onMouseLeave={() => setShowCart(false)}  >
         <button className='btn-icon btn-shop-cart' onClick={() => {
            navigate('/cart');
         }} >
            {(cartInfo.items || []).length > 0 && <label>{cartQtd}</label>}
            {(cartInfo.items || []).length > 0 ? <BsHandbagFill color='#fff'  size={24}/>  :  <BsHandbag  color='#fff' size={24}/> }                                          
         </button>                  
         <CartContent  cartInfo={cartInfo} show={showCart} />
      </div>
   );
}

const ProductItemNotFound = {
   id: -1,
   filter_type: ' ',
   description: 'No items found',
}


function ProductSearchInput({extInputRef, autoFocus}) {

   const [searchInput, setSearchInput] = useState('');
   const [searchText, setSearchText] = useState('');
   const [inputOptions, setInputOptions] = useState({loading: false, items: []});
   const [showOptions, setShowOptions] = useState(false);
   const intRef = useRef(null);
   const inputRef = extInputRef || intRef;
   const [selIndex, setSelIndex] = useState(-1);
   const navigate = useNavigate();
   const isMonted = useRef(true);

   useEffect(() => {
      return () => isMonted.current = false;
   }, []);

   useEffect(() => setSelIndex(-1), [showOptions]);
   

   useEffect(() => {
      const cancelToken = api.getCancelToken();
      const fetchItems = async () => {
         try {
            setInputOptions(p => ({...p, loading: true}));
            const ret = await ProductController.getProductTextSearchOptions(searchText);
            setInputOptions(p => ({loading: false, items: ret.data.results}));
            setSelIndex(-1);
         } catch (err) {
            if (!api.isCancel(err)) {
               console.log(err);
               setInputOptions(p => ({...p, loading: false}));
            }            
         }         
      }      
      fetchItems();
      return () => cancelToken.cancel();
   }, [searchText]);

   useEffect(() => {
      const timOut = setTimeout(() => {
         if (isMonted.current) {
            setSearchText(searchInput);
         }                  
      }, 500);
      return () => clearTimeout(timOut);
   }, [searchInput]);

   const requestCloseOptions = useCallback(() => {
      setTimeout(() => {
         if (isMonted.current) {
            setShowOptions(false);
         }         
      }, [150]);
   }, [setShowOptions]);

   const onSelectItem = useCallback((itm) => {      
      setSearchInput(itm.description);   
      setShowOptions(false);
      inputRef.current.blur();
      if (itm.filter_type === 'product') {
         navigate(ProductController.getProductUri(itm.id, itm.description, ''));
      } else {
         navigate(ProductController.getProductFilterUri(itm.filter_type, itm.id, itm.description));
      }
   }, [inputRef, setSearchInput, setShowOptions, navigate]);

   const handleKeyDown = useCallback((e) => {
      const iInc = (e.code === 'ArrowDown') ? 1 : ((e.code === 'ArrowUp') ?  -1 : 0 );
      if (iInc !== 0) {
         setSelIndex(p => (
            ((p + iInc) >= 0) && 
            (inputOptions.items.length > 0) && 
            ((p + iInc) < inputOptions.items.length)
         ) ? (p + iInc) : p);
      } else if (e.code === 'Enter') {
         if (selIndex >= 0) {
            onSelectItem(inputOptions.items[selIndex]);
         } else if (searchInput !== '') {
            inputRef.current.blur();
            navigate(ProductController.getProductSearchTextUri(searchInput));
         }
      }
   }, [inputOptions.items, selIndex, setSelIndex, onSelectItem, searchInput, navigate, inputRef] );

   const onClearInput = useCallback(() => {
      inputRef.current.focus();
      setSearchText('');               
      setSearchInput('');               
      setTimeout(() => setShowOptions(true), 150);
   }, [inputRef, setSearchText, setSearchInput, setShowOptions]);
  

   return (
      <div className='flex-1 pos-relative'>
         <input 
            className={`product-search ${showOptions ? 'show' : ''}`} 
            onFocus={() =>setShowOptions(true)} 
            onBlur={requestCloseOptions}  
            onClick={() =>setShowOptions(true)} 
            onKeyDown={handleKeyDown}
            value={searchInput} 
            ref={inputRef}
            onChange={(e) => setSearchInput(e.target.value)} />
         <button 
            className={`btn-clear-input ${searchInput !== '' ? 'show' : ''}`} 
            onClick={onClearInput}  >
            <IoMdClose size={16} />
         </button>
         <ul className={`product-search-select-items ${showOptions ? 'show' : ''} `}>
            {(inputOptions.items.length > 0 ?  inputOptions.items : [ProductItemNotFound] ).map((itm, idx) => (
               <li  
                  className={`product-search-item ${idx === selIndex ? 'selected' : ''}`}
                  onClick={itm.id === -1 ? null : () => onSelectItem(itm)}
                  key={itm.id + itm.filter_type}>
                     <div className='row-05 align-start'>
                        <label className='font-87'>{itm.description }</label>
                        <label className='font-75 color-grey'>{itm.filter_type.substr(0, 1).toUpperCase() + itm.filter_type.substr(1)}</label>
                     </div>
               </li>
            ) )}
         </ul>
      </div>
   )

}

function AppHeaderFull({menuData, cartQtd, cartInfo, withoutMenu}) {

   const [itemMenuExpanded, setItemMenuExpanded] = useState(null);
   const [requestExpandMenu, setRequestMenuExpand] = useState(null);

   useEffect(() => {
      /* this effect is just to not fire 
         the expand behavior immediatly on mouse over */
      if (!requestExpandMenu) {
         setItemMenuExpanded(requestExpandMenu);
      } else {
         const timOut = setTimeout(() => setItemMenuExpanded(requestExpandMenu), [250]);
         return () => clearTimeout(timOut);
      }
   }, [requestExpandMenu])

   return (
      <div className='app-header-full width-100'>
         <div className='row-1 back-prim pad-1 width-100-1 just-center'>
            <div className='row-1 gap-2 flex-1  max-width-90 '>          
               <a href='/'><img src={logo} height={40} alt='logo'  /></a>
               {!withoutMenu && <ProductSearchInput /> }               
               <div className='row gap-2' >
                  <UserButton />
                  <CartButton  cartInfo={cartInfo} cartQtd={cartQtd} />
               </div>         
            </div>      
         </div>      
         {!withoutMenu  && 
            <>
               <nav className='row surface just-center pos-relative' onMouseLeave={() => setRequestMenuExpand(null)} >
                  {menuData && 
                     menuData.map((itm, idx) => <HeaderMenuItem  key={idx}  info={itm}  onHoverMenu={setRequestMenuExpand} selItem={itemMenuExpanded} /> )
                  }
                  <HiddenMenu sender={itemMenuExpanded} onHoverMenu={setRequestMenuExpand} />
                  <HiddenMenuOverlay show={itemMenuExpanded}  />         
               </nav>            
               <div className='row-1 just-center back-prim-4 width-100-025 pad-025 color-prim-4-on'>
                  <img src={airplane} height={32} style={{color: '#fff'}}  alt='air shipping' />
                  <strong >FREE SHIPING ON PURCHASES OVER $100</strong>
               </div>           
            </>         
         }
             
      </div>
   );
}

function CompactMenuItem({info}) {

   return (info.filter && info.id) ?
      (
         <a className={`btn link-item-menu compact-item-menu `}
                     href={`/products/?${info.filter}=${info.id}-${info.description}`}>{info.description} </a> 
      ) : null;
}

function CompactHiddenMenu({menuData, show, onRequestClose}) {

   const {userInfo, reloadUserInfo} = useContext(UserContext);
   const navigate = useNavigate();
   const location = useLocation();
  
   const handleLogoff = useCallback(() => {
      AuthService.logout();
      reloadUserInfo();
      if (location.pathname === '/') {
         window.location.reload();
      } else {
         navigate('/');
      }            
   }, [navigate, location, reloadUserInfo]);

   return (
      <div >
         <div className={`compact-menu-overlay ${show ? 'show' : ''}`} 
            onClick={onRequestClose}
          > </div>
         <div className={`compact-menu-content ${show ? 'show' : ''} `}>
            <section className='col back-prim-5 color-white align-start'>
               <div className='pad-1 border-bottom-prim-4 width-100 border-box'>
                  <button 
                     onClick={userInfo ? null : () =>  navigate('/login') }
                     className='btn-link no-decoration  underline-hover color-white' >                  
                     {userInfo ? userInfo.description : 'Login'}
                  </button>
               </div>
               <div className='row-1 pad-1 width-100 border-box'>
                  <a className='btn-link no-decoration font-87 underline-hover row-1 just-start  color-white' 
                     href='/my-orders'><BiNews size={16} /> My Orders</a>
                  <button 
                     className='btn-link font-87 underline-hover row-1 just-start  color-white'
                     onClick={handleLogoff}>
                        <BiExit size={16}/> Exit
                  </button>
               </div>
            </section>            
            <section className='pad-0-1 col align-start width-100 border-box' >
               <label className='color-grey font-87 pad-1-0' >
                  Categories
               </label>
               <nav className='col width-100 ' >
                  {menuData && 
                     menuData.map((itm, idx) => <CompactMenuItem  key={idx}  info={itm} /> )
                  }
               </nav>
            </section>
         </div>
      </div>
   )
}


function AppHeaderCompact({menuData, cartQtd, cartInfo}) {

   const [isExpanded, setIsExpanded] = useState(false);
   const navigate = useNavigate();
   const [showSearch, setShowSearch] = useState(false);
   const refSearch = useRef(null);
   const refHeader = useRef(null);
   const [showSticky, setShowSticky] = useState(false);

   useEffect(() => {
      const content = document.getElementById('page-content');
      const headers = document.getElementsByClassName('app-header-compact');      
      if (content) {
         if (showSticky) {
            content.classList.add('sticky');
            if (headers.length > 0) {
               headers[0].classList.add('sticky');
            }
         } else {
            content.classList.remove('sticky');
            if (headers.length > 0) {
               headers[0].classList.remove('sticky');
            }
         }      
      }      
   }, [showSticky]);

   const handlePosSticky = useCallback(() => {
      setShowSticky(refHeader.current ? (window.scrollY > refHeader.current.clientHeight) : false )
   }, [refHeader]);

   useEffect(() => {
      window.onscroll = handlePosSticky;
      return () => window.onscroll = null;
   }, [handlePosSticky]);

   useEffect(() => {
      const body = document.querySelector('body');
      body.style.overflow = isExpanded ? 'hidden' : 'auto';
   }, [isExpanded]);
   
   return (
      <div className={`app-header-compact  width-100`} ref={refHeader}>
         <div className='row-1 back-prim pad-05-1 width-100-1 just-center' >
            <div className='row-1 gap-2 flex-1  ' >          
               <a href='/'><img src={logo} height={36} alt='logo'  /></a>
               <div className='row gap-105 align-start' >                  
                  {!showSearch &&
                     (
                        <button className='btn no-pad' onClick={() => {
                           setShowSearch(true);
                        }}>
                           <IoIosSearch color='#fff' size={24}/>
                        </button>                  
                     )
                   }                  
                  <div className='pos-relative'>
                     <button className='btn btn-shop-cart no-pad' onClick={() => navigate('/cart')} >
                        {(cartInfo.items || []).length > 0 && <label>{cartQtd}</label>}
                        {(cartInfo.items || []).length > 0 ? <BsHandbagFill color='#fff' size={16}/>  :  <BsHandbag  color='#fff' size={24}/> }                                          
                     </button>                  
                  </div>
                  <button className={`btn no-pad`} style={isExpanded ?  {marginRight: 0} : {}}  onClick={() => setIsExpanded(p => !p)}>
                     {
                        isExpanded ? 
                           <IoMdClose color="#fff" size={24}  /> :
                           <IoMdMenu color="#fff" size={24}  />
                     }
                  </button>
               </div>         
            </div>      
         </div>                        
         <section className={`header-small-search ${showSearch ? 'show' : ''}`} >
            <ProductSearchInput extInputRef={refSearch} />
            <div className='row-1'>               
               <button className='btn no-pad' onClick={() => {
                  if (refSearch.current.value !== '') {                     
                     navigate(ProductController.getProductSearchTextUri(refSearch.current.value));
                  }                  
               }}>
                  <IoIosSearch color='#fff' size={24}/>
               </button>        
               <button className='btn no-pad' onClick={() =>setShowSearch(false)}>
                  <IoMdClose color="#fff" size={24}  />
               </button>        
            </div>
         </section> 
         <CompactHiddenMenu menuData={menuData} show={isExpanded} onRequestClose={() => setIsExpanded(false)} />
      </div>
   );
}

export default function AppHeader({withoutMenu}) {

   const {cartInfo} = useContext(CartContext);
   const cartQtd = cartInfo ? cartInfo.items.reduce((prev, val) => (parseFloat(prev) + val.quantity), [0]) : 0;
   const {menuData} = useContext(MenuContext);      

   return (
      <header className="col width-100 parent-app-header ">
         <AppHeaderFull  menuData={menuData} cartQtd={cartQtd} cartInfo={cartInfo} withoutMenu={withoutMenu} />
         <AppHeaderCompact  menuData={menuData} cartQtd={cartQtd} cartInfo={cartInfo} />
      </header>
   );
   
}