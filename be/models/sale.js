
const SS_DELIVERED = 'D';
const SS_ORDERED = 'O';
const SS_PAYMENT_PENDING = 'P';
const SS_PREPARATION_TO_SHIP = 'S';
const SS_IN_TRANSPORTATION = 'T';


class Sale {

   constructor(jsonBase) {
      this.id = 0;
      this.id_cart = null;
      this.id_sale_status = SS_ORDERED;
      this.freight_value = 0;
      if (jsonBase) {
         if (jsonBase.id_cart) {
            this.id_cart = jsonBase.id_cart;
         }
         if (jsonBase.id_payment_method) {
            this.id_payment_method = jsonBase.id_payment_method;
         }
         if (jsonBase.freight_value) {
            this.freight_value = jsonBase.freight_value;
         }
         if (jsonBase.id_discount_code) {
            this.id_discount_code = jsonBase.id_discount_code;
         }
         if (jsonBase.email) {
            this.email = jsonBase.email;
         }
         if (jsonBase.days_to_delivery) {
            this.days_to_delivery = parseInt(jsonBase.days_to_delivery);
         }
      }
   }
}

module.exports = [Sale, SS_DELIVERED, SS_ORDERED, SS_PAYMENT_PENDING, SS_PREPARATION_TO_SHIP,SS_IN_TRANSPORTATION ];