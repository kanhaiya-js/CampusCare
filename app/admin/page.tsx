import React from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Wrench,
  Download,
  ArrowUpRight,
  TrendingUp,
  Star,
  MapPin,
  Layers,
  QrCode,
} from "lucide-react";
import prisma from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/issues/status-badge";
import { formatRelativeTime } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    totalIssues,
    openIssues,
    inProgressCount,
    resolvedCount,
    criticalCount,
    staffCount,
    recentIssues,
    categories,
    staffMembers,
    feedbacks,
  ] = await Promise.all([
    prisma.issue.count(),
    prisma.issue.count({
      where: { status: { in: ["SUBMITTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "REOPENED"] } },
    }),
    prisma.issue.count({ where: { status: "IN_PROGRESS" } }),
    prisma.issue.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.issue.count({ where: { priority: "CRITICAL" } }),
    prisma.user.count({ where: { role: "STAFF" } }),
    prisma.issue.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        location: true,
        assignedStaff: { select: { name: true } },
      },
    }),
    prisma.category.findMany({
      include: { _count: { select: { issues: true } } },
    }),
    prisma.user.findMany({
      where: { role: "STAFF" },
      include: { staffProfile: true },
    }),
    prisma.feedback.findMany({
      select: { rating: true },
    }),
  ]);

  const avgSatisfaction =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-8 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
            Campus Operations Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-foreground tracking-tight mt-0.5">
            Facility Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time campus infrastructure oversight, dispatch management, and service resolution metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/qr-codes">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <QrCode className="w-3.5 h-3.5 text-primary-500" /> Room QR Hub
            </Button>
          </Link>
          <a href="/api/admin/reports" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <Download className="w-3.5 h-3.5" /> Export CSV Report
            </Button>
          </a>
          <Link href="/admin/issues">
            <Button size="sm" className="gap-1.5 text-xs font-semibold">
              Manage Tickets →
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Tickets</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-orbitron text-foreground mt-2">{totalIssues}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Campus-wide cumulative</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Unresolved</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-orbitron text-amber-600 mt-2">{openIssues}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Requiring staff dispatch</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Critical Hazards</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-orbitron text-red-600 mt-2">{criticalCount}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Urgent priority</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Resident Satisfaction</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
          <p className="text-2xl font-bold font-orbitron text-emerald-600 mt-2">{avgSatisfaction} / 5.0</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Based on verified fixes</span>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Issues Needing Action */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Recent Issues Stream</h2>
            <Link
              href="/admin/issues"
              className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
            >
              View all issues table →
            </Link>
          </div>

          <div className="space-y-3">
            {recentIssues.map((issue) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="block p-4 rounded-xl border border-border bg-card hover:border-primary-400 dark:hover:border-primary-700 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-primary-600 dark:text-primary-400">
                        #{issue.publicIssueId}
                      </span>
                      <StatusBadge status={issue.status} />
                      <PriorityBadge priority={issue.priority} />
                    </div>
                    <h3 className="font-bold text-sm text-foreground mt-1 hover:text-primary-600">
                      {issue.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatRelativeTime(issue.createdAt)}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>{issue.location.building} {issue.room ? `(${issue.room})` : ""}</span>
                  <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> {issue.assignedStaff?.name || "Unassigned"}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Col: Category Breakdown & Staff Queue */}
        <div className="space-y-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Issue Categories</span>
                <Link href="/admin/categories" className="text-xs text-primary-600 hover:underline font-normal">
                  Manage
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map((cat) => {
                const percentage =
                  totalIssues > 0 ? Math.round((cat._count.issues / totalIssues) * 100) : 0;
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{cat.name}</span>
                      <span className="text-muted-foreground font-mono">
                        {cat._count.issues} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${Math.max(4, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Active Technicians */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Staff Workload Status</span>
                <Link href="/admin/staff" className="text-xs text-primary-600 hover:underline font-normal">
                  View all ({staffCount})
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {staffMembers.slice(0, 5).map((staff) => (
                <div key={staff.id} className="flex items-center justify-between border-b border-border pb-2 last:border-none last:pb-0">
                  <div>
                    <p className="font-semibold text-foreground">{staff.name}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {staff.staffProfile?.specialization || "General"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground">
                    {staff.staffProfile?.currentWorkload || 0} active tickets
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
