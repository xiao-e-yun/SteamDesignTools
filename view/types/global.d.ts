import ws from '../src/websocket'

declare global {
    interface Window {
        ws: ws
      }
}