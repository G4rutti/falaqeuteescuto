export const websocketConfig = {
  url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/ws`,
  reconnectInterval: 5000,
  reconnectAttempts: 5,
  heartbeatInterval: 30000,
}
