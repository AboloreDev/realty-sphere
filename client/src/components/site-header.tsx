"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppSelector } from "@/state/redux";

import ThemeToggle from "./code/ThemeToggle";
import { Button } from "./ui/button";
import { Bell, MessageSquare, Search } from "lucide-react";
import { Input } from "./ui/input";
import { useGetUserProfileQuery } from "@/state/api/authApi";

export function SiteHeader() {
  // functions
  const { data: user } = useGetUserProfileQuery();
  const title =
    user.user?.role === "TENANT" ? "Tenant Dashboard" : "Landlord Dashboard";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-base font-medium"> {title}</h1>
          </div>
          <div className="flex space-x-4 items-center">
            {user.user?.role === "TENANT" && (
              <div className="flex items-center gap-2">
                <Input className="" placeholder="Search properties" />
                <Search />
              </div>
            )}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
