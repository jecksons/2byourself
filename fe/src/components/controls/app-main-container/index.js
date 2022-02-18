import AppFooter from "../../controls/app-footer";
import AppHeader from "../../controls/app-header";
import './styles.css';

export default function AppMainContainer(props) {

   return   (
      <main className="col background height-full just-start">
         <AppHeader />
         <section className="col flex-1 just-start page-content" >      
            {props.children}
         </section>
         <AppFooter />
      </main>
   );
}