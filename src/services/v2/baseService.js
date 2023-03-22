/** ****************************************************************************************************
 *
 * Aergoscan V2 API
 *
 **************************************************************************************************** */
import chaininfos from '../../../chaininfo.json';
import { Amount } from "@herajs/client";
import cfg from "../../config/config";

const apiRoot = async (req, res, next) => {
    const publicEndpoints = ['mainBlockInfo' ,'recentTransactions' ,'txHistory' ,'Blocks' ,'Transactions' ,'contractTx' ,'existedTxTokenList' ,'search' ,'names' ,'accountsBalance' ,'accounts' ,'tokensPrice' ,'token' ,'tokenTransfers' ,'tokenHolder' ,'nft' ,'nftTransfers' ,'nftHolder' ,'tokenBalance' ,'nftInventory' ,'nftGroupCountInventory'];
    return res.json({
        id: process.env.SELECTED_NETWORK,
        msg: `Aergoscan API for chain ${process.env.SELECTED_NETWORK}.`,
        resources: publicEndpoints.map(resource => `${cfg.HOST}/${process.env.SELECTED_NETWORK}/${cfg.VERSION}/${resource}/`)
    });
}

const chainInfo = async (req, res, next) => {
    const chaininfo = chaininfos[process.env.SELECTED_NETWORK];
    if (!chaininfo) {
        return res.json({error: 'chaininfo not found'});
    }
    return res.json(chaininfo);
}

const maxTokens = async (req, res, next) => {
    const chaininfo = chaininfos[process.env.SELECTED_NETWORK];
    if (!chaininfo) {
        return res.send('chaininfo not found');
    }
    const unit = req.query.unit || 'aer';
    const amount = new Amount(chaininfo['MaxTokens'], 'aer');
    const [value,] = amount.toUnit(unit).toString().split(" ");
    return res.send(value);
}

/**
 * best block
 */
const bestBlock = async (req, res, next) => {
    // console.log('bestBlock = '+req.apiClient);
    console.log('bestBlock!!');
    try {
        return res.json(await req.apiClient.getBestBlock());
    } catch (e) {
        return res.json({error: e});
    }
}


export { apiRoot, chainInfo, maxTokens, bestBlock }
