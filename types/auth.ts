export interface SignupData {
  name: string;
  email: string;
  slug: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  slug: string;
}
