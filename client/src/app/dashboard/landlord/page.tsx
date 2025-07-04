import ProtectedRoute from "@/components/code/ProtectedRoute";
import DashboardPage from "../page";
import React from "react";

const LandlordPage = () => {
  return (
    <ProtectedRoute>
      <DashboardPage>Landlord</DashboardPage>
    </ProtectedRoute>
  );
};

export default LandlordPage;
