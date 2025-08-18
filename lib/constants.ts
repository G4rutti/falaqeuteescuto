export const API_BASE_URL = "https://falaqeuteescuto-backend.onrender.com"

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  STREAMER: (slug: string) => `/${slug}`,
} as const

export const WEBSOCKET_URL = "wss://falaqeuteescuto-backend.onrender.com/ws"
