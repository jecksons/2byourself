import logo from '../../../media/logo_transparent.png';
import airplane from '../../../media/plane.png';
import {BsHandbag, BsHandbagFill} from 'react-icons/bs';
import {useLocation, useNavigate} from 'react-router-dom';
import './styles.css';
import { useCallback, useContext, useEffect, useState } from 'react';
import CartContext from '../../../store/cart-context';
import MenuContext from '../../../store/menu-context';
import UserContext from '../../../store/user-context';
import {IoIosArrowDown, IoIosArrowUp, IoIosSearch, IoMdMenu, IoMdClose} from  'react-icons/io';
import {BiExit, BiNews} from 'react-icons/bi';
import AuthService from '../../../services/auth-service';

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
               {!withoutMenu && <input className='product-search' />}               
               <div className='row gap-2' >
                  <UserButton />
                  <div className='pos-relative'>
                     <button className='btn-icon btn-shop-cart' >
                        {(cartInfo.items || []).length > 0 && <label>{cartQtd}</label>}
                        {(cartInfo.items || []).length > 0 ? <BsHandbagFill color='#fff'  size={24}/>  :  <BsHandbag  color='#fff' size={24}/> }                                          
                     </button>                  
                  </div>
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
         <div className={`compact-menu-overlay ${show ? 'show' : ''}`}> </div>
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

   useEffect(() => {
      const body = document.querySelector('body');
      body.style.overflow = isExpanded ? 'hidden' : 'auto';
   }, [isExpanded]);
   
   return (
      <div className='app-header-compact width-100'>
         <div className='row-1 back-prim pad-05-1 width-100-1 just-center' >
            <div className='row-1 gap-2 flex-1  max-width-90  ' >          
               <a href='/'><img src={logo} height={36} alt='logo'  /></a>
               <div className='row gap-105 align-start'   >                  
                  <button className='btn no-pad'>
                     <IoIosSearch color='#fff' size={24}/>
                  </button>                  
                  <div className='pos-relative'>
                     <button className='btn btn-shop-cart no-pad' >
                        {(cartInfo.items || []).length > 0 && <label>{cartQtd}</label>}
                        {(cartInfo.items || []).length > 0 ? <BsHandbagFill color='#fff' size={16}/>  :  <BsHandbag  color='#fff' size={24}/> }                                          
                     </button>                  
                  </div>
                  <button className={`btn no-pad`} style={isExpanded ?  {marginRight: 17} : {}}  onClick={() => setIsExpanded(p => !p)}>
                     {
                        isExpanded ? 
                           <IoMdClose color="#fff" size={24}  /> :
                           <IoMdMenu color="#fff" size={24}  />
                     }
                  </button>
               </div>         
            </div>      
         </div>                        
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