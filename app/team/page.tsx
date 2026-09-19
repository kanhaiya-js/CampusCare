import React from "react";
import Link from "next/link";
import {
  Code2,
  Search,
  Presentation,
  Users,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Layers,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Project Team | CampusCare — GL Bajaj",
  description:
    "Meet the development and research team behind CampusCare at G.L. Bajaj Institute of Technology & Management: Kanhaiya (Lead Developer), Rishav (Project Researcher), and Badri (Supporter & Presentation Specialist).",
};

export default function TeamPage() {
  const teamMembers = [
    {
      name: "Kanhaiya",
      role: "Lead Developer",
      tagline: "Full-Stack Architecture & Systems Development",
      highlight: "Built Complete Frontend & Backend",
      color: "indigo",
      avatarInitials: "K",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      avatarBg: "from-indigo-600 to-blue-600",
      icon: Code2,
      summary:
        "Engineered the complete architecture of CampusCare from the ground up, implementing end-to-end frontend interfaces, server-side APIs, database schemas, and real-time interaction systems.",
      contributions: [
        "Full-Stack Development: Built all Next.js 14 App Router pages, server components, and dynamic client interactions.",
        "Backend & Database: Designed the Prisma ORM schema, SQLite/Postgres database relations, and secure REST API route handlers.",
        "Authentication & Security: Implemented JWT session cookies, RBAC authorization (Student, Staff, Admin), and sensitive subject filtering.",
        "Interactive Systems: Created the SVG Interactive Campus Map, dynamic 4-step issue reporting wizard, and real-time SLA escalation timers.",
        "UI/UX Design: Engineered modern dark/light glassmorphic styling, custom Tailwind themes, and smooth micro-animations.",
      ],
      skills: ["Next.js 14", "React", "TypeScript", "Prisma ORM", "Node.js", "Tailwind CSS", "JWT Auth", "REST APIs"],
    },
    {
      name: "Rishav",
      role: "Project Researcher",
      tagline: "Campus Operations & Requirement Discovery",
      highlight: "Project Researcher",
      color: "emerald",
      avatarInitials: "R",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      avatarBg: "from-emerald-600 to-teal-600",
      icon: Search,
      summary:
        "Led on-ground campus requirement discovery, surveying GLBITM students and staff to map facility problem workflows, SLA expectations, and institutional support channels.",
      contributions: [
        "Campus Requirement Discovery: Gathered real-world problem statements across GL Bajaj Academic Blocks (AB-1, AB-2, AB-3, AB-4) and hostels.",
        "Workflow Analysis: Mapped incident reporting lifecycle from initial student logging to departmental dispatch and resolution confirmation.",
        "Institutional Policy Mapping: Designed categorization criteria separating physical maintenance from statutory student welfare channels.",
        "User Feedback & Testing: Conducted testing iterations with peer students to validate issue reporting usability and ease of navigation.",
        "SLA & Priority Benchmarking: Researched standard response turnaround times for electrical, plumbing, IT, and HVAC issues.",
      ],
      skills: ["Campus Research", "Requirement Analysis", "User Workflow Mapping", "SLA Benchmarking", "Institutional Policy"],
    },
    {
      name: "Badri",
      role: "Supporter & Presentation Specialist",
      tagline: "Pitch Decks, PPT Maker & Documentation",
      highlight: "Supporter & Presentation, PPT Maker",
      color: "purple",
      avatarInitials: "B",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      avatarBg: "from-purple-600 to-pink-600",
      icon: Presentation,
      summary:
        "Crafted the project pitch materials, slide presentations, and academic demonstration assets, providing core support throughout development and reviews.",
      contributions: [
        "Presentation & PPT Design: Authored structured slide decks, infographics, and pitch decks for institutional project evaluations.",
        "Project Demonstration Support: Assisted in live system demonstrations, feature walkthroughs, and presentation delivery.",
        "Visual Documentation: Prepared project diagrams, process flowcharts, and executive summaries for academic submissions.",
        "Cross-Functional Support: Coordinated testing feedback, proofreading documentation, and validating user-facing copy.",
        "Academic Review Alignment: Ensured project deliverables aligned with institutional evaluation rubrics and presentation guidelines.",
      ],
      skills: ["PPT Design", "Project Pitching", "Visual Documentation", "Flowcharting", "Academic Review Support"],
    },
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <div className="flex items-center gap-2.5">
          <Link href="/presentation">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold border-primary-500/30 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10">
              <Presentation className="w-3.5 h-3.5 text-primary-500" />
              Launch Project PPT Deck
            </Button>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/80 dark:border-primary-800/80">
            <GraduationCap className="w-3.5 h-3.5" />
            GL Bajaj Institute of Technology &amp; Management
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
          <Users className="w-3.5 h-3.5" />
          Meet the Innovators
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-orbitron tracking-tight text-foreground">
          The Team Behind <span className="text-primary-600 dark:text-primary-400">CampusCare</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Engineered as part of the Institutional Project Initiative at <strong>GL Bajaj (GLBITM Greater Noida)</strong> to digitize, transparently track, and resolve campus infrastructure maintenance.
        </p>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {teamMembers.map((member) => {
          const Icon = member.icon;
          return (
            <div
              key={member.name}
              className="relative group rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${member.avatarBg}`}
              />

              <div className="space-y-5">
                {/* Avatar & Badges */}
                <div className="flex items-start justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.avatarBg} text-white flex items-center justify-center text-xl font-bold font-orbitron shadow-md`}
                  >
                    {member.avatarInitials}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${member.badgeColor}`}
                  >
                    <Icon className="w-3 h-3" />
                    {member.highlight}
                  </span>
                </div>

                {/* Name & Role Title */}
                <div>
                  <h3 className="text-xl font-bold font-orbitron text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                    {member.role}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {member.tagline}
                  </p>
                </div>

                {/* Summary */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {member.summary}
                </p>

                {/* Core Contributions */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground block">
                    Key Contributions:
                  </span>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {member.contributions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skill Tags */}
              <div className="pt-6 border-t border-border/60 mt-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Specializations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground/80 border border-border/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Overview Banner */}
      <div className="rounded-2xl border border-primary-200 dark:border-primary-900 bg-gradient-to-br from-primary-50/70 via-card to-primary-100/30 dark:from-primary-950/40 dark:via-card dark:to-primary-950/20 p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Project Mission &amp; Institutional Vision
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-foreground">
              Empowering 10,000+ Students &amp; Faculty at GL Bajaj
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              CampusCare was created to replace outdated manual complaints and delayed maintenance logs with an automated, transparent, digital problem resolution ecosystem. Engineered with modern full-stack web standards, the system features instant issue dispatch, SLA escalations, campus interactive map navigation, and student privacy safeguards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-stretch sm:items-center lg:items-end">
            <Link href="/presentation" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto gap-2 shadow-md bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 text-white border-0 hover:opacity-95">
                <Presentation className="w-4 h-4" />
                Launch Project Presentation PPT
              </Button>
            </Link>
            <Link href="/map" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <Layers className="w-4 h-4" />
                Interactive Campus Map
              </Button>
            </Link>
            <Link href="/issues/report" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto gap-2 text-xs text-muted-foreground hover:text-foreground">
                <ShieldCheck className="w-4 h-4" />
                Report an Issue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
