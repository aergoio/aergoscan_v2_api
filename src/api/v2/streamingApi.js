import express from 'express'
import { peerInfo } from '../../services/v2/streamingService'

const apiV2 = express.Router({ mergeParams: true })

apiV2.route('/peerInfo').get(peerInfo)

export default apiV2
