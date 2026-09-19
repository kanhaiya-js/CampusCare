"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Wrench,
  Layers,
  MapPin,
  Download,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/format";

interface SidebarProps {
  role: "ADMIN" | "STAFF" | "USER";
  className?: string;
}

export function Sidebar({ role, className }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/issues", label: "All Issues", icon: FileText },
    { href: "/admin/analytics", label: "Analytics & KPIs", icon: BarChart3 },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/staff", label: "Staff & Workload", icon: Wrench },
    { href: "/admin/categories", label: "Categories", icon: Layers },
    { href: "/admin/locations", label: "Campus Locations", icon: MapPin },
    { href: "/admin/reports", label: "Export Reports", icon: Download },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
  ];

  const staffLinks = [
    { href: "/staff", label: "Assigned Queue", icon: LayoutDashboard },
    { href: "/issues?scope=assigned", label: "My Workload", icon: Wrench },
    { href: "/issues", label: "Campus Tickets", icon: FileText },
    { href: "/map", label: "Interactive Map", icon: MapPin },
  ];

  const userLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/issues/report", label: "Report Issue", icon: PlusCircle },
    { href: "/issues?scope=my", label: "My Reported Issues", icon: FileText },
    { href: "/issues", label: "All Campus Issues", icon: Layers },
    { href: "/map", label: "Campus Map", icon: MapPin },
  ];

  const links = role === "ADMIN" ? adminLinks : role === "STAFF" ? staffLinks : userLinks;

  return (
    <aside className={cn("w-64 shrink-0 border-r border-border bg-card p-4 min-h-[calc(100vh-4rem)]", className)}>
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {role === "ADMIN" ? "Facility Administration" : role === "STAFF" ? "Maintenance Operations" : "Student / Reporter Portal"}
        </p>
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary-600 dark:text-primary-400" : "text-muted-foreground")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
