const { ErNotFound } = require("../services/error_classes");
const UtilsLib = require("../services/utils_lib");

const FINAL_PRICE_EXPR = 'round(prd.price -  round(prd.price * ((ifnull(ofe.discount, 0) / 100)), 2), 2) ';

const SQL_SEL_OFFERS = `
      with
         ofe as
         (
            select 
               ofe.id_offer id,
               ofe.description,
               (
                  select
                     count(1)
                  from
                     product prd
                  join product_category ppc on (prd.id_product_category = ppc.id_product_category)
                  join brand pbr on (prd.id_brand = pbr.id_brand)                     
                  where
                     prd.id_offer = ofe.id_offer
                     /*prdfilter*/
               )  products
            from
               offer ofe
         )
      select
         *
      from
         ofe
      where
         ofe.products > 0      
      order by
         description
   `;

const SQL_SEL_CATEGORIES = `
      with
         agp as
         (
            select 
               cat.id_product_category id,
               cat.description,
               (
                  select
                     count(1)
                  from
                     product prd
                  join product_category ppc on (prd.id_product_category = ppc.id_product_category)
                  join brand pbr on (prd.id_brand = pbr.id_brand)                                          
                  where
                     prd.id_product_category = cat.id_product_category
                     /*prdfilter*/
               )  products
            from
               product_category cat
         )
      select
         *
      from
         agp
      where
         agp.products > 0      
      order by
         description
`;

const SQL_SEL_BRANDS = `
      with
         agp as
         (
            select 
               brd.id_brand id,
               brd.description,
               (
                  select
                     count(1)
                  from
                     product prd
                  join product_category ppc on (prd.id_product_category = ppc.id_product_category)
                  join brand pbr on (prd.id_brand = pbr.id_brand)                                          
                  where
                     prd.id_brand = brd.id_brand
                     /*prdfilter*/
               )  products
            from
               brand brd
         )
      select
         *
      from
         agp
      where
         agp.products > 0      
      order by
         description
   `;

const SQL_SEL_SIZES = `
      select
         siz.id_size id,
         siz.description
      from
         size siz
      where
         exists
               (
                  select 
                     * 
                  from 
                     product_category_size cats
                  join product prd on (prd.id_product_category = cats.id_product_category)
                  join product_category ppc on (prd.id_product_category = ppc.id_product_category)
                  join brand pbr on (prd.id_brand = pbr.id_brand)                                       
                  where
                     cats.id_size = siz.id_size
                     /*prdfilter*/
               )
      order by
         id_size
   `;

const SQL_SEL_GENRES = `
   select
      'M' id,
      'Men' description
   union all
   select
      'F' id,
      'Women' description
`;   

const SQL_SEL_PRICE_RANGE = `
      select
         ifnull(min(prd.price), 0) min_value,
         ifnull(max(prd.price), 0) max_value
      from
         product prd
      join product_category ppc on (prd.id_product_category = ppc.id_product_category)
      join brand pbr on (prd.id_brand = pbr.id_brand)                              
      where
         1 = 1
         /*prdfilter*/
   `;

const SQL_FILTER_SIZE = `
      exists
      (
         select 
            1
         from 
            product_category_size cats   
         where
            prd.id_product_category = cats.id_product_category
            and cats.id_size in (
                  /*items*/
            )      
      )
   `;

const SQL_SEL_ALL_PROD_SECTIONS = `
      with
         prd as
         (
            select
               cat.description category,
               prd.id_product_category,
               count(1) total,
               prd.id_brand,
               brd.description brand,
               prd.genre,
               prd.id_offer,
               ofe.description offer
            from
               product prd
            left join product_category cat on (cat.id_product_category = prd.id_product_category)
            left join brand brd on (brd.id_brand = prd.id_brand)
            left join offer ofe on (ofe.id_offer = prd.id_offer)
            group by
               cat.description,
               prd.id_product_category,
               prd.id_brand,
               brd.description,
               prd.genre,
               prd.id_offer,
               ofe.description 
         ),
         cag as
         (   
            select
               max(case when a.rn =  1 then  a.id_product_category end )  id_product_category_1,
               max(case when a.rn =  1 then  a.category end )  category_1,
               max(case when a.rn =  2 then  a.id_product_category end )  id_product_category_2,
               max(case when a.rn =  2 then  a.category end )  category_2,
               a.genre
            from
               (
                  select
                     a.*,
                     row_number() over(partition by a.genre order by a.total desc, a.category) rn
                  from
                     (
                        select 
                           sum(prd.total) total,
                           prd.id_product_category,
                           prd.category,
                           prd.genre
                        from 
                           prd
                        group by
                           prd.id_product_category,
                           prd.category,
                           prd.genre
                     ) a
               ) a
            group by
               a.genre
         )   
      select
         prd.*,
         row_number() over(partition by prd.genre, prd.brand, prd.id_brand order by total desc) rn_brand,
         row_number() over(partition by prd.genre, prd.category, prd.id_product_category order by total desc) rn_category,
         row_number() over(partition by prd.genre, prd.offer, prd.id_offer order by total desc) rn_offer,
         row_number() over(partition by prd.genre order by prd.category, prd.brand, total desc) rn_genre,    
         cag.id_product_category_1,
         cag.category_1,
         cag.id_product_category_2,
         cag.category_2
      from
         prd
      left join cag on cag.genre = prd.genre
   `;

const PRODUCT_FILTERS = [
   {
      id: 'category', 
      filterType: 'items',
      description: 'Categories',
      fieldFilter: 'prd.id_product_category',
      sql: SQL_SEL_CATEGORIES
   },
   {
      id: 'brand', 
      filterType: 'items',
      fieldFilter: 'prd.id_brand',
      description: 'Brands',
      sql: SQL_SEL_BRANDS
   },
   {
      id: 'size', 
      filterType: 'items',
      exprFilter: SQL_FILTER_SIZE,
      description: 'Sizes',
      sql: SQL_SEL_SIZES
   },   
   {
      id: 'offer', 
      filterType: 'items',
      fieldFilter: 'prd.id_offer',
      description: 'Offers',
      sql: SQL_SEL_OFFERS
   },
   {
      id: 'genre', 
      filterType: 'items',
      fieldFilter: 'prd.genre',
      description: 'Genre',
      isChar: true,
      sql: SQL_SEL_GENRES
   },
   {
      id: 'price', 
      filterType: 'range',
      fieldFilter: FINAL_PRICE_EXPR,
      description: 'Price',
      sql: SQL_SEL_PRICE_RANGE
   }   
]

const PRODUCT_SORT_OPTIONS = [
   {
      id: 'popularity',
      expression: 'prd.user_rating'
   },
   {
      id: 'price',
      expression: 'round(prd.price * (1- (ifnull(ofe.discount, 0) / 100)), 2)'
   },
   {
      id: 'brand',
      expression: 'brd.description'
   }
]

const SQL_SEL_PRODUCTS = `
      with  
         prd as
         (   
            select
               prd.id_product,
               prd.description,
               prd.price original_price,
               ${FINAL_PRICE_EXPR} final_price,
               prd.user_rating,
               prd.id_image,
               ofe.description offer,
               pbr.description brand,
               ofe.discount,
               row_number() over(order by 
                  /*sort_by*/
                  prd.user_rating,
                  round(prd.price * (1- (ifnull(ofe.discount, 0) / 100)), 2)    
               ) rn_products,
               count(1) over() tot_products   
            from
               product prd
            left join offer ofe on (prd.id_offer = ofe.id_offer)
            join product_category ppc on (prd.id_product_category = ppc.id_product_category)
            join brand pbr on (prd.id_brand = pbr.id_brand)                              
            where
               1=1
               /*filter*/
         )
      select
         *
      from
         prd
      where
         prd.rn_products between ? and ?
      order by
         prd.rn_products
   `;


const SQL_SEL_PRODUCT_DETAIL = `
      select
         prd.id_product,
         prd.description,
         prd.price original_price,
         ${FINAL_PRICE_EXPR} final_price,
         round(prd.price * ((ifnull(ofe.discount, 0) / 100)), 2) discount_value,
         prd.user_rating,
         prd.user_fit_sizing,
         prd.genre,
         prd.id_image,
         prd.id_brand,
         prd.id_product_category,
         ofe.description offer,
         brd.description brand,
         ofe.discount,
         cat.description category,
         cas.id_size,
         siz.description size
      from
         product prd
      left join offer ofe on (prd.id_offer = ofe.id_offer)
      left join brand brd on (prd.id_brand = brd.id_brand)
      left join product_category cat on (prd.id_product_category = cat.id_product_category)
      left join product_category_size cas on (cas.id_product_category = cat.id_product_category)
      left join size siz on (siz.id_size = cas.id_size)
      where
         prd.id_product = ?
   `   ;

const SQL_SEL_PROD_WITHOUT_RATING = `
      select 
         prd.id_product
      from 
         product prd
      where
         not exists
                  (
                     select
                        1
                     from
                        product_rating rat
                     where
                        rat.id_product = prd.id_product
                  )
   `;

const SQL_INS_RATING = `
      insert into product_rating
      (
         id_product,
         rating,
         review_count
      )
      values(?, ?, ?)   
`;

const SQL_SEL_PRODUCT_RATING = `
      select 
         rat.rating, 
         rat.review_count,
         round((sum( rat.review_count *  rat.rating ) over())  / (sum( rat.review_count) over()), 1) perc,
         (sum( rat.review_count) over()) review_total
      from 
         product_rating rat
      where
         rat.id_product = ?
      order by
         rat.rating
`

const SQL_SEL_SEARCH_PRODUCTS = `
      with
         brd as
         (
            select
               fil.id_brand id,
               fil.description,
               'brand' filter_type
            from
               brand fil
            where
               1=1
               /*word_filters*/
         ),
         cat as
         (   
            select
               fil.id_product_category id,
               fil.description,
               'category' filter_type
            from
               product_category fil
            where
               1=1
               /*word_filters*/         
         ),
         prd as
         (
            select
               fil.id_product id,
               fil.description,
               'product' filter_type
            from
               product fil
            where
               1=1
               /*word_filters*/
         ),
         itm as
         (
            select
               cat.id,
               cat.description,
               cat.filter_type,
               1 appearance_order
            from
               cat
            union all
            select
               brd.id,
               brd.description,
               brd.filter_type,
               2 appearance_order
            from
               brd
            union all
            select
               prd.id,
               prd.description,
               prd.filter_type,
               3 appearance_order
            from
               prd
         ),
         agp as
         (
            select
               itm.*,
               row_number() over(order by 
                  case
                     when upper(itm.description) like upper(concat(?, '%')) then 1
                     when upper(itm.description) like upper(concat('%', ?, '%')) then 2
                     else 3
                  end,
                  itm.appearance_order,
                  itm.description
               ) rn_items,
               count(1) over() count_items
            from
               itm
         )
      select
         agp.*
      from
         agp
      where
         agp.rn_items between ? and ?
      order by
         agp.rn_items
   `;

class ProductController {

   static async addFilterNT(arFilters, productItemFilter, conn, filters = ' ', filterValues = []) {
      const sql = productItemFilter.sql.replace('/*prdfilter*/', filters);
      const rows = await conn.query(sql, filterValues);
      if (rows.length > 0) {
         if (productItemFilter.filterType === 'items') {
            arFilters.push({
               description: productItemFilter.description, 
               filterType: productItemFilter.filterType,
               id: productItemFilter.id,
               items: rows.map((itm) => ({id: itm.id, description: `${itm.description} ${itm.products > 0 ? `(${itm.products})` : ''}`}))
            })
         } else {
            arFilters.push({
               description: productItemFilter.description, 
               filterType: productItemFilter.filterType,
               id: productItemFilter.id,
               items: [rows[0].min_value, rows[0].max_value]
            });
         }         
      }     
   }

   static processFilterFromPhrase(text, sqlValues) {
      const queryWords = text.replaceAll('  ', ' ').split(' ');
      let filterRet = ' ';
      queryWords.forEach((itm) => {
         filterRet += ` and upper(concat(prd.description, ppc.description, pbr.description)) like upper(concat('%', ?, '%')) `;
         sqlValues.push(itm);
      });
      return filterRet;
   }

   static async getProductsOptionsByText(query, conn) {
      try {
         const metadata = {
            total: 0,
            count: 0,
            offset: parseInt(query.offset) > 0 ? parseInt(query.offset) : 0,
            limit: parseInt(query.limit) > 0 ? parseInt(query.limit) : 20
         };
         let sqlFilter = '';
         let sql = SQL_SEL_SEARCH_PRODUCTS;
         const queryText = query.searchtext || '';
         const queryWords = queryText.split(' ');         
         let values = [];         
         queryWords.forEach((itm, idx) => {
            sqlFilter += ` and upper(fil.description) like upper(concat('%', ?, '%')) `;
            values.push(itm);
         });
         if (values.length > 0) {
            values = [...values, ...values, ...values];
            sql = sql.replaceAll('/*word_filters*/', sqlFilter);
         }
         values.push(queryText, queryText, metadata.offset +1, metadata.offset + metadata.limit);
         const rows = await conn.query(sql, values);
         let results = [];
         if (rows.length > 0) {
            metadata.total = rows[0].count_items;
            metadata.count = rows.length;
            results = rows.map((itm) => ({
               id: itm.id,
               description: itm.description,
               filter_type: itm.filter_type               
            }));
         }
         return {
            metadata,
            results            
         };
      } finally {
         await conn.close();
      }
   }

   static async getProductFilters(query, conn) {
      try {
         let ret = [];
         const fullFilters = ProductController.getProductFilterSQL(query);
         for (let i = 0; i < PRODUCT_FILTERS.length; i++) {
            if (query.hasOwnProperty(PRODUCT_FILTERS[i].id)) {
               const specificFilters = ProductController.getProductFilterSQL(query, PRODUCT_FILTERS[i].id);
               await ProductController.addFilterNT(ret, PRODUCT_FILTERS[i], conn, specificFilters.filter, specificFilters.values);
            } else {
               await ProductController.addFilterNT(ret, PRODUCT_FILTERS[i], conn, fullFilters.filter, fullFilters.values);
            }                       
         }         
         return ret;
      } finally {
         await conn.close();
      }
   }

   static getProductFilterSQL(query, filterToIgnore) {
      let filter = '';
      let values = [];
      const qrKeys = Object.keys(query);
      let lastIdxFilter = qrKeys.length -1;
      if (filterToIgnore && (qrKeys.indexOf(filterToIgnore) >= 0)) {
         lastIdxFilter = qrKeys.indexOf(filterToIgnore)-1;
      }
      for (let i = 0; i <= lastIdxFilter; i++) {
         const fieldKey = qrKeys[i];
         const flt = PRODUCT_FILTERS.find((fltItem) => fltItem.id === fieldKey);
         if (flt) {
            let fltVals = query[fieldKey].split(',');            
            if (!flt.isChar) {
               fltVals = fltVals.map((itf) => (parseFloat(itf)));
            }            
            if (fltVals.length > 0) {
               let arStr = '';
               fltVals.forEach((val) => {arStr += `${arStr !== '' ? ', ' : ''}?`});
               if (flt.fieldFilter) {                  
                  if (flt.filterType === 'range') {
                     if (fltVals.length >= 2) {
                        filter += ` and  ${flt.fieldFilter} between ? and ?`;
                        values.push(fltVals[0], fltVals[1]);
                     }
                  } else {
                     filter += ` and  ${flt.fieldFilter} in (${arStr})`;
                     values = values.concat(fltVals);
                  }                  
               } else if (flt.exprFilter) {                  
                  filter += ` and  ${flt.exprFilter.replace('/*items*/', arStr)}`;
                  values = values.concat(fltVals);
               }
            }
         } else if (fieldKey === 'searchtext') {
            filter += ProductController.processFilterFromPhrase(query[fieldKey], values);
         }
      }
      if (query.id) {
         const idVals = query.id.split(',');
         if (idVals.length > 0) {
            values = values.concat(idVals);
            filter += ` and prd.id_product in (${ idVals.map((itm, idx) => `${idx > 0 ? ', ' : ''} ?`) }) `;
         }
      }
      return {filter: filter, values: values};
   }

   static async getProductRatings(idProduct, conn) {
      const ret = {
         ratings: 0,
         rating_average: 0,
         distribuition: [
            {rating: 1, total: 0, ratio: 0},
            {rating: 2, total: 0, ratio: 0},
            {rating: 3, total: 0, ratio: 0},
            {rating: 4, total: 0, ratio: 0},
            {rating: 5, total: 0, ratio: 0}
         ]
      }
      const rows = await conn.query(SQL_SEL_PRODUCT_RATING, [idProduct]);
      if (rows.length > 0) {
         ret.ratings = rows[0].review_total;
         ret.rating_average = rows[0].perc;
         rows.forEach((itm) => {
            const dist = ret.distribuition.find((di) => di.rating === itm.rating);
            if (dist) {
               dist.total = itm.review_count;
               dist.ratio = UtilsLib.roundTo(itm.review_count / rows[0].review_total, 3);
            }
         })
      }
      return ret;
   }

   static getProductSQLOptions(query) {
      let sql = SQL_SEL_PRODUCTS;
      const {filter, values} = ProductController.getProductFilterSQL(query);            
      let sortSql = ' ';
      if (query.sort_by) {
         const itmSort = PRODUCT_SORT_OPTIONS.find((itm) => query.sort_by === itm.id);
         if (itmSort) {
            sortSql = itmSort.expression;
            if (query.order_by === 'desc') {
               sortSql += ' desc';
            }
            sortSql += ', ';
         }
      }
      sql = sql.replace('/*filter*/', filter).replace('/*sort_by*/', sortSql);
      return {sql: sql, values: values}
   }

   static async getProductByIdNT(idProduct, conn) {
      const prd = await conn.query(SQL_SEL_PRODUCT_DETAIL, [idProduct]);
      if (prd.length > 0) {
         let info = {
            id: prd[0].id_product,
            description: prd[0].description,
            original_price: prd[0].original_price,
            final_price: prd[0].final_price,
            discount_value: prd[0].discount_value,
            discount: prd[0].discount ?? 0,
            offer: prd[0].offer,
            genre: {
               id: prd[0].genre,
               description: prd[0].genre === 'M' ? 'Men' : 'Women'
            },
            brand: {
               id: prd[0].id_brand,
               description: prd[0].brand
            },            
            category: {
               id: prd[0].id_product_category,
               description: prd[0].category
            },
            image: `/products/img/${prd[0].id_image}.webp`,
            imageSmall: `/products/img/small/${prd[0].id_image}.webp`,
            sizes: []
         };
         prd.forEach((itm) => {
            if (itm.id_size) {
               info.sizes.push({id: itm.id_size, description: itm.size});
            }
         });
         info.user_rating = await ProductController.getProductRatings(idProduct, conn);
         return info;
      }
      throw new ErNotFound('Product not found!');
   }

   static async getProductById(idProduct, conn) {
      try {
         return await ProductController.getProductByIdNT(idProduct, conn);

      } finally {
         await conn.close();
      }
   }

   static getProductFromSQLRow(row) {
      return {
         id: row.id_product,
         description: row.description,
         original_price: row.original_price,
         final_price: row.final_price,
         discount: row.discount ?? 0,
         user_rating: row.user_rating,
         offer: row.offer,
         brand: row.brand,
         image: `/products/img/${row.id_image}.webp`,
         imageSmall: `/products/img/small/${row.id_image}.webp`
      };
   }
   
   static async getProducts(query, conn) {
      try {
         const ret = {
            metadata: {
               total: 0,
               count: 0,
               offset: (parseInt(query.offset) >= 0 ? parseInt(query.offset) : 0),
               limit: (parseInt(query.limit) > 0 ? parseInt(query.limit) : 20)
            },
            results: []
         };
         const options = ProductController.getProductSQLOptions(query);
         const rows = await conn.query(options.sql, [...options.values,  ret.metadata.offset + 1, ret.metadata.offset + ret.metadata.limit]);
         if (rows.length > 0) {
            ret.metadata.total = rows[0].tot_products;
            ret.metadata.count = rows.length;
            ret.results = rows.map((itm) => ProductController.getProductFromSQLRow(itm));
         }
         return ret;
      } finally {
         await conn.close();
      }
   }

   static async generateRandomRatings(conn) {
      let transStarted = false;
      try {
         const rows = await conn.query(SQL_SEL_PROD_WITHOUT_RATING);
         await conn.beginTransaction();
         if (rows.length > 0) {
            for (let i = 0; i < rows.length; i++) {
               const ratItems = [
                  {rating: 1, value: UtilsLib.getRandomInt(0, 200)},
                  {rating: 2, value: UtilsLib.getRandomInt(0, 200)},
                  {rating: 3, value: UtilsLib.getRandomInt(0, 200)},
                  {rating: 4, value: UtilsLib.getRandomInt(0, 200)},
                  {rating: 5, value: UtilsLib.getRandomInt(0, 200)}
               ];
               ratItems.forEach((itm) => itm.value = itm.value > 100 ? (itm.value - 100) : 0);
               for (let el in ratItems) {
                  await conn.query(SQL_INS_RATING, [rows[i].id_product, ratItems[el].rating, ratItems[el].value]);
               }
            }
         }
         await conn.commit();         
      }  catch (err) {
         if (transStarted) {
            await conn.rollback();
         }
         throw err;
      }      
      finally {
         await conn.close();
      }
   }

   static processMenuCategories(rows, category) {      
      const brands = {
         description: 'Brands',
         filter: 'brand',
         items: []
      };
      const offers = {
         description: 'Offers',
         filter: 'offer',
         items: []
      };      
      rows.forEach((itm) => {
         if (itm.id_product_category === category.id) {
            if (!brands.items.find((brd) => itm.id_brand === brd.id)) {
               brands.items.push({
                  id: itm.id_brand,
                  description: itm.brand
               })
            }
            if (itm.offer &&   (!offers.items.find((ofe) => itm.id_offer === ofe.id))) {
               offers.items.push({
                  id: itm.id_offer,
                  description: itm.offer
               })
            }
         }
      });
      if (brands.items.length > 0) {
         category.items.push(brands);
      }
      if (offers.items.length > 0) {
         category.items.push(offers);
      }
   }

   static processMenuRows(rows, ret) {
      let itmGenre;
      const catItems = [];
      const functAddCat = (idCategory, description) => {
         if (idCategory) {
            if (!catItems.find((cat) => cat.id === idCategory)) {
               catItems.push({
                     description: description,
                     id: idCategory,
                     filter: 'category',
                     items: []
                  }
               );
            }
         }
      };            
      let categories;
      let brands;
      let genreOffers;
      rows.forEach((itm) => {
         if (itm.rn_genre === 1) {
            itmGenre = {
               description: itm.genre === 'M' ? 'Men' : 'Women',
               id: itm.genre,
               filter: 'genre',
               items: []
            };
            ret.push(itmGenre);
            functAddCat(itm.id_product_category_1, itm.category_1);
            functAddCat(itm.id_product_category_2, itm.category_2);                  
            categories = {
               description: 'Categories',
               filter: 'category',
               items: []
            };
            brands = {
               description: 'Brands',
               filter: 'brand',
               items: []
            };
            genreOffers = {
               description: 'Offers',
               filter: 'offer',
               items: []
            };
            itmGenre.items.push(categories, brands, genreOffers);
         }
         if (itm.rn_offer === 1 && itm.offer) {
            genreOffers.items.push({
               description: itm.offer,
               id: itm.id_offer
            });
         }
         if (itm.rn_category === 1 && itm.category) {
            categories.items.push({
               description: itm.category,
               id: itm.id_product_category
            });
         }
         if (itm.rn_brand === 1 && itm.brand) {
            brands.items.push({
               description: itm.brand,
               id: itm.id_brand
            });            
         }               
      });
      catItems.forEach((itm) => {
         ProductController.processMenuCategories(rows, itm);
         ret.push(itm);
      });      
   }

   static processMenuOffers(ret) {
      const offers = {
         description: 'Offers',
         filter: 'offer',
         items: []
      }
      ret.forEach((sec) => {
         sec.items.forEach((cat) => {            
            if (cat.filter === 'offer') {
               cat.items.forEach((ofe) => {
                  if (!offers.items.find((ofeItem) => ofeItem.id === ofe.id)) {                     
                     offers.items.push({...ofe});
                  }
               })
            }
         });
      } );
      if (offers.items.length > 0) {
         ret.push({
            description: 'Offers',
            items: [
               offers
            ]
         });
      }
   }

   static async getMenuOptions(conn) {
      try {
         const rows = await conn.query(SQL_SEL_ALL_PROD_SECTIONS);
         let ret = [];                  
         if (rows.length > 0) {
            ProductController.processMenuRows(rows, ret);    
            ProductController.processMenuOffers(ret);
         }
         ret.forEach((itm) => {
            itm.items.forEach((sub) => {
               if (sub.items.length > 0) {
                  sub.items.sort((a, b) => a.description.localeCompare(b.description) );
               }              
            });
         })
         return ret;
      } finally {
         await conn.close();
      }
   }


   static getProductFiltersReq(req, res, conn) {
      ProductController.getProductFilters(req.query, conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }

   static getProductsReq(req, res, conn) {
      ProductController.getProducts(req.query, conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }

   static getProductByIdReq(req, res, conn) {
      ProductController.getProductById(req.params.id, conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }


   static generateRatingsReq(req, res, conn) {
      ProductController.generateRandomRatings(conn)
      .then((ret) => res.status(200).json({message: 'ok'}))
      .catch((err) => UtilsLib.resError(err, res));
   }

   static getMenuOptionsReq(req, res, conn) {
      ProductController.getMenuOptions(conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
      
   }

   static getProductsOptionsByTextReq(req, res, conn) {
      ProductController.getProductsOptionsByText(req.query, conn)
      .then((ret) => res.status(200).json(ret))
      .catch((err) => UtilsLib.resError(err, res));
   }

}

module.exports = ProductController;