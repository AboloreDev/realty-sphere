"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  MessageSquare,
  Settings,
  Menu,
  DoorClosed,
  Search,
} from "lucide-react"; // Add Search Icon
import { useLogoutMutation } from "@/state/api/authApi";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setUser } from "@/state/slice/userSlice";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function DashboardHeader({ toggleSidebar }: HeaderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);
  const title =
    user?.role === "TENANT" ? "Tenant Dashboard" : "Landlord Dashboard";

  const [logout, { isLoading }] = useLogoutMutation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // handle settings
  const handleSettings = () => {
    if (user?.role === "TENANT") {
      router.push("/dashboard/tenant/settings");
    } else {
      router.push("/dashboard/landlord/settings");
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "";
    const names = name.split(" ");
    return names
      .map((n) => n.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(setUser(null));
      toast.success("Logged out successfully!");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.data?.message || "Logout failed");
    }
  };

  return (
    <header className="bg-black dark:bg-gray-300 text-white dark:text-black shadow-sm p-3 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <Button className="md:hidden" variant="ghost" onClick={toggleSidebar}>
          <Menu className="w-6 h-6 font-bold" />
        </Button>
        <h1 className="text-xl md:text-2xl font-semibold hidden md:block prata-regular">
          {title}
        </h1>
      </div>

      {/* Conditional Search Box (only for Tenant role) */}
      {user?.role === "TENANT" && (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Input
            type="text"
            placeholder="Search..."
            className={cn(
              " top-0 left-0 right-0 w-full px-4 py-2 border rounded-md shadow-md transition-all duration-300 transform",
              isSearchOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-[-20px]"
            )}
          />
        </div>
      )}

      <div className="flex items-center space-x-4 prata-regular">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 text-black dark:text-white">
                <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSettings}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <DoorClosed className="h-4 w-4" />
              <span>{isLoading ? "Logging out..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
