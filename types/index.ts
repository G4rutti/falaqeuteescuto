export interface User {
  id: string
  username: string
  email: string
  streamerSlug?: string
}

export interface Message {
  id: string
  text: string
  donationAmount?: number
  createdAt: string
  streamerSlug: string
  audioUrl?: string
}

export interface StreamerStats {
  totalMessages: number
  alertsInQueue: number
  isConnected: boolean
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  streamerSlug: string
}

export interface MessageRequest {
  text: string
  donationAmount?: number
  streamerSlug: string
}
