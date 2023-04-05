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
    '180.64.248.30',
    '211.193.209.70',
    '211.105.2.33',
    '222.255.206.97',
    '2600:1700:17f0:4b20:6193:e93d:6b7e:786c',
    '222.112.179.205',
    '123.140.248.25',
    '68.228.218.150',
    '119.196.100.206',
    '87.16.93.170',
    '2601:647:4600:3ad0:ddb0:37a3:66d8:a660',
    '99.182.41.248',
    '180.230.34.43',
    '121.157.43.31',
    '64.64.123.40',
    '217.21.116.221',
    '77.191.172.239',
    '203.248.117.37',
    '92.220.233.24',
    '121.152.216.248',
    '2a02:a460:5167:1:ea19:fe10:54a4:aa43',
    '81.211.75.121',
    '218.153.75.232',
    '125.183.156.158',
    '211.202.159.170',
    '85.249.161.207',
    '122.39.239.101',
    '222.235.58.103',
    '211.114.70.66',
    '59.152.147.103',
    '2601:243:2381:ba40:9897:c55b:dc78:5ddc',
    '2001:8003:f220:2901:c0da:7f7c:ebaa:7bc8',
    '5.29.21.52',
    '210.123.100.166',
    '116.121.168.102',
    '115.21.179.135',
    '218.39.98.234',
    '59.16.38.102',
    '211.243.232.72',
    '31.187.80.43',
    '124.58.151.215',
    '1.213.169.124',
    '221.162.210.168',
    '58.72.52.18',
    '59.20.192.224',
    '211.180.247.136',
    '159.250.47.124',
    '220.75.211.84',
    '185.205.172.64',
    '61.84.83.248',
    '115.144.252.60',
    '175.198.60.97',
    '203.246.171.66',
    '95.181.238.159',
    '211.255.203.42',
    '74.59.171.187',
    '2a00:23c6:9186:301:44d5:9b87:ff0e:1da',
    '1.240.244.84',
    '42.113.157.16',
    '118.46.61.154',
    '188.186.95.23',
    '125.177.219.7',
    '176.132.138.159',
    '180.129.83.158',
    '2a01:4b00:b014:fe00:5084:f9b3:2cb2:861a',
    '27.7.20.87',
    '122.153.195.55',
    '2a02:a440:d3e:1:f45a:1a9f:5cfc:7aa1',
    '221.152.140.41',
    '2a01:e0a:1f1:b860:d0d3:79e0:b441:7a61',
    '202.150.191.126',
    '99.38.117.164',
    '211.227.109.235',
    '85.8.117.99',
    '112.144.250.52',
    '221.143.199.92',
    '211.203.100.121',
    '112.158.199.223',
    '125.143.174.77',
    '59.171.220.62',
    '211.192.221.21',
    '203.220.226.1',
    '82.41.32.174',
    '154.6.151.173',
    '123.140.248.18',
    '94.174.122.58',
    '18.141.173.194',
    '49.142.68.249',
    '90.161.164.54',
    '125.139.33.152',
    '80.229.254.174',
    '175.197.211.178',
    '218.52.91.192',
    '211.52.165.168',
    '211.226.203.222',
    '211.108.111.47',
    '211.40.136.213',
    '219.100.37.242',
    '116.45.149.164',
    '161.122.52.167',
    '121.167.146.95',
    '220.87.212.48',
    '119.195.243.218',
    '2001:448a:6040:b2cd:644d:560:86f3:6239',
    '222.109.19.241',
    '121.165.137.181',
    '47.157.45.214',
    '203.241.147.20',
    '211.59.108.33',
    '125.134.110.53',
    '69.145.132.163',
    '2600:1700:af40:ad00:312f:93ab:6604:618f',
    '59.29.233.133',
    '218.145.150.135',
    '49.163.184.25',
    '112.169.119.26',
    '49.169.219.138',
    '121.141.140.175',
    '119.194.145.66',
    '175.117.167.2',
    '119.153.38.93',
    '108.51.20.50',
    '213.234.29.206',
    '183.105.124.127',
    '59.12.111.36',
    '2001:448a:1190:1144:3838:e651:55ac:e15',
    '211.55.63.185',
    '14.243.50.99',
    '211.210.119.201',
    '85.89.25.253',
    '125.177.16.237',
    '211.228.109.124',
    '151.68.47.87',
    '210.220.85.10',
    '175.176.9.166',
    '194.61.40.139',
    '211.54.17.177',
    '2.136.250.103',
    '92.76.203.113',
    '31.134.187.52',
    '121.179.231.119',
    '165.225.228.86',
    '106.249.246.242',
    '2001:e60:3164:fca0:5c58:f990:29db:5f6f',
    '177.97.71.200',
    '118.38.119.193',
    '85.249.169.160',
    '182.218.228.112',
    '211.214.21.200',
    '175.157.246.179',
    '125.242.37.26',
    '210.117.213.228',
    '59.16.52.236',
    '18.141.197.1',
    '118.42.164.202',
    '45.149.175.69',
    '118.129.66.2',
    '2001:448a:6040:b2cd:b0cd:c13:d348:1e40',
    '3.34.153.57',
    '1.237.44.89',
    '221.163.68.136',
    '110.12.18.175',
    '61.84.55.200',
    '182.253.132.141',
    '14.63.17.32',
    '58.234.6.219',
    '118.48.181.145',
    '188.97.235.73',
    '222.234.239.107',
    '211.193.209.70'
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

    // ip filter
    const requestIP = req.connection.remoteAddress;
    if(blacklist.indexOf(requestIP) >= 0) {
        console.log('aaccess attempt : ' + requestIP)
        return res.json({
            msg: 'Access Denied'
        });
    }


    req.apiClient = new ApiClient(process.env.SELECTED_NETWORK);
    next();
});

chainRouter.use('/:version', apiV2base, apiV2main, apiV2blocksTransactions, apiV2tokenNft, apiV2account, apiV2others);


export default app;

