"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Home,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  Wrench,
  Shield,
  ShieldCheck,
  Zap,
  Users,
  Clock,
  BarChart3,
  Award,
  BookOpen,
  ArrowRight,
  Laptop,
  Check,
  Building2,
  PhoneCall,
  Bus,
  FileText,
  HelpCircle,
  QrCode,
  Cpu,
  Radio,
  Smartphone,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Slide {
  id: number;
  tag: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  notes: string;
}

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const slides: Slide[] = [
    // Slide 1: Title
    {
      id: 1,
      tag: "Title & Cover",
      title: "CampusCare - GL Bajaj",
      subtitle: "Autonomous Campus Facility Maintenance & Problem Resolution Ecosystem",
      notes:
        "Welcome professors and evaluators. Today we are presenting CampusCare, an institutional digital platform designed specifically for GLBITM Greater Noida to modernize physical maintenance and issue resolution.",
      content: (
        <div className="space-y-6 text-center max-w-3xl mx-auto py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
            <Award className="w-3.5 h-3.5" />
            Innovative Vocational Project (IVD 2026)
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-orbitron tracking-tight text-foreground">
              CampusCare
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-primary-600 dark:text-primary-400">
              Report. Track. Resolve. Improve.
            </p>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            A next-generation, transparent operations ecosystem engineered for{" "}
            <strong>10,000+ students, faculty, and maintenance staff</strong> at G.L. Bajaj Institute of Technology & Management.
          </p>

          {/* Team Recognition Card */}
          <div className="pt-4">
            <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md max-w-2xl mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                Project Creators &amp; Presenters:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
                  <p className="font-bold text-xs text-foreground">Kanhaiya</p>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">Lead Developer</p>
                  <p className="text-[10px] text-muted-foreground">Frontend &amp; Backend Systems</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                  <p className="font-bold text-xs text-foreground">Rishav</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Project Researcher</p>
                  <p className="text-[10px] text-muted-foreground">Field Study &amp; Operations SLA</p>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
                  <p className="font-bold text-xs text-foreground">Badri</p>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">Supporter &amp; Presentation</p>
                  <p className="text-[10px] text-muted-foreground">PPT Maker &amp; Pitch Specialist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 2: The Problem
    {
      id: 2,
      tag: "Problem Statement",
      title: "The Problem We Are Solving",
      subtitle: "Why Traditional Campus Maintenance Fails in Large Educational Institutions",
      notes:
        "Large campuses face severe operational bottlenecks: paper registers get lost, students don't know who to tell, and technicians waste time locating the exact room or switchboard. There is zero SLA accountability.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto py-2">
          <div className="p-5 rounded-xl border border-red-200/80 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 space-y-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              1. Fragmented &amp; Manual Reporting
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Students and professors rely on paper registers at reception or verbal complaints to floor peons. Complaints frequently get forgotten, lost, or delayed for days without any log.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Clock className="w-4 h-4" />
              2. Zero Status Visibility &amp; SLA Tracking
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Once an issue is reported, students have no way to know if an electrician or plumber was dispatched. Critical lecture hall AC or projector failures disrupt academic schedules.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <MapPin className="w-4 h-4" />
              3. Spatial Ambiguity &amp; Large Campus Layout
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              GLBITM spans multiple high-density blocks (AB-1, AB-2, AB-3, AB-4, Library, Hostels). Maintenance workers waste 30+ minutes simply trying to locate which lab or switchboard is broken.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              4. Grievance Misrouting &amp; Safeguards
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sensitive issues (harassment, anti-ragging, or medical emergencies) cannot be treated like broken taps. Without intelligent filtering, critical safety complaints get misrouted.
            </p>
          </div>
        </div>
      ),
    },

    // Slide 3: The Solution
    {
      id: 3,
      tag: "Solution Overview",
      title: "Introducing CampusCare",
      subtitle: "A Unified, Automated Infrastructure Problem Resolution Ecosystem",
      notes:
        "CampusCare solves this by creating a modern, centralized digital bridge between students, faculty, specialized technicians, and campus leadership.",
      content: (
        <div className="space-y-6 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/30 space-y-2">
              <Zap className="w-7 h-7 text-primary-600 dark:text-primary-400 mx-auto" />
              <h3 className="text-sm font-bold text-foreground">Under 60s Reporting</h3>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Intuitive 4-step wizard with location selectors, photo uploads, and priority tags.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2">
              <Layers className="w-7 h-7 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <h3 className="text-sm font-bold text-foreground">Interactive Campus Map</h3>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Visual SVG spatial map of GLBITM blocks, labs, corridors, and facility locations.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-2">
              <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-foreground">Institutional Safeguards</h3>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Real-time keyword analysis redirecting statutory emergencies to official helplines.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary-500" />
              Complete Lifecycle Transparency
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              From the instant a student files an issue, CampusCare generates a tracking ticket, assigns target resolution SLAs (e.g. 2 hours for urgent electrical faults), routes the ticket to the specialized maintenance department, and logs timestamped status updates.
            </p>
          </div>
        </div>
      ),
    },

    // Slide 4: System Architecture & Workflow
    {
      id: 4,
      tag: "Working & Architecture",
      title: "How CampusCare Works: End-to-End Flow",
      subtitle: "From Issue Detection to Verified Resolution",
      notes:
        "Here is the exact technical pipeline: User submits -> Safety check executes -> Automated routing assigns technician -> SLA timer begins -> Technician updates status -> Resolution verified.",
      content: (
        <div className="space-y-4 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-3 rounded-lg border border-border bg-card text-center space-y-1.5">
              <span className="w-6 h-6 rounded-md bg-primary-600 text-white font-bold inline-flex items-center justify-center text-[10px]">
                1
              </span>
              <p className="font-bold text-foreground">Student Reports</p>
              <p className="text-[10px] text-muted-foreground">Selects block, floor, category &amp; evidence</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card text-center space-y-1.5">
              <span className="w-6 h-6 rounded-md bg-primary-600 text-white font-bold inline-flex items-center justify-center text-[10px]">
                2
              </span>
              <p className="font-bold text-foreground">Safety Screening</p>
              <p className="text-[10px] text-muted-foreground">Detects statutory terms &amp; guards scope</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card text-center space-y-1.5">
              <span className="w-6 h-6 rounded-md bg-primary-600 text-white font-bold inline-flex items-center justify-center text-[10px]">
                3
              </span>
              <p className="font-bold text-foreground">Auto Dispatch</p>
              <p className="text-[10px] text-muted-foreground">Categorized to Electric/Plumb/IT queue</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card text-center space-y-1.5">
              <span className="w-6 h-6 rounded-md bg-primary-600 text-white font-bold inline-flex items-center justify-center text-[10px]">
                4
              </span>
              <p className="font-bold text-foreground">Staff Action</p>
              <p className="text-[10px] text-muted-foreground">Technician works with live SLA timer</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card text-center space-y-1.5">
              <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[10px]">
                5
              </span>
              <p className="font-bold text-foreground">Resolved &amp; Logged</p>
              <p className="text-[10px] text-muted-foreground">Student notified, analytics recorded</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3.5 rounded-lg border border-border/70 bg-card/60 space-y-1.5">
              <p className="font-bold text-primary-600 dark:text-primary-400">Automated SLA Clock Engine</p>
              <p className="text-muted-foreground">
                Urgent tickets trigger a 2-hour countdown. Medium tasks receive 6-12 hours. If unserviced, tickets automatically escalate to the Maintenance Supervisor with alert notifications.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border/70 bg-card/60 space-y-1.5">
              <p className="font-bold text-primary-600 dark:text-primary-400">Multi-Role JWT Session Security</p>
              <p className="text-muted-foreground">
                Zero credential leaks. Custom middleware verifies RBAC claims (Student, Maintenance Staff, Institutional Admin) with multi-cookie backwards-compatible failovers.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 5: Core Features
    {
      id: 5,
      tag: "Feature Breakdown",
      title: "Key Feature Showcase",
      subtitle: "Designed Specially for GL Bajaj Campus Operations",
      notes:
        "Walk through the key modules: The Interactive Map, 4-step wizard, Transport tracker, Clubs logistics, and Support portal.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto py-2">
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-foreground">Interactive Campus Map</h4>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Interactive vector map of Academic Blocks 1-4, Central Library, Hostels, and Cafeterias with pin-point location tagging.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-foreground">Smart Report Wizard</h4>
            <p className="text-[11px] text-muted-foreground leading-tight">
              4-step frictionless submission: Category Selection → Location Specifier → Photo/Description Evidence → Instant Confirmation.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-foreground">Transport Fleet Hub</h4>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Tracks 12+ GLBITM institute bus routes across Noida, Greater Noida, Delhi &amp; Ghaziabad with bus maintenance reporting.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-foreground">Student Clubs Logistics</h4>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Enables student societies (Rotaract, IEEE, Coding Club, Cultural) to reserve microphones, projectors &amp; auditorium lighting.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-foreground">Institutional Support</h4>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Zero tolerance safeguard portal connecting directly to Anti-Ragging Committee, ICC, YourDOST Mental Health &amp; Dispensary.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-foreground">Admin Command Center</h4>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Real-time analytics, technician workload metrics, SLA compliance graphs, and one-click CSV report exports.
            </p>
          </div>
        </div>
      ),
    },

    // Slide 6: Stakeholder Benefits
    {
      id: 6,
      tag: "Benefits & Value",
      title: "Benefits for Institutional Stakeholders",
      subtitle: "Measurable Impact Across Students, Staff, and Leadership",
      notes:
        "Every group gains substantial value: Students get quick resolutions, technicians get organized digital tasks, and college leadership gets data for NAAC / NIRF accreditation audits.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto py-2">
          <div className="p-5 rounded-xl border border-primary-200 dark:border-primary-800 bg-card space-y-3">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-sm">
              <Users className="w-4 h-4" />
              For Students &amp; Faculty
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span>Zero paperwork: report faults in seconds from smartphone or laptop.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span>Live notification updates when technicians inspect and finish.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span>Guaranteed SLA response times for classroom lighting, ACs, and projectors.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-800 bg-card space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Wrench className="w-4 h-4" />
              For Maintenance Staff
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Digital task queue organized strictly by priority and exact room.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Photo evidence eliminates diagnostic guesswork before visiting site.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Clear record of completed jobs proves productivity and technician effort.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-card space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Building2 className="w-4 h-4" />
              For College Leadership
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Comprehensive campus infrastructure audit trail for NAAC &amp; NIRF.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Identifies repeat failure zones (e.g. chronic AC faults in AB-2).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Enhances campus reputation, student satisfaction, and safety.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },

    // Slide 7: Tech Stack
    {
      id: 7,
      tag: "Technology Stack",
      title: "Full-Stack Technology Architecture",
      subtitle: "Engineered with Enterprise-Grade Standards",
      notes:
        "We built CampusCare using industry standards: Next.js 14 App Router, TypeScript, Prisma ORM, Jose JWT, and modern Tailwind CSS with custom glassmorphism.",
      content: (
        <div className="space-y-4 max-w-4xl mx-auto py-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
              <p className="font-orbitron font-bold text-xs text-primary-600">Next.js 14</p>
              <p className="text-[10px] text-muted-foreground">App Router &amp; Server Components</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
              <p className="font-orbitron font-bold text-xs text-blue-500">TypeScript</p>
              <p className="text-[10px] text-muted-foreground">Strict Type Safety Across APIs</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
              <p className="font-orbitron font-bold text-xs text-emerald-500">Prisma ORM</p>
              <p className="text-[10px] text-muted-foreground">SQLite Dev &amp; PostgreSQL Prod</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
              <p className="font-orbitron font-bold text-xs text-indigo-500">Tailwind CSS</p>
              <p className="text-[10px] text-muted-foreground">Glassmorphism &amp; Dark/Light Mode</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-2">
            <span className="text-xs font-bold text-foreground block">Engineering Highlights:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span>Dual database support: instant offline SQLite prototyping and scalable PostgreSQL deployment.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span>Zero third-party runtime bloat; high performance with fast TTFB.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span>Encrypted JWT cookies with multi-level fallback verification protecting logged-in sessions.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                <span>Responsive vector interactive maps rendered cleanly on mobile screens and desktop monitors.</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 8: Team Roles & Execution
    {
      id: 8,
      tag: "Project Team",
      title: "Team Roles & Division of Work",
      subtitle: "Collaborative Execution for GLBITM IVD Project",
      notes:
        "Highlight the individual contributions: Kanhaiya engineered the full-stack code, Rishav performed on-ground campus research, and Badri authored the presentations and visual pitch materials.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto py-2">
          <div className="p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-card/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold font-orbitron flex items-center justify-center text-base">
              K
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Kanhaiya</h4>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Lead Developer</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Frontend &amp; Backend Engineering</p>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3">
              <li>• Built Next.js 14 App Router &amp; API routes</li>
              <li>• Designed Prisma ORM models &amp; DB migrations</li>
              <li>• Implemented JWT authentication &amp; RBAC</li>
              <li>• Developed Interactive Campus Map &amp; Report Wizard</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-card/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold font-orbitron flex items-center justify-center text-base">
              R
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Rishav</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Project Researcher</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Campus Discovery &amp; SLA Design</p>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3">
              <li>• On-ground student problem surveys in GLBITM</li>
              <li>• Mapped problem workflows across blocks AB-1 to 4</li>
              <li>• Defined SLA resolution benchmarks &amp; priorities</li>
              <li>• Tested student usability &amp; feedback loops</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-card/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold font-orbitron flex items-center justify-center text-base">
              B
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Badri</h4>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Supporter &amp; Presentation</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">PPT Maker &amp; Pitch Specialist</p>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3">
              <li>• Authored project presentation slide decks</li>
              <li>• Designed visual pitch materials &amp; flow diagrams</li>
              <li>• Coordinated live system demonstration delivery</li>
              <li>• Aligned project deliverables with evaluation rubrics</li>
            </ul>
          </div>
        </div>
      ),
    },

    // Slide 9: Future Scope & Roadmap
    {
      id: 9,
      tag: "Future Roadmap",
      title: "Future Scope & Scale-Up Vision",
      subtitle: "Where We Are Taking CampusCare Next",
      notes:
        "Present the future enhancements: IoT hardware sensors, QR code physical stickers on every desk, and AI-assisted damage severity detection.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto py-2">
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs">
              <QrCode className="w-4 h-4" />
              1. QR-Code Desk &amp; Room Integration
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Placing waterproof QR code stickers on classroom desks, projector stands, and water coolers. Scanning the QR code immediately pre-fills the exact block, floor, and room number for 10-second reporting.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs">
              <Cpu className="w-4 h-4" />
              2. Automated Diagnostics &amp; Damage Categorization
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Integrating an automated heuristic inspection model to parse submitted details (e.g. electrical hazard vs cosmetic defect), automatically predicting urgency and necessary replacement parts.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs">
              <Radio className="w-4 h-4" />
              3. IoT Hardware Sensor Integration
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connecting smart water-level sensors in hostel overhead tanks and power-phase sensors in substation panels to autonomously log maintenance tickets before students even notice an outage.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs">
              <Smartphone className="w-4 h-4" />
              4. Mobile Native App (PWA &amp; Push)
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Full Progressive Web App (PWA) with push notifications for instant alerts to on-duty electricians and plumbers on their phones when urgent tickets arrive.
            </p>
          </div>
        </div>
      ),
    },

    // Slide 10: Conclusion & Q&A
    {
      id: 10,
      tag: "Conclusion & Q&A",
      title: "Thank You & Open for Q&A",
      subtitle: "Empowering GL Bajaj with Smart Campus Care",
      notes:
        "Conclude with confidence. Invite questions from the jury. All team members are ready to answer technical, architectural, and operational questions.",
      content: (
        <div className="space-y-6 text-center max-w-3xl mx-auto py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Project Live &amp; Fully Functional
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-orbitron text-foreground">
              Transforming Campus Operations Today
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              CampusCare proves how thoughtful engineering and clear student-centric design can modernize physical college infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/" target="_blank">
              <Button variant="primary" className="gap-2 shadow-md">
                <Laptop className="w-4 h-4" />
                Live Demo: CampusCare
              </Button>
            </Link>
            <Link href="/team">
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Meet the Team
              </Button>
            </Link>
            <Link href="/map" target="_blank">
              <Button variant="outline" className="gap-2">
                <MapPin className="w-4 h-4" />
                Interactive Map
              </Button>
            </Link>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card/60 max-w-lg mx-auto text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Evaluation &amp; Review Contacts:</p>
            <p>GL Bajaj Institute of Technology &amp; Management, Greater Noida</p>
            <p className="text-[11px] mt-1 text-primary-600 dark:text-primary-400 font-medium">
              Kanhaiya (Lead Dev) • Rishav (Research) • Badri (Presentation &amp; Support)
            </p>
          </div>
        </div>
      ),
    },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const activeSlide = slides[currentSlide];

  return (
    <div className={`min-h-screen flex flex-col bg-background text-foreground ${isFullscreen ? "p-4 sm:p-8" : "p-4 sm:p-6 lg:p-8"}`}>
      {/* Top Controls Bar */}
      <header className="flex items-center justify-between pb-4 border-b border-border/80 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Back to App
          </Link>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5 text-xs font-bold font-orbitron text-primary-600 dark:text-primary-400">
            <Presentation className="w-3.5 h-3.5" />
            CampusCare Presentation Deck
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs gap-1.5 h-8"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {showNotes ? "Hide Notes" : "Speaker Notes"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullscreen}
            className="text-xs gap-1.5 h-8"
            title="Toggle Fullscreen (Key: F)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </Button>
        </div>
      </header>

      {/* Slide Progress Indicator */}
      <div className="max-w-7xl mx-auto w-full pt-3 pb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5 font-medium">
          <span className="uppercase tracking-wider text-[11px] font-bold text-primary-600 dark:text-primary-400">
            Slide {currentSlide + 1} of {slides.length} - {activeSlide.tag}
          </span>
          <span className="text-[11px]">Use ← / → keys to navigate</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 via-indigo-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Slide Card Container */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full my-auto py-4">
        <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-md shadow-2xl p-6 sm:p-10 flex flex-col justify-between min-h-[520px] relative overflow-hidden transition-all duration-300">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 via-indigo-500 to-indigo-500" />

          {/* Slide Header */}
          <div className="space-y-1 mb-4 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              {activeSlide.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-orbitron tracking-tight text-foreground">
              {activeSlide.title}
            </h2>
            {activeSlide.subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {activeSlide.subtitle}
              </p>
            )}
          </div>

          {/* Slide Dynamic Content */}
          <div className="flex-1 flex flex-col justify-center my-auto">
            {activeSlide.content}
          </div>

          {/* Speaker Notes Drawer (if enabled) */}
          {showNotes && (
            <div className="mt-6 pt-4 border-t border-border/80 bg-muted/40 rounded-xl p-3.5 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                Speaker Pitch Note (What Badri or Kanhaiya can say):
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "{activeSlide.notes}"
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Slide Navigation Bar */}
      <footer className="flex items-center justify-between pt-4 border-t border-border/80 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-1 overflow-x-auto max-w-[50vw] sm:max-w-md py-1">
          {slides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(index)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                currentSlide === index
                  ? "bg-primary-600 text-white shadow-sm scale-105"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
              title={s.title}
            >
              {s.id}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((prev) => prev - 1)}
            className="text-xs gap-1 h-9"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            disabled={currentSlide === slides.length - 1}
            onClick={() => setCurrentSlide((prev) => prev + 1)}
            className="text-xs gap-1 h-9 shadow-sm"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
