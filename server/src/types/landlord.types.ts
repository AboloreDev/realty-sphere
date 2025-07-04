export interface getLandlordId {
  id: string;
  role: "MANAGER";
}

export interface createLandlord {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
}

export interface updateLandlord {
  id: string;
  name: string;
  email: string;
}
