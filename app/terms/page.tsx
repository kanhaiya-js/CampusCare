import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | CampusCare",
  description:
    "Terms and Conditions for CampusCare, the campus facility issue reporting platform at G.L. Bajaj Institute of Technology and Management.",
};

export default function TermsPage() {
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
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground font-orbitron">Terms of Use</h1>
            <p className="text-xs text-muted-foreground">Last updated: September 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm text-foreground/90 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By registering for and using CampusCare, you agree to comply with these Terms of Use.
            CampusCare is an internal platform developed for G.L. Bajaj Institute of Technology and Management (GLBITM), Greater Noida,
            and is intended exclusively for use by enrolled students, faculty members, and authorized campus staff.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">2. Eligibility</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Only currently enrolled GLBITM students, faculty, and authorized maintenance staff are permitted to use CampusCare.</li>
            <li>Student accounts are self-registered. Staff and administrator accounts require approval from a campus administrator.</li>
            <li>You must provide accurate institutional information during registration.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">3. Acceptable Use</h2>
          <p>You agree to use CampusCare only for its intended purpose: reporting, tracking, and resolving campus facility issues. You must not:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Submit false, misleading, or duplicate facility reports.</li>
            <li>Upload inappropriate, offensive, or unrelated images or content.</li>
            <li>Attempt to access accounts, data, or administrative functions you are not authorized to use.</li>
            <li>Use the platform for personal disputes, harassment, or any activity unrelated to campus facility maintenance.</li>
            <li>Interfere with or disrupt the operation of the platform.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">4. Issue Reporting</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All submitted facility reports are reviewed and routed to campus maintenance teams.</li>
            <li>Reports involving safety hazards (electrical faults, water damage near wiring, structural concerns) should also be reported directly to the Campus Maintenance Control Room at Ext. 104.</li>
            <li>CampusCare is not a substitute for emergency services. For medical emergencies, contact the Campus Medical Dispensary or call emergency services immediately.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">5. Sensitive Content Safeguards</h2>
          <p>
            CampusCare includes automated keyword detection for reports that mention topics such as ragging, harassment, or personal safety.
            When such content is detected, the platform displays official GLBITM helpline numbers and statutory contact information
            instead of processing the report as a facility issue. This is a safety feature, not a replacement for official institutional channels.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">6. Intellectual Property</h2>
          <p>
            CampusCare was developed as an academic project by GLBITM students. All source code, design, and platform content
            remain the intellectual property of the project team and GLBITM. Unauthorized reproduction or distribution is not permitted.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">7. Account Suspension</h2>
          <p>
            Campus administrators reserve the right to suspend or terminate accounts that violate these terms,
            submit fraudulent reports, or misuse the platform. Users will be notified via their registered email.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">8. Limitation of Liability</h2>
          <p>
            CampusCare is provided as-is for campus facility management. GLBITM and the CampusCare project team are not
            liable for delays in maintenance resolution, data loss due to server outages, or any indirect damages
            arising from the use of the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">9. Governing Authority</h2>
          <p>
            These terms are governed by the rules and regulations of G.L. Bajaj Institute of Technology and Management
            and applicable laws of the state of Uttar Pradesh, India.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">10. Contact</h2>
          <p>
            Questions about these terms should be directed to the GLBITM campus IT administration at the Proctor Office (Block A, Room 102)
            or through the official college support channels listed on the{" "}
            <Link href="/support" className="text-primary-600 dark:text-primary-400 underline">Support page</Link>.
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
