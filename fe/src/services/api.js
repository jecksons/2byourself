import axios from 'axios';
import apiConfig from './config';
import TokenService from './token-service';
import { createBrowserHistory } from 'history';

const api = axios.create({
    baseURL: apiConfig.apiURL
});

api.getCancelToken = () => axios.CancelToken.source();

api.isCancel = (err) => axios.isCancel(err);

api.interceptors.request.use(
    (config) => {
        config.headers['x-client-version'] = apiConfig.clientVersion;
        const token = TokenService.getLocalAccessToken();        
        if (token) {
            config.headers['x-access-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);        
    }
);

api.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        const oriConfig = err.config;
        if (err.response) {            
            if (err.response.status === 401) {
                if (!oriConfig._retry) {
                    const refreshToken = TokenService.getLocalRefreshToken();
                    if (refreshToken) {
                        try {
                            const retRef = await api.post('/auth/refresh-token/', {
                                refreshToken: refreshToken
                            });
                            TokenService.updateLocalAccessToken(retRef.data.accessToken);
                            return api(oriConfig);
                        } catch (error) {                        
                        }                                                            
                    }    
                }
                TokenService.deleteLocalUser();                
                window.location.reload();
            } else if (err.response.status === 426) {
                createBrowserHistory().push('/');
                window.location.reload(true);                
            }
        }
        return Promise.reject(err);
    }
)

export default api;