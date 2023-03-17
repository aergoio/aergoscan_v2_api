
console.log(">>> process.env.SELECTED_NETWORK = "+process.env.SELECTED_NETWORK);
console.log(">>> process.env.ES_URL           = "+process.env.ES_URL);
console.log(">>> process.env.HTTP_PORT        = "+process.env.HTTP_PORT);

console.log("............"+process.env.SELECTED_NETWORK)

if (process.env.SELECTED_NETWORK == 'local') {
    console.log("aergoscan local Mode");
    module.exports = require('./config-local');
} else if (process.env.SELECTED_NETWORK == 'testnet') {
    console.log("aergoscan testnet Mode");
    module.exports = require('./config-mainnet');
} else if (process.env.SELECTED_NETWORK == 'mainnet') {
    console.log("aergoscan mainnet Mode");
    module.exports = require('./config-mainnet');
} else if (process.env.SELECTED_NETWORK == 'alpha') {
    console.log("aergoscan alpha Mode");
    module.exports = require('./config-alpha');
}
