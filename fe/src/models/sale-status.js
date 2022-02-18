
export const SaleStatusList = [
   {id: 'D', description: 'Delivered', media: 'delivered.png'},
   {id: 'O', description: 'Ordered', media: 'bill.png'},
   {id: 'P', description: 'Payment Pending', media: 'waiting.png'},
   {id: 'S', description: 'Preparation to Ship', media: 'boxes.png'},
   {id: 'T', description: 'In Transportation', media: 'delivery.png'}
]

class SaleStatus{

   constructor (id) {
      this.id = id;
   }

   toString() {
      const itm = SaleStatusList.find((itm) => itm.id === this.id );
      if (itm) {
         return itm.description;
      }      
   }

   getImg() {
      const itm = SaleStatusList.find((itm) => itm.id === this.id );
      if (itm) {
         console.log('get item ' + itm.media);
         return require(`../media/${itm.media}`);
      }      
   }
}

export default SaleStatus;