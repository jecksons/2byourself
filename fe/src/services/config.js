function Config(){
    const API_URL = process.env.REACT_APP_API_URL;
    const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const CLIENT_VERSION = process.env.REACT_APP_CLIENT_VERSION;
   
   let cfgBase = {        
        apiURL: API_URL,
        googleClientId: GOOGLE_CLIENT_ID,
        clientVersion: CLIENT_VERSION
   };

   return cfgBase;
}

export default new Config();