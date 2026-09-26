"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, ShieldAlert, CheckCircle2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Turnstile, TurnstileRef } from "@/components/ui/turnstile";

export default function RegisterPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentOrEmployeeId: "",
    role: "STUDENT",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileRef>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!agreeToTerms) {
      setErrorMessage("Please agree to the Terms of Use and Privacy Policy to create your account.");
      return;
    }

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setErrorMessage("Please complete the Cloudflare security verification.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          studentOrEmployeeId: formData.studentOrEmployeeId,
          role: "STUDENT",
          turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error?.message || "Registration failed";
        setErrorMessage(errorMsg);
        toastError(errorMsg);
        turnstileRef.current?.reset();
        setTurnstileToken("");
        return;
      }

      success(`Welcome to CampusCare, ${data.data.user.name}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg p-8 rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3">
            <img
              src="/logo.png"
              alt="CampusCare"
              className="w-full h-full rounded-xl object-contain drop-shadow-md"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-primary-600" />
            Student Registration Portal
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Register Student Account
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create your GL Bajaj student profile to report campus issues and track repairs in real-time.
          </p>
        </div>

        {/* Staff & Admin Notice Callout */}
        <div className="mb-5 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            Looking for Staff or Administrator Access?
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
            Public self-registration is reserved for <strong>students only</strong>. Staff, technician, and administrative accounts are provisioned internally by college administration.
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1.5 font-semibold">
            Please contact Administrator <strong>Prabhat Sir</strong> (
            <a href="mailto:prabhat.sir@glbitm.edu" className="underline font-mono">
              prabhat.sir@glbitm.edu
            </a>
            ) or visit the Central Administration Office.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Student Registration Form */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          <Input
            label="Student Full Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Aryan Verma"
            required
          />

          <Input
            label="College Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. aryan.verma@glbitm.edu"
            required
          />

          <Input
            label="Student Roll No. / Admission ID (Optional)"
            type="text"
            value={formData.studentOrEmployeeId}
            onChange={(e) => setFormData({ ...formData, studentOrEmployeeId: e.target.value })}
            placeholder="e.g. 2201920100123 or GLB-2024-CS104"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 6 characters"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Repeat password"
              required
            />
          </div>

          {/* Terms & Conditions Agreement */}
          <div className="flex items-start gap-2.5 pt-1.5 pb-0.5">
            <input
              id="agree-terms-register"
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer accent-primary-600 shrink-0"
              required
            />
            <label htmlFor="agree-terms-register" className="text-xs text-muted-foreground leading-normal select-none cursor-pointer">
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
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <Turnstile
              ref={turnstileRef}
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
            />
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full mt-3 font-bold"
            isLoading={isLoading}
            disabled={!agreeToTerms || (Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) && !turnstileToken) || isLoading}
          >
            Create Student Account <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary-600 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
