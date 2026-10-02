"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Settings2, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PERMISSIONS_STORAGE_KEY = "campuscare_permissions_consented";
export const COOKIE_CONSENT_KEY = "campuscare_cookie_consent";

export function PermissionConsentModal() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    functional: true,
    notifications: true,
  });

  useEffect(() => {
    setMounted(true);

    try {
      // Check if user has already granted cookie consent
      const existingConsent =
        localStorage.getItem(COOKIE_CONSENT_KEY) ||
        localStorage.getItem(PERMISSIONS_STORAGE_KEY);

      if (existingConsent) {
        return; // Already allowed, do not prompt
      }

      // User just opened the web application: prompt gently after smooth delay
      setIsOpen(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 700);

      return () => clearTimeout(timer);
    } catch {
      // Ignore storage access errors if in restricted iframe/incognito
    }
  }, []);

  const handleSaveConsent = (type: "all" | "essential" | "custom") => {
    const isAll = type === "all";
    const allowExtra = isAll || (type === "custom" && preferences.functional);

    try {
      const payload = {
        essentialCookies: true,
        functionalCookies: allowExtra,
        notifications: isAll ? true : type === "custom" ? preferences.notifications : false,
        camera: isAll,
        sound: isAll,
        consented: true,
        consentedAt: new Date().toISOString(),
      };

      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem(COOKIE_CONSENT_KEY, isAll ? "accepted" : "essential");
    } catch {
      // Ignore storage errors
    }

    // Smooth exit animation
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 400);
  };

  if (!mounted || !isOpen) return null;

  return (
    <aside
      aria-label="Cookie & Privacy Preferences"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] transition-all duration-500 ease-out transform ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
          : "translate-y-6 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-2xl p-5 text-foreground relative">
        {/* Quick Close Button */}
        <button
          type="button"
          onClick={() => handleSaveConsent("essential")}
          aria-label="Dismiss cookie notice"
          className="absolute top-3.5 right-3.5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header & Icon */}
        <div className="flex items-start gap-3 pr-6">
          <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/70 border border-primary-200/80 dark:border-primary-800/80 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
            <Cookie className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Cookie &amp; Privacy Preferences
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              We use essential cookies to maintain secure sessions and ensure smooth campus operations. Review our{" "}
              <Link
                href="/privacy"
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Optional Expanded Customization */}
        {showPreferences && (
          <div className="mt-4 pt-3 border-t border-border/60 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
              <div className="pr-2">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Essential Session Cookies</span>
                </div>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Required for login authentication &amp; CSRF protection
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                Required
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
              <div className="pr-2">
                <span className="font-medium text-foreground block">Preferences &amp; Alerts</span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Save facility filters &amp; ticket status notification alerts
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, functional: e.target.checked }))
                }
                className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowPreferences((prev) => !prev)}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            {showPreferences ? "Simple View" : "Customize"}
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSaveConsent(showPreferences ? "custom" : "essential")}
              className="text-xs h-8 px-3"
            >
              Essential Only
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleSaveConsent("all")}
              className="text-xs h-8 px-3.5 gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
