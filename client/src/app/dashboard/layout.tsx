import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex-grow transition-all duration-500">{children}</div>
    </main>
  );
};

export default DashboardLayout;
