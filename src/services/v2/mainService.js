import { schedulerDataCache } from '../../caches/caches';

/**
 * txHistory
 */
const txHistory = async (req, res, next) => {
    console.log('txHistory!!');
    try {

        // if(!schedulerDataCache.has('txHistory')){
            //-- CachedTxHistory 에 있는 함수랑 같음.
            const [
                txPerDay
            ] = await Promise.all([
                req.apiClient.aggregateBlocks({ gte: "now-13d/d", lte: "now" }, "1d")
            ]);

            schedulerDataCache.set('txHistory_'+process.env.SELECTED_NETWORK, {
                txPerDay
            });
        // }

        // return res.json(schedulerDataCache.get('txHistory_'+process.env.SELECTED_NETWORK));
        return res.json({
            txPerDay
        })
    } catch(e) {
        console.log("........"+ e);
        return res.json({error: e});
    }
}

/**
* CachedSchedule - txHistory
* key list - ['mainBlockInfo_main', 'recentTransactions_main', 'txHistory_main']
* key list - ['mainBlockInfo_testnet, 'recentTransactions_testnet', 'txHistory_testnet']
* key list - ['mainBlockInfo_alpha', 'recentTransactions_alpha', 'txHistory_alpha']
*/
const CachedTxHistory = async (req, res, next) => {
    // console.log('CachedTxHistory!!');
    // console.log('qeury = '+req.query);
    try {
        const [
            txPerDay
        ] = await Promise.all([
            req.apiClient.aggregateBlocks({ gte: "now-30d/d", lte: "now" }, "1d")
        ]);

        schedulerDataCache.set(req.query.key, {
            txPerDay
        });

        return res.json({
            txPerDay
        })
    } catch(e) {
        return res.json({error: e});
    }
}


/**
 * txTotal, maxTps, maxTpm
 *  - BP number, Latest Bock - hera 에서 가져옴
 */
const mainBlockInfo = async (req, res, next) => {
    // console.log('mainBlockInfo!!');
    try {
        return res.json(schedulerDataCache.get('mainBlockInfo_'+process.env.SELECTED_NETWORK));
    } catch(e) {
        return res.json({error: e});
    }
}

/**
 * CachedSchedule - CacehMainBlockInfo
 * key list - ['mainBlockInfo_main', 'recentTransactions_main', 'txHistory_main']
 * key list - ['mainBlockInfo_testnet, 'recentTransactions_testnet', 'txHistory_testnet']
 * key list - ['mainBlockInfo_alpha', 'recentTransactions_alpha', 'txHistory_alpha']
 */
const CachedMainBlockInfo = async (req, res, next) => {
// apiRouterV2.route('/CachedMainBlockInfo').get(routeCache.cacheSeconds(5), async (req, res) => {
// apiRouterV2.route('/CachedMainBlockInfo').get(async (req, res) => {
    // console.log('CachedMainBlockInfo!!');
    // console.log('CachedMainBlockInfo!!' + JSON.stringify(req.query.key));
    try {

        const [
            // txPerMonth,
            txTotal,
            maxTps,
            maxTpm,
            blockCount
        ] = await Promise.all([
            // req.apiClient.aggregateBlocks({ gte: "now-10y/y", lt: "now" }, "1M"),
            req.apiClient.getTxCount(),

            req.apiClient.searchBlock({
                body: {
                    size: 1,
                    sort: {
                        txs: { "order" : "desc" }
                    },
                }
            }, true),
            req.apiClient.getBestBlock(),
            req.apiClient.getBlockCount()
        ]);
        // const txTotal = txPerMonth.map(day => day.sum_txs.value).reduce((a, b) => a + b, 0);

        schedulerDataCache.set(req.query.key, {
            blockCount,
            txTotal,
            maxTps,
            maxTpm
        })

        return res.json({
            blockCount,
            txTotal,
            maxTps,
            maxTpm
        })

        /*
        const [
            // txPerMonth,
            txTotal,
            blockCount,

            // maxTps
            maxTpm  //txPerMinute
        ] = await Promise.all([
            req.apiClient.getTxCount(),
            req.apiClient.getBlockCount(), // height가 안맞네


            req.apiClient.searchBlock({
                body: {
                    size: 1,
                    sort: {
                        txs: { "order" : "desc" }
                    },
                }
            }, true),


            // req.apiClient.aggregateBlocks({ gte: "now-60m/m", lt: "now" }, "1m")
            req.apiClient.aggregateBlocks({ gte: "now-30d/d", lt: "now" }, "1d"),
        ]);

        schedulerDataCache.set(req.query.key, {
            txTotal,
            blockCount,
            maxTpm
            // maxTps

        })

        return res.json({
            txTotal,
            blockCount,
            maxTpm
            // maxTps

        })
        */

    } catch(e) {
        return res.json({error: e});
    }
}

/**
 * Recent transactions
 */
const RecentTransactions = async (req, res, next) => {
    // console.log('recentTransactions!!');
    try {

        // return res.json(schedulerDataCache.get('recentTransactions_'+req.params.chainId));
        return res.json(schedulerDataCache.get('recentTransactions_'+process.env.SELECTED_NETWORK));

    } catch(e) {
        return res.json({error: e});
    }
}

/**
 * CachedSchedule - recentTransactions
 * key list - ['mainBlockInfo_main', 'recentTransactions_main', 'txHistory_main']
 * key list - ['mainBlockInfo_testnet, 'recentTransactions_testnet', 'txHistory_testnet']
 * key list - ['mainBlockInfo_alpha', 'recentTransactions_alpha', 'txHistory_alpha']
 */
const CachedRecentTransactions = async (req, res, next) => {
// apiRouterV2.route('/CachedRecentTransactions').get(routeCache.cacheSeconds(5), async (req, res) => {
// apiRouterV2.route('/CachedRecentTransactions').get(async (req, res) => {
//     console.log('CachedRecentTransactions!!');
    try {

        const txList = await req.apiClient.searchTransactions({
            match_all: {}
        })

        schedulerDataCache.set(req.query.key, {
            txList
        })

        // console.log(CachedSchedule.get('recentTransactions_'+req.params.chainId));

        return res.json({
            txList
        })

    } catch(e) {
        return res.json({error: e});
    }
}

export { txHistory, CachedTxHistory, mainBlockInfo, CachedMainBlockInfo, RecentTransactions, CachedRecentTransactions }
