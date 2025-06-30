"use client";

import {
  Home,
  Heart,
  FileText,
  Users,
  Settings,
  Calculator,
  Currency,
  LifeBuoy,
  FilePen,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/state/redux";
import { usePathname } from "next/navigation";

interface SideMenuProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function DashboardSidebar({
  isOpen,
  toggleSidebar,
}: SideMenuProps) {
  const user = useAppSelector((state) => state.user.user);
  const pathname = usePathname();

  const tenantLinks = [
    { name: "Dashboard", href: "/dashboard/tenant", icon: Home },
    { name: "Favorites", href: "/dashboard/tenant/favorites", icon: Heart },
    {
      name: "Applications",
      href: "/dashboard/tenant/applications",
      icon: FileText,
    },
    {
      name: "Payment History",
      href: "/dashboard/tenant/payments",
      icon: Currency,
    },
    { name: "Invoices", href: "/dashboard/tenant/invoice", icon: FilePen },
    { name: "Properties", href: "/dashboard/tenant/property", icon: Settings },
    {
      name: "Calculator",
      href: "/dashboard/tenant/calculator",
      icon: Calculator,
    },
    { name: "Help & Support", href: "/dashboard/tenant/help", icon: LifeBuoy },
  ];

  const managerLinks = [
    { name: "Dashboard", href: "/landlord", icon: Home },
    { name: "Properties", href: "/landlord/properties", icon: FileText },
    { name: "Tenants", href: "/landlord/tenants", icon: Users },
    { name: "Settings", href: "/landlord/settings", icon: Settings },
  ];

  const links = user?.role === "TENANT" ? tenantLinks : managerLinks;

  return (
    <div className="min-h-screen">
      <div
        className={cn(
          "fixed inset-0 bg-black/10 z-20 md:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={toggleSidebar}
      />
      <aside
        className={cn(
          "fixed md:sticky bg-white text-black h-full w-64 shadow-md z-30 transform transition-transform md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4">
          <nav className="space-y-2 ">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center prata-regular space-x-2 p-2 rounded",
                  pathname === link.href
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                )}
                onClick={toggleSidebar}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}
