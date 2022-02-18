import './styles.css';
import ReactLoading from 'react-loading';
import PropTypes from 'prop-types';

function SurfaceLoading({size, onBackground, width = 0, height = 0, loadType = 'spin', className = ''}) {
   return (
      <div className={`parent-loading-status-onsurface ${className}`}>
         <ReactLoading 
            type={loadType} 
            color={onBackground ? "#fff" : "#0081AC" }   
            width={width ? width :  (size > 0 ? size : 36) }  
            height={height ? height : (size > 0 ? size : 36) } /> 
      </div>
   );
}

SurfaceLoading.propTypes = {
   size: PropTypes.number,
   onBackground: PropTypes.bool,
   loadType: PropTypes.string,
   className: PropTypes.string
}

export default SurfaceLoading;