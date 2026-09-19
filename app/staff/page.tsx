import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  User,
  Shield,
  Activity,
} from "lucide-react";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/issues/status-badge";
import { formatRelativeTime } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function StaffDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "STAFF" && session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch staff profile and assigned issues
  const [staffProfile, assignedIssues] = await Promise.all([
    prisma.staffProfile.findUnique({
      where: { userId: session.userId },
    }),
    prisma.issue.findMany({
      where: { assignedStaffId: session.userId },
      include: {
        category: true,
        location: true,
        reporter: { select: { name: true, email: true } },
        feedback: true,
        _count: { select: { comments: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const inProgressTickets = assignedIssues.filter((i) => i.status === "IN_PROGRESS");
  const pendingAcceptance = assignedIssues.filter((i) => i.status === "ASSIGNED");
  const completedTickets = assignedIssues.filter(
    (i) => i.status === "RESOLVED" || i.status === "CLOSED"
  );
  const criticalTickets = assignedIssues.filter(
    (i) => i.priority === "CRITICAL" && i.status !== "CLOSED"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              <Wrench className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Technician Operations Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-foreground tracking-tight mt-1">
            Welcome, {session.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Specialization:{" "}
            <span className="font-semibold text-foreground">
              {staffProfile?.specialization || "General Facility Maintenance"}
            </span>{" "}
            · Live Workload:{" "}
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {staffProfile?.currentWorkload || 0} active tickets
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/map">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <MapPin className="w-4 h-4 text-primary-500" /> View Campus Hotspots
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Workload Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Action</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-orbitron text-foreground mt-2">{pendingAcceptance.length}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Awaiting dispatch</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">In Progress</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-orbitron text-amber-600 mt-2">{inProgressTickets.length}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Active repairs</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Urgent Critical</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-orbitron text-red-600 mt-2">{criticalTickets.length}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Needs immediate care</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Resolved by You</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-orbitron text-emerald-600 mt-2">{completedTickets.length}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Finished jobs</span>
        </div>
      </div>

      {/* Critical Queue Warning Banner */}
      {criticalTickets.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 animate-bounce" />
            <div>
              <h4 className="text-xs font-bold">You have {criticalTickets.length} urgent/critical issue(s) assigned</h4>
              <p className="text-[11px] text-red-700/80 dark:text-red-300/80 mt-0.5">
                Immediate response required for hazards in {criticalTickets.map((t) => t.location.building).join(", ")}.
              </p>
            </div>
          </div>
          <Link href={`/issues/${criticalTickets[0].id}`}>
            <Button size="sm" variant="destructive" className="text-xs font-semibold">
              Inspect Priority Ticket
            </Button>
          </Link>
        </div>
      )}

      {/* Assigned Tickets Work Center */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Assigned Tickets Queue</h2>
          <span className="text-xs text-muted-foreground font-medium">
            Sorted by severity and urgency
          </span>
        </div>

        {assignedIssues.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
            <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <h3 className="font-semibold text-sm text-foreground">No tickets assigned to your queue</h3>
            <p className="text-xs text-muted-foreground mt-1">
              When new maintenance issues matching your specialization are reported, they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedIssues.map((ticket) => (
              <div
                key={ticket.id}
                className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary-300 dark:hover:border-primary-800 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-mono font-bold text-xs text-primary-600 dark:text-primary-400">
                      #{ticket.publicIssueId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-foreground mt-2 leading-snug">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {ticket.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 font-medium text-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary-500" />
                      {ticket.location.building} {ticket.room ? `· Room: ${ticket.room}` : ""}
                    </div>
                    <div>Category: {ticket.category.name}</div>
                    <div>Reported by: {ticket.reporter.name} ({formatRelativeTime(ticket.createdAt)})</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {ticket._count.comments} comment(s)
                  </span>
                  <Link href={`/issues/${ticket.id}`}>
                    <Button size="sm" className="text-xs gap-1">
                      Update Progress <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
