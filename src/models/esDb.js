import elasticsearch from 'elasticsearch';

import cfg from '../config/config';
import * as Console from "console";

export const esDb = new elasticsearch.Client({
    host: cfg.DB_HOST,
    log: ['error'] // 'trace'
});

/*
export const waitForDb = () => {
    try {
        return new Promise((resolve) => {
            function connectDb() {
                console.log(`Connecting to elasticsearch on ${cfg.DB_HOST}...`);
                esDb.ping({requestTimeout: 10000}, (error) => {
                    if (error) {
                        console.error('Could not connect, retrying in 3 seconds...');
                        setTimeout(() => {
                            connectDb();
                        }, 3000);
                        return;
                    }
                    resolve();
                });
            }

            connectDb();
        });
    }catch (e) {
        console.log("waitForDb..error = " + e)

    }
};
*/

export class ApiClient {
    constructor(chainId = 'alpha') {
        this.chainId = chainId;
        this.BLOCK_INDEX = `${chainId}_block`;
        this.TX_INDEX = `${chainId}_tx`;
        this.NAME_INDEX = `${chainId}_name`;
        this.TOKEN_INDEX = `${chainId}_token`;
        this.TOKEN_TX_INDEX = `${chainId}_token_transfer`;
        this.ACCOUNT_TOKENS_INDEX = `${chainId}_account_tokens`;
        this.NFT_INDEX = `${chainId}_nft`;
        this.CONTRACT_TX = `${chainId}_contract`;
        this.ACCOUNT_BALANCE_INDEX = `${chainId}_account_balance`;
        this.CHAIN_INFO = `${chainId}_chain_info`;
    }

    async chainInfo (query) {
        const q = {
            requestTimeout: 5000,
            index: this.CHAIN_INFO,
            body: {
                // query,
            }
        };
        const response = await esDb.search(q);
        const  result = response.hits.hits.map(item => ({hash: item._id, meta: item._source}));
        console.log(result);
        return result;
    }

    async searchBlock(opts, single = false) {
        const response = await esDb.search({
            requestTimeout: 5000,
            index: this.BLOCK_INDEX,
            ...opts
        });
        if (single) {
            if (response.hits.total.value == 0) {
                throw Error('Not found');
            }
            const item = response.hits.hits[0];
            return {hash: item._id, meta: item._source};
        } else {
            return response.hits.hits.map(item => ({hash: item._id, meta: item._source}));
        }
    }

    async quickSearchBlocks (q, sort="no", from=0, size=10) {
        const query = {
            requestTimeout: 5000,
            index: this.BLOCK_INDEX,
            q,
            sort,
            from,
            size
        };
        const response = await esDb.search(query);

        // total-count and limit page count
        const totalCnt = await this.getBlockCount();
        let limitPageCount = totalCnt;
        if (totalCnt > 10000) limitPageCount = 1000 * size;
        const resp = {
            // total: response.hits.total.value,
            // totalPage: await this.getBlockCount(),
            total: totalCnt,
            limitPageCount: limitPageCount,
            from,
            size,
            hits: response.hits.hits.map(item => ({hash: item._id, meta: item._source}))
        };

        return resp;
    }

    async searchTransactions (query, extraBody) {
        const response = await this.searchTransactionsRaw(query, extraBody);
        return response.hits.hits.map(item => ({hash: item._id, meta: item._source}));
    }

    async searchTransactionsRaw (query, extraBody, extraParams) {
        const q = {
            requestTimeout: 5000,
            index: this.TX_INDEX,
            body: {
                query,
                size: 10,
                sort: {
                    blockno: { "order" : "desc" }
                },
            }
        };
        if (extraBody) {
            Object.assign(q.body, extraBody);
        }
        if (extraParams) {
            Object.assign(q, extraParams);
        }
        const response = await esDb.search(q);
        return response;
    }

    async quickSearchTransactions (q, sort="blockno", from=0, size=10) {
        const query = {
            requestTimeout: 5000,
            index: this.TX_INDEX,
            q,
            sort,
            from,
            size
        };
        const response = await esDb.search(query);

        // total-count and limit page count
        const totalCnt = await this.getTxCount(q);
        let limitPageCount = totalCnt;
        if (totalCnt > 10000) limitPageCount = 1000 * size;
        const resp = {
            // total: response.hits.total.value,
            // total: await this.getTxCount(q),
            total: totalCnt,
            limitPageCount: limitPageCount,
            from,
            size,
            hits: response.hits.hits.map(item => ({hash: item._id, meta: item._source}))
        };
        return resp;
    }

    async quickSearchTokenTransfers (q, sort="blockno:desc", from=0, size=10) {

        const query = {
            requestTimeout: 5000,
            index: this.TOKEN_TX_INDEX,
            q,
            sort,
            from,
            size
        };
        // console.log('query = '+JSON.stringify(query));
        const response = await esDb.search(query);
        // console.log('quickSearchTokenTransfers = '+JSON.stringify(response));

        // total-count and limit page count
        const totalCnt = await this.getTokenTxCount(q);
        let limitPageCount = totalCnt;
        if (totalCnt > 10000) limitPageCount = 1000 * size;
        const resp = {
            // total: response.hits.total.value,
            // total:  await this.getTokenTxCount(q),
            total: totalCnt,
            limitPageCount: limitPageCount,
            from,
            size,
            hits: response.hits.hits.map(item => ({hash: item._id, meta: item._source}))
        };
        return resp;
    }

    async accountsBalance (q, sort="balance_float", from=0, size=20) {
        const query = {
            requestTimeout: 5000,
            index: this.ACCOUNT_BALANCE_INDEX,
            q,
            sort,
            from,
            size
        };
        const response = await esDb.search(query);
        // console.log("ACCOUNT_BALANCE_INDEX = "+this.ACCOUNT_BALANCE_INDEX)
        // console.log("query = "+JSON.stringify(query));
        // console.log(response);

        // total-count and limit page count
        const totalCnt = await this.getAccountBalanceCount(q);
        let limitPageCount = totalCnt;
        if (totalCnt > 10000) limitPageCount = 1000 * size;
        const resp = {
            // total: response.hits.total.value,
            // total: await this.getTxCount(q),
            total: totalCnt,
            limitPageCount: limitPageCount,
            from,
            size,
            hits: response.hits.hits.map(item => ({hash: item._id, meta: item._source}))
        };
        return resp;
    }

    async quickSearchAccountToken (q, sort="", from=0, size=10) {
        const query = {
            requestTimeout: 5000,
            index: this.ACCOUNT_TOKENS_INDEX,
            q,
            sort,
            from,
            size
        };
        const response = await esDb.search(query);

        // total-count and limit page count
        const totalCnt = await this.getTokenNftHolderCount(q);
        let limitPageCount = totalCnt;
        if (totalCnt > 10000) limitPageCount = 1000 * size;
        const resp = {
            // total: response.hits.total.value,
            // total:  await this.getTokenNftHolderCount(q),
            total: totalCnt,
            limitPageCount: limitPageCount,
            from,
            size,
            hits: response.hits.hits.map(item => ({hash: item._id, meta: item._source}))
        };
        return resp;
    }


    async quickSearchToken (q, sort="blockno:desc", from=0, size=10) {
/*
        const query = {
            requestTimeout: 5000,
            index: this.TOKEN_INDEX,
            q,
            sort,
            from,
            size
        };
*/
        const query = {
            requestTimeout: 5000,
            index: this.TOKEN_INDEX,
            body: {
                query : {
                    query_string : {
                        query : q
                    }
                }
            }
        };

        const response = await esDb.search(query);
        // console.log('quickSearchToken q = '+JSON.stringify(query));
        // console.log('quickSearchToken = '+JSON.stringify(response));

        const resp = {
            total: response.hits.total.value,
            limitPageCount: response.hits.total.value,
            from,
            size,
            hits: response.hits.hits.map(item => ({hash: item._id, meta: item._source}))
        };
        return resp;
    }

    /**
     *
     * @param q
     * @returns {Promise<{hits: {meta: *, hash: *}[], total: *, size, from, limitPageCount: *}>}
     */
    async quickSearchContractTx (q) {
        const query = {
            requestTimeout: 5000,
            index: this.CONTRACT_TX,
            q
        };
        const response = await esDb.search(query);

        // console.log("response = "+JSON.stringify(response));

        const resp = {
            total: response.hits.total.value,
            hits: response.hits.hits.map(item => ({hash: item._id, meta: item._source}))
        };
        return resp;
    }

    /**
     * 삭제 예정
     * @param query
     * @param extraBody
     * @param extraParams
     * @returns {Promise<*>}
     */
    async searchTokenTransfersRaw (query, extraBody, extraParams) {
        const q = {
            requestTimeout: 5000,
            index: this.TOKEN_TX_INDEX,
            body: {
                query,
                size: 50,
                sort: {
                    blockno: { "order" : "desc" }
                },
            }
        };
        if (extraBody) {
            Object.assign(q.body, extraBody);
        }
        if (extraParams) {
            Object.assign(q, extraParams);
        }
        const response = await esDb.search(q);
        return response;
    }

    async quickSearchNames (q, sort="blockno:desc", from=0, size=1) {
        const query = {
            requestTimeout: 5000,
            index: this.NAME_INDEX,
            q,
            sort,
            from,
            size
        };
        const response = await esDb.search(query);
        const resp = {
            total: response.hits.total.value,
            from,
            size,
            hits: response.hits.hits.map(item => item._source)
        };
        return resp;
    }

    async getBestBlock () {
        return await this.searchBlock({
            body: {
                size: 1,
                sort: {
                    no: { "order" : "desc" }
                },
            }
        }, true);
    }

    async getBlockCount (q) {
        const args = {
            index: this.BLOCK_INDEX
        };
        if (q) {
            args.q = q;
        }
        const { count } = await esDb.count(args);
        return count;
    }

    async getTxCount (q) {
        const args = {
            index: this.TX_INDEX
        };
        if (q) {
            args.q = q;
        }
        const { count } = await esDb.count(args);
        return count;
    }

    async getTokenTxCount (q) {
        const args = {
            index: this.TOKEN_TX_INDEX
        };
        if (q) {
            args.q = q;
        }
        const { count } = await esDb.count(args);
        return count;
    }

    async getInventoryCount (q) {
        const args = {
            index: this.NFT_INDEX
        };
        if (q) {
            args.q = q;
        }
        const { count } = await esDb.count(args);
        return count;
    }

    async getTokenNftHolderCount (q) {
        const args = {
            index: this.ACCOUNT_TOKENS_INDEX
        };
        if (q) {
            args.q = q;
        }
        const { count } = await esDb.count(args);
        return count;
    }

    async getAccountBalanceCount (q) {
        const args = {
            index: this.ACCOUNT_BALANCE_INDEX
        };
        if (q) {
            args.q = q;
        }
        const { count } = await esDb.count(args);
        return count;
    }

    aggregateBlocks (tsQuery, interval, aggs={sum_txs: { sum: { field: "txs" }},max_txs: { max: { field: "txs" }}}, extraQuery=[]) {
        const query = {
            "bool": {
                "must": [
                    {
                        "range": {
                            ts: tsQuery,
                        }
                    },
                    ...extraQuery,
                ]
            }
        }
        // console.log("query = "+JSON.stringify(query));
        // console.log("aggs = "+JSON.stringify(aggs));
        return new Promise(async (resolve) => {
            const response = await esDb.search({
                index: this.BLOCK_INDEX,
                body: {
                    query,
                    aggs: {
                        grouped_blocks: {
                            "date_histogram" : {
                                "field" : "ts",
                                "interval" : interval
                            },
                            aggs
                        }
                    },
                }
            });
            resolve(response.aggregations.grouped_blocks.buckets);
        })
    }

    // NFT Holder All-List
    async searchAccountToken (q) {
        const query = {
            requestTimeout: 5000,
            index: this.ACCOUNT_TOKENS_INDEX,
            body: {
                size: 0,
                query : {
                    query_string : {
                        query : q
                    }
                },
                aggs: {
                    group_by_state: {
                        terms: {
                            field: "account",
                            size: 50000
                        }
                    }
                    }
            }
        };
        const response = await esDb.search(query);
        const resp = {
            hits: response.aggregations.group_by_state.buckets.map(item => ({account:item.key, amount:item.doc_count}))
        };
        return resp;
    }

    // NFT Holder Inventory
    async searchAccountTokenInventory (q, sort="blockno:desc", from=0, size=10) {
        const query = {
            requestTimeout: 5000,
            index: this.NFT_INDEX,
            q,
            sort,
            from,
            size
        };
        // console.log(">>>>>>>>"+JSON.stringify(query));
        const response = await esDb.search(query);
        // console.log("...response="+response);

        // total-count and limit page count
        const totalCnt = await this.getInventoryCount(q);
        let limitPageCount = totalCnt;
        if (totalCnt > 10000) limitPageCount = 1000 * size;
        const resp = {
            // total: response.hits.total.value,
            // total:  await this.getInventoryCount(q),
            total: totalCnt,
            limitPageCount: limitPageCount,
            from,
            size,
            hits: response.hits.hits.map(item => ({hash: item._id, meta: item._source}))
        };
        return resp;
    }

    // 사용자(account) NFT의 token_id 보유 갯수
    async quickSearchNftGroupCountInventory(q) {

        const query = {
            requestTimeout: 5000,
            index: this.NFT_INDEX,
            body: {
                size: 0,
                query : {
                    query_string : {
                        query : q
                    }
                },
                aggs: {
                    group_by_state: {
                        terms: {
                            field: "address"
                        }
                    }
                }
            }
        };
        const response = await esDb.search(query);
        const resp = {
            hits: response.aggregations.group_by_state.buckets.map(item => ({address:item.key, amount:item.doc_count}))
        };
        return resp;

    }

    // 보유한/보유했던 토큰 리스트
    async quickSearchTokenTransfersOwnerList(q) {
        const query = {
            requestTimeout: 5000,
            index: this.TOKEN_TX_INDEX,
            body: {
                size: 0,
                query : {
                    query_string : {
                        query : q
                    }
                },
                aggs: {
                    group_by_state: {
                        terms: {
                            field: "address"
                        }
                    }
                }
            }
        };
        const response = await esDb.search(query);
        const resp = {
            // hits: response.aggregations.group_by_state.buckets.map(item => ({account:item.key, amount:item.doc_count}))
            hits: response.aggregations.group_by_state.buckets.map(item => ({address:item.key}))
        };
        return resp;

    }

    /***************************************************************************************
     * Silvermine-scan
     *
     * @param tsQuery
     * @param interval
     * @param aggs
     * @param extraQuery
     * @returns {Promise<unknown>}
     */
    aggregateTransfer (req_address, tsQuery, interval, aggs={sum_amount: { sum: { field: "amount_float" }},count_amount: { value_count: { field: "amount_float" }}}, extraQuery=[]) {

        // console.log(".......req_address = "+req_address)
        // console.log(".......extraQuery = "+extraQuery)
        const query = {
            "bool": {
                "must": [
                    {
                        "range": {
                            ts: tsQuery,
                        }
                    },
                    {
                        "term": {
                            "address": req_address
                        }
                    },
                    ...extraQuery,
                ]
            }
        }
        return new Promise(async (resolve) => {
            const response = await esDb.search({
                index: this.TOKEN_TX_INDEX,
                body: {
                    query,
                    // query: {
                    //     "term": {
                    //         "address": req_q
                    //     }
                    // },
                    aggs: {
                        grouped_tx: {
                            "date_histogram" : {
                                "field" : "ts",
                                "interval" : interval
                            },
                            aggs
                        }
                    },
                }
            });
            resolve(response.aggregations.grouped_tx.buckets);
        })
    }
}
