import cfg from '../../config/config';
import { ApiClient } from '../../models/esDb';

const requestIp = require('request-ip');

/**
 * 블록정보 (q, sort, size, from)
 */
const blocks = async (req, res, next) => {
    console.log('blocks url : ' + req.url);
    try {
        // block height
        // const blockCount = await req.apiClient.getBlockCount();

        // block list
        let result = await req.apiClient.quickSearchBlocks(
            req.query.q,
            req.query.sort,
            parseInt(req.query.from || 0),
            Math.min(1000, parseInt(req.query.size || 10)),
        );
        // result.total = blockCount;

        return res.json(result);
    } catch (e) {
        return res.json({ error: e });
    }
};

/**
 * Transactions 정보 (q, sort, size, from)
 */
const transactions = async (req, res, next) => {
    // console.log("Client IP: " +requestIp.getClientIp(req));
    console.log('(' + requestIp.getClientIp(req) + ') transactions url : ' + req.url);

    try {
        const result = await req.apiClient.quickSearchTransactions(
            req.query.q,
            req.query.sort,
            parseInt(req.query.from || 0),
            Math.min(1000, parseInt(req.query.size || 10)),
        );

        try {
            if (result.hits.length > 0) {
                // internal
                const internalTx = result.hits.map(x => `_id:${x.hash}`);
                const internalQ = `${internalTx.join(' OR ')}`;
                const resultInternal = await req.apiClient.quickSearchInternalTransactions(internalQ, 'blockno', 0, internalQ.length);

                if (resultInternal.hits.length > 0) {
                    result.hits.map(x => {
                        const internal = resultInternal.hits.find(i => i.hash === x.hash);
                        if (internal) {
                            x.internal = internal.meta;
                        }
                    });
                }
            }
        } catch (e) {}

        return res.json(result);
    } catch (e) {
        console.log('...e = ' + e);
        return res.json({ error: e });
    }
};

/**
 * internals 정보 (q, sort, size, from)
 */
const internals = async (req, res, next) => {
    console.log('(' + requestIp.getClientIp(req) + ') internals url : ' + req.url);

    try {
        const result = await req.apiClient.quickSearchInternalTransactions(
            req.query.q,
            req.query.sort,
            parseInt(req.query.from || 0),
            Math.min(1000, parseInt(req.query.size || 10)),
        );

        return res.json(result);
    } catch (e) {
        console.log('...e = ' + e);
        return res.json({ error: e });
    }
};

const contractTx = async (req, res, next) => {
    console.log('contract url : ' + req.url);
    try {
        const result = await req.apiClient.quickSearchContractTx(req.query.q);
        return res.json(result);
    } catch (e) {
        console.log('...e = ' + e);
        return res.json({ error: e });
    }
};

const event = async (req, res, next) => {
    console.log('event url : ' + req.url);
    try {
        const result = await req.apiClient.quickSearchEvents(req.query.q, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10)));
        // console.log(JSON.stringify(result.hits));
        return res.json(result);
    } catch (e) {
        console.log('...e = ' + e);
        return res.json({ error: e });
    }
};

export { blocks, transactions, internals, contractTx, event };
