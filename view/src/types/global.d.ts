import ws from '@/websocket'

declare global {
  interface Window { 
    ws : ws
  }
}