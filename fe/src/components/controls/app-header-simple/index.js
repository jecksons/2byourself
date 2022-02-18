import logo from '../../../media/logo_transparent.png';
import {BsHandbag, BsHandbagFill} from 'react-icons/bs';
import { useContext } from 'react';
import CartContext from '../../../store/cart-context';

export default function AppHeaderSimple(props) {

   const {cartInfo} = useContext(CartContext);
   const cartQtd = cartInfo ? cartInfo.items.reduce((prev, val) => (parseFloat(prev) + val.quantity), [0]) : 0;

   return <header className="col width-100 parent-app-header ">
      <div className='row-1 back-prim pad-1 width-100-1 just-center'>
         <div className='row-1 gap-5 min-width-58 '>          
            <img src={logo} height={50} alt='logo' />
            <div className='row gap-3'>
               <div className='pos-relative'>
                  <button className='btn-icon btn-shop-cart' >
                     {(cartInfo.items || []).length > 0 && <label>{cartQtd}</label>}
                     {(cartInfo.items || []).length > 0 ? <BsHandbagFill  size={36}/>  :  <BsHandbag  size={36}/> }                                          
                  </button>                  
               </div>
            </div>         
         </div>      
      </div>      
   </header>
}