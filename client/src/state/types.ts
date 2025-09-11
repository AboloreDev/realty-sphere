export interface User {
  id: string;
  name: string;
  email: string;
  role: "TENANT" | "MANAGER";
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  tokens?: {
    // Make it optional for backward compatibility
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface RegisterUserTypes {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "Tenant" | "Landlord";
}

export interface LoginUserTypes {
  email: string;
  password: string;
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  user: { id: number; name: string; email: string; role: string };
}
