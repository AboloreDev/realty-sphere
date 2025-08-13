import ProtectedRoute from "@/components/code/ProtectedRoute";
import React from "react";

const TenantPage = () => {
  return <ProtectedRoute requiredRole="TENANT">Tenant</ProtectedRoute>;
};

export default TenantPage;
