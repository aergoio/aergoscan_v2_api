require("dotenv").config();

const ENV_DB_HOST = process.env.SCAN_DB_HOST;
const ENV_DB_DATABASE = process.env.SCAN_DB_DATABASE;
const ENV_DB_USERNAME = process.env.SCAN_DB_USERNAME;
const ENV_DB_PASSWORD = process.env.SCAN_DB_PASSWORD;

const development = {
    username: ENV_DB_USERNAME,
    password: ENV_DB_PASSWORD,
    database: ENV_DB_DATABASE,
    host: ENV_DB_HOST,
    dialect: "mysql",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    logging: false,
};

const production = {
    username: ENV_DB_USERNAME,
    password: ENV_DB_PASSWORD,
    database: ENV_DB_DATABASE,
    host: ENV_DB_HOST,
    dialect: "mysql",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    logging: false,
};

const test = {
    username: ENV_DB_USERNAME,
    password: ENV_DB_PASSWORD,
    database: ENV_DB_DATABASE,
    host: ENV_DB_HOST,
    dialect: "mysql",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    logging: false,
};

module.exports = { development, test, production };
