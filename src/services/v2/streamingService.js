import { heraGrpcProvider } from '../herajs'
import WebSocket from 'ws'

export const initializeStreamingService = (server) => {
  const wss = new WebSocket.Server({ noServer: true })
  wss.on('connection', (ws) => {
    const aergo = heraGrpcProvider(process.env.SELECTED_NETWORK)
    const blockHeaderStream = aergo.getBlockMetadataStream()

    blockHeaderStream.on('data', (blockHeader) => {
      try {
        const blockHeaderWithVoteReward = {
          ...blockHeader,
          voteReward: blockHeader.voteReward.formatNumber('aergo'),
        }
        ws.send(JSON.stringify(blockHeaderWithVoteReward)) // 블록 데이터를 클라이언트로 전송
      } catch (error) {
        console.error('[WebSocket] Error sending blockHeader:', error)
      }
    })

    blockHeaderStream.on('end', () => {
      console.log('Block stream ended.')
      ws.close()
    })

    ws.on('message', (message) => {
      console.log('[WebSocket] Received message from client:', message)
    })

    ws.on('close', () => {
      console.log('[WebSocket] Block stream ended.')
      /**
       * 웹소켓 연결 끊길 때 재연결
       * https://jungeunpyun.tistory.com/78
       *  */
      setTimeout(function () {
        initializeStreamingService(server)
      }, 1000)
    })

    ws.on('error', (err) => {
      console.error('WebSocket error:', err)
    })
  })

  console.log('[WebSocket] WebSocket server initialized for v2/streamBlocks.')
  return wss
}
