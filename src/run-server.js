import app from './app'
import cfg from './config/config'
import { createServer } from 'http'
import { initializeV3StreamingService } from './services/v3/streamingService'

// HTTP 서버 생성
const httpServer = createServer(app)

// WebSocket 서비스 초기화
const wssV3 = initializeV3StreamingService(httpServer)

httpServer.on('upgrade', (req, socket, head) => {
  if (req.url === '/v3/streamBlocks') {
    wssV3.handleUpgrade(req, socket, head, (ws) => {
      wssV3.emit('connection', ws, req)
    })
  } else {
    console.log('Invalid WebSocket URL:', req.url)
    socket.destroy()
  }
})

const startup = async () => {
  httpServer.listen(cfg.HTTP_PORT, () => {
    console.log(`Backend and WebSocket listening on port ${cfg.HTTP_PORT}.`)
  })
}

console.log('Server started at ' + new Date())
startup()
