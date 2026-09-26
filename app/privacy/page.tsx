import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CampusCare",
  description:
    "Privacy Policy for CampusCare, the campus facility issue reporting platform at G.L. Bajaj Institute of Technology and Management.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Button>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground font-orbitron">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground">Last updated: September 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">1. Introduction</h2>
          <p>
            CampusCare is operated by and for G.L. Bajaj Institute of Technology and Management (GLBITM), Greater Noida.
            This Privacy Policy explains how we collect, use, store, and protect your personal information when you use the CampusCare platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
          <p>When you register and use CampusCare, we collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account information:</strong> Name, institutional email address, student or employee ID, department, and year of study.</li>
            <li><strong>Issue reports:</strong> Titles, descriptions, photos, and location details you submit when reporting a facility issue.</li>
            <li><strong>Usage data:</strong> Login timestamps and pages visited within the platform for operational monitoring.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">3. How We Use Your Information</h2>
          <p>Your information is used exclusively for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Routing facility issue reports to the appropriate campus maintenance staff.</li>
            <li>Providing status updates and notifications about your reported issues.</li>
            <li>Generating anonymous, aggregate facility analytics for campus administration.</li>
            <li>Authenticating your identity as a verified GLBITM student, faculty, or staff member.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">4. Data Storage and Security</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All data is stored on servers hosted by Render, Inc. with encryption at rest and in transit.</li>
            <li>Passwords are hashed using bcrypt and are never stored in plain text.</li>
            <li>Access to personal data is restricted to authorized campus administrators only.</li>
            <li>We do not sell, share, or transfer your personal data to any third party outside GLBITM administration.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">5. Data Retention</h2>
          <p>
            Your account data and issue reports are retained for the duration of your enrollment or employment at GLBITM.
            Resolved issue records are retained for institutional audit and facility planning purposes.
            You may request deletion of your account by contacting the campus IT administrator.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">6. Your Rights</h2>
          <p>As a user of CampusCare, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Withdraw from the platform at any time.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">7. Cookies and Local Storage</h2>
          <p>
            CampusCare uses HTTP-only session cookies for authentication. We do not use tracking cookies,
            advertising pixels, or any third-party analytics services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">8. Contact</h2>
          <p>
            For privacy-related inquiries, contact the GLBITM campus IT administration at the Proctor Office (Block A, Room 102)
            or through the official college support channels listed on the{" "}
            <Link href="/support" className="text-primary-600 dark:text-primary-400 underline">Support page</Link>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy as the platform evolves. Any changes will be reflected on this page with an updated revision date.
            Continued use of CampusCare after changes constitutes acceptance of the revised policy.
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-border text-xs text-muted-foreground">
        <p>G.L. Bajaj Institute of Technology and Management, Plot No. 2, APJ Abdul Kalam Road, Knowledge Park 3, Greater Noida, UP - 201306</p>
      </div>
    </div>
  );
}
