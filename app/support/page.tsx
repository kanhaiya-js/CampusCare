import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  HeartHandshake,
  AlertTriangle,
  Stethoscope,
  PhoneCall,
  ExternalLink,
  Lock,
  ArrowRight,
  HelpCircle,
  FileCheck2,
  Building2,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Official College Support | CampusCare - GL Bajaj",
  description:
    "Official institutional support channels, Anti-Ragging, ICC, YourDOST mental health support, medical care, and student welfare at GLBITM Greater Noida.",
};

export default function SupportPage() {
  const officialChannels = [
    {
      title: "Anti-Ragging Committee & Squad",
      badge: "Zero Tolerance Policy",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300",
      icon: ShieldAlert,
      iconColor: "text-red-600 dark:text-red-400",
      description:
        "Strict anti-ragging measures as per Supreme Court & UGC/AICTE mandates. Any form of physical, verbal, or mental harassment is strictly prohibited across GLBITM premises and hostels.",
      contacts: [
        { label: "Institutional Anti-Ragging Cell", action: "Dean Student Welfare Office, Block A" },
        { label: "National Anti-Ragging Helpline", action: "1800-180-5522 (Toll Free, 24x7)" },
      ],
      link: "https://www.glbitm.org/",
      actionLabel: "Visit Official Anti-Ragging Portal",
    },
    {
      title: "Internal Complaints Committee (ICC)",
      badge: "Gender Safety & POSH",
      badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
      icon: Lock,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      description:
        "Prevention, prohibition, and redressal of sexual harassment of women employees and students. Provides completely confidential and formal inquiry processes.",
      contacts: [
        { label: "Presiding Officer / ICC Cell", action: "Administrative Block / Dean Office" },
        { label: "Confidentiality", action: "Full identity protection ensured by law" },
      ],
      link: "https://www.glbitm.org/",
      actionLabel: "ICC Guidelines & Contact",
    },
    {
      title: "YourDOST - Psychological & Emotional Wellbeing",
      badge: "Confidential Counselling",
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
      icon: HeartHandshake,
      iconColor: "text-teal-600 dark:text-teal-400",
      description:
        "GLBITM partner platform providing free, 24x7 confidential emotional, academic stress, and mental health counselling with certified experts and psychologists.",
      contacts: [
        { label: "Platform Access", action: "Active GLBITM institutional email authentication" },
        { label: "Format", action: "Online Chat, Voice Call, and Video Sessions" },
      ],
      link: "https://yourdost.com/",
      actionLabel: "Connect with YourDOST",
    },
    {
      title: "Campus Medical & Emergency First Aid",
      badge: "24x7 Health Support",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
      icon: Stethoscope,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      description:
        "On-campus medical dispensary with qualified resident doctor, nursing staff, emergency first-aid equipment, and rapid tie-ups with nearby Knowledge Park hospitals.",
      contacts: [
        { label: "Dispensary Location", action: "Ground Floor, Campus Health Centre" },
        { label: "Hostel First Aid", action: "24-Hour support with on-duty wardens" },
      ],
      link: "https://www.glbitm.org/",
      actionLabel: "Medical Facilities Info",
    },
    {
      title: "Dean Student Welfare & Proctorial Board",
      badge: "Student Affairs",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
      icon: Users2,
      iconColor: "text-blue-600 dark:text-blue-400",
      description:
        "Supervises student discipline, hostel regulations, student council, society operations, cultural affairs, and official college grievances.",
      contacts: [
        { label: "Office", action: "Block A, GLBITM Greater Noida Campus" },
        { label: "Jurisdiction", action: "Discipline, student welfare & general student governance" },
      ],
      link: "https://www.glbitm.org/",
      actionLabel: "Dean Student Welfare Office",
    },
    {
      title: "Student Grievance Redressal Committee (SGRC)",
      badge: "Statutory Cell",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
      icon: FileCheck2,
      iconColor: "text-amber-600 dark:text-amber-400",
      description:
        "Statutory body established as per AICTE/AKTU norms to impartially resolve academic grievances, examination disputes, and administrative concerns.",
      contacts: [
        { label: "Formal Filing", action: "Official GLBITM Grievance Portal & Registrar Office" },
        { label: "Portal", action: "Official AKTU / GLBITM ERP Student SIM" },
      ],
      link: "https://www.glbitm.org/",
      actionLabel: "Official Grievance Redressal",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-primary-900/50">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Institutional Safeguard Notice
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-orbitron tracking-tight">
            Official College Support & Institutional Channels
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong>CampusCare</strong> is designed specifically for <em>campus infrastructure, maintenance, and facility problem resolution</em>.
            It is <strong>NOT</strong> a substitute for statutory grievances, sexual harassment reporting, anti-ragging complaints, or medical emergencies.
          </p>
        </div>
      </div>

      {/* Difference Clarification Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-900 dark:text-blue-200">
            <Building2 className="w-4 h-4 text-blue-600" />
            Use CampusCare For:
          </div>
          <ul className="text-xs text-blue-800/90 dark:text-blue-300/80 space-y-1.5 list-disc pl-4">
            <li>Broken classroom lights, fans, power sockets, and switches</li>
            <li>AC malfunctions in lecture halls, labs, and Central Library</li>
            <li>Water leakages, tap faults, washroom cleanliness</li>
            <li>Projector, Wi-Fi, lab equipment, or computer centre glitches</li>
            <li>Hostel furniture, geyser, or cleanliness maintenance</li>
            <li>Bus fleet cleanliness or stop infrastructure concerns</li>
          </ul>
          <div className="pt-2">
            <Link href="/issues/report">
              <Button size="sm" variant="outline" className="text-xs">
                Report Campus Maintenance Issue <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-900 dark:text-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Use Official Institutional Channels For:
          </div>
          <ul className="text-xs text-rose-800/90 dark:text-rose-300/80 space-y-1.5 list-disc pl-4">
            <li>Any incident of ragging or intimidation (Anti-Ragging Squad)</li>
            <li>Sexual harassment, gender misconduct, or POSH issues (ICC)</li>
            <li>Acute psychological distress, depression, or anxiety (YourDOST)</li>
            <li>Medical emergencies requiring doctor or ambulance</li>
            <li>Academic disputes, grading grievances, or fee disputes (SGRC)</li>
            <li>Campus security breaches or criminal matters</li>
          </ul>
          <div className="pt-2">
            <a href="https://www.glbitm.org/" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="destructive" className="text-xs">
                Open Official GLBITM Portal <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Directory of Institutional Cells */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary-600" />
            Verified GLBITM Institutional Directory
          </h2>
          <span className="text-xs text-muted-foreground">Knowledge Park 3, Greater Noida</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {officialChannels.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${channel.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground leading-snug">{channel.title}</h3>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${channel.badgeColor}`}
                        >
                          {channel.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{channel.description}</p>

                  <div className="space-y-1.5 pt-2 border-t border-border">
                    {channel.contacts.map((c, cIdx) => (
                      <div key={cIdx} className="text-xs flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">{c.label}:</span>
                        <span className="font-semibold text-foreground text-right">{c.action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {channel.actionLabel}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Campus Notice */}
      <div className="p-4 rounded-xl bg-muted/60 border border-border text-center space-y-1 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">
          G.L. Bajaj Institute of Technology & Management (GLBITM)
        </p>
        <p>Plot No. 2, APJ Abdul Kalam Road, Knowledge Park 3, Greater Noida, Uttar Pradesh - 201306</p>
        <p className="text-[11px] pt-1">
          For emergency campus dispatch, reach out to security personnel at Campus Gate 1 & Gate 2.
        </p>
      </div>
    </div>
  );
}
