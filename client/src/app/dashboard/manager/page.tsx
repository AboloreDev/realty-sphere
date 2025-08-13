import ProtectedRoute from "@/components/code/ProtectedRoute";
import React from "react";

const LandlordPage = () => {
  return <ProtectedRoute requiredRole="MANAGER">Landlord</ProtectedRoute>;
};

export default LandlordPage;
