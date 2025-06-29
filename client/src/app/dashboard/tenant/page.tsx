import ProtectedRoute from "@/components/code/ProtectedRoute";
import React from "react";
import DashboardLayout from "../layout";

const TenantPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>TenantPage</div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default TenantPage;
