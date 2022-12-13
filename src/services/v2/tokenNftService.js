import * as Console from "console";

const { sequelize } = require('../../models/index');
import cfg from '../../config/config';
import {addCachedTokenData, tokenRegisteredCache, nftRegisteredCache, getCachedToken} from "../../caches/caches";

sequelize.sync({ force: false })
    // .authenticate()
    .then(() => {
        console.log('DB Connected');
    })
    .catch((err) => {
        console.error(err);
    });

/**
 * Tokens/token detail (q, sort, size, from)
 *  - 등록된 토큰도 검색
 * return :
 *          url : 외부/내부 정보로 가져와야함
 */
const token = async (req, res, next) => {
    console.log('tokens url : '+req.url);
    console.log('tokens url : '+req.query.q);
    try {

        let regContractAddress;
        //-- range : ALL (전체검색), REG(등록된 토큰만 검색)
        if("REG" === req.query.range){

            //--  reg-token
            let search = "";
            if(req.query.search){
                search = req.query.search;
            }

            const query = 'select token_address, token_name, token_symbol, token_url, token_image from token_list where network =:q_network AND (token_name like :q_search OR token_symbol like :q_search) AND type = :q_type AND status=3 AND is_view= :q_is_view limit ' + req.query.size + ' offset ' + req.query.from;
            regContractAddress = "_id:";

            const [result, metadata] = await sequelize.query(query, {
                replacements: {
                    q_network: cfg.SCHEDULER_NETWORK,
                    q_search: '%'+search+'%',
                    q_type: 'ARC1',
                    q_is_view: 'Y'}
            });

            for (let i=0; i < result.length; i++){
                if(i < result.length && i > 0){
                    regContractAddress += " OR _id:"
                }
                regContractAddress += result[i].token_address;
                // console.log("..regContractAddress = " + regContractAddress);

                // set to tokenRegisteredCache
                // tokenRegisteredCache.set(result[i].token_address, JSON.stringify(result[i]));
            }
            if(result.length == 0){
                regContractAddress = "";
            }
        }else{
            regContractAddress = req.query.q;
        }

        //-- elastic Toekn List
        // const tokenList = await req.apiClient.quickSearchToken(req.query.q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10)));
        const tokenList = await req.apiClient.quickSearchToken(regContractAddress, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10)));


        await Promise.all(tokenList.hits.map(async tokenList => {
            const query_q = "address:"+tokenList.hash;
            const contract_info = await req.apiClient.quickSearchTokenTransfers(query_q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10)));
            tokenList.meta.total_transfer = contract_info.total;
            // tokenList.meta.url = cfg.UNREGISTERED_TOKEN_URL;
            // tokenList.meta.image = cfg.UNREGISTERED_TOKEN_IMAGE;

            //-- token get information (images/url)
            // for (let tokenKey of tokenRegisteredCache.keys()) {
                // console.log(tokenKey);
            // }

            const tmpTokenList = [];
            tmpTokenList.push(tokenList);

            for (let tokenAddress of tmpTokenList) {
                if (tokenRegisteredCache.has(tokenAddress.hash)) {
                    const tempToken = JSON.parse(tokenRegisteredCache.get(tokenAddress.hash));
                    console.log(JSON.stringify(tempToken))
                    tokenList.meta.name = tempToken.token_name;
                    tokenList.meta.symbol = tempToken.token_symbol;
                    tokenList.meta.url = tempToken.token_url;
                    tokenList.meta.image = tempToken.token_image;
                } else {
                    tokenList.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                    tokenList.meta.image = cfg.UNREGISTERED_TOKEN_IMAGE;
                }
            }

        }) );

        return res.json(tokenList);
    } catch(e) {
        return res.json({error: e});
    }
}

/**
 * Nft/nft detail, allow search query (q, sort, size, from)
 * - 등록된 NFT도 검색
 * return :
 *          url : 외부/내부 정보로 가져와야함
 *
 */
const nft = async (req, res, next) => {
    console.log('tokens url : ' + req.url);
    console.log('tokens header : ' + req.header('user-agent'));
    console.log('tokens protocol : ' + req.protocol);
    console.log('tokens addresses : ' + req.connection.remoteAddress);

    try {

        let regContractAddress;
        //-- range : ALL (전체검색), REG(등록된 토큰만 검색)
        if("REG" === req.query.range){
            //--  reg-token
            let search = "";
            if(req.query.search){
                search = req.query.search;
            }

            const query = 'select token_address, token_name, token_symbol, token_url, token_image from token_list where network =:q_network AND (token_name like :q_search OR token_symbol like :q_search) AND type = :q_type AND status=3 AND is_view= :q_is_view limit ' + req.query.size + ' offset ' + req.query.from;
            regContractAddress = "_id:";

            // const [result, metadata] = await sequelize.query(query, params);
            const [result, metadata] = await sequelize.query(query, {
                replacements: {
                    q_network: cfg.SCHEDULER_NETWORK,
                    q_search: '%'+search+'%',
                    q_type: 'ARC2',
                    q_is_view: 'Y'}
            });

            for (let i = 0; i < result.length; i++) {
                if (i < result.length && i > 0) {
                    regContractAddress += " OR _id:"
                }
                regContractAddress += result[i].token_address;
                // console.log("..regContractAddress = " + regContractAddress);

                // set to tokenRegisteredCache
                // tokenRegisteredCache.set(result[i].token_address, JSON.stringify(result[i]));
            }
            if (result.length == 0) {
                regContractAddress = "";
            }
        }else{
            regContractAddress = req.query.q;
        }

        //-- elastic Toekn List
        // const tokenList = await req.apiClient.quickSearchToken(req.query.q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10)));
        const tokenList = await req.apiClient.quickSearchToken(regContractAddress, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10)));

        await Promise.all(tokenList.hits.map(async tokenList => {
            const query_q = "address:" + tokenList.hash;
            const contract_info = await req.apiClient.quickSearchTokenTransfers(query_q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10)));
            tokenList.meta.total_transfer = contract_info.total;

            //-- token get information (images/url)
            // for (let tokenKey of tokenRegisteredCache.keys()) {
            // console.log(tokenKey);
            // }

            const tmpTokenList = [];
            tmpTokenList.push(tokenList);

            for (let tokenAddress of tmpTokenList) {
                if (nftRegisteredCache.has(tokenAddress.hash)) {
                    const tempToken = JSON.parse(nftRegisteredCache.get(tokenAddress.hash));
                    tokenList.meta.name = tempToken.token_name;
                    tokenList.meta.symbol = tempToken.token_symbol;
                    tokenList.meta.url = tempToken.token_url;
                    tokenList.meta.image = tempToken.token_image;
                } else {
                    tokenList.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                    tokenList.meta.image = cfg.UNREGISTERED_TOKEN_IMAGE;
                }
            }

        }));

        return res.json(tokenList);
    } catch (e) {
        return res.json({error: e});
    }
}

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
    console.log('tokenTransfers|nftTransfers url : '+req.url);
    try {
        const result = await req.apiClient.quickSearchTokenTransfers(req.query.q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10)));

        if (result.hits && result.hits.length) {
            result.hits = await Promise.all(result.hits.map(hit => addCachedTokenData(req.apiClient, hit)))

            //-- token/nft get information (images/url)
            const tmpTokenList = [];
            tmpTokenList.push(result);
            for (let tokenList of result.hits) {
                if (tokenRegisteredCache.has(tokenList.meta.address) || nftRegisteredCache.has(tokenList.meta.address)) {
                    let tempToken = JSON.parse(tokenRegisteredCache.get(tokenList.meta.address));
                    // console.log("tempToken = "+tempToken);
                    if(tempToken.size == 0){
                        tempToken = JSON.parse(nftRegisteredCache.get(tokenList.meta.address));
                    }
                    tokenList.token.meta.name = tempToken.token_name;
                    tokenList.token.meta.symbol = tempToken.token_symbol;
                    tokenList.token.meta.url = tempToken.token_url;
                    tokenList.token.meta.image = tempToken.token_image;
                } else {
                    tokenList.token.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                    tokenList.token.meta.image = cfg.UNREGISTERED_TOKEN_IMAGE;
                }
            }
        }

        return res.json(result);
    } catch(e) {
        console.log("tokenNftTransfers = "+e)
        return res.json({error: e});
    }
}



/**
 * Token holder (q, sort, size, from)
 */
const tokenNftHolder = async (req, res, next) => {
    console.log('tokenHolder url : '+req.url);
    const q_query = req.query.q + " AND balance_float>0";
    console.log(req.query.q);
    try {
        const result = await req.apiClient.quickSearchAccountToken(req.query.q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10)));
        if (result.hits && result.hits.length) {
            result.hits = await Promise.all(result.hits.map(hit => addCachedTokenData(req.apiClient, hit)))

            //-- token get information (images/url)
            for (let tokenList of result.hits) {
                if (tokenRegisteredCache.has(tokenList.meta.address)) {
                    const tempToken = JSON.parse(tokenRegisteredCache.get(tokenList.meta.address));
                    tokenList.token.meta.name = tempToken.token_name;
                    tokenList.token.meta.symbol = tempToken.token_symbol;
                    tokenList.token.meta.url = tempToken.token_url;
                    tokenList.token.meta.image = tempToken.token_image;
                } else {
                    tokenList.token.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                    tokenList.token.meta.image = cfg.UNREGISTERED_TOKEN_IMAGE;
                }
            }
        }

        return res.json(result);
    } catch(e) {
        return res.json({error: e});
    }
}

/**
 * Nft Inventory (q, sort, size, from)
 */
const nftInventory = async (req, res, next) => {
    console.log('tokenHolder url : '+req.url);
    try {
        const result = await req.apiClient.searchAccountTokenInventory(req.query.q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 20)));
        if (result.hits && result.hits.length) {
            result.hits = await Promise.all(result.hits.map(hit => addCachedTokenData(req.apiClient, hit)))

            //-- token get information (images/url)
            for (let tokenList of result.hits) {
                if (tokenRegisteredCache.has(tokenList.meta.address)) {
                    const tempToken = JSON.parse(tokenRegisteredCache.get(tokenList.meta.address));
                    tokenList.token.meta.name = tempToken.token_name;
                    tokenList.token.meta.symbol = tempToken.token_symbol;
                    tokenList.token.meta.url = tempToken.token_url;
                    tokenList.token.meta.image = tempToken.token_image;
                } else {
                    tokenList.token.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                    tokenList.token.meta.image = cfg.UNREGISTERED_TOKEN_IMAGE;
                }
            }
        }

        return res.json(result);
    } catch(e) {
        return res.json({error: e});
    }
}

/**
 * Nft GroupCount Inventory (q, sort, size, from)
 *
 */
const nftGroupCountInventory = async (req, res, next) => {
    console.log('nftGroupCountInventory url : '+req.url);
    try {
        //--
        const result = await req.apiClient.quickSearchNftGroupCountInventory(req.query.q);
        console.log("-----result1 = "+JSON.stringify(result));

        result.total = result.hits.length;
        result.limitPageCount = result.hits.length;
        result.from = req.query.from;
        result.size = req.query.size;

        //-- token info
        if (result.hits && result.hits.length) {
            result.hits = await Promise.all(result.hits.map(hit => addCachedTokenData(req.apiClient, hit)))
        }
        console.log("-----result2 = "+JSON.stringify(result));

        //-- token get information (images/url)
        for (let tokenList of result.hits) {
            console.log("tokenList.address = "+tokenList.address);
            if (nftRegisteredCache.has(tokenList.address)) {
                const tempToken = JSON.parse(nftRegisteredCache.get(tokenList.address));
                tokenList.token.meta.name = tempToken.token_name;
                tokenList.token.meta.symbol = tempToken.token_symbol;
                tokenList.token.meta.url = tempToken.token_url;
                tokenList.token.meta.image = tempToken.token_image;
            } else {
                tokenList.token.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                tokenList.token.meta.image = cfg.UNREGISTERED_TOKEN_IMAGE;
            }

            //-- recently ts
            const account = (req.query.q).split("account:");
            const q_query = "(from:"+account[1]+" OR to:"+account[1]+") AND "+"address:"+tokenList.address;
            const ts = await req.apiClient.quickSearchTokenTransfers(q_query, "blockno:desc", 0, 1);
            tokenList.ts = (ts.hits[0]).meta.ts;
        }

        return res.json(result);
    } catch(e) {
        return res.json({error: e});
    }
}

/**
 * Token holder (q, sort, size, from)
 */
const tokenNftBalance = async (req, res, next) => {
    console.log('tokenHolder url : '+req.url);
    try {
        const result = await req.apiClient.quickSearchAccountToken(req.query.q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10)));
        console.log(JSON.stringify(result));
        if (result.hits && result.hits.length) {
            result.hits = await Promise.all(result.hits.map(hit => addCachedTokenData(req.apiClient, hit)))

            //-- token get information (images/url)
                for (let tokenList of result.hits) {
                    if(tokenList.token != null) {
                        if (tokenRegisteredCache.has(tokenList.meta.address)) {
                            const tempToken = JSON.parse(tokenRegisteredCache.get(tokenList.meta.address));
                            tokenList.token.meta.name = tempToken.token_name;
                            tokenList.token.meta.symbol = tempToken.token_symbol;
                            tokenList.token.meta.url = tempToken.token_url;
                            tokenList.token.meta.image = tempToken.token_image;
                        } else {
                            tokenList.token.meta.url = cfg.UNREGISTERED_TOKEN_URL;
                            tokenList.token.meta.image = cfg.UNREGISTERED_TOKEN_IMAGE;
                        }
                    }
                }
        }

        return res.json(result);
    } catch(e) {
        return res.json({error: e});
    }
}

export { token, nft, tokenNftTransfers, tokenNftHolder, nftInventory, nftGroupCountInventory, tokenNftBalance }
