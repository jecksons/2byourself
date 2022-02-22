import ContentLoader from 'react-content-loader';
import api from '../../../services/api';
import './styles.css';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ProductController from '../../../controllers/product-controller';

function ProductCard({product}) {
   
   return <a className="card-anim product-card-item"  href={ProductController.getProductUri(product.id, product.description, product.brand) } >
      <div className="flex-1 width-100">
         <div className="col just-center pos-relative width-100">
            {(product.discount > 0) && <label className="discount-perc">{product.discount.toFixed(0)}% Off</label>}
            <img src={`${api.defaults.baseURL}${product.image}`} alt='product'  className='product-card-img' />
         </div>
      </div>
      <div className="col-05 align-start width-100" >
         <label className="font-75 font-bold" >{product.brand}</label>      
         <label className="font-75">{product.description}</label>      
         <div className="row-1 just-center width-100">
            {product.final_price !== product.original_price && <label className="font-75 font-strike">USD {product.original_price.toFixed(2)}</label>      } 
            <label className="font-bold">USD {product.final_price.toFixed(2)}</label>      
         </div>
      </div>      
   </a>
}

function ProductCardLoading() {
   return (
      <article className="card-anim product-card-item " >            
         <ContentLoader viewBox='0 0 330 356'   >
               <rect x="90" y="20" rx="5" ry="5" width="150" height="200" />
               <rect x="0" y="270" rx="5" ry="5" width="90" height="16" />
               <rect x="0" y="300" rx="5" ry="5" width="310" height="16" />
               <rect x="75" y="330" rx="5" ry="5" width="150" height="16" />
         </ContentLoader>         
      </article>
   )
}

function ProductCardId({productId}) {

   const [prodData, setProdData] = useState(null);

   useEffect(() => {
      const cancelToken = api.getCancelToken();
      const fetchPrd = async () => {
         try {
            const ret = await ProductController.getProdByIds([productId]);
            if (ret.data.results.length > 0) {
               setProdData(ret.data.results[0]);
            }            
         } catch (err) {
            if (!api.isCancel(err)) {
               console.log(err);
            }
         }
      }
      fetchPrd();
      return () => cancelToken.cancel();
   }, [productId]);

   return prodData ? <ProductCard  product={prodData}  /> : <ProductCardLoading />
}

ProductCard.propTypes = {
   product: PropTypes.object.isRequired
}

ProductCardId.propTypes = {
   productId: PropTypes.string.isRequired
}

export {ProductCard, ProductCardId, ProductCardLoading};