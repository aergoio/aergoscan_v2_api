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

// blacklsit ip
const blacklist = [
'180.230.34.43',
'121.179.231.119',
'203.248.117.37',
'77.191.172.239',
'165.225.228.86',
'99.182.41.248',
'222.112.179.205',
'121.152.216.248',
'211.202.159.170',
'2a02:a460:5167:1:ea19:fe10:54a4:aa43',
'64.64.123.40',
'106.249.246.242',
'2001:e60:3164:fca0:5c58:f990:29db:5f6f',
'122.39.239.101',
'211.180.247.136',
'2601:243:2381:ba40:9897:c55b:dc78:5ddc',
'177.97.71.200',
'118.38.119.193',
'222.235.58.103',
'211.114.70.66',
'85.249.169.160',
'218.39.98.234',
'121.157.43.31',
'59.152.147.103',
'211.243.232.72',
'116.121.168.102',
'31.187.80.43',
'182.218.228.112',
'125.143.174.77',
'180.64.248.30',
'221.143.199.92',
'211.214.21.200',
'175.157.246.179',
'125.242.37.26',
'59.171.220.62',
'210.117.213.228',
'211.192.221.21',
'85.8.117.99',
'59.16.52.236',
'18.141.197.1',
'154.6.151.173',
'82.41.32.174',
'123.140.248.18',
'211.203.100.121',
'203.220.226.1',
'175.197.211.178',
'49.142.68.249',
'125.139.33.152',
'116.45.149.164',
'125.183.156.158',
'118.42.164.202',
'45.149.175.69',
'211.52.165.168',
'211.226.203.222',
'211.40.136.213',
'211.108.111.47',
'222.109.19.241',
'118.129.66.2',
'161.122.52.167',
'211.255.203.42',
'2001:448a:6040:b2cd:b0cd:c13:d348:1e40',
'220.87.212.48',
'121.167.146.95',
'119.195.243.218'
];

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

    // ip filter
    const requestIP = req.connection.remoteAddress;
    console.log(requestIP);
    console.log(blacklist.indexOf(requestIP))
    if(blacklist.indexOf(requestIP) >= 0) {
        console.log('aaccess attempt : ' + requestIP)
        return res.json({
            msg: 'Access Denied'
        });
    }

    return res.json({
        msg: 'Welcome to the Aergoscan API. Please select a chain id.',
        // chains: cfg.AVAILABLE_NETWORKS.map(chainId => `${cfg.HOST}/${chainId}/${cfg.VERSION}`)
        chains: cfg.AVAILABLE_NETWORKS.map(chainId => `${cfg.HOST}/${cfg.VERSION}`)
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

/*
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
    console.log(">>>>>>>= " + process.env.SELECTED_NETWORK);
    req.apiClient = new ApiClient(process.env.SELECTED_NETWORK);
    next();
});

// chainRouter.use('/:chainId', apiV1walletConnect, apiV1blocksTransactions, apiV1othersApi);
// chainRouter.use('/:chainId/v2', apiV2base, apiV2main, apiV2blocksTransactions, apiV2tokenNft, apiV2account, apiV2others);
*/

chainRouter.param('version', function(req, res, next, vversion) {
    req.apiClient = new ApiClient(process.env.SELECTED_NETWORK);
    next();
});

chainRouter.use('/:version', apiV2base, apiV2main, apiV2blocksTransactions, apiV2tokenNft, apiV2account, apiV2others);


export default app;

