import { heraGrpcProvider } from "../herajs";
import { addCachedTokenData } from "../../caches/caches";

/** ****************************************************************************************************
 * Used to Connect (Chrome Extended) 1.5
 *
 * coin/token balance for HeraJS
 *
 ** ****************************************************************************************************/

// Test Contract
const CONTRACT_GEM = "Amhpi4LgVS74YJoZAWXsVgkJfEztYe5KkV3tY7sYtCgXchcKQeCQ";

const accountBalance = async (req, res, next) => {
    console.log("accountBalance url : " + req.url);

    let aergoClientType = heraGrpcProvider(process.env.SELECTED_NETWORK);

    /**
     * balance for token and coin
     * @type {string}
     */
    try {
        //-- coin
        const accountAddress = req.query.q; // accoutn Address
        // const accountAddress = 'AmNBes1nksbz8VhbF6DiXfEqL1dx1YRHFpxZwZABQLqkctmCTFZU'; // test accout Address
        let state = {
            nonce: 0,
            balance: "0 aer",
            codehash: "",
            storageroot: "",
            sqlrecoverypoint: 0,
        };
        console.log("accountAddress state = " + JSON.stringify(state));
        let connectState = true;

        try {
            state = await aergoClientType.getState(accountAddress);
        } catch (e) {
            // {"nonce":0,"balance":"0 aer","codehash":"","storageroot":"","sqlrecoverypoint":0}
            // state = await aergoClientType.getState(accountAddress);
            connectState = false;
        }
        if (connectState == false) {
            try {
                state = await aergoClientType.getState(accountAddress);
            } catch (e) {
                console.log("connectState e = " + e);
            }
        }

        let aergoBalance;
        try {
            aergoBalance = state.balance.toString();
        } catch (e) {
            console.log("aergoBalance = " + e);
        }

        //-- token
        const contractAddress = CONTRACT_GEM; // contract
        const abi = await aergoClientType.getABI(contractAddress);

        // const method = 'balanceOf';
        const args = [accountAddress];
        const contract = Contract.fromAbi(abi).setAddress(contractAddress);
        console.log("contract = " + JSON.stringify(contract));

        const balanceOf = await aergoClientType.queryContract(
            contract.functions["balanceOf"](...args)
        );
        const symbol = await aergoClientType.queryContract(
            contract.functions["symbol"](...args)
        );
        const name = await aergoClientType.queryContract(
            contract.functions["name"](...args)
        );
        const decimals = await aergoClientType.queryContract(
            contract.functions["decimals"](...args)
        );

        let accountBalanceData = {
            coin: {
                address: accountAddress,
                meta: {
                    balance: aergoBalance,
                    name: "Aergo",
                    symbol: "AERGO",
                },
            },
            objects: [
                {
                    token: {
                        contract: contractAddress,
                        meta: {
                            name: name,
                            symbol: symbol,
                            decimals: decimals,
                            balance: balanceOf._bignum,
                        },
                    },
                },
            ],
        };

        console.log(JSON.stringify(accountBalanceData));
        return res.json(accountBalanceData);
    } catch (e) {
        return res.json({ error: e });
    }
};

/**
 * Query token/nft transfers, allow search query (q, sort, size, from)
 * For q, see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html
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
        }
        return res.json(result);
    } catch (e) {
        return res.json({ error: e });
    }
};

export { accountBalance, tokenNftTransfers };
