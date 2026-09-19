"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const initialEmail = searchParams.get("email") || "";

  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("Password123!");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error?.message || "Invalid credentials. Please try again.");
        toastError(data.error?.message || "Login failed");
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

  const fillCredentials = (e: string, p: string = "Password123!") => {
    setEmail(e);
    setPassword(p);
  };

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

      {/* Demo Credentials Quick Switcher */}
      <div className="mb-6 p-3.5 rounded-xl border border-primary-200 dark:border-primary-900 bg-primary-50/50 dark:bg-primary-950/30">
        <p className="text-[11px] font-bold text-primary-900 dark:text-primary-300 uppercase tracking-wider mb-2">
          Demo Accounts (1-Click Quick Fill)
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => fillCredentials("aarav.sharma@glbitm.edu")}
            className="px-2 py-1.5 rounded bg-card hover:bg-muted border border-border text-[11px] font-semibold text-foreground transition-colors text-center"
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => fillCredentials("electrician@glbitm.edu")}
            className="px-2 py-1.5 rounded bg-card hover:bg-muted border border-border text-[11px] font-semibold text-foreground transition-colors text-center"
          >
            🔧 Staff
          </button>
          <button
            type="button"
            onClick={() => fillCredentials("admin@glbitm.edu")}
            className="px-2 py-1.5 rounded bg-card hover:bg-muted border border-border text-[11px] font-semibold text-foreground transition-colors text-center"
          >
            🏛️ Admin
          </button>
        </div>
      </div>

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
            placeholder="e.g. aarav.sharma@glbitm.edu"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground">Password</label>
            <span className="text-[11px] text-muted-foreground">Default: Password123!</span>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full mt-2" isLoading={isLoading}>
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
