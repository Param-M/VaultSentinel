export interface User {
  client_id: string;
  bank_name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  link_token: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  client_id: string;
  bank_name: string;
  email: string;
  role: string;
}

export interface LinkTokenPayload {
  valid: boolean;
  email?: string;
  bank_name?: string;
  client_id?: string;
  message?: string;
}
