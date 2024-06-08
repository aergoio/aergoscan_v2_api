import express from 'express';

import { txHistory, CachedTxHistory, mainBlockInfo, CachedMainBlockInfo, RecentTransactions, CachedRecentTransactions } from '../../services/v2/mainService';

const apiV2 = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   - name: [mainApi]
 *     description: Everything about your Pets
 *     externalDocs:
 *       description: aergoscan
 *       url: https://aergoscan.io
 * server:
 *   - https
 *   - http
 */
// apiV2.route('/txHistory').get(txHistory);
apiV2.route('/CachedTxHistory').get(CachedTxHistory);
apiV2.route('/mainBlockInfo').get(mainBlockInfo);
apiV2.route('/CachedMainBlockInfo').get(CachedMainBlockInfo);
apiV2.route('/RecentTransactions').get(RecentTransactions);
apiV2.route('/CachedRecentTransactions').get(CachedRecentTransactions);

export default apiV2;
