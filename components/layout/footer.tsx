import React from "react";
import Link from "next/link";
import { Shield, LifeBuoy, MapPin, ExternalLink, Lightbulb, Users, Presentation } from "lucide-react";

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-border bg-card text-card-foreground mt-auto relative overflow-hidden">
      {/* Radiant Top Border Accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-blue-600/60 via-purple-600/60 to-amber-500/60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Institute Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-base">
              <img src="/logo.png" alt="CampusCare Logo" className="w-8 h-8 rounded-lg object-contain" />
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5 font-orbitron">
                  <span className="font-black tracking-wider leading-none text-foreground text-base">
                    CampusCare
                  </span>
                  <span className="text-xs font-bold text-muted-foreground tracking-wide">
                    (GL BAJAJ)
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">GLBITM Greater Noida</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Dedicated campus facility, infrastructure maintenance, and community issue resolution platform for
              G.L. Bajaj Institute of Technology & Management.
            </p>
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground pt-1">
              <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
              <span>Plot No. 2, APJ Abdul Kalam Road, Knowledge Park 3, Greater Noida, UP — 201306</span>
            </div>

            {/* Human Touch Community Note */}
            <div className="pt-2 text-xs text-muted-foreground/90 flex items-center gap-1.5">
              <span>Made with pride & care by GLBITM engineering students for our 10,000+ campus community.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Campus Ops</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/issues/report" className="hover:text-foreground transition-colors">
                  Report a Problem
                </Link>
              </li>
              <li>
                <Link href="/issues" className="hover:text-foreground transition-colors">
                  Browse Issues
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-foreground transition-colors">
                  Interactive Campus Map
                </Link>
              </li>
              <li>
                <Link href="/facilities" className="hover:text-foreground transition-colors">
                  Campus Facilities
                </Link>
              </li>
              <li>
                <Link href="/transport" className="hover:text-foreground transition-colors">
                  Transport & Bus Fleet
                </Link>
              </li>
            </ul>
          </div>

          {/* Student & Academic */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Academic & Life</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/clubs" className="hover:text-foreground transition-colors">
                  Student Societies & Clubs
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary-500" />
                  Campus Map & Blocks
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Student / Faculty Sign In
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-foreground transition-colors">
                  Maintenance Staff Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-foreground transition-colors">
                  Admin Control Panel
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-foreground transition-colors flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400">
                  <Users className="w-3 h-3 text-primary-500" />
                  Project Team (Kanhaiya, Rishav, Badri)
                </Link>
              </li>
              <li>
                <Link href="/presentation" className="hover:text-foreground transition-colors flex items-center gap-1 font-medium text-muted-foreground hover:text-primary-600 dark:hover:text-primary-400">
                  <Presentation className="w-3 h-3 text-indigo-500" />
                  Project Presentation (PPT Deck)
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Institutional Support */}
          <div>
            <div className="rounded-xl p-3.5 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                <LifeBuoy className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Official College Support</span>
              </div>
              <p className="text-[11px] text-rose-700/90 dark:text-rose-300/80 leading-snug">
                CampusCare routes facility issues. For anti-ragging, proctorial, or medical emergencies, use official channels:
              </p>
              <div className="space-y-1 text-[11px] text-rose-900 dark:text-rose-200 font-mono">
                <div>• Medical: Ext. 210</div>
                <div>• Security / Control: Ext. 104</div>
              </div>
              <Link
                href="/support"
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline pt-0.5"
              >
                Access Official Helplines
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} G.L. Bajaj Institute of Technology & Management. CampusCare Platform.</p>
          <div className="flex items-center gap-2">
            <span>Report. Track. Resolve. Improve.</span>
            <span>•</span>
            <Link href="/support" className="text-primary-600 dark:text-primary-400 hover:underline">
              Official Institutional Redressal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
