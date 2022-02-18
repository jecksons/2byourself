import PropTypes from 'prop-types';

function ItemFormError({message}) {
   return message && <p className="form-error">{message}</p>
}

ItemFormError.propTypes = {
   message: PropTypes.string
}

export default ItemFormError;