import './styles.css';
import emailImg from '../../../media/email.png';
import freeDeliveryImg from '../../../media/free-delivery.png';
import loveYouImg from '../../../media/love-you.png';
import email32 from '../../../media/email-black-32.png';
import linkedin32 from '../../../media/linkedin-32.png';
import www32 from '../../../media/www-32.png';


export default function AppFooter(props) {

   return (
      <footer className='app-footer'>
         <div className='footer-info-banner'>
            <div className='col-1 pad-1 max-width-18'>
               <img alt="free delivery" src={freeDeliveryImg} style={{maxHeight: 64}} />
               <label className='font-bold font-1012 textcenter'>Free Shipping Over $100</label>
               <p >This is our gift for you. Any product to anywhere in Brazil you will have free shipping on purchases over $100.</p>
            </div>
            <div className='col-1 pad-1 max-width-18'>
               <img alt="email subscribing" src={emailImg} style={{maxHeight: 64}} />
               <label className='font-bold font-1012 text-center'> Sign up for emails and get en extra 15% off</label>
               <p>Save on your next purchase subscribing us for exclusive offers. You will not regret!</p>
            </div>
            <div className='col-1 pad-1 max-width-18'>
               <img alt="made for you" src={loveYouImg} style={{maxHeight: 64}} />
               <label className='font-bold font-1012 text-center'>Your Product To Be Yourself</label>
               <p >Try your product for the best fiting, and if needed, we give you 30 days to return.</p>
            </div>
         </div>
         <strong className='info-sample-site'>This website are using fictional data. Any similarity with existing brands could be just coincidence.</strong>
         <section className='footer-contact-info'>
            <div className='row-1  row-contact'>
               <div className='col-05 align-start'>
                  <label>Design and development by</label>
                  <a href="https://www.jeckson.me" className='link-small font-87'>Jéckson Schwengber</a>
               </div>
               <label>Brazil - 2022</label>
               <div className='col-05 align-end'>
                  <label className='font-bold'> Let's get connect</label>            
                  <div className='row-1 align-start'>
                     <a href="mailto:jeckson.es@gmail.com" className='link-small font-87'> <img alt="email" src={email32} style={{maxHeight: 24}} /> </a>
                     <a href="https://www.linkedin.com/in/jecksonschwengber/" className='link-small font-87'> <img alt="linkedin" src={linkedin32}  style={{maxHeight: 24}} /> </a>
                     <a href="https://www.jeckson.me/" className='link-small font-87'> <img alt="website" src={www32} style={{maxHeight: 24}}  /> </a>
                  </div>
               </div>
            </div>         
         </section>
      </footer>
   )

}