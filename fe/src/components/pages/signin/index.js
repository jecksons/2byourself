import './styles.css';
import AppMainContainer from '../../controls/app-main-container';
import LoginControl from '../../controls/login-control';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function Signin(props) {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        document.title = "2BeYourself - Login"
    }, []);
    
    return (
        <AppMainContainer>
            <section className="col flex-1 just-start gap-105 pad-105 " >   
                <div className='card-square col-1 align-start'>
                    <label className='font-105 color-grey'>Login</label>
                    <LoginControl 
                        onNext={() => {
                            console.log(searchParams.get('originalPath'));
                            if (searchParams.get('originalPath')) {                                
                                navigate(searchParams.get('originalPath'), {replace: true});
                            } else {
                                navigate('/', {replace: true});
                            }
                        }}
                    /> 
                </div>                   
            </section>
        </AppMainContainer>
    );

}