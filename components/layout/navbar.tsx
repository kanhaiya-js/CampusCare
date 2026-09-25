"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Wrench,
  PlusCircle,
  MapPin,
  Menu,
  X,
  CheckCheck,
  Users,
  QrCode,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "STAFF" | "ADMIN";
  avatarUrl?: string | null;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { success } = useToast();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    if (showNotifications || showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotifications, showUserMenu]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || (!resolvedTheme && theme === "dark"));

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isCurrentlyDark =
      resolvedTheme === "dark" ||
      (!resolvedTheme && theme === "dark") ||
      (typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
    const nextTheme = isCurrentlyDark ? "light" : "dark";

    if (typeof document !== "undefined" && "startViewTransition" in document) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX || rect.left + rect.width / 2;
      const y = e.clientY || rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = (document as any).startViewTransition(() => {
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        setTheme(nextTheme);
      });

      transition.ready
        .then(() => {
          const clipPath = [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ];
          document.documentElement.animate(
            {
              clipPath: clipPath,
            },
            {
              duration: 450,
              easing: "cubic-bezier(0.4, 0, 0.2, 1)",
              pseudoElement: "::view-transition-new(root)",
            } as any
          );
        })
        .catch(() => {
          setTheme(nextTheme);
        });
    } else {
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        (document as any).documentElement.classList.add("theme-transition");
        setTheme(nextTheme);
        setTimeout(() => {
          (document as any).documentElement.classList.remove("theme-transition");
        }, 450);
      } else {
        setTheme(nextTheme);
      }
    }
  };

  useEffect(() => {
    fetchUser();
    setShowNotifications(false);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.data?.user) {
        setUser(data.data.user);
        fetchNotifications();
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      success("Logged out successfully");
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardUrl = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN" || (user.role as string) === "DEPARTMENT_COORDINATOR") return "/admin";
    if (user.role === "STAFF" || (user.role as string) === "MAINTENANCE_STAFF") return "/staff";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight group shrink-0">
            <img
              src="/logo.png"
              alt="CampusCare Logo"
              className="w-8 h-8 rounded-lg object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex items-baseline gap-1.5 font-orbitron">
              <span className="font-black text-foreground tracking-wider leading-none text-[16px]">
                CampusCare
              </span>
              <span className="text-[12px] font-bold text-muted-foreground tracking-wide leading-none">
                (GL BAJAJ)
              </span>
            </div>
          </Link>
        </div>

        {/* Full-Width Desktop Navigation Tabs with Gray Hover State and Underground Line Effect */}
        <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2.5 flex-1 px-2 h-full">
          {user && (
            <Link
              href={getDashboardUrl()}
              className={`group relative flex items-center px-3.5 py-2 text-[13px] font-medium transition-all rounded-lg ${
                pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/staff")
                  ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-500/10 dark:bg-primary-500/15"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800/80"
              }`}
            >
              <span>Dashboard</span>
              {/* Underground Line Hover & Active Indicator */}
              <span
                className={`absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-300 ease-out origin-center pointer-events-none ${
                  pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/staff")
                    ? "bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 opacity-100 scale-x-100 shadow-[0_2px_8px_rgba(99,102,241,0.6)]"
                    : "bg-gray-400 dark:bg-gray-500 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 shadow-[0_1px_6px_rgba(156,163,175,0.4)]"
                }`}
              />
            </Link>
          )}
          <Link
            href="/issues"
            className={`group relative flex items-center px-3.5 py-2 text-[13px] font-medium transition-all rounded-lg ${
              pathname === "/issues" || pathname.startsWith("/issues/")
                ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-500/10 dark:bg-primary-500/15"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800/80"
            }`}
          >
            <span>Issues</span>
            {/* Underground Line Hover & Active Indicator */}
            <span
              className={`absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-300 ease-out origin-center pointer-events-none ${
                pathname === "/issues" || pathname.startsWith("/issues/")
                  ? "bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 opacity-100 scale-x-100 shadow-[0_2px_8px_rgba(99,102,241,0.6)]"
                  : "bg-gray-400 dark:bg-gray-500 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 shadow-[0_1px_6px_rgba(156,163,175,0.4)]"
              }`}
            />
          </Link>
          <Link
            href="/map"
            className={`group relative flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold transition-all rounded-lg ${
              pathname === "/map"
                ? "text-primary-600 dark:text-primary-300 bg-primary-50/80 dark:bg-primary-950/50 border border-primary-200/80 dark:border-primary-800/70 shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800/80 border border-transparent"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0 group-hover:scale-110 transition-transform" />
            <span>Interactive Campus Map</span>
            {/* Underground Line Hover & Active Indicator */}
            <span
              className={`absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full transition-all duration-300 ease-out origin-center pointer-events-none ${
                pathname === "/map"
                  ? "bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 opacity-100 scale-x-100 shadow-[0_2px_8px_rgba(99,102,241,0.6)]"
                  : "bg-gray-400 dark:bg-gray-500 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 shadow-[0_1px_6px_rgba(156,163,175,0.4)]"
              }`}
            />
          </Link>
          <Link
            href="/qr"
            className={`group relative flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold transition-all rounded-lg ${
              pathname === "/qr" || pathname === "/qr-generator"
                ? "text-primary-600 dark:text-primary-300 bg-primary-50/80 dark:bg-primary-950/50 border border-primary-200/80 dark:border-primary-800/70 shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800/80 border border-transparent"
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-500 shrink-0 group-hover:scale-110 transition-transform" />
            <span>QR Generator</span>
            {/* Underground Line Hover & Active Indicator */}
            <span
              className={`absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full transition-all duration-300 ease-out origin-center pointer-events-none ${
                pathname === "/qr" || pathname === "/qr-generator"
                  ? "bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 opacity-100 scale-x-100 shadow-[0_2px_8px_rgba(99,102,241,0.6)]"
                  : "bg-gray-400 dark:bg-gray-500 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 shadow-[0_1px_6px_rgba(156,163,175,0.4)]"
              }`}
            />
          </Link>
          <Link
            href="/facilities"
            className={`group relative flex items-center px-3.5 py-2 text-[13px] font-medium transition-all rounded-lg ${
              pathname === "/facilities"
                ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-500/10 dark:bg-primary-500/15"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800/80"
            }`}
          >
            <span>Facilities</span>
            {/* Underground Line Hover & Active Indicator */}
            <span
              className={`absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-300 ease-out origin-center pointer-events-none ${
                pathname === "/facilities"
                  ? "bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 opacity-100 scale-x-100 shadow-[0_2px_8px_rgba(99,102,241,0.6)]"
                  : "bg-gray-400 dark:bg-gray-500 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 shadow-[0_1px_6px_rgba(156,163,175,0.4)]"
              }`}
            />
          </Link>
          <Link
            href="/transport"
            className={`group relative flex items-center px-3.5 py-2 text-[13px] font-medium transition-all rounded-lg ${
              pathname === "/transport"
                ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-500/10 dark:bg-primary-500/15"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800/80"
            }`}
          >
            <span>Transport</span>
            {/* Underground Line Hover & Active Indicator */}
            <span
              className={`absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-300 ease-out origin-center pointer-events-none ${
                pathname === "/transport"
                  ? "bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 opacity-100 scale-x-100 shadow-[0_2px_8px_rgba(99,102,241,0.6)]"
                  : "bg-gray-400 dark:bg-gray-500 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 shadow-[0_1px_6px_rgba(156,163,175,0.4)]"
              }`}
            />
          </Link>
          <Link
            href="/clubs"
            className={`group relative flex items-center px-3.5 py-2 text-[13px] font-medium transition-all rounded-lg ${
              pathname === "/clubs"
                ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-500/10 dark:bg-primary-500/15"
                : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800/80"
            }`}
          >
            <span>Clubs</span>
            {/* Underground Line Hover & Active Indicator */}
            <span
              className={`absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-300 ease-out origin-center pointer-events-none ${
                pathname === "/clubs"
                  ? "bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 opacity-100 scale-x-100 shadow-[0_2px_8px_rgba(99,102,241,0.6)]"
                  : "bg-gray-400 dark:bg-gray-500 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 shadow-[0_1px_6px_rgba(156,163,175,0.4)]"
              }`}
            />
          </Link>
          {/* Team Tab with Hover Preview */}
          <div className="relative group/team">
            <Link
              href="/team"
              className={`group relative flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium transition-all rounded-lg ${
                pathname === "/team"
                  ? "text-primary-600 dark:text-primary-400 font-semibold bg-primary-500/10 dark:bg-primary-500/15"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800/80"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-primary-500/80 group-hover:text-primary-500 transition-colors" />
              <span>Team</span>
              {/* Underground Line Hover & Active Indicator */}
              <span
                className={`absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-all duration-300 ease-out origin-center pointer-events-none ${
                  pathname === "/team"
                    ? "bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 opacity-100 scale-x-100 shadow-[0_2px_8px_rgba(99,102,241,0.6)]"
                    : "bg-gray-400 dark:bg-gray-500 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 shadow-[0_1px_6px_rgba(156,163,175,0.4)]"
                }`}
              />
            </Link>

            {/* Hover / Dropdown Preview Menu for Quick Overview */}
            <div className="invisible opacity-0 group-hover/team:visible group-hover/team:opacity-100 transition-all duration-200 absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 w-72 pointer-events-none group-hover/team:pointer-events-auto">
              <div className="p-3 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-border/70 pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-primary-500" />
                    Project Team
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-semibold border border-primary-200/50 dark:border-primary-800/50">
                    GL Bajaj
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-muted/60 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                      K
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">Kanhaiya</p>
                      <p className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold">Lead Developer</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">Built frontend &amp; backend</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-muted/60 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                      R
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">Rishav</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Project Researcher</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">Campus research &amp; problem analysis</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-muted/60 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
                      B
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">Badri</p>
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Supporter &amp; Presentation</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">PPT maker &amp; project pitch</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/team"
                  className="block text-center text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline pt-1.5 border-t border-border/50"
                >
                  View Full Team Profile →
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">

          {/* Official Support Link */}
          <Link
            href="/support"
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/25 hover:bg-rose-100 dark:hover:bg-rose-500/25 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Support
          </Link>

          {/* Scan QR Button */}
          <Link
            href="/scan"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors shadow-2xs"
            title="Scan Campus Room QR Code"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </Link>

          {/* Quick Report Button */}
          {user ? (
            <Link href="/issues/report" className="hidden sm:inline-flex">
              <Button size="sm" variant="primary" className="gap-1.5 shadow-sm">
                <PlusCircle className="w-4 h-4" />
                Report Issue
              </Button>
            </Link>
          ) : null}

          {/* Theme Toggle with smooth rotation and ripple animation */}
          <button
            onClick={toggleTheme}
            className="relative w-9 h-9 rounded-lg border border-border dark:border-slate-700 bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-90 shadow-2xs overflow-hidden"
            aria-label="Toggle theme"
            title={mounted ? (isDark ? "Switch to Light Mode" : "Switch to Dark Mode") : "Toggle Theme"}
          >
            <div className="relative w-4 h-4 flex items-center justify-center">
              <Sun
                className={`w-4 h-4 text-amber-400 absolute transition-all duration-500 ease-out transform ${
                  isDark
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
              />
              <Moon
                className={`w-4 h-4 text-slate-700 dark:text-slate-200 absolute transition-all duration-500 ease-out transform ${
                  isDark
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
            </div>
          </button>

          {/* Notifications Popover */}
          {user && (
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => {
                  setShowNotifications((prev) => !prev);
                  setShowUserMenu(false);
                }}
                className="relative w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 text-[10px] font-bold rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-lg border transition-colors ${
                            !n.readAt
                              ? "bg-primary-50/60 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800"
                              : "bg-background border-border"
                          }`}
                        >
                          <p className="text-xs font-semibold text-foreground">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          {n.issueId && (
                            <Link
                              href={`/issues/${n.issueId}`}
                              onClick={() => setShowNotifications(false)}
                              className="text-[10px] font-semibold text-primary-600 hover:underline inline-block mt-1"
                            >
                              View ticket →
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Menu */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => {
                  setShowUserMenu((prev) => !prev);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full bg-slate-200 border border-border"
                />
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="text-xs font-semibold">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {user.role}
                  </span>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-card border border-border shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                      Role: {user.role}
                    </span>
                  </div>

                  <Link
                    href={getDashboardUrl()}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    {user.role === "ADMIN" ? (
                      <Shield className="w-3.5 h-3.5 text-primary-500" />
                    ) : user.role === "STAFF" ? (
                      <Wrench className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    My Portal
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    Settings & Profile
                  </Link>

                  {(user.role === "ADMIN" || user.role === "STAFF") && (
                    <Link
                      href="/admin/qr-codes"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                      Room QR Directory
                    </Link>
                  )}

                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border px-4 py-3 bg-background space-y-2">
          {user && (
            <Link
              href={getDashboardUrl()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/issues"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
          >
            Browse Issues
          </Link>
          <Link
            href="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
          >
            Interactive Campus Map
          </Link>
          <Link
            href="/qr"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted text-primary-600 dark:text-primary-400 font-semibold"
          >
            <span className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-500" />
              QR Generator &amp; Directory
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              New
            </span>
          </Link>
          <Link
            href="/facilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
          >
            Campus Facilities
          </Link>
          <Link
            href="/transport"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
          >
            Transport &amp; Bus Routes
          </Link>
          <Link
            href="/clubs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
          >
            Student Clubs
          </Link>
          <Link
            href="/team"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
          >
            Project Team (Kanhaiya, Rishav, Badri)
          </Link>
          {/* Highlighted Action Buttons for Mobile Users */}
          <div className="pt-3 pb-1 space-y-2.5 border-t border-border/80">
            {/* 1. Highlighted: Official College Support & Helplines */}
            <Link
              href="/support"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 dark:from-rose-950/60 dark:via-pink-950/40 dark:to-rose-950/60 border-2 border-rose-300 dark:border-rose-700/80 hover:border-rose-400 dark:hover:border-rose-600 text-rose-700 dark:text-rose-300 font-bold text-sm shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/80 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                  <LifeBuoy className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <span>Official College Support &amp; Helplines</span>
              </div>
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            </Link>

            {/* 2. Highlighted: + Report New Issue */}
            <Link
              href="/issues/report"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-4 h-4 text-white" />
                </div>
                <span>+ Report New Issue</span>
              </div>
              <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Fast 30s
              </span>
            </Link>

            {/* Location QR Scanner */}
            <Link
              href="/scan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Location / Room QR Code</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
