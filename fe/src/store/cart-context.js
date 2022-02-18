import React from 'react';

export const initialState = {
   id: null,
   items: []
}


const CartContext = React.createContext(initialState);

export default CartContext;