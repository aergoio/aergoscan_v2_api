
console.log(">>> process.env.SELECTED_NETWORK = "+process.env.SELECTED_NETWORK);
console.log(">>> process.env.ES_URL           = "+process.env.ES_URL);
console.log(">>> process.env.HTTP_PORT        = "+process.env.HTTP_PORT);


if (process.env.SELECTED_NETWORK == 'local' || process.env.SELECTED_NETWORK == 'testnet' || process.env.SELECTED_NETWORK == 'mainnet') {
    console.log("aergoscan local Mode");

    if (process.env.SELECTED_NETWORK == 'local'){
        process.env.SELECTED_NETWORK = "testnet";
    }

    module.exports = require('./config-network');
} else if (process.env.SELECTED_NETWORK == 'alpha') {
    console.log("aergoscan alpha Mode");
    module.exports = require('./config-alpha');
}