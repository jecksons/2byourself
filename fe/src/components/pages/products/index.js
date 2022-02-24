import { useCallback, useEffect, useReducer, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {AiOutlinePlus, AiOutlineMinus, AiOutlineMinusCircle, AiOutlineClose} from 'react-icons/ai';
import {BiCheckboxChecked, BiCheckbox} from 'react-icons/bi';
import {GoSettings} from 'react-icons/go';
import Modal from 'react-modal';

import api from '../../../services/api';
import PageTrack from '../../controls/page-track';
import { ProductCard, ProductCardLoading } from "../../controls/product-card";
import utils from "../../../services/utils";
import NotFoundSurface from "../../controls/not-found-surface";
import ProductController from "../../../controllers/product-controller";
import AppMainContainer from "../../controls/app-main-container";
import './styles.css';

function DismissibleFilter({filter, onDismiss}) {

   return <div className="row-05 width-100">
      <label >
         {filter.description}            
      </label>
      <button className="btn-icon" onClick={() => onDismiss(filter)}><AiOutlineMinusCircle size={16} />  </button>
   </div>
}


const getDescriptionWithoutCount = (description) => {
   if (description.indexOf('(') >= 0) {
      return description.substr(0,  description.lastIndexOf('(') ).trim();
   }
   return description;
}

function FilterItemSelect({filterItem, show, onChangeSelection, selItems}) {

   
   const isSelected = useCallback((itm) => (itm && 
      selItems.find((flt) => 
         flt.id === itm.id && 
            flt.filter === filterItem.id 
         )  != null      
      )
      , [selItems, filterItem]);
      
   return <ul className={`col-05 align-start toggle-${show ? 'show' : 'hide'} pad-05-1`} >
      {filterItem.items.map((itm) => <li  key={itm.id}  >         
      <label className="row-05 width-100 lb-item-check" onClick={() => {
         onChangeSelection({
            type: `${isSelected(itm) ? 'unselect' : 'select'}`, 
            value: {
               id: itm.id, 
               filter: filterItem.id,
               description: getDescriptionWithoutCount(itm.description)
            }});
      }} >
         {
            isSelected(itm) ?
               <BiCheckboxChecked size={20}  /> : 
               <BiCheckbox size={20} style={{color: '#909090'}} /> 
         }         
         {itm.description}         
      </label>   
      </li>)}
   </ul>

}

function FilterItem({filter, onChangeSelection, selItems}) {

   const [expanded, setExpanded]  = useState(false);

   return (
      <li className="width-100">
         <button 
            className="btn-section" 
            onClick={() => setExpanded(p => !p)}>{filter.description} {expanded ? <AiOutlineMinus size={16}/> : <AiOutlinePlus size={16}/>}
         </button>      
            {filter.filterType === 'items' ? 
                  <FilterItemSelect  filterItem={filter} show={expanded} onChangeSelection={onChangeSelection} selItems={selItems} /> : 
                  null
         }
      </li>
   )
}

function FiltersModal({filters, onChangeSelection, selFilters, show, onRequestClose}) {

   return show && (
      <Modal 
         className={'dialog-content'}
         overlayClassName={'overlay-dialog'}
         isOpen={true}
         onRequestClose={onRequestClose}
         >
         <div className="col-05 card-square max-height-90vh min-width-16">
            <button onClick={onRequestClose} className="product-filters-close" ><AiOutlineClose size={12}/></button>
            <label>Filters</label>
            <ul className="col-05 align-start width-100 scroll-auto">
               {filters.map((itm) => <FilterItem key={itm.id} filter={itm} onChangeSelection={onChangeSelection} selItems={selFilters} /> )}
            </ul>                     
         </div>
      </Modal>         
   );

}

function FiltersSmall({filters, onChangeSelection, selFilters, onDismiss}) {

   const [showingModal, setShowingModal] = useState(false);

   return (
      <section className="col-05 align-start width-100 product-filters-small" >
         <div className="row-05">
            <button className="btn-action-secundary" onClick={() => setShowingModal(true)}> 
               <GoSettings size={16} color='#000'/>
            Filters</button>
         </div>
         <ul className="row-05 flex-wrap just-start">
            {
               (selFilters ?? []).map((itm) => <button 
               key={itm.filter + itm.id.toString()}
                  className="btn btn-round-dismissible" 
                  onClick={() => onDismiss(itm)}>
                     {itm.description}
                     <AiOutlineClose size={12}/>
               </button>)
            }
         </ul>
         <FiltersModal  
            filters={filters} 
            onChangeSelection={onChangeSelection} 
            selFilters={selFilters} 
            show={showingModal}
            onRequestClose={() => setShowingModal(false)}
            />      
      </section>
   );

}


const ProdPageSize = 5;

const PL_LOADING = 0;
const PL_LOADED = 1;
const PL_ERROR = 2;

const ProductQueryFilters = [
   'genre',
   'category',   
   'brand',   
   'offer',
   'size',
   'offset',
   'searchtext'
]

const getProductsTitle = (filters, separator = ' - ') => {
   let strRes = '';
   let iCnt = 0;   
   ProductQueryFilters.forEach((itm) => {
      if (iCnt < 2) {         
         const flt = filters.find((flt) => flt.filter === itm);
         if (flt) {
            strRes += `${strRes ? (separator || ' & ') : ''} ${flt.description}`;
            iCnt++;
         }         
      }
   });
   if (strRes === '') {
      strRes = 'Men & Women Clothing';
   }
   return strRes;
}

const getPageTitle = (filters) => {
   let strRes = '2BYourself - ';
   strRes += getProductsTitle(filters) || `Products`;   
   return strRes;
}

const processFiltersFromParams = (searchParams) => {
   const ret = [];
   searchParams.forEach((value, key) => {
      if (ProductQueryFilters.find((itm) => itm === key )) {
         const values = value.split(',');
         values.forEach((itmVal) => {
            let valAdd = itmVal;
            if (valAdd.indexOf('-') > 0) {
               ret.push({
                  id: parseInt(valAdd.substr(0, valAdd.indexOf('-'))) || valAdd.substr(0, valAdd.indexOf('-')),
                  description: valAdd.substr(valAdd.indexOf('-')+1),
                  filter: key
               });
            } else if (key === 'searchtext') {
               ret.push({
                  id: valAdd,
                  description: valAdd,
                  filter: key
               });
            }
         } )
      }
   });   
   return ret;
}

const getFilterStr = (filters, includeDescription) => {
   let filtersAgp = [];      
   filters.forEach((itm) => {
      let flt = filtersAgp.find((filter) => itm.filter === filter.filter);
      if (!flt) {
         flt = {
            filter: itm.filter,
            items: []
         };
         filtersAgp.push(flt);
      }         
      if (includeDescription) {
         flt.items.push(itm.id + '-' + itm.description);
      } else {
         flt.items.push(itm.id);
      }
   });
   let strFilter = '';
   filtersAgp.forEach((itm) => {
      strFilter += `&${itm.filter}=${itm.items.join(',')}`
   });
   return strFilter;
}

const updateQueryParamsFromFilter = (filters, offset, setSearchParams) => {
   const filterStr = getFilterStr(filters, true);   
   setSearchParams(filterStr);
}

function handleSelectedFilters(state, action) {
   switch (action.type) {
      case 'select': {
         return [...state, action.value];
      }
      case 'unselect': {
         let newItems = [...state];
         return newItems.filter((itm) => (itm.id !== action.value.id || itm.filter !== action.value.filter));         
      }
      case 'update': {
         let newItems = [...state];
         const idx = newItems.findIndex((itm) => itm.id === action.value.id && itm.filter === action.value.filter);
         if (idx >= 0) {
            newItems[idx] = action.value;
         } else {
            newItems.push(action.value)
         }
         return newItems;
      }
      case 'update-by-filter': {
         let newItems = [...state];
         const idx = newItems.findIndex((itm) => itm.filter === action.value.filter);
         if (idx >= 0) {
            newItems[idx] = action.value;
         } else {
            newItems.push(action.value)
         }
         return newItems;
      }
      case 'delete-by-filter': {
         return [...state].filter((itm) => itm.filter  !== action.filter);         
      }
      case 'clear': {
         return [];
      }
      case 'set': {
         return [...action.value];
      }
      default: throw new Error('Action not expected')
   }
}

function ProductNotFound(props) {

   return (
      <div className="no-products-found">
         <NotFoundSurface  title="No products found" message="Try to searching for something else" />
      </div>
   )

}

export default function Products(props){

   const [searchParams, setSearchParams] = useSearchParams();
   const [products, setProducts] = useState([]);
   const [prodMetadata, setProdMetadata] = useState({total: 0});
   const [prodOffset, setProdOffset] = useState(0);
   const [filters, setFilters] = useState([]);
   const [selFilters, reducerSelFilters] = useReducer(handleSelectedFilters, []);
   const [productLoad, setProductLoad] = useState(PL_LOADING);
   const [errorMessage, setErrorMessage] = useState(null);
   const [productsTitle, setProductsTitle] = useState(' ');
         
   useEffect(() => {      
      const filterParams = processFiltersFromParams(searchParams);
      const filterOffset = filterParams.find((itm) => itm.filter === 'offset');
      let offsetValue = 0;
      if (filterOffset) {
         offsetValue = parseInt(filterOffset.id) ?? 0;
         filterParams.splice(filterParams.indexOf(filterOffset), 1);
      }      
      const filterStr = getFilterStr(filterParams);
      const cancelToken = api.getCancelToken();
      const fetchPrd = async () => {
         try {            
            const ret  = await ProductController.getProds(offsetValue, ProdPageSize, filterStr);
            setProducts(ret.data.results);
            setProdMetadata(ret.data.metadata);            
            setProductLoad(PL_LOADED);
         } catch (err) {
            if (!api.isCancel(err)) {
               setErrorMessage({title: 'Something went wrong.', message: utils.getHTTPError(err)})
               setProductLoad(PL_ERROR);
            }
         }
      }
      const fetchFilters = async () => {
         try {            
            const ret = await ProductController.getFilters(filterStr);
            setFilters(ret.data);            
         } catch (err) {
            if (!api.isCancel(err)) {
               console.log(err);
            }
         }
      }
      setProductLoad(PL_LOADING);
      fetchPrd();
      fetchFilters();
      document.title = getPageTitle(filterParams);
      reducerSelFilters({type: 'set', value: filterParams});
      setProductsTitle(getProductsTitle(filterParams, ' & ') || ' ');
      setProdOffset(offsetValue);
      return () => cancelToken.cancel();
   }, [searchParams]);

   const onChangeFilters = useCallback((action) => {
      let parFilters = processFiltersFromParams(searchParams);
      parFilters = handleSelectedFilters(parFilters, action);
      updateQueryParamsFromFilter(parFilters, 0, setSearchParams);
   }, [searchParams, setSearchParams]);

   const onDismissFilter = useCallback((item) => {
      onChangeFilters({type: 'unselect', value: item});
   }, [onChangeFilters]);

   const onChangeOffset = useCallback((newOffset) => {      
      if (newOffset > 0) {
         onChangeFilters({type: 'update-by-filter', value: {
            id: newOffset,
            filter: 'offset',
            description: ''
         }});
      } else {
         onChangeFilters({type: 'delete-by-filter', filter: 'offset'});         
      }
   }, [onChangeFilters])

   return (
      <AppMainContainer>
         <section className="body-product">
            <section className="card-square width-12 col-1 align-start just-start product-filter-main">
               <label className="font-bold">Filter By</label>
               {
                  selFilters.length > 0 &&
                     <div className="col-05 width-100">
                        <ul className="width-100">
                           {selFilters.map((itm) => <DismissibleFilter key={itm.filter + itm.id.toString()}  filter={itm} onDismiss={onDismissFilter}  />)}                     
                        </ul>
                        <button className="btn-link font-75" onClick={() => onChangeFilters({type: 'clear'})}>Clear All</button>
                     </div>
               }
               <ul className="col-05 align-start width-100">
                  {filters.map((itm) => <FilterItem key={itm.id} filter={itm} onChangeSelection={onChangeFilters} selItems={selFilters} /> )}
               </ul>                     
            </section>
            <section className="product-grid">
               <header className="row">               
                  <h2 className="font-105 font-bold">{productsTitle}</h2>                  
               </header>            
               <FiltersSmall 
                  filters={filters} 
                  onChangeSelection={onChangeFilters} 
                  onDismiss={onDismissFilter}
                  selFilters={selFilters}  />
               {
                  (productLoad === PL_LOADED && products.length === 0) ?
                     <ProductNotFound /> : 
                     (
                        <ul className="product-items">
                           {
                              productLoad === PL_LOADING ? 
                                 ( Array.from('123').map((itm) => <ProductCardLoading key={itm} /> )) :
                                 (
                                    productLoad === PL_ERROR ? 
                                       <NotFoundSurface title={errorMessage.title}  message={errorMessage.message} /> :
                                       products.map((itm) => <ProductCard key={itm.id} product={itm} /> )
                                 )
                           }                             
                        </ul>
                     )
               }
               <footer className="row just-end" >
                  <PageTrack pageSize={ProdPageSize} rowOffset={prodOffset} onSelectOffset={onChangeOffset} rowTotal={prodMetadata.total} />                  
               </footer>
            </section>
         </section>
      </AppMainContainer>
   )

}