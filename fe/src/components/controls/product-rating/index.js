import PropTypes from 'prop-types';
import star from '../../../media/star.png';
import star_filled from '../../../media/star_filled.png';
import {useState} from 'react';

function ProductRating({value, maxValue, size = 12}) {

   const [itemsFill] = useState(() => {
      let ret = [];
      for (let i = 1; i <= maxValue; i++) {
         ret.push(value >= i);
      }
      return ret;
   })

   return <ol className='row'>
      {itemsFill.map((itm, index) => <img alt='rating star' style={{height: size}} key={index} src={ itm ? star_filled : star} />)}
   </ol>

}


ProductRating.propTypes = {
   value: PropTypes.number.isRequired,
   maxValue: PropTypes.number.isRequired,
   size: PropTypes.number
}

export default ProductRating;