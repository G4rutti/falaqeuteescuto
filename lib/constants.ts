export const API_BASE_URL = "http://localhost:8080"

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  STREAMER: (slug: string) => `/${slug}`,
} as const

export const WEBSOCKET_URL = "ws://localhost:8080/ws"
