"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const { success, error: toastError } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Failed to process request. Please try again.");
        toastError(data.error?.message || "Request failed");
        return;
      }

      setIsSubmitted(true);
      success("Password recovery instructions generated.");
    } catch {
      setErrorMessage("A network error occurred. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-blue-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Password Recovery</h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Enter your campus email address to receive password reset instructions.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                <p className="font-semibold">Reset request registered</p>
                <p>
                  If an active account exists for <strong>{email}</strong>, a secure password reset token has been issued. Valid for 15 minutes.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
                <Button className="w-full">
                  Enter Reset Token <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Campus Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@glbitm.edu"
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full mt-2" isLoading={isLoading}>
              Send Reset Instructions <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <div className="mt-4 text-center">
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
    </div>
  );
}
