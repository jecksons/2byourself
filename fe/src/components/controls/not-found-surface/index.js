import PropTypes from 'prop-types';
import './styles.css';

function NotFoundSurface({title, message}) {

   return <div className='not-found-surface'>
      <section>         
         <strong>{title}</strong>
         <p>{message}</p>
      </section>
   </div>;

}


NotFoundSurface.propTypes = {
   title: PropTypes.string.isRequired,
   message: PropTypes.string.isRequired
}

export default NotFoundSurface;