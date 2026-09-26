"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || "";

  const { success, error: toastError } = useToast();

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!hasMinLength || !hasLetter || !hasNumberOrSymbol) {
      setErrorMessage("Please ensure your password satisfies all security requirements.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Failed to reset password. The token may be expired or invalid.");
        toastError(data.error?.message || "Reset failed");
        return;
      }

      setIsSuccess(true);
      success("Password successfully changed.");
    } catch {
      setErrorMessage("Network error occurred. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-blue-400">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Set New Password</h1>
        <p className="text-xs text-muted-foreground mt-1.5">
          Enter your recovery token and select a strong replacement password.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {isSuccess ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
              <p className="font-semibold">Password updated successfully</p>
              <p>Your password has been changed and all prior active sessions have been invalidated.</p>
            </div>
          </div>

          <Button onClick={() => router.push("/login")} className="w-full mt-2">
            Proceed to Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Reset Token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste the 64-character token"
              required
            />
          </div>

          <div>
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
            />
          </div>

          <div>
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
              required
            />
          </div>

          {/* Password strength checklist */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs space-y-1.5">
            <div className="font-medium text-foreground text-[11px] mb-1">Password Requirements:</div>
            <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
              <Check className="w-3.5 h-3.5" /> At least 8 characters
            </div>
            <div className={`flex items-center gap-1.5 ${hasLetter ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
              <Check className="w-3.5 h-3.5" /> Contains at least one letter
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumberOrSymbol ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
              <Check className="w-3.5 h-3.5" /> Contains at least one number or symbol
            </div>
            {confirmPassword.length > 0 && (
              <div className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                <Check className="w-3.5 h-3.5" /> Passwords match
              </div>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full mt-2" isLoading={isLoading}>
            Update Password <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <Suspense fallback={<div className="text-xs text-muted-foreground">Loading form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
