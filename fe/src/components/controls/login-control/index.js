import { useEffect, useState, useCallback, useContext } from "react";
import logoGoogle from '../../../media/google.svg';
import utils from "../../../services/utils";
import {ErrorToast} from '../../controls/toast';
import SurfaceLoading from "../../controls/surface-loading";
import './styles.css';
import ButtonActionPrimary from "../../controls/button-action";
import AuthService from "../../../services/auth-service";
import ItemFormError from "../../controls/item-form-error";
import PropTypes from 'prop-types';
import UserContext from "../../../store/user-context";
import { useGoogleLogin} from 'react-google-login';
import config from "../../../services/config";

const SS_LOADING = 0;
const SS_LOADED = 1;
const SS_NONE = 3;

const FF_NOT_VALIDATED = 0;
const FF_VALIDATED = 1;
const FF_INVALID = 2;

function LoginControl({onNext}) {

   const [userInfo, setUserInfo] = useState({
      firstName: {
         value: '', 
         state: FF_NOT_VALIDATED
      }, 
      lastName: {
         value: '', 
         state: FF_NOT_VALIDATED
      }, 
      email: {
         value: '', 
         state: FF_NOT_VALIDATED
      }});

   const [userEmail, setUserEmail] = useState('');
   const [userData, setUserData] = useState({state: SS_NONE, user: null, email: ''});  
   const [signUpProcess, setSignUpProcess] = useState(false);
   const [googleStatus, setGoogleStatus] = useState(SS_NONE);
   const {reloadUserInfo} = useContext(UserContext);
   const onErrorGoogle = useCallback((res) => {
      console.log(res);
   }, []);   
   const onSuccessGoogle = useCallback((res) => {
      if (res.getBasicProfile) {
         const prof = res.getBasicProfile();
         setGoogleStatus(SS_LOADING);
         AuthService.signUpEmail(prof.getName(), 
            prof.getEmail())
         .then((ret) => {
            reloadUserInfo();
            onNext();
         })
         .catch((err) => {
            setGoogleStatus(SS_NONE);
            ErrorToast.fire({
               title: `Unable to sign up`,
               text: utils.getHTTPError(err),
               icon: "error"
            });
         });
      }
   }, [onNext, reloadUserInfo]);
   const  {signIn} = useGoogleLogin({onSuccess: onSuccessGoogle, onFailure: onErrorGoogle,  clientId: config.googleClientId, cookiePolicy: 'single_host_origin' });

   useEffect(() => {
      if (userEmail) {
         const timOut = setTimeout(() => {            
            const locUser = AuthService.getLocalSavedUser();
            if (locUser) {
               if (locUser.email === userEmail)  {
                  setUserData(p => ({
                     ...p, 
                     state: SS_LOADED,
                     user: locUser
                  }));
                  reloadUserInfo();
                  return;
               }
            }
            setUserData(p => ({...p, state: SS_LOADING}));
            AuthService.checkEmailExists(userEmail)
            .then((ret) => {
               setUserData(p => ({
                  ...p, 
                  state: SS_LOADED,
                  user: ret.data
               }));
            })
            .catch((err) => {
               setUserData(p => ({
                     ...p, 
                     state: SS_LOADED,
                     user: null
                  }))});
         }, [500]);         
         return () => clearTimeout(timOut);
      } else {
         setUserData(p => ({
            ...p, 
            state: SS_NONE,
            user: null
         }));
      }
   }, [userEmail, reloadUserInfo]);

   const handleUserInfo = useCallback((target) => {
      const newState = target.name === 'email' ? 
                  (utils.validateEmail(target.value) ? FF_VALIDATED : FF_INVALID) : 
                  (target.value ? FF_VALIDATED : FF_INVALID);
      if (target.name === 'email') {
         if (newState === FF_VALIDATED) {
            setUserEmail(target.value);
         } else {
            setUserEmail('');
         }        
      }
      setUserInfo(p => ({
         ...p,  
         [target.name]: {
            value: target.value, 
            state: newState
         },
      }));

   }, [setUserInfo]);

   const handleNextLogin = useCallback((e) => {
      e.preventDefault();      
      if (userData.user) {
         setSignUpProcess(true);
         AuthService.getLoginByEmail(userInfo.email.value)
         .then((ret) => {
            reloadUserInfo();            
            onNext();
         })
         .catch((err) => {
            setSignUpProcess(false);
            ErrorToast.fire({
               title: `Unable to sign up`,
               text: utils.getHTTPError(err),
               icon: "error"
            });
         });                  
         return;
      }
      if (!userInfo.firstName.value || !userInfo.lastName.value)  {
         setUserInfo(p => ({...p, 
            firstName: {
               value: p.firstName.value,
               state: p.firstName.value ? FF_VALIDATED : FF_INVALID
            },
            lastName: {
               value: p.lastName.value,
               state: p.lastName.value ? FF_VALIDATED : FF_INVALID
            }
         }));
      } else {
         setSignUpProcess(true);
         AuthService.signUpEmail(`${userInfo.firstName.value} ${userInfo.lastName.value}`, 
            userInfo.email.value)
         .then((ret) => {
            reloadUserInfo();
            onNext();
         })
         .catch((err) => {
            setSignUpProcess(false);
            ErrorToast.fire({
               title: `Unable to sign up`,
               text: utils.getHTTPError(err),
               icon: "error"
            });
         });
      }        
   }, [userInfo, userData.user, onNext, reloadUserInfo]);   

   const handleGoogleLogin= () => {
      signIn();
   }   


   return (
      <div className="col-1 width-100 border-box pad-1 just-start" >
         <form className="col-1 align-start width-100 ">            
            <div className="col-05 align-start width-100">
               <label className="font-75">Email</label>
               <div className="pos-relative width-100  ">
                  <input 
                     placeholder="example@example.com" 
                     name="email" 
                     autoFocus
                     className={`${userInfo.email.state === FF_INVALID ? 'input-error' : ''} width-100 border-box `}
                     onChange={(e) => handleUserInfo(e.target)  } 
                     value={userInfo.email.value} />           
                  {userData.state === SS_LOADING && 
                     <SurfaceLoading  className="email-input-loading" size={16} />    
                  }                  
               </div>               
            </div>            
            <div className={`col-1 align-start width-100 login-further-info${(userEmail !== '' && userData.state === SS_LOADED && !userData.user) ? '-show' : '' }`} >
               <div className="col-05 align-start width-100">
                  <label className="font-75">First Name</label>
                  <input 
                     name="firstName" 
                     className={`${userInfo.firstName.state === FF_INVALID ? 'input-error' : ''} width-100 border-box `}
                     onChange={(e) => handleUserInfo(e.target)  } 
                     value={userInfo.firstName.value} />
                  <ItemFormError message={userInfo.firstName.state === FF_INVALID ? 'First Name is required!' : ''} />                  
               </div>
               <div className="col-05 align-start width-100">
                  <label className="font-75">Last Name</label>
                  <input  
                     name="lastName" 
                     className={`${userInfo.lastName.state === FF_INVALID ? 'input-error' : ''} width-100 border-box `}
                     onChange={(e) => handleUserInfo(e.target)  } 
                     value={userInfo.lastName.value} />
                  <ItemFormError message={userInfo.lastName.state === FF_INVALID ? 'Last Name is required!' : ''} />                  
               </div>
            </div>
            <div className="row width-100 ">
               <ButtonActionPrimary  
                  caption={'Login'} 
                  onClick={handleNextLogin}                   
                  processing={signUpProcess}
                  disabled={userData.state !== SS_LOADED}
                  fullSize={true}
                  />         
            </div>            
         </form>
         <div className="col login-div-line width-100">
            <label>or</label>
         </div>
         <div className="width-100">
            <button className="btn-social-google width-100" onClick={handleGoogleLogin}>               
               {
                  googleStatus === SS_LOADING ? 
                     <SurfaceLoading size={16} onBackground={false}  /> : 
                     <>
                        <img src ={logoGoogle} width={24} alt="google social login"/>
                        Continue with Google
                     </>                     
               }               
            </button>
         </div>
      </div>
   )
}

LoginControl.propTypes = {
   onNext: PropTypes.func.isRequired
}

export default LoginControl;

