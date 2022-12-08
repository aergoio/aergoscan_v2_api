import express, {json} from 'express';
import cors from 'cors';
import { ApiClient } from './models/esDb';
import cfg from './config/config';
import fetch from 'node-fetch';

import apiV1walletConnect from './api/v1/walletConnectApi'
import apiV1blocksTransactions from './api/v2/blocksTransactionsApi'  //-- v1 호환성 유지
import apiV1othersApi from './api/v2/othersApi'  //-- v1 호환성 유지
import apiV2base from './api/v2/baseApi'
import apiV2main from './api/v2/mainApi'
import apiV2blocksTransactions from './api/v2/blocksTransactionsApi'
import apiV2tokenNft from './api/v2/tokenNftApi'
import apiV2account from './api/v2/AccountApi'
import apiV2others from './api/v2/othersApi'
import {rewards} from "./services/v2/othersService";
// import {swaggerUi, specs} from '../swagger/swagger';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs'
import * as path from "path";

const specs = YAML.load(path.join(__dirname, '../swagger/aergoscan-api.yaml'))

const app = express();

// app.use(cors({credentials: true, origin: 'http://localhost:8081'}));
app.use(cors({credentials: true, origin: true}));

// Nested router for chainId
const chainRouter = express.Router();

const cache = {
    swapData: null,
    swapDataUpdated: null,
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))



app.use('/', chainRouter);
app.use((err, req, res, next) => {
    if (err) {
        return res.status(500).json({ error: err.message });
    }
    next();
});

chainRouter.route('/').get((req, res) => {
    return res.json({
        msg: 'Welcome to the Aergoscan API. Please select a chain id.',
        chains: cfg.AVAILABLE_NETWORKS.map(chainId => `${cfg.HOST}/${chainId}/${cfg.VERSION}`)
    });
});

chainRouter.route('/swapStat').get(async (req, res) => {
    const swapStatCacheDuration = 60 * 60 * 24 * 1000;
    const isStale = cache.swapDataUpdated && (new Date() - cache.swapDataUpdated) > swapStatCacheDuration;
    if (!cache.swapData || isStale) {
        const url = 'https://vb42nx03yf.execute-api.us-east-1.amazonaws.com/prod';
        try {
            const response = await fetch(url);
            cache.swapData = await response.json();
            cache.swapDataUpdated = new Date();
        } catch(e) {
            return res.json({error: 'Could not fetch data'});
        }
    }
    return res.json({ updated: cache.swapDataUpdated, result: cache.swapData });
});

chainRouter.param('chainId', function(req, res, next, chainId) {
    if (cfg.AVAILABLE_NETWORKS.indexOf(chainId) === -1) {
        return next(new Error('invalid chain id'));
    }
    //-- v1 호환성 유지
    if(chainId == "test") {
        req.params.chainId = "testnet";
    } else if(chainId == "main"){
        req.params.chainId = "mainnet";
    }
    req.apiClient = new ApiClient(req.params.chainId);
    next();
});

chainRouter.use('/:chainId', apiV1walletConnect, apiV1blocksTransactions, apiV1othersApi);
chainRouter.use('/:chainId/v2', apiV2base, apiV2main, apiV2blocksTransactions, apiV2tokenNft, apiV2account, apiV2others);

export default app;

