import express from 'express'

import {
  txHistory,
  CachedTxHistory,
  mainBlockInfo,
  CachedMainBlockInfo,
  RecentTransactions,
  CachedRecentTransactions,
  peerInfo,
  chainInfo,
  consensusInfo,
  bestBlock,
  accountState,
  staking,
  block,
} from '../../services/v2/mainService'

const apiV2 = express.Router({ mergeParams: true })

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

apiV2.route('/txHistory').get(txHistory)
apiV2.route('/CachedTxHistory').get(CachedTxHistory)
apiV2.route('/mainBlockInfo').get(mainBlockInfo)
apiV2.route('/CachedMainBlockInfo').get(CachedMainBlockInfo)
apiV2.route('/RecentTransactions').get(RecentTransactions)
apiV2.route('/CachedRecentTransactions').get(CachedRecentTransactions)

// get blockchain datas by hera.js
apiV2.route('/peerInfo').get(peerInfo)
apiV2.route('/chainInfo').get(chainInfo)
apiV2.route('/consensusInfo').get(consensusInfo)
apiV2.route('/bestBlock').get(bestBlock)
apiV2.route('/accountState').get(accountState)
apiV2.route('/staking').get(staking)
apiV2.route('/block').get(block)

export default apiV2
