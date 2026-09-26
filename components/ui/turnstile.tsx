"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";

export interface TurnstileRef {
  reset: () => void;
  remove: () => void;
}

interface TurnstileProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (errorCode?: string) => void;
  theme?: "auto" | "light" | "dark";
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (errorCode?: string) => void;
          "expired-callback"?: () => void;
          theme?: "auto" | "light" | "dark";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
    onTurnstileLoaded?: () => void;
  }
}

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(function Turnstile(
  {
    siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
    onVerify,
    onExpire,
    onError,
    theme = "auto",
    className = "",
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Expose imperative methods to parent form
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          console.warn("[Turnstile] Error resetting widget:", e);
        }
      }
    },
    remove: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {
          console.warn("[Turnstile] Error removing widget:", e);
        }
      }
    },
  }));

  // 1. Load Cloudflare Turnstile script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.turnstile) {
      setIsScriptReady(true);
      return;
    }

    let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkInterval = setInterval(() => {
      if (window.turnstile) {
        setIsScriptReady(true);
        clearInterval(checkInterval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  // 2. Render widget when script is ready and container is mounted
  useEffect(() => {
    if (!isScriptReady || !containerRef.current || !window.turnstile || !siteKey) {
      return;
    }

    // Cleanup existing widget if any before re-rendering
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      } catch (err) {
        // ignore
      }
    }

    try {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        size: "normal",
        callback: (token: string) => {
          setErrorMessage(null);
          onVerify(token);
        },
        "expired-callback": () => {
          onExpire?.();
        },
        "error-callback": (errorCode?: string) => {
          console.warn("[Turnstile] Challenge error code:", errorCode);
          // If domain is not yet configured for localhost in Cloudflare dashboard,
          // inform the developer clearly.
          if (errorCode === "110200") {
            setErrorMessage("Cloudflare: localhost domain is not added to this Turnstile site key.");
          }
          onError?.(errorCode);
        },
      });

      widgetIdRef.current = widgetId;
    } catch (err) {
      console.error("[Turnstile] Render error:", err);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (err) {
          // ignore
        }
      }
    };
  }, [isScriptReady, siteKey, theme, onVerify, onExpire, onError]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className={`my-2 flex flex-col items-center justify-center min-h-[65px] ${className}`}>
      <div ref={containerRef} className="flex justify-center w-full" />
      {errorMessage && (
        <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 text-center font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
});
