export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://falaqeuteescuto-backend.onrender.com"

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  STREAMER: (slug: string) => `/${slug}`,
} as const

export const WEBSOCKET_URL = API_BASE_URL.replace("http", "ws") + "/ws"
