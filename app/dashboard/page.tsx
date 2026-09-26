import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  MapPin,
  Calendar,
  MessageSquare,
  ArrowRight,
  QrCode,
} from "lucide-react";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/issues/status-badge";
import { formatRelativeTime } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch user issues
  const [issues, userNotifications] = await Promise.all([
    prisma.issue.findMany({
      where: { reporterId: session.userId },
      include: {
        category: true,
        location: true,
        assignedStaff: { select: { name: true, email: true } },
        feedback: true,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const activeIssues = issues.filter(
    (i) => i.status !== "CLOSED" && i.status !== "RESOLVED" && i.status !== "REJECTED"
  );
  const pendingVerification = issues.filter((i) => i.status === "SUBMITTED");
  const inProgress = issues.filter((i) => i.status === "IN_PROGRESS" || i.status === "ASSIGNED");
  const resolved = issues.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider font-orbitron">
            Campus Resident Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-wide mt-1 font-orbitron">
            Welcome, {session.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track your submitted maintenance tickets and report new facility issues
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/scan">
            <Button variant="outline" size="md" className="gap-2 shadow-xs font-semibold">
              <QrCode className="w-4 h-4 text-primary-500" />
              Scan Room QR
            </Button>
          </Link>
          <Link href="/issues/report">
            <Button size="md" className="gap-2 shadow-sm font-semibold">
              <PlusCircle className="w-4 h-4" />
              Report New Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Issues</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-2 font-orbitron">{activeIssues.length}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Awaiting or in progress</span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-2 font-orbitron">{pendingVerification.length}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Queued for verification</span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-2 font-orbitron">{inProgress.length}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Technician on site</span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-2 font-orbitron">{resolved.length}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Completed fixes</span>
        </div>
      </div>

      {/* Main Grid: Recent Tickets & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left 2 Cols: My Issues List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black tracking-wide text-foreground font-orbitron">Recent Reported Issues</h2>
            <Link
              href="/issues?scope=my"
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              View all my issues <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {issues.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-sm text-foreground">No issues reported yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Notice a broken light, dripping tap, or faulty air conditioner? Submit a ticket to alert maintenance.
              </p>
              <Link href="/issues/report" className="inline-block mt-4">
                <Button size="sm">Report Issue Now</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.slice(0, 5).map((issue) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className="block p-4 rounded-xl border border-border bg-card hover:border-primary-400 dark:hover:border-primary-600 transition-all hover:shadow-xs group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/80 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-800">
                          #{issue.publicIssueId}
                        </span>
                        <StatusBadge status={issue.status} />
                        <PriorityBadge priority={issue.priority} />
                      </div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {issue.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{issue.description}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {formatRelativeTime(issue.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                        {issue.location.building} {issue.room ? `(${issue.room})` : ""}
                      </span>
                      <span className="hidden sm:inline-block">·</span>
                      <span className="hidden sm:inline-block font-medium">{issue.category.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {issue._count.comments > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-medium">
                          <MessageSquare className="w-3 h-3" />
                          {issue._count.comments}
                        </span>
                      )}
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:underline flex items-center gap-0.5">
                        Details <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Notifications & Quick Resources */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Recent Notifications</span>
                <span className="text-[11px] font-normal text-muted-foreground">Latest updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userNotifications.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No notifications yet.</p>
              ) : (
                <div className="space-y-3">
                  {userNotifications.map((notif) => (
                    <div key={notif.id} className="text-xs border-b border-border pb-2.5 last:border-none last:pb-0">
                      <p className="font-semibold text-foreground">{notif.title}</p>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary-50/50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary-800 dark:text-primary-300">
                Facility Support Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p><strong>Emergencies:</strong> For exposed wires or active flooding, report immediately and alert block security.</p>
              <p><strong>Clear Evidence:</strong> Attaching a photo expedites technician assignment by 40%.</p>
              <p><strong>Feedback:</strong> Verify fixes when notified to ensure campus accountability.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
