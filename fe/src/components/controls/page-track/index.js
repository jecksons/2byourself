import PropTypes from 'prop-types';
import { useCallback, useState, useEffect } from 'react';
import Select from 'react-select';
import {MdArrowBackIosNew, MdArrowForwardIos} from 'react-icons/md';
import './styles.css';


function PageTrack({pageSize, rowTotal, rowOffset, onSelectOffset}) {

   const [pages, setPages] = useState([]);
   const [selPage, setSelPage] = useState({
      currPage: null,
      nextPage: null,
      prevPage: null
   });
   const [keyRender, setKeyRender] = useState(0);
      
   
   useEffect(() => {
      if (rowTotal > 0 && pageSize > 0) {         
         let numPages = Math.trunc(rowTotal / pageSize);
         let arPages = Array.from({length: numPages}, (v, idx) => ({
            value: (idx * pageSize),
            label: `${(idx * pageSize + 1).toString()} to ${((idx +1) * (pageSize) ).toString()}`
         }) );         
         const extraVal = rowTotal - (numPages * pageSize);
         if (extraVal > 0) {
            arPages.push({
               value: (numPages * pageSize),
               label: `${(numPages * pageSize + 1).toString()} to ${(numPages * pageSize + extraVal).toString()}`
            });            
         }         
         let idxSelPage = arPages.findIndex((itm) => (itm.value >= rowOffset && itm.value <= (rowOffset + pageSize))  );
         const newPageData = {
            currPage: null,
            nextPage: null,
            prevPage: null
         }
         if (idxSelPage >= 0) {
            if (idxSelPage > 0) {
               newPageData.prevPage = arPages[idxSelPage-1];
            }
            newPageData.currPage = arPages[idxSelPage];
            if (idxSelPage < (arPages.length -1) ) {
               newPageData.nextPage = arPages[idxSelPage+1];
            }
         }   
         setSelPage(newPageData);
         setPages(arPages);
         setKeyRender(p => p+1);
      } else {
         setPages([]);
      }      
   }, [pageSize, 
      rowTotal, 
      rowOffset]);   

   const handleChangeSel = useCallback((option) => {
      if (option) {
         onSelectOffset(option.value);
      }      
   }, [onSelectOffset]);

   return pages.length > 1 && <div className='page-track'>
      {
         selPage.prevPage ? 
            <button className={`btn-icon btn-no-shadow btn-pad-025`} onClick={() => handleChangeSel(selPage.prevPage)} > <MdArrowBackIosNew size={16} /> </button> : 
            <div className='width-3'> </div>
      } 
      <Select
         key={keyRender}
         options={pages}
         defaultValue={selPage.currPage}
         classNamePrefix='av-select'
         isSearchable={false}
         onChange={(opt) => handleChangeSel(opt) }
      />
      {
         selPage.nextPage ? 
            <button className={`btn-icon btn-no-shadow btn-pad-025 `}  onClick={() => handleChangeSel(selPage.nextPage)}><MdArrowForwardIos size={16} /> </button> :
            <div className='width-3'> </div>
      }       
   </div>
}

PageTrack.propTypes = {
   pageSize: PropTypes.number.isRequired,
   rowTotal: PropTypes.number.isRequired,
   rowOffset: PropTypes.number.isRequired,
   onSelectOffset: PropTypes.func.isRequired
}

export default PageTrack;