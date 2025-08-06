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
  House,
  HouseIcon,
  HomeIcon,
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
    name: "Residencies",
    href: "/dashboard/tenant/residencies",
    icon: House,
  },
  {
    name: "Payment History",
    href: "/dashboard/tenant/payments",
    icon: Currency,
  },
  { name: "Invoices", href: "/dashboard/tenant/invoices", icon: FilePen },
  { name: "Properties", href: "/dashboard/tenant/property", icon: Settings },
  {
    name: "Calculator",
    href: "/dashboard/tenant/calculator",
    icon: Calculator,
  },
];

export const managerNavMain = [
  { name: "Dashboard", href: "/dashboard/manager", icon: Home },
  {
    name: "Properties",
    href: "/dashboard/manager/properties",
    icon: HomeIcon,
  },
  {
    name: "Applications",
    href: "/dashboard/manager/applications",
    icon: FileText,
  },
  { name: "Tenants", href: "/dashboard/manager/tenants", icon: Users },
  {
    name: "Create Listings",
    href: "/dashboard/manager/listings",
    icon: HouseIcon,
  },
  { name: "Invoices", href: "/dashboard/manager/invoices", icon: FilePen },
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
    href: "/dashboard/manager/settings",
    icon: Settings2Icon,
  },
  { name: "Get Help", href: "/dashboard/manager/faq", icon: HelpCircle },
  { name: " Logout", href: "/logout", icon: LogOut },
];
