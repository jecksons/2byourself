const env = process.env.NODE_ENV;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

const config = {
    connectionLimit: 100,
    debug: false,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    env: env,
    web: {},
    host: DB_HOST,
    email: {
        username: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD
    }
};


config.web.port = process.env.WEB_PORT || 8080;
config.web.jwtSecret = process.env.TOKEN_SECRET;
config.web.jwtExpireTime = parseInt(process.env.TOKEN_EXPIRE_TIME || 120);
config.web.jwtRefreshExpireTime = parseInt(process.env.REFRESH_TOKEN_EXPIRE_TIME || 300);
config.web.clientVersion = parseInt(process.env.CLIENT_VERSION || 1);

module.exports = config;