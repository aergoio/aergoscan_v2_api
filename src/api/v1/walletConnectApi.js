import express from 'express';

import { accountBalance, tokenNftTransfers } from '../../services/v1/walletConnectService';
import apiV2 from "../v2/tokenNftApi";

const apiV1 = express.Router({mergeParams: true});

apiV1.route('/accountBalance').get(accountBalance)
apiV1.route('/tokenTransfers|nftTransfers').get(tokenNftTransfers)


export default apiV1