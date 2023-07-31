const ENV_SELECTED_NETWORK = process.env.SELECTED_NETWORK;
const ENV_ES_URL = process.env.ES_URL;
const ENV_HTTP_PORT = process.env.HTTP_PORT;
const ENV_HOST_API = process.env.HOST_API;

console.log(">>> process.env.SELECTED_NETWORK = " + ENV_SELECTED_NETWORK);
console.log(">>> process.env.ES_URL           = " + ENV_ES_URL);
console.log(">>> process.env.ENV_HTTP_PORT    = " + ENV_HTTP_PORT);
console.log(">>> process.env.HTTP_HOST_API    = " + ENV_HOST_API);

module.exports = {
    // api version
    VERSION: "v2",

    HTTP_PORT: ENV_HTTP_PORT,
    DB_HOST: process.env.ES_HOST || ENV_ES_URL,
    AVAILABLE_NETWORKS: [ENV_HOST_API],
    HOST: ENV_HOST_API,

    //-- node grpc
    NODE_GRPC_MAIN: "mainnet-api.aergo.io:7845",
    NODE_GRPC_TEST: "testnet-api.aergo.io:7845",
    NODE_GRPC_ALPHA: "alpha-api.aergo.io:7845",

    //-- Scheduler Config
    SCHEDULER_NETWORK: ENV_SELECTED_NETWORK,
    SCHEDULER_BASEURL: "http://127.0.0.1:" + ENV_HTTP_PORT + "/",

    // Registered Token Info (default info (image/url)
    UNREGISTERED_TOKEN_URL: "",
    UNREGISTERED_TOKEN_IMAGE: "",
};
