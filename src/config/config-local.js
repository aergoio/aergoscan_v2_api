const SELECTED_NETWORK = process.env.SELECTED_NETWORK
const ES_URL = process.env.ES_URL;
const ENV_HTTP_PORT = process.env.HTTP_PORT;

// const SELECTED_NETWORK = "testnet"
// const ES_URL = "52.78.184.31:9200";
// const ENV_HTTP_PORT = "3000";

console.log(">>>local log SELECTED_NETWORK = "+SELECTED_NETWORK);
console.log(">>>local log ES_URL           = "+ES_URL);
console.log(">>>local log ENV_HTTP_PORT    = "+ENV_HTTP_PORT);

module.exports = {
    // api version
    VERSION: "v2",

    HTTP_PORT: ENV_HTTP_PORT,
    DB_HOST: process.env.ES_HOST || ES_URL,
    AVAILABLE_NETWORKS: ['testnet', 'alpha', 'mainnet', 'main', 'test', 'local'], // v1 호환성 유지 - main
    HOST: 'http://localhost:'+ENV_HTTP_PORT,

    //-- node grpc
    NODE_GRPC_MAIN: 'mainnet-api.aergo.io:7845',
    NODE_GRPC_TEST: 'testnet-api.aergo.io:7845',
    NODE_GRPC_ALPHA: 'alpha-api.aergo.io:7845',

    //-- Scheduler Config
    SCHEDULER_NETWORK: SELECTED_NETWORK,
    SCHEDULER_BASEURL:  'http://127.0.0.1:'+ENV_HTTP_PORT+'/',

    // Registered Token Info (default info (image/url)
    UNREGISTERED_TOKEN_URL: '',
    UNREGISTERED_TOKEN_IMAGE: ''
};
