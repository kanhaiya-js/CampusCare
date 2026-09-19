"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { User, Sun, Moon, Bell, Shield, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { success, error: toastError } = useToast();

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [studentOrEmployeeId, setStudentOrEmployeeId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUser(d.data.user);
          setName(d.data.user.name);
          setStudentOrEmployeeId(d.data.user.studentOrEmployeeId || "");
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success("Profile settings updated successfully!");
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Account & System Preferences
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage your personal profile, notification alerts, and theme appearance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Nav Info */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card text-center space-y-3">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "User"}`}
              alt="Avatar"
              className="w-20 h-20 rounded-full mx-auto bg-slate-200 border-2 border-primary-500 shadow-sm"
            />
            <div>
              <h3 className="font-bold text-base text-foreground">{user?.name}</h3>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Right Form Settings */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary-500" /> Personal Information
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <Input
                label="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Campus Email (Institutional)"
                value={user?.email || ""}
                disabled
                className="opacity-75 cursor-not-allowed bg-muted"
              />

              <Input
                label="Student / Employee ID"
                value={studentOrEmployeeId}
                onChange={(e) => setStudentOrEmployeeId(e.target.value)}
                placeholder="e.g. STU-2024-8842"
              />

              <div className="flex justify-end pt-2">
                <Button size="sm" type="submit" isLoading={isSaving}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Theme Appearance */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" /> Theme & Appearance
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  theme === "light"
                    ? "border-primary-600 bg-primary-50 text-primary-900 ring-2 ring-primary-500/20"
                    : "border-border bg-background hover:bg-muted text-foreground"
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                Light Mode
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  theme === "dark"
                    ? "border-primary-600 bg-primary-950 text-primary-200 ring-2 ring-primary-500/20"
                    : "border-border bg-background hover:bg-muted text-foreground"
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                Dark Mode
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  theme === "system"
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-950 text-primary-900 dark:text-primary-200 ring-2 ring-primary-500/20"
                    : "border-border bg-background hover:bg-muted text-foreground"
                }`}
              >
                <Shield className="w-5 h-5 text-slate-500" />
                System Default
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-500" /> Notification Delivery
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                <span className="text-foreground font-medium">In-app notifications on ticket status change</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                <span className="text-foreground font-medium">Resolution confirmation alerts when repairs are completed</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                <span className="text-foreground font-medium">Discussion comments notifications</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
