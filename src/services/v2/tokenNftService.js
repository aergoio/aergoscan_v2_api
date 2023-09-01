import * as Console from "console";

const { sequelize } = require("../../models/index");
import cfg from "../../config/config";
import {
    addCachedTokenData,
    tokenRegisteredCache,
    nftRegisteredCache,
    getCachedToken,
} from "../../caches/caches";

sequelize
    .sync({ force: false })
    // .authenticate()
    .then(() => {
        console.log("DB Connected");
    })
    .catch((err) => {
        console.error(err);
    });

const tokenVerified = async (req, res, next) => {
    console.log("tokens url : " + req.url);

    req.query.q += ` AND verified_status:verified`;
    const tokenVerifyList = await req.apiClient.quickSearchToken(
        req.query.q,
        req.query.sort,
        parseInt(req.query.from || 0),
        Math.min(1000, parseInt(req.query.size || 10))
    );
    return res.json(tokenVerifyList);
};

/**
 * Tokens/token detail (q, sort, size, from)
 *  - 등록된 토큰도 검색
 * return :
 *          url : 외부/내부 정보로 가져와야함
 */
const token = async (req, res, next) => {
    console.log("token url : " + req.url);
    try {
        // chain info
        let chainInfoPublic = false;
        let chainInfoMainnet = false;

        const chainInfo = await req.apiClient.chainInfo(req.query.q);
        chainInfoPublic = chainInfo[0].meta.public;
        chainInfoMainnet = chainInfo[0].meta.mainnet;

        console.log(
            "chainInfoPublic = " +
                chainInfoPublic +
                ", chainInfoMainnet = " +
                chainInfoMainnet
        );

        //-- elastic Toekn List
        const tokenList = await req.apiClient.quickSearchToken(
            req.query.q,
            req.query.sort,
            parseInt(req.query.from || 0),
            Math.min(1000, parseInt(req.query.size || 10))
        );
        return res.json(tokenList);
    } catch (e) {
        console.log(e);
        return res.json({ error: e });
    }
};

/**
 * Nft/nft detail, allow search query (q, sort, size, from)
 * - 등록된 NFT도 검색
 * return :
 *          url : 외부/내부 정보로 가져와야함
 *
 */
const nft = async (req, res, next) => {
    console.log("tokens url : " + req.url);
    // console.log('tokens header : ' + req.header('user-agent'));
    // console.log('tokens protocol : ' + req.protocol);
    // console.log('tokens addresses : ' + req.connection.remoteAddress);

    try {
        // chain info
        let chainInfoPublic = false;
        let chainInfoMainnet = false;

        const chainInfo = await req.apiClient.chainInfo(req.query.q);
        chainInfoPublic = chainInfo[0].meta.public;
        chainInfoMainnet = chainInfo[0].meta.mainnet;

        console.log(
            "chainInfoPublic = " +
                chainInfoPublic +
                ", chainInfoMainnet = " +
                chainInfoMainnet
        );

        //-- elastic Toekn List
        const tokenList = await req.apiClient.quickSearchToken(
            req.query.q,
            req.query.sort,
            parseInt(req.query.from || 0),
            Math.min(1000, parseInt(req.query.size || 10))
        );
        return res.json(tokenList);
    } catch (e) {
        return res.json({ error: e });
    }
};

/**
 * Token/Nft (q, sort, size, from)
 *      Search to TxHash :      tx_id:HrPcXv3mFFpAF9GFpGfNBiri28GJDynMGB4bmwH6rrqV
 *      If ARC1 then            token_id  = ""    (token_id:<0)
 *      If ARC2 then            token_id != ""    (token_id:>0)
 *      If ARC1 and ARC2 then   delete to token_id
 *      Ex) q=tx_id:HrPcXv3mFFpAF9GFpGfNBiri28GJDynMGB4bmwH6rrqV+AND+token_id:>0
 */
const tokenNftTransfers = async (req, res, next) => {
    // apiRouterV2.route('/tokenTransfers|nftTransfers').get(async (req, res) => {
    console.log("tokenTransfers|nftTransfers url : " + req.url);
    try {
        const result = await req.apiClient.quickSearchTokenTransfers(
            req.query.q,
            req.query.sort,
            parseInt(req.query.from || 0),
            Math.min(1000, parseInt(req.query.size || 10))
        );

        if (result.hits && result.hits.length) {
            result.hits = await Promise.all(
                result.hits.map((hit) => addCachedTokenData(req.apiClient, hit))
            );

            //-- token/nft get information (images/url)
            const tmpTokenList = [];
            tmpTokenList.push(result);
            for (let tokenList of result.hits) {
                if (tokenList.token != null) {
                    var q = "_id:" + tokenList.token.meta.address;
                    const result = req.apiClient.quickSearchToken(q);
                    if (result.length > 0 && result != "undefined") {
                        const tempToken = JSON.parse(result);
                        tokenList.token.meta.name = tempToken.name;
                        tokenList.token.meta.symbol = tempToken.symbol;
                        tokenList.token.meta.url = tempToken.homepage_url;
                        tokenList.token.meta.image = tempToken.image_url;
                    } else {
                        tokenList.token.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                        tokenList.token.meta.image =
                            cfg.UNREGISTERED_TOKEN_IMAGE;
                    }
                }
            }
        }
        return res.json(result);
    } catch (e) {
        console.log("tokenNftTransfers = " + e);
        return res.json({ error: e });
    }
};

/**
 * Token holder (q, sort, size, from)
 */
const tokenNftHolder = async (req, res, next) => {
    console.log("tokenHolder url : " + req.url);
    const q_query = req.query.q + " AND balance_float>0";
    console.log(req.query.q);
    try {
        const result = await req.apiClient.quickSearchAccountToken(
            req.query.q,
            req.query.sort,
            parseInt(req.query.from || 0),
            Math.min(1000, parseInt(req.query.size || 10))
        );
        if (result.hits && result.hits.length) {
            result.hits = await Promise.all(
                result.hits.map((hit) => addCachedTokenData(req.apiClient, hit))
            );

            //-- token get information (images/url)
            for (let tokenList of result.hits) {
                if (tokenList.token != null) {
                    var q = "_id:" + tokenList.token.meta.address;
                    const result = req.apiClient.quickSearchToken(q);
                    if (result.length > 0 && result != "undefined") {
                        const tempToken = JSON.parse(result);
                        tokenList.token.meta.name = tempToken.name;
                        tokenList.token.meta.symbol = tempToken.symbol;
                        tokenList.token.meta.url = tempToken.homepage_url;
                        tokenList.token.meta.image = tempToken.image_url;
                    } else {
                        tokenList.token.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                        tokenList.token.meta.image =
                            cfg.UNREGISTERED_TOKEN_IMAGE;
                    }
                }
            }
        }

        return res.json(result);
    } catch (e) {
        return res.json({ error: e });
    }
};

/**
 * Nft Inventory (q, sort, size, from)
 */
const nftInventory = async (req, res, next) => {
    console.log("tokenHolder url : " + req.url);
    try {
        const result = await req.apiClient.searchAccountTokenInventory(
            req.query.q,
            req.query.sort,
            parseInt(req.query.from || 0),
            Math.min(1000, parseInt(req.query.size || 20))
        );
        if (result.hits && result.hits.length) {
            result.hits = await Promise.all(
                result.hits.map((hit) => addCachedTokenData(req.apiClient, hit))
            );

            //-- token get information (images/url)
            for (let tokenList of result.hits) {
                if (tokenList.token != null) {
                    var q = "_id:" + tokenList.token.meta.address;
                    const result = req.apiClient.quickSearchToken(q);
                    if (result.length > 0 && result != "undefined") {
                        const tempToken = JSON.parse(result);
                        tokenList.token.meta.name = tempToken.name;
                        tokenList.token.meta.symbol = tempToken.symbol;
                        tokenList.token.meta.url = tempToken.homepage_url;
                        tokenList.token.meta.image = tempToken.image_url;
                    } else {
                        tokenList.token.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                        tokenList.token.meta.image =
                            cfg.UNREGISTERED_TOKEN_IMAGE;
                    }
                }
            }
        }

        return res.json(result);
    } catch (e) {
        return res.json({ error: e });
    }
};

/**
 * Nft GroupCount Inventory (q, sort, size, from)
 *
 */
const nftGroupCountInventory = async (req, res, next) => {
    console.log("nftGroupCountInventory url : " + req.url);
    try {
        //--
        const result = await req.apiClient.quickSearchNftGroupCountInventory(
            req.query.q
        );
        console.log("-----result1 = " + JSON.stringify(result));

        result.total = result.hits.length;
        result.limitPageCount = result.hits.length;
        result.from = req.query.from;
        result.size = req.query.size;

        //-- token info
        if (result.hits && result.hits.length) {
            result.hits = await Promise.all(
                result.hits.map((hit) => addCachedTokenData(req.apiClient, hit))
            );
        }
        console.log("-----result2 = " + JSON.stringify(result));

        //-- token get information (images/url)
        for (let tokenList of result.hits) {
            console.log("tokenList.address = " + tokenList.address);
            if (tokenList.token != null) {
                var q = "_id:" + tokenList.token.meta.address;
                const result = req.apiClient.quickSearchToken(q);
                if (result.length > 0 && result != "undefined") {
                    const tempToken = JSON.parse(result);
                    tokenList.token.meta.name = tempToken.name;
                    tokenList.token.meta.symbol = tempToken.symbol;
                    tokenList.token.meta.url = tempToken.homepage_url;
                    tokenList.token.meta.image = tempToken.image_url;
                } else {
                    tokenList.token.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                    tokenList.token.meta.image = cfg.UNREGISTERED_TOKEN_IMAGE;
                }
            }

            //-- recently ts
            const account = req.query.q.split("account:");
            const q_query =
                "(from:" +
                account[1] +
                " OR to:" +
                account[1] +
                ") AND " +
                "address:" +
                tokenList.address;
            const ts = await req.apiClient.quickSearchTokenTransfers(
                q_query,
                "blockno:desc",
                0,
                1
            );
            tokenList.ts = ts.hits[0].meta.ts;
        }

        return res.json(result);
    } catch (e) {
        return res.json({ error: e });
    }
};

/**
 * Token holder (q, sort, size, from)
 */
const tokenNftBalance = async (req, res, next) => {
    console.log("tokenHolder url : " + req.url);
    try {
        const result = await req.apiClient.quickSearchAccountToken(
            req.query.q,
            req.query.sort,
            parseInt(req.query.from || 0),
            Math.min(1000, parseInt(req.query.size || 10))
        );
        console.log(JSON.stringify(result));
        if (result.hits && result.hits.length) {
            result.hits = await Promise.all(
                result.hits.map((hit) => addCachedTokenData(req.apiClient, hit))
            );

            //-- token get information (images/url)
            for (let tokenList of result.hits) {
                if (tokenList.token != null) {
                    var q = "_id:" + tokenList.token.meta.address;
                    const result = req.apiClient.quickSearchToken(q);
                    if (result.length > 0 && result != "undefined") {
                        const tempToken = JSON.parse(result);
                        tokenList.token.meta.name = tempToken.name;
                        tokenList.token.meta.symbol = tempToken.symbol;
                        tokenList.token.meta.url = tempToken.homepage_url;
                        tokenList.token.meta.image = tempToken.image_url;
                    } else {
                        tokenList.token.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                        tokenList.token.meta.image =
                            cfg.UNREGISTERED_TOKEN_IMAGE;
                    }
                }
            }
        }

        return res.json(result);
    } catch (e) {
        return res.json({ error: e });
    }
};

export {
    token,
    tokenVerified,
    nft,
    tokenNftTransfers,
    tokenNftHolder,
    nftInventory,
    nftGroupCountInventory,
    tokenNftBalance,
};
