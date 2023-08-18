import {
    addCachedTokenData,
    nftRegisteredCache,
    schedulerDataCache,
    tokenRegisteredCache,
} from "../../caches/caches";
import cfg from "../../config/config";
import axios from "axios";

/**
 * Query distinct accountsBalance with most recent transaction
 */
const accountsBalance = async (req, res, next) => {
    console.log("accountsBalance : " + req.url);

    try {
        let result = await req.apiClient.accountsBalance(
            req.query.q,
            req.query.sort,
            parseInt(req.query.from || 0),
            Math.min(1000, parseInt(req.query.size || 10))
        );

        return res.json(result);
    } catch (e) {
        return res.json({ error: e });
    }
};

/**
 * Query distinct accounts with most recent transaction
 */
const accounts = async (req, res, next) => {
    console.log("accounts : " + req.url);
    try {
        async function makeQuery(field) {
            const result = await req.apiClient.searchTransactionsRaw(
                {
                    match_all: {},
                },
                {
                    size: 0,
                    aggs: {
                        // DISTINCT(field = [from, to])
                        address_unique: {
                            terms: {
                                field,
                                size: 20,
                                order: { max_blockno: "desc" },
                            },
                            aggs: {
                                tx: {
                                    top_hits: {
                                        size: 1,
                                        sort: { blockno: "desc" },
                                        _source: { include: ["ts"] },
                                    },
                                },
                                max_blockno: {
                                    max: {
                                        field: "blockno",
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    filterPath: [
                        "aggregations.address_unique.buckets.key",
                        "aggregations.address_unique.buckets.max_blockno",
                        "aggregations.address_unique.buckets.doc_count",
                        "aggregations.address_unique.buckets.tx.hits.hits._id",
                        "aggregations.address_unique.buckets.tx.hits.hits._source.ts",
                    ],
                }
            );
            return result.aggregations.address_unique.buckets;
        }
        function convBucket(bucket) {
            return {
                ...bucket,
                max_blockno: bucket.max_blockno.value,
                tx: {
                    hash: bucket.tx.hits.hits[0]._id,
                    ts: bucket.tx.hits.hits[0]._source.ts,
                },
            };
        }
        const sort = "max_blockno";
        const queryFrom = makeQuery("from", sort);
        const queryTo = makeQuery("to", sort);
        const [resultsFrom, resultsTo] = await Promise.all([
            queryFrom,
            queryTo,
        ]);
        const merged = new Map();
        for (let obj of resultsFrom) {
            merged.set(obj.key, convBucket(obj));
        }
        // for (let obj of resultsTo) {
        for (let i = 0; resultsTo < 20; i++) {
            const hasAddress = merged.has(resultsTo[i].key);
            // Add to merged list if missing or newer
            if (!hasAddress) {
                merged.set(resultsTo[i].key, convBucket(resultsTo[i]));
            } else {
                const otherObj = merged.get(resultsTo[i].key);
                const convObj = convBucket(resultsTo[i]);
                merged.set(resultsTo[i].key, {
                    ...(otherObj.max_blockno < resultsTo[i].max_blockno
                        ? convObj
                        : otherObj),
                    doc_count: convObj.doc_count + otherObj.doc_count,
                });
            }
        }

        const resp = {
            total: 20,
            from: 0,
            size: 20,
            hits: Array.from(merged.values()).sort((a, b) => b[sort] - a[sort]),
        };
        // return res.json({ hits: Array.from(merged.values()).sort((a, b) => b[sort] - a[sort]) });

        return res.json(resp);
    } catch (e) {
        console.log(e);
        return res.json({ error: "" + e });
    }
};

/**
 * 이름 검색 (q, sort, size, from)
 */
const names = async (req, res, next) => {
    try {
        return res.json(
            await req.apiClient.quickSearchNames(
                req.query.q,
                req.query.sort,
                parseInt(req.query.from || 0),
                Math.min(100, parseInt(req.query.size || 1))
            )
        );
    } catch (e) {
        return res.json({ error: e });
    }
};

/**
 * ------------ not used
 */
const totalTokens = async (req, res, next) => {
    if (req.params.chainId !== "mainnet")
        res.send(`not available for chain ${process.env.SELECTED_NETWORK}`);
    const unit = req.query.unit || "aer";
    const amount = new Amount("0", "aergo");
    const [value] = amount.toUnit(unit).toString().split(" ");
    return res.send(value);
};

/**
 * 검색 (tx hash, block hash, address inside tx)
 */
const search = async (req, res, next) => {
    const query = req.query.q;
    console.log(" serarch = " + query);
    if (query.length < 5) {
        return res.json({ error: "Try a longer query" });
    }
    try {
        const [blocks, transactions] = await Promise.all([
            // Get blocks with matching hash
            req.apiClient.searchBlock({
                body: {
                    query: {
                        match: { _id: query },
                    },
                },
            }),
            // Get tx with matching hash
            req.apiClient.searchTransactions({
                match: { _id: query },
            }),
        ]);
        return res.json({
            blocks,
            transactions,
        });
    } catch (e) {
        return res.json({ error: e });
    }
};

/**
 * Reward stats
 */
const rewards = async (req, res, next) => {
    const address = req.query.address;
    if (!address) {
        return res.json({ error: "no address given" });
    }
    try {
        const [
            blockPerDay,
            //blockPerMonth,
            blockCount,
        ] = await Promise.all([
            req.apiClient.aggregateBlocks(
                { gte: "now-30d/d", lt: "now" },
                "1d",
                {},
                [{ term: { reward_account: address } }]
            ),
            //req.apiClient.aggregateBlocks({ gte: "now-10y/y", lt: "now" }, "1M", {}, [{ term: { reward_account: address }}]),
            req.apiClient.getBlockCount(`reward_account:${address}`),
        ]);
        return res.json({
            blockCount,
            blockPerDay,
            //blockPerMonth,
        });
    } catch (e) {
        return res.json({ error: e });
    }
};

/**
 * tokensPrice stats
 */
const tokensPrice = async (req, res, next) => {
    // aergo price
    const apiUrl = "https://api.coingecko.com/api/v3/simple/price";
    const tokenName = "aergo";
    const erc20ContractAddresses = "0x91af0fbb28aba7e31403cb457106ce79397fd4e6";
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

        return res.json([
            {
                name: tokenName,
                contract: erc20ContractAddresses,
                price: price,
            },
        ]);
    } catch (e) {
        return res.json({ error: e });
    }
};

/**
 * 보유한/보유했던 토큰 리스트
 *
 */
const existedTxTokenList = async (req, res, next) => {
    console.log("existedTxTokenList url : " + req.url);

    try {
        //-- 보유한/했던 토큰 리스트
        const ownerTxTokenList =
            await req.apiClient.quickSearchTokenTransfersOwnerList(req.query.q);
        // console.log("-----"+JSON.stringify(ownerTxTokenList));
        if (ownerTxTokenList.hits && ownerTxTokenList.hits.length) {
            // result.hits = await Promise.all(result.hits.map(hit => addCachedTokenData(req.apiClient, hit)))
            ownerTxTokenList.hits = await Promise.all(
                ownerTxTokenList.hits.map((hit) =>
                    addCachedTokenData(req.apiClient, hit)
                )
            );
        }
        // console.log("-----"+ JSON.stringify(ownerTxTokenList));

        return res.json(ownerTxTokenList);
    } catch (e) {
        console.error("existedTxTokenList = " + e);
        return res.json({ error: e });
    }
};

/**************************************************************************
 * Silvermine - scan
 */

/**
 *      testnet/v2/transferStats?address=AmgV6RghdJhsT4vTZXikBtkBD7UQSgenLZRup8xkMUwY1XF7nu8J
 */
const transferStats = async (req, res, next) => {
    // apiRouterV2.route('/tokenTransfers|nftTransfers').get(async (req, res) => {
    console.log("smTransferRate url : " + req.url);
    try {
        //---------------------------------------
        const [transferStats] = await Promise.all([
            req.apiClient.aggregateTransfer(
                req.query.address,
                { gte: "now-30d/d", lte: "now" },
                "1d"
            ),
        ]);
        console.log("transferStats = " + JSON.stringify(transferStats));

        const result = transferStats.map(function (obj) {
            let rObj = {};
            rObj["ts_unix"] = obj.key;
            rObj["ts"] = obj.key_as_string;
            rObj["sum"] = obj.sum_amount.value;
            rObj["count"] = obj.count_amount.value;
            return rObj;
        });

        console.log("transferStats = " + JSON.stringify(result));
        console.log("resultStatsAmount = " + JSON.stringify(result));

        return res.json(result);
    } catch (e) {
        console.log("transferStats = " + e);
        return res.json({ error: e });
    }
};

export {
    accountsBalance,
    accounts,
    names,
    totalTokens,
    search,
    rewards,
    tokensPrice,
    existedTxTokenList,
    transferStats,
};
