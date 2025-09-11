"use client";

import * as React from "react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useAppDispatch } from "@/state/redux";
import { Separator } from "@/components/ui/separator"; // Assuming Radix-based
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  authApi,
  useGetUserProfileQuery,
  useLogoutMutation,
} from "@/state/api/authApi";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { clearUser } from "@/state/slice/userSlice";
import { cn } from "@/lib/utils";
import {
  landlordNavSecondary,
  managerNavMain,
  tenantNavMain,
  tenantNavSecondary,
} from "@/constants/sidebarData";
import { clearSelectedUser } from "@/state/slice/messageSlice";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useGetUserProfileQuery();
  const dispatch = useAppDispatch();
  const [logout, { isLoading }] = useLogoutMutation();
  const router = useRouter();
  const pathname = usePathname();

  const userRole = user.user.role;

  const navMain = userRole === "TENANT" ? tenantNavMain : managerNavMain;

  const navSecondary =
    userRole === "TENANT" ? tenantNavSecondary : landlordNavSecondary;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearUser());
      dispatch(clearSelectedUser());
      authApi.util.resetApiState();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.success("Logged out successfully!");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.data?.message || "Logout failed");
    }
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* HEADER */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="#" className="flex items-center gap-2">
                <span className="text-2xl prata-regular font-semibold">
                  Nestora Realty
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <Separator />

      {/* MAIN NAV */}
      <SidebarContent>
        <SidebarMenu>
          <div className="flex flex-col space-y-4 mt-8">
            {navMain.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-4 prata-regular text-lg font-semibold",
                      pathname === link.href
                        ? "bg-black text-white"
                        : "hover:bg-gray-100"
                    )}
                  >
                    <link.icon className="size-5" />
                    {link.name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>
        </SidebarMenu>

        <Separator className="my-3" />

        {/* SECONDARY NAV */}
        <SidebarMenu>
          {navSecondary.map((item) => (
            <SidebarMenuItem key={item.href}>
              {item.name.trim() === "Logout" ? (
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-lg text-muted-foreground w-full text-left"
                  >
                    <item.icon className="size-6" />
                    {isLoading ? "Logging Out...." : item.name}
                  </button>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 text-lg text-muted-foreground",
                      pathname === item.href
                        ? "bg-black text-white"
                        : "hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="size-6" />
                    {item.name}
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-4">
        {user && (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getInitials(user?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-xs">
                  <span className="font-medium">{user?.user?.name}</span>
                  <span className="text-muted-foreground truncate w-[140px]">
                    {user?.user?.email}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{user?.user?.email}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
