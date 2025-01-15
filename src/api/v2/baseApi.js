import express from 'express'

import {
  apiRoot,
  chainInfo,
  maxTokens,
  bestBlock,
  firstBlock,
} from '../../services/v2/baseService'

const apiV2 = express.Router({ mergeParams: true })

apiV2.route('/').get(apiRoot)
apiV2.route('/chainInfo').get(chainInfo)
apiV2.route('/maxTokens').get(maxTokens)
apiV2.route('/bestBlock').get(bestBlock)
apiV2.route('/firstBlock').get(firstBlock)

export default apiV2
