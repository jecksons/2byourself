import PropTypes from 'prop-types';
import SurfaceLoading from '../surface-loading';

function ButtonActionPrimary(props) {

   const processing = props.processing ?? false;
   const btnStyle = {minWidth: props.minWidth ?? 0};
   if (!btnStyle.minWidth) {
      delete btnStyle.minWidth;
   } 
   return <button  
      style={btnStyle}      
      className={`btn-action-primary ${props.fullSize ? 'width-100' : ''}  ${processing ? 'btn-pad-05-105' : ''}  ${props.disabled ? 'btn-disabled' : ''}`} 
      onClick={processing || props.disabled ? null: props.onClick}>
      {
         processing ? 
            <SurfaceLoading height={36} width={36} onBackground={true} loadType="bars" /> : 
            props.caption}
 </button>
}

ButtonActionPrimary.defaultProps = {
   fullSize: false
}

ButtonActionPrimary.propTypes = {
   processing: PropTypes.bool,
   caption: PropTypes.string,
   onClick: PropTypes.func,
   disabled: PropTypes.bool,
   minWidth: PropTypes.number,
   fullSize: PropTypes.bool
}

export default ButtonActionPrimary;