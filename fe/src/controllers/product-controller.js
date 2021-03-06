import api from "../services/api"

export default class ProductController {

   static getProds(offset, pageSize, filters) {
      return api.get(`/products/?offset=${offset}&limit=${pageSize}${filters}`)
   }

   static getProdByIds(productIds) {
      const strProds = productIds.join(',');
      return api.get(`/products/?offset=0&limit=9999&id=${strProds}`)
   }

   static getFilters(activeFilters) {
      return api.get(`/products/filters/?${activeFilters}`)      
   }

   static getProductTextSearchOptions(searchText) {
      return api.get(`/products/search-text-options/?limit=15&searchtext=${searchText}`)            
   }   

   static getProductFiltersUri(genre, category, brand) {      
      const filters = [];
      if (genre) {
         filters.push(`genre=${genre.id}-${genre.description}`);
      }
      if (category) {
         filters.push(`category=${category.id}-${category.description}`);
      }
      if (brand) {
         filters.push(`brand=${brand.id}-${brand.description}`);
      }      
      let ret = '/products/';
      if (filters.length > 0) {
         ret += `?${filters.join('&')}`
      }
      return ret;
   }

   static getProductUri(productId, description, brandName) {
      return `/products/${productId}/?product=${brandName.replace(/ /g, '_')}-${description.replace(/ /g, '_')}`;
   }

   static getProductFilterUri(filter, id, description) {
      return `/products/?${filter}=${id}-${description}`;
   }

   static getProductSearchTextUri(searchText) {
      return `/products/?searchtext=${searchText}`;
   }

}