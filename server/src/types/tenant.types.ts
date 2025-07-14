export interface getTenantId {
  id: string;
  role: "TENANT";
}

export interface createTenant {
  id: string;
  name: string;
  email: string;
  role: "TENANT";
  password?: string;
}

export interface updateTenant {
  id: string;
  name: string;
  email: string;
}

export interface AddTenantFavoritePropertyType {
  id: string;
  propertyId: string;
}
