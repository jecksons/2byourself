import api from "../services/api"

export default class SaleController {
   
   static getPaymentOptions() {
      return api.get(`/sales/payment-options/`);
   }

   static getDeliveryOptions(idCart) {
      return api.get(`/sales/delivery-options/${idCart}`);
   }


   static saveSale(sale) {
      return api.post(`sales/`, sale);
   }

   static getSale(idSale) {
      return api.get(`sales/id/${idSale}`);
   }

   static getSales(offset, limit) {
      return api.get(`sales/?offset=${offset}&limit=${limit}`);
   }
      



}
