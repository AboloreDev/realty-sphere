import { AppSidebar } from "@/components/app-sidebar";
import ProtectedRoute from "@/components/code/ProtectedRoute";

// import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export interface DashboardProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardProps) {
  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {/* <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
              </div> */}
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
