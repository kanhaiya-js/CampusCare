"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Wrench, GraduationCap, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

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
    adminKey: "",
    specialization: "GENERAL",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (formData.role === "ADMIN" && !formData.adminKey) {
      setErrorMessage("Please enter the Admin Passkey (default: CampusCare2026)");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error?.message || "Registration failed";
        setErrorMessage(errorMsg);
        toastError(errorMsg);
        return;
      }

      success(`Welcome to CampusCare, ${data.data.user.name}!`);

      if (data.data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.data.user.role === "STAFF") {
        router.push("/staff");
      } else {
        router.push("/dashboard");
      }
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
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3">
            <img
              src="/logo.png"
              alt="CampusCare"
              className="w-full h-full rounded-xl object-contain drop-shadow-md"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Join CampusCare
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create an account to report issues, manage campus facilities, or monitor operations.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Select Account Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "STUDENT" })}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center text-center gap-1 ${
                formData.role === "STUDENT"
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300 font-semibold ring-2 ring-primary-500/20"
                  : "border-border bg-background hover:bg-muted text-muted-foreground"
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="text-xs">Student</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "STAFF" })}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center text-center gap-1 ${
                formData.role === "STAFF"
                  ? "border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 font-semibold ring-2 ring-amber-500/20"
                  : "border-border bg-background hover:bg-muted text-muted-foreground"
              }`}
            >
              <Wrench className="w-5 h-5" />
              <span className="text-xs">Staff / Tech</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "ADMIN" })}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center text-center gap-1 ${
                formData.role === "ADMIN"
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 font-semibold ring-2 ring-purple-500/20"
                  : "border-border bg-background hover:bg-muted text-muted-foreground"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs">Administrator</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Aryan Verma"
            required
          />

          <Input
            label="Campus Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. aryan.verma@glbitm.edu"
            required
          />

          {formData.role === "ADMIN" && (
            <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-300">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Admin Creation Passkey</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                To create an administrator account, enter the passkey: <code className="px-1 py-0.5 rounded bg-purple-200/50 dark:bg-purple-900/50 font-mono font-bold text-foreground">CampusCare2026</code>
              </p>
              <Input
                type="password"
                value={formData.adminKey}
                onChange={(e) => setFormData({ ...formData, adminKey: e.target.value })}
                placeholder="Enter passkey: CampusCare2026"
                required
              />
            </div>
          )}

          {formData.role === "STAFF" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">
                Maintenance Specialization
              </label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
              >
                <option value="GENERAL">General Campus Maintenance</option>
                <option value="ELECTRICAL">Electrical & Lighting</option>
                <option value="PLUMBING">Plumbing & Water Supply</option>
                <option value="HVAC">HVAC & Air Conditioning</option>
                <option value="NETWORK">IT Infrastructure & Wi-Fi</option>
                <option value="CARPENTRY">Civil & Carpentry</option>
                <option value="CLEANING">Sanitation & Housekeeping</option>
              </select>
            </div>
          )}

          <Input
            label={
              formData.role === "ADMIN"
                ? "Employee ID (Optional)"
                : formData.role === "STAFF"
                ? "Staff Badge ID (Optional)"
                : "Student Roll / Admission ID (Optional)"
            }
            type="text"
            value={formData.studentOrEmployeeId}
            onChange={(e) => setFormData({ ...formData, studentOrEmployeeId: e.target.value })}
            placeholder={
              formData.role === "ADMIN"
                ? "e.g. GLB-ADM-02"
                : formData.role === "STAFF"
                ? "e.g. GLB-STF-09"
                : "e.g. GLB-2024-CS104"
            }
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

          <Button type="submit" size="lg" className="w-full mt-3" isLoading={isLoading}>
            Create {formData.role === "ADMIN" ? "Admin" : formData.role === "STAFF" ? "Staff" : "Student"} Account <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-primary-600 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
