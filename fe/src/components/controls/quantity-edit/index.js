import PropTypes from 'prop-types';
import { useCallback } from 'react';
import {FiPlus, FiMinus} from 'react-icons/fi';


function QuantityEdit({quantity, onChangeQuantity}) {

   const handleStepQuantity = useCallback((valueAdd) => {
      if ((quantity + valueAdd) > 0) {
         onChangeQuantity(quantity + valueAdd);
      }      
   }, [quantity, onChangeQuantity]);

   return <div className='row'>
      <button className='btn-icon btn-icon-circle' onClick={() => handleStepQuantity(-1)} ><FiMinus size={16}/></button>
      <input type={'number'} className='width-4 text-center' value={quantity} onChange={(e) => onChangeQuantity(parseFloat(e.target.value) >= 1 ? parseFloat(e.target.value) : 1)} />
      <button className='btn-icon btn-icon-circle' onClick={() => handleStepQuantity(1)}><FiPlus size={16}/></button>
   </div>
}

QuantityEdit.propTypes = {
   quantity: PropTypes.number.isRequired,
   onChangeQuantity: PropTypes.func.isRequired,
}

export default QuantityEdit;