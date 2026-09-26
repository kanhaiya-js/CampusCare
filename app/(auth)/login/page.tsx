"use client";

import React, { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Turnstile, TurnstileRef } from "@/components/ui/turnstile";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const initialEmail = searchParams.get("email") || "";

  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!agreeToTerms) {
      setErrorMessage("Please agree to the Terms of Use and Privacy Policy to continue.");
      return;
    }

    if (!turnstileToken) {
      setErrorMessage("Please complete the Cloudflare security verification.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          "cf-turnstile-response": turnstileToken,
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Invalid credentials. Please try again.");
        toastError(data.error?.message || "Login failed");
        turnstileRef.current?.reset();
        setTurnstileToken("");
        return;
      }

      success(`Welcome back, ${data.data.user.name}!`);

      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (data.data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.data.user.role === "STAFF") {
        router.push("/staff");
      } else {
        router.push("/dashboard");
      }

      router.refresh();
    } catch (err) {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isQrRedirect =
    callbackUrl &&
    (callbackUrl.includes("locationId") ||
      callbackUrl.includes("issues/report") ||
      callbackUrl.includes("scan"));

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card shadow-xl">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-3">
          <img
            src="/logo.png"
            alt="CampusCare"
            className="w-full h-full rounded-xl object-contain drop-shadow-md"
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign In to CampusCare</h1>
        <p className="text-xs text-muted-foreground mt-1.5">
          Access your facility issue portal and campus maintenance tasks
        </p>
      </div>

      {isQrRedirect && (
        <div className="mb-6 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/40 text-xs">
          <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            Location QR Scanned - Login Required
          </div>
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
            Please authenticate with your student or staff credentials before raising an issue for this campus room.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Input
            label="Campus Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. kanhaiya.rai@glbitm.edu"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Terms & Privacy Agreement */}
        <div className="flex items-start gap-2.5 pt-1 pb-1">
          <input
            id="agree-terms-login"
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer accent-primary-600 shrink-0"
            required
          />
          <label htmlFor="agree-terms-login" className="text-xs text-muted-foreground leading-normal select-none cursor-pointer">
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {/* Cloudflare Turnstile Bot Verification */}
        <Turnstile
          action="login"
          ref={turnstileRef}
          onVerify={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken("")}
          onError={() => setTurnstileToken("")}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2 font-bold"
          isLoading={isLoading}
          disabled={!agreeToTerms || !turnstileToken || isLoading}
        >
          Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary-600 hover:underline">
          Register new student account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <Suspense fallback={<div className="text-xs text-muted-foreground">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
