// create the tenant interface
export interface Tenant {
  name: string;
  email: string;
  id: string;
  role?: string;
  leaseStatus?: string;
}

// create the updated tenant request payload
export interface UpdatedTenantRequest {
  id: string;
  data: Partial<Tenant>;
}

// create the updated Tenant response
export interface UpdatedTenantResponse {
  success: boolean;
  message: string;
  data: Tenant;
}
