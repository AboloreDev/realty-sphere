// create the landlord interface
export interface Landlord {
  name: string;
  email: string;
  id: string;
  role?: string;
}

// create the updatedLandlordRequest Interface
export interface updatedLandlordRequest {
  id: string;
  data: Partial<Landlord>;
}

// create the updatedLandlordResponse
export interface updatedLandlordResponse {
  success: boolean;
  message: string;
  data: Landlord;
}
