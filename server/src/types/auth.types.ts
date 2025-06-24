export interface CreateAccount {
  name: string;
  email: string;
  password: string;
  role: "Tenant" | "Landlord";
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface verifyEmail {
  code: string;
}
export interface resendVerificationEmail {
  email: string;
}
