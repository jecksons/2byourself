import './css/settings.css';
import './css/objects.css';
import './css/components.css';
import React, {useState, useMemo, useCallback, useEffect}  from "react";
import ScrollToTop from './components/controls/scroll-to-top';
import Products from './components/pages/products';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import ProductDetail from './components/pages/product-detail';
import CartContext, {initialState as initialCart} from './store/cart-context';
import { useLocalStorage, useSessionStorage } from './hooks/utils-hooks';
import Cart from './components/pages/cart';
import Checkout from './components/pages/checkout';
import MyOrders from './components/pages/my-orders';
import SaleOrder from './components/pages/sale-order';
import MenuController from './controllers/menu-controller';
import MenuContext from './store/menu-context';
import UserContext from './store/user-context';
import Signin from './components/pages/signin';
import RequireAuth from './components/controls/require-auth';

function App() {

  const [localCart , setLocalCart] = useLocalStorage('local-cart', initialCart);
  const [cartInfo, setCartInfo] = useState(localCart);
  const updateCartValue = useCallback((newValue) => {
    setCartInfo(newValue);
    setLocalCart(newValue);    
  }, [setLocalCart, setCartInfo]);
  const cartValue = useMemo(() => ({cartInfo, setCartInfo: updateCartValue}), [cartInfo,updateCartValue ]);

  const [sessionMenu, setSessionMenu] = useSessionStorage('menu-session', null); 
  const [menuData, setMenuData] = useState(sessionMenu);
  const updateMenuData = useCallback((newValue) => {
    setMenuData(newValue);
    setSessionMenu(newValue);
  }, [setMenuData, setSessionMenu])
  const menuValue = useMemo(() => ({menuData, setMenuData: updateMenuData}), [menuData, updateMenuData]);
  
  useEffect(() => {
    if (!sessionMenu) {
      MenuController.loadMenu(updateMenuData);
    }    
  }, [sessionMenu, updateMenuData]);

  const [localUser, setLocalUser, reloadLocalUser] = useLocalStorage('user', null);
  const [userInfo, setUserInfo] = useState(localUser);
  const updaterUserInfo = useCallback((newValue) => {
    setLocalUser(newValue);
    setUserInfo(newValue);
  }, [setLocalUser, setUserInfo]);
  const reloadUserInfo = useCallback(() => {
    const refreshUser = reloadLocalUser();
    setUserInfo(refreshUser);
  }, [reloadLocalUser]);
  const userValue = useMemo(() => ({userInfo, setUserInfo: updaterUserInfo, reloadUserInfo}), [userInfo,  updaterUserInfo, reloadUserInfo] );
    
  return (
    <div className="App">
      <UserContext.Provider value={userValue} >
        <CartContext.Provider value={cartValue}>
          <MenuContext.Provider value={menuValue} >
            <BrowserRouter>
              <ScrollToTop>              
                <Routes>                
                  <Route path="/" element={<Products/>} />            
                  <Route path='/login' element={<Signin/>} />
                  <Route path="/products/" element={<Products/>}/>
                  <Route path="/products/:productId" element={<ProductDetail/>}/>
                  <Route exact path="/cart/" element={<Cart />} />
                  <Route exact path="/my-orders/" element={
                    <RequireAuth>
                        <MyOrders />
                    </RequireAuth>
                  } />
                  <Route exact path="/checkout/" element={<Checkout />} />
                  <Route exact path="/orders/:orderId" element={
                    <RequireAuth>
                      <SaleOrder />
                    </RequireAuth>
                  } />
                  <Route path="*" element={<Products/>} />                                
                </Routes>
              </ScrollToTop>          
            </BrowserRouter>
          </MenuContext.Provider>
        </CartContext.Provider>
      </UserContext.Provider>      
    </div>
  );
}

export default App;
