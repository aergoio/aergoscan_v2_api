const schedule = require("node-schedule");
const axios = require("axios");
import cfg from "../config/config";

// url path
const CachedMainBlockInfo = "CachedMainBlockInfo";
const CachedRecentTransactions = "CachedRecentTransactions";
const peerInfo = "peerInfo";
// const CachedTxHistory             = "CachedTxHistory";              // 프론트에서 사용 안함

/**
 * key list - ['mainBlockInfo_main', 'recentTransactions_main', 'txHistory_main']
 * key list - ['mainBlockInfo_testnet, 'recentTransactions_testnet', 'txHistory_testnet']
 * key list - ['mainBlockInfo_alpha', 'recentTransactions_alpha', 'txHistory_alpha']
 * @returns {Promise<void>}
 */
const startup = async () => {
    try {
        schedule.scheduleJob("0/5 * * * * *", function () {
            // console.log('Scheduling CachedMainBlockInfo for mainBlockInfo : ' + new Date());
            // console.log("ScheduleJob = "+cfg.SCHEDULER_BASEURL+cfg.VERSION+"/"+CachedRecentTransactions);
            CacheApiCall(
                cfg.SCHEDULER_BASEURL +
                    cfg.VERSION +
                    "/" +
                    CachedRecentTransactions,
                "recentTransactions_" + cfg.SCHEDULER_NETWORK
            );
        });
    } catch (error) {
        console.error("scheduleJob[1] =" + error);
    }

    try {
        schedule.scheduleJob("0/20 * * * * *", function () {
            // console.log('Scheduling CachedMainBlockInfo for mainBlockInfo : ' + new Date());
            CacheApiCall(
                cfg.SCHEDULER_BASEURL + cfg.VERSION + "/" + CachedMainBlockInfo,
                "mainBlockInfo_" + cfg.SCHEDULER_NETWORK
            );
        });
    } catch (error) {
        console.error("scheduleJob[2] =" + error);
    }

    // peer info for check syncing
    if (cfg.SCHEDULER_ALERT_URL) {
        try {
            let intervalMin = 30;
            if (cfg.SCHEDULER_ALERT_INTERVAL_MINUTE) {
                let intervalOverwrite = Number(cfg.SCHEDULER_ALERT_INTERVAL_MINUTE)
                if (intervalOverwrite > 60) {
                    intervalMin = 60;
                } else if (intervalOverwrite < 5) {
                    intervalMin = 5;
                } else {
                    intervalMin = intervalOverwrite;
                }
            }

            schedule.scheduleJob("0 */" + intervalMin + " * * * *", function () {
                console.log('Scheduling CachedMainBlockInfo for mainBlockInfo : ' + new Date());
                AlertBlockSync();
            });
        } catch (error) {
            console.error("scheduleJob[3] =" + error);
        }
    }

    // token price
    /*
    try{
        schedule.scheduleJob('0/5 * * * * *', function(){
            CacheTokensPriceRegistered();
        });
    } catch (error) {
        console.error('scheduleJob[3] =' + error);
    }
    */

    /*
    try{
        schedule.scheduleJob('1 * * * * *', function(){
            // console.log('Scheduling CachedTxHistory for txHistory : ' + new Date());
            CacheApiCall(cfg.SCHEDULER_BASEURL+cfg.VERSION+"/"+CachedTxHistory, "txHistory_" + cfg.SCHEDULER_NETWORK);
        });
    } catch (error) {
        console.error('scheduleJob[3] =' + error);
    }
    */
};

console.log("Job Scheduler started at " + new Date());
startup();

async function CacheApiCall(apiUrl, key) {
    // console.log(apiUrl)
    try {
        axios({
            timeout: 4000,
            method: "get",
            url: apiUrl,
            params: {
                key: key,
            },
        })
            .then(function (response) {
                // console.log(response);
            })
            .catch(function (error) {
                console.error(
                    "scheduleJob CacheApiCall[1] : " + apiUrl + "=" + error
                );
            });
    } catch (error) {
        console.error("scheduleJob CacheApiCall[2] =" + error);
    }
}

async function AlertBlockSync(){
    try {
        axios({
            timeout: 4000,
            method: "get",
            url: cfg.SCHEDULER_BASEURL + cfg.VERSION + "/" + peerInfo,
        })
            .then(function (response) {
                // get best block number
                let bestBlockNumber = 0;
                response.data.forEach((peer) => {
                    if (bestBlockNumber < peer.bestblock.blockno) {
                        bestBlockNumber = peer.bestblock.blockno;
                    }
                })
                response.data.forEach((peer) => {
                    if (peer.address.role == 1 && bestBlockNumber > peer.bestblock.blockno + Number(cfg.SCHEDULER_ALERT_BLOCKNO)) {
                        console.log("Alert Block Sync : " + peer.address.peerid)
                        axios({
                            timeout: 4000,
                            method: "post",
                            url: cfg.SCHEDULER_ALERT_URL,
                            data: {
                                peerID: peer.address.peerid,
                                difference: bestBlockNumber - peer.bestblock.blockno,
                                bestHeight: bestBlockNumber,
                                currentHeight: peer.bestblock.blockno
                            },
                        })
                    }
                })
            })
            .catch(function (error) {
                console.error(
                    "scheduleJob CacheApiCall[1] : " + "=" + error
                );
            });
    } catch (error) {
        console.error("scheduleJob CacheApiCall[2] =" + error);
    }
}

/**
 * token price 사용 (현재 사용 안함)
 * @returns {Promise<void>}
 * @constructor
 */
async function CacheTokensPriceRegistered() {
    // aergo price
    const apiUrl = "https://api.coingecko.com/api/v3/simple/price";
    const tokenName = "aergo";
    // const erc20ContractAddresses = '0x91af0fbb28aba7e31403cb457106ce79397fd4e6';
    const vsCurrencies = "usd,krw";

    try {
        const response = await axios.get(apiUrl, {
            params: {
                // contract_addresses: erc20ContractAddresses,
                ids: tokenName,
                vs_currencies: vsCurrencies,
            },
        });
        const price = response.data[tokenName];

        const [result] = [
            {
                name: tokenName,
                // erc20CA : erc20ContractAddresses,
                // current : vsCurrencies,
                price: price,
            },
        ];

        console.log("111111 = " + JSON.stringify(result));

        // tokePriceRegisteredCache.clear();
        // for (let i = 0; i < result.length; i++) {
        //     tokePriceRegisteredCache.set(result[i].token_address, JSON.stringify(result[i]));
        // }

        // console.log(">>>>>>>"+tokePriceRegisteredCache.get(erc20ContractAddresses));
    } catch (error) {
        console.error("scheduleJob CacheNftRegistered =" + error);
    }
}
