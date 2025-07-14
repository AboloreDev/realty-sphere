import {
  Home,
  Heart,
  FileText,
  Users,
  Settings,
  Calculator,
  Currency,
  FilePen,
  Settings2Icon,
  HelpCircle,
  LogOut,
} from "lucide-react";

export const tenantNavMain = [
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
];

export const managerNavMain = [
  { name: "Dashboard", href: "/dashboard/landlord", icon: Home },
  {
    name: "Properties",
    href: "/dashboard/landlord/properties",
    icon: FileText,
  },
  { name: "Tenants", href: "/dashboard/landlord/tenants", icon: Users },
];

export const tenantNavSecondary = [
  {
    name: "Settings",
    href: "/dashboard/tenant/settings",
    icon: Settings2Icon,
  },
  { name: "Get Help", href: "/dashboard/tenant/faq", icon: HelpCircle },
  { name: " Logout", href: "/logout", icon: LogOut },
];
export const landlordNavSecondary = [
  {
    name: "Settings",
    href: "/dashboard/landlord/settings",
    icon: Settings2Icon,
  },
  { name: "Get Help", href: "/dashboard/landlord/faq", icon: HelpCircle },
  { name: " Logout", href: "/logout", icon: LogOut },
];
