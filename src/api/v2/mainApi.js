import express from 'express'

import {
  txHistory,
  CachedTxHistory,
  mainBlockInfo,
  CachedMainBlockInfo,
  RecentTransactions,
  CachedRecentTransactions,
  peers,
  chainInfo,
  nameInfo,
  consensusInfo,
  bestBlock,
  accountState,
  staking,
  block,
  accountVotes,
  abi,
  transactionReceipt,
  topVotes,
  blockMetadata,
  queryContract,
  queryContractState,
  serverInfo,
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
apiV2.route('/peers').get(peers)
apiV2.route('/node/chainInfo').get(chainInfo)
apiV2.route('/node/bestBlock').get(bestBlock)
apiV2.route('/nameInfo').get(nameInfo)
apiV2.route('/serverInfo').get(serverInfo)
apiV2.route('/consensusInfo').get(consensusInfo)
apiV2.route('/accountState').get(accountState)
apiV2.route('/staking').get(staking)
apiV2.route('/block').get(block)
apiV2.route('/blockMetadata').get(blockMetadata)
apiV2.route('/accountVotes').get(accountVotes)
apiV2.route('/topVotes').get(topVotes)
apiV2.route('/abi').get(abi)
apiV2.route('/transactionReceipt').get(transactionReceipt)
apiV2.route('/queryContract').post(queryContract)
apiV2.route('/queryContractState').post(queryContractState)

export default apiV2
