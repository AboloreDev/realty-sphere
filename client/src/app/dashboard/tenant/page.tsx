"use client";

import ProtectedRoute from "@/components/code/ProtectedRoute";
import DashboardLayout from "../layout";
import { useState } from "react";
import DashboardHeader from "@/components/code/DashboardHeader";
import DashboardSidebar from "@/components/code/DashboardSidebar";

const LandlordPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardHeader toggleSidebar={toggleSidebar} />
        <div className="flex fixed h-full">
          <DashboardSidebar
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />

          <div className="flex-1 overflow-y-scroll">5</div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default LandlordPage;
