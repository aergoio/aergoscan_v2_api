const SELECTED_NETWORK = "alpha";
const ES_URL = "localhost:9200";

module.exports = {
    // api version
    VERSION: "v2",

    HTTP_PORT: 3001, // alphanet use to port 3001
    DB_HOST: process.env.ES_HOST || ES_URL,       // 2.0 testnet-dev
    AVAILABLE_NETWORKS: ['https://api2-alpha.aergoscan.io'],
    HOST: 'https://api2-alpha.aergoscan.io',

    //-- node grpc
    NODE_GRPC_MAIN: 'mainnet-api.aergo.io:7845',
    NODE_GRPC_TEST: 'testnet-api.aergo.io:7845',
    NODE_GRPC_ALPHA: 'alpha-api.aergo.io:7845',

    //-- Scheduler Config
    SCHEDULER_NETWORK: SELECTED_NETWORK,
    SCHEDULER_BASEURL:  'http://127.0.0.1:3001/',

    // Registered Token Info (default info (image/url)
    UNREGISTERED_TOKEN_URL: '',
    UNREGISTERED_TOKEN_IMAGE: ''
};
