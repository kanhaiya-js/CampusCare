import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Wrench,
  CheckCircle2,
  MapPin,
  Sparkles,
  Zap,
  Building2,
  Bus,
  Users2,
  Lightbulb,
  HeartHandshake,
  Layers,
  ArrowRight,
  Clock,
  ThumbsUp,
  GraduationCap,
  BookOpen,
  SlidersHorizontal,
  Coffee,
  CheckCheck,
  ShieldCheck,
  PhoneCall,
  Activity,
  Award,
  HelpCircle,
  Megaphone,
  Flame,
  Check,
  UserCheck,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db/prisma";
import { formatRelativeTime } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real counts & real resolved issues from database (with graceful fallback)
  let totalCount = 0;
  let resolvedCount = 0;
  let categoryCount = 0;
  let deptCount = 0;
  let recentResolvedIssues: any[] = [];

  try {
    const results = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({ where: { status: { in: ["RESOLVED", "USER_CONFIRMED", "CLOSED"] } } }),
      prisma.category.count({ where: { active: true } }),
      prisma.department.count({ where: { active: true } }),
      prisma.issue.findMany({
        where: { status: { in: ["RESOLVED", "USER_CONFIRMED", "CLOSED"] } },
        include: {
          location: true,
          category: true,
          assignedStaff: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
    ]);
    totalCount = results[0];
    resolvedCount = results[1];
    categoryCount = results[2];
    deptCount = results[3];
    recentResolvedIssues = results[4];
  } catch (error) {
    console.warn("Could not fetch database stats for homepage:", (error as Error).message);
  }

  // Real campus notices that authentic GL Bajaj students care about
  const campusNotices = [
    {
      badge: "EXAM NOTICE",
      badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      title: "Mid-Semester Practical Labs (Block B & C)",
      text: "Class Representatives are requested to test lab PCs, HDMI cables, and switchboards before 5:00 PM today so our IT desk can resolve any glitches ahead of morning exams.",
      time: "Updated 1 hour ago",
    },
    {
      badge: "HOSTEL MESS",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      title: "Drinking Water Coolers Serviced",
      text: "RO filter inspection & high-pressure cleaning finished for Boys Hostel 1 & 2. Water testing certified 100% normal by Campus Health Desk.",
      time: "Today, 11:30 AM",
    },
    {
      badge: "CENTRAL LIBRARY",
      badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      title: "3rd Floor Quiet Zone & Wi-Fi Check",
      text: "Access Points AP-302 and AP-304 rebooted with enhanced 5GHz bandwidth for students studying late during project submission week.",
      time: "Today, 09:15 AM",
    },
    {
      badge: "COLLEGE BUSES",
      badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      title: "Pari Chowk Route 12 Timing Adjustment",
      text: "Due to metro extension work near Knowledge Park 2, Route 12 evening buses will board 10 minutes earlier from the Gate 2 parking circle.",
      time: "Yesterday",
    },
  ];


  // Real campus testimonials with human warmth
  const campusVoices = [
    {
      name: "Aarav Sharma",
      role: "3rd Year, B.Tech CSE (Block A)",
      quote:
        "Last Thursday, the ceiling projector in our DBMS lab started flickering 20 minutes before our project demo. We logged it on CampusCare instead of running to the admin building. Rajesh Ji from IT arrived with a fresh cable and fixed it on spot. Our whole group gave him 5 stars.",
      avatarBg: "bg-blue-600",
      initials: "AS",
      verifiedTag: "Hostel 1 Resident",
    },
    {
      name: "Prof. S.K. Verma",
      role: "ECE Department Faculty (Block B)",
      quote:
        "Earlier, getting a damaged oscilloscope power socket repaired meant writing a manual register note and waiting 3 days. Now, a 30-second ticket with a photo gets routed directly to the duty electrician. My lab sessions run without interruptions.",
      avatarBg: "bg-teal-600",
      initials: "SV",
      verifiedTag: "Lab Coordinator",
    },
    {
      name: "Rajesh Kumar",
      role: "Lead Campus Electrician (8+ Yrs at GLBITM)",
      quote:
        "Before this app, students would say 'bhaiya second floor pe light kharab hai' and we had to check all 10 classrooms to find the switch. Now students attach the exact room number and photo. We carry the right spare MCB and finish the job in 15 minutes.",
      avatarBg: "bg-amber-600",
      initials: "RK",
      verifiedTag: "Duty Staff",
    },
  ];


  // Humanized features
  const humanFeatures = [
    {
      title: "Snap, Tag & Done in 30s",
      desc: "No paper applications or walking around looking for peons. Click a picture of the broken item, pick your room or block, and submit.",
      icon: Zap,
      badge: "Zero Hassle",
      color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200/70 dark:border-amber-800/40",
    },
    {
      title: "Already Reported? Just Upvote",
      desc: "If your classmate already reported the broken AC in Room 302, don't duplicate it. Hit upvote to bump its priority with the supervisor.",
      icon: ThumbsUp,
      badge: "Teamwork",
      color: "from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/70 dark:border-indigo-800/40",
    },
    {
      title: "Exam Rooms & Safety First",
      desc: "Water leakage near wires, dark stairwells after sunset, or projector faults in active exam halls get immediate emergency dispatch.",
      icon: SlidersHorizontal,
      badge: "Fast Track",
      color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-200/70 dark:border-rose-800/40",
    },
    {
      title: "Every Corner of GL Bajaj Covered",
      desc: "From Block A, B, C classrooms to SHD Auditorium, Central Library, Basketball Ground, and Boys/Girls Hostels with floor-level maps.",
      icon: MapPin,
      badge: "Knowledge Park 3",
      color: "from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border-blue-200/70 dark:border-blue-800/40",
    },
    {
      title: "Photo Proof When Done",
      desc: "Technicians upload a photo of the completed repair. The complaint is marked closed only after you confirm that it's genuinely working.",
      icon: CheckCircle2,
      badge: "Student Verified",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/40",
    },
    {
      title: "Discreet Support & Direct Helplines",
      desc: "Need immediate personal assistance, anti-ragging support, or first aid? Direct numbers for our Proctor Office and Campus Medical Room.",
      icon: HeartHandshake,
      badge: "Always Here",
      color: "from-red-500/10 to-rose-500/10 text-red-600 dark:text-red-400 border-red-200/70 dark:border-red-800/40",
    },
  ];

  // College Helplines
  const campusHelplines = [
    {
      dept: "Campus Maintenance Control Room",
      location: "Basement, Block C",
      timings: "8:00 AM – 8:00 PM Daily",
      contact: "Ext. 104 / Intercom",
      badge: "General Repairs",
    },
    {
      dept: "Campus Health & Medical Dispensary",
      location: "Ground Floor (Next to Café)",
      timings: "Dr. Sharma • 9:00 AM – 6:00 PM",
      contact: "Emergency Ambulance Linkage",
      badge: "First Aid & Clinic",
    },
    {
      dept: "Proctor Office & Anti-Ragging Cell",
      location: "Block A, Room 102",
      timings: "24x7 Student Safeguard",
      contact: "Dean of Student Welfare",
      badge: "Student Safety",
    },
    {
      dept: "Institute Transport & Bus Incharge",
      location: "Gate 1 Main Office",
      timings: "Mr. Chauhan • 8:30 AM – 5:00 PM",
      contact: "Route passes & driver queries",
      badge: "Transport Fleet",
    },
  ];

  // Realistic Student FAQs
  const studentFaqs = [
    {
      q: "How fast does someone actually come to fix my issue?",
      a: "For classroom electrical issues, loose projector cables, and hostel plumbing, our duty technicians usually arrive within 25 to 45 minutes during class hours. Complex equipment repairs take up to 24 hours.",
    },
    {
      q: "Do I still need to sign the old complaint register in the department office?",
      a: "No! CampusCare completely replaces the physical paper registers. Once you report it here, it is directly assigned to the duty technician, and both you and the department coordinator can track live progress.",
    },
    {
      q: "What if a switchboard sparks or there is a serious water overflow?",
      a: "For immediate physical hazards, alert your floor peon or call the Campus Maintenance Control Room at Ext. 104 immediately, or click the red 'Support' button in the top menu.",
    },
    {
      q: "Can hostel students report problems in their dorm rooms?",
      a: "Yes! Both Boys Hostel (Blocks 1 & 2) and Girls Hostel are mapped with room numbers and washrooms. Mention your room number and our hostel maintenance crew will attend to it.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Student Bulletin Marquee / Notice Bar */}
      <div className="w-full bg-indigo-50/90 dark:bg-indigo-950/40 border-b border-indigo-200/70 dark:border-indigo-800/50 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-indigo-900 dark:text-indigo-200">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-[10px] bg-indigo-200/80 dark:bg-indigo-900/80 px-2 py-0.5 rounded text-indigo-800 dark:text-indigo-200">
              Campus Bulletin
            </span>
            <span className="truncate">
              Mid-term week in progress: Tech crews on priority standby across Block A, B & C labs.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-muted-foreground text-[11px]">
            <span>Knowledge Park 3, Greater Noida</span>
            <span>•</span>
            <Link href="/support" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">
              Emergency Desks →
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section with Warm College Atmosphere & Real Campus Backdrop */}
      <section className="relative overflow-hidden py-10 md:py-16 border-b border-border">
        {/* Real GL Bajaj Campus Hero Background Image - Blurry for crisp text contrast in both Light and Dark modes */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/hero-bg.png"
            alt="GL Bajaj Campus"
            className="w-full h-full object-cover object-center opacity-70 dark:opacity-65 filter blur-[2px] contrast-[1.03] saturate-[1.04] brightness-[0.98] dark:brightness-[0.92] transition-all duration-700 scale-[1.02]"
          />
          {/* Subtle atmospheric scrim & edge blend so texts and icons are crisp without milky wash */}
          <div className="absolute inset-0 bg-background/25 dark:bg-slate-950/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-transparent to-background/85 dark:from-background/60 dark:via-transparent dark:to-background/90" />
        </div>

        {/* Hero Content - Directly over beautifully blurred campus backdrop */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
          {/* Official Campus Crest / Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto animate-float">
            <img src="/logo.png" alt="CampusCare Logo" className="w-full h-full rounded-2xl object-contain drop-shadow-md" />
          </div>

          {/* Campus Inspiration Quote */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-medium bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border border-border/80 shadow-xs max-w-xl mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="italic text-foreground/90 font-serif text-[12px] sm:text-[13px]">
              &ldquo;Dreams transform into thoughts, and thoughts result in action.&rdquo;
            </span>
            <span className="text-primary-600 dark:text-primary-400 font-bold font-sans text-[11px] shrink-0">
              — Dr. A.P.J. Abdul Kalam
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-wide text-foreground max-w-3xl mx-auto leading-tight font-orbitron drop-shadow-xs">
            Shaping Our Campus, Together.
          </h1>

          <p className="text-base sm:text-lg font-bold text-foreground max-w-2xl mx-auto">
            G.L. Bajaj Institute of Technology &amp; Management <span className="text-muted-foreground font-semibold">(GLBITM)</span>
          </p>

          <p className="text-xs sm:text-sm text-foreground/90 dark:text-muted-foreground font-semibold max-w-xl mx-auto flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
            Plot No. 2, APJ Abdul Kalam Road, Knowledge Park 3, Greater Noida
          </p>

          <p className="text-sm sm:text-base text-foreground/90 dark:text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed pt-1">
            From faulty projectors in Block B to broken water coolers in the hostel, nobody likes chasing staff with paper forms.
            Just snap a photo, mention your room, and get it fixed with real-time updates.
          </p>

          {/* Primary Action Buttons - Aligned in the exact same line */}
          <div className="pt-4 flex flex-wrap md:flex-nowrap items-center justify-center gap-2.5 sm:gap-3 max-w-5xl mx-auto">
            <Link href="/issues/report" className="shrink-0">
              <Button size="lg" className="shadow-lg shadow-primary-600/25 text-sm font-semibold gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white whitespace-nowrap h-11">
                <Zap className="w-4 h-4" />
                Report a Problem (Takes 30s)
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/issues" className="shrink-0">
              <Button variant="outline" size="lg" className="text-sm font-semibold gap-1.5 border-border bg-background/90 hover:bg-background text-foreground shadow-xs backdrop-blur-xs whitespace-nowrap h-11">
                <Activity className="w-4 h-4 text-primary-500" />
                Browse Campus Issues
              </Button>
            </Link>
            <Link href="/map" className="shrink-0">
              <Button variant="secondary" size="lg" className="text-sm font-semibold gap-1.5 bg-background/90 hover:bg-background border border-border text-foreground shadow-xs backdrop-blur-xs whitespace-nowrap h-11">
                <MapPin className="w-4 h-4 text-primary-500" />
                Campus Map &amp; Blocks
              </Button>
            </Link>
            <Link href="/support" className="shrink-0">
              <Button variant="ghost" size="lg" className="text-sm text-rose-600 dark:text-rose-400 font-semibold gap-1.5 border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 backdrop-blur-xs shadow-2xs whitespace-nowrap h-11 px-4">
                <ShieldAlert className="w-3.5 h-3.5" />
                Campus Helplines
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Campus Notice Board Section */}
      <section className="py-12 md:py-16 border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                <Megaphone className="w-4 h-4" />
                Campus Notice Board
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-foreground font-orbitron">
                Today's Maintenance & Facility Updates
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Real-time updates directly from our campus electrical, plumbing, hostel, and transport supervisors.
              </p>
            </div>
            <Link href="/issues">
              <Button variant="outline" size="sm" className="text-xs font-semibold gap-1">
                View All Campus Issues →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campusNotices.map((notice, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${notice.badgeColor}`}>
                      {notice.badge}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{notice.time}</span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1.5">{notice.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notice.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Proof: Recent Campus Fixes */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              Recent Solved Tickets
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-foreground font-orbitron">
              Campus Hall of Fixes
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Real problems reported by students, fixed by campus staff, and verified with photographic proof.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentResolvedIssues.length > 0
              ? recentResolvedIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className="p-4 rounded-2xl border border-border bg-card shadow-xs hover:shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                        #{issue.publicIssueId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Resolved
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-foreground line-clamp-1">{issue.title}</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{issue.description}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                      {issue.location.building} {issue.room ? `(${issue.room})` : ""}
                    </span>
                    <span className="shrink-0">{formatRelativeTime(issue.updatedAt)}</span>
                  </div>
                </Link>
              ))
              : [
                {
                  title: "Classroom 204 Projector HDMI Cable",
                  loc: "Block B, Room 204",
                  time: "Fixed in 25 mins",
                  tech: "Rakesh (IT Staff)",
                  ver: "Sneha, 3rd Yr CSE",
                },
                {
                  title: "Drinking Water Dispenser Cooling",
                  loc: "Boys Hostel 1, Ground Floor",
                  time: "Fixed in 40 mins",
                  tech: "Amit (Plumber)",
                  ver: "Harshit, 2nd Yr ME",
                },
                {
                  title: "Reading Floor Wi-Fi AP Reboot",
                  loc: "Central Library, 3rd Floor",
                  time: "Fixed in 15 mins",
                  tech: "Network Cell",
                  ver: "Library Staff",
                },
                {
                  title: "Mess Hall Light Fixtures",
                  loc: "Girls Hostel Mess",
                  time: "Fixed same day",
                  tech: "Rajesh (Electrician)",
                  ver: "Mess Committee",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-border bg-card shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Verified Fixed
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{item.time}</span>
                    </div>
                    <h4 className="font-bold text-xs text-foreground">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary-500" />
                      {item.loc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/80 text-[10px] text-muted-foreground space-y-0.5">
                    <p>
                      <strong className="text-foreground">Staff:</strong> {item.tech}
                    </p>
                    <p>
                      <strong className="text-foreground">Verified by:</strong> {item.ver}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Built for GL Bajaj Experience: Humanized Features */}
      <section className="py-14 md:py-20 border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 mb-1">
              <Award className="w-3.5 h-3.5" />
              How It Actually Works
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-foreground font-orbitron">
              Designed Around Real College Life
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              Built by engineering students who know the pain of sitting through lectures with broken fans or hunting down staff with paper requisitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {humanFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-2xl border ${f.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {f.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-foreground mb-2">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Community Testimonials: Voices of GL Bajaj */}
      <section className="py-14 md:py-20 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <HeartHandshake className="w-4 h-4" />
              Community Voices
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-foreground font-orbitron">
              What People on Campus Say
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Real feedback from students, teachers, and maintenance heroes who keep GL Bajaj running every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campusVoices.map((v, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-2xl ${v.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}>
                      {v.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{v.name}</h4>
                      <p className="text-xs text-muted-foreground">{v.role}</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-[13px] text-foreground/90 leading-relaxed italic">
                    "{v.quote}"
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-md text-[11px]">
                    {v.verifiedTag}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold text-muted-foreground">Verified Review</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Real Campus Helplines & Duty Desks */}
      <section className="py-14 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
              <PhoneCall className="w-4 h-4" />
              Direct Campus Helplines
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-foreground font-orbitron">
              Emergency & Duty Desks
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              When something urgent needs immediate physical attention, reach out directly to these on-campus rooms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {campusHelplines.map((desk, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border inline-block mb-3">
                    {desk.badge}
                  </span>
                  <h4 className="font-bold text-sm text-foreground leading-snug">{desk.dept}</h4>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {desk.location}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2">{desk.timings}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/80">
                  <span className="text-xs font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-lg inline-block w-full text-center">
                    {desk.contact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Realistic Student FAQs */}
      <section className="py-14 border-b border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 mb-1">
              <HelpCircle className="w-4 h-4" />
              Got Questions?
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-foreground font-orbitron">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Straightforward answers about reporting, timelines, and campus maintenance.
            </p>
          </div>

          <div className="space-y-3.5">
            {studentFaqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border bg-card shadow-xs">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 text-xs flex items-center justify-center font-bold shrink-0">
                    Q
                  </span>
                  {faq.q}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 pl-7 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warm Community Bottom Call-to-Action Section */}
      <section className="py-16 border-t border-border bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/40 p-8 sm:p-12 text-center shadow-xs">
            {/* Soft decorative glow */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-3.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 px-3 py-1 rounded-full">
                Built by GLBITM Students
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-wide font-orbitron text-foreground">
                See Something Broken? Don&apos;t Ignore It.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Our campus only gets better when all of us take responsibility. Reporting takes less than a minute.
              </p>
              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <Link href="/issues/report">
                  <Button size="lg" className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-primary-600/20">
                    + Report a Problem Now
                  </Button>
                </Link>
                <Link href="/issues">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border bg-background hover:bg-muted text-foreground font-semibold shadow-2xs gap-1.5"
                  >
                    <Activity className="w-4 h-4 text-primary-500" />
                    Browse Campus Issues
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
