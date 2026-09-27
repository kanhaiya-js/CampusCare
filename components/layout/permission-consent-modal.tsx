"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Cookie,
  Bell,
  Camera,
  Volume2,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const PERMISSIONS_STORAGE_KEY = "campuscare_permissions_consented";

export function PermissionConsentModal() {
  const { success, info } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Permission toggles
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [allowCamera, setAllowCamera] = useState(true);
  const [allowSound, setAllowSound] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          // User is authenticated
          const consented = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
          if (!consented) {
            // Show prompt with a small delay for smooth page transition
            const timer = setTimeout(() => {
              setIsOpen(true);
            }, 800);
            return () => clearTimeout(timer);
          }
        }
      })
      .catch(() => {
        // Not authenticated or network error; suppress prompt
      });
  }, []);

  const savePermissions = async (options: {
    notifications: boolean;
    camera: boolean;
    sound: boolean;
  }) => {
    // If notifications allowed, request browser Notification API
    if (options.notifications && typeof window !== "undefined" && "Notification" in window) {
      try {
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
      } catch (err) {
        console.warn("Notification permission request error:", err);
      }
    }

    const payload = {
      essentialCookies: true,
      notifications: options.notifications,
      camera: options.camera,
      sound: options.sound,
      consentedAt: new Date().toISOString(),
    };

    localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(payload));
    setIsOpen(false);

    if (options.notifications && options.camera) {
      success("Permissions configured! Push alerts and QR camera scanning are active.");
    } else {
      info("Your privacy and device preferences have been saved.");
    }
  };

  const handleAcceptAll = () => {
    savePermissions({
      notifications: true,
      camera: true,
      sound: true,
    });
  };

  const handleSaveCustom = () => {
    savePermissions({
      notifications: allowNotifications,
      camera: allowCamera,
      sound: allowSound,
    });
  };

  const handleEssentialOnly = () => {
    savePermissions({
      notifications: false,
      camera: false,
      sound: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header with Institution Branding */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0 border border-primary-200 dark:border-primary-800">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Device Permissions &amp; Privacy Choices
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              CampusCare needs permission to deliver real-time ticket alerts, door placard QR scanning, and session authentication.
            </p>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-3 divide-y divide-border/60 text-xs">
          {/* 1. Essential Cookies */}
          <div className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-200 dark:border-emerald-800">
                <Cookie className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Essential Session Cookies</p>
                <p className="text-[11px] text-muted-foreground">
                  Secures your login token, anti-tampering hash, and active campus session.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shrink-0">
              <Lock className="w-2.5 h-2.5" /> Required
            </span>
          </div>

          {/* 2. Notifications */}
          <div className="pt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-200 dark:border-blue-800">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Status &amp; Emergency Alerts</p>
                <p className="text-[11px] text-muted-foreground">
                  Notifies you when technicians are dispatched or your reported issues are resolved.
                </p>
              </div>
            </div>
            {isCustomizing ? (
              <button
                type="button"
                onClick={() => setAllowNotifications(!allowNotifications)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  allowNotifications ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    allowNotifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            ) : (
              <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/80 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-800 shrink-0">
                Recommended
              </span>
            )}
          </div>

          {/* 3. Camera / Scanner */}
          <div className="pt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-200 dark:border-indigo-800">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Door Placard QR Camera Scanner</p>
                <p className="text-[11px] text-muted-foreground">
                  Enables camera to scan classroom, lab, or hostel door placards instantly.
                </p>
              </div>
            </div>
            {isCustomizing ? (
              <button
                type="button"
                onClick={() => setAllowCamera(!allowCamera)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  allowCamera ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    allowCamera ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            ) : (
              <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/80 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-800 shrink-0">
                Recommended
              </span>
            )}
          </div>

          {/* 4. Audio Chimes */}
          <div className="pt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 border border-amber-200 dark:border-amber-800">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Sound &amp; Chime Feedback</p>
                <p className="text-[11px] text-muted-foreground">
                  Provides subtle audio confirmation when scan succeeds or complaint is filed.
                </p>
              </div>
            </div>
            {isCustomizing ? (
              <button
                type="button"
                onClick={() => setAllowSound(!allowSound)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  allowSound ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    allowSound ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            ) : (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 shrink-0">
                Optional
              </span>
            )}
          </div>
        </div>

        {/* Toggle Customization Mode */}
        <div className="pt-1 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="text-primary-600 dark:text-primary-400 hover:underline font-semibold flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isCustomizing ? "Collapse Preferences" : "Customize Permissions Separately"}
            {isCustomizing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEssentialOnly}
            className="w-full sm:w-auto text-xs"
          >
            Essential Only
          </Button>

          {isCustomizing ? (
            <Button
              type="button"
              size="sm"
              onClick={handleSaveCustom}
              className="w-full sm:w-auto text-xs"
            >
              Save My Preferences
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto text-xs gap-1.5"
            >
              <Check className="w-4 h-4" /> Allow All &amp; Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
