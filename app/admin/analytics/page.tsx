"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  TrendingUp,
  Star,
  Download,
  AlertTriangle,
  Building2,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-muted-foreground">Aggregating facilities metrics...</span>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-xs text-muted-foreground">Failed to load analytics.</div>;
  }

  const { kpis, statusDistribution, priorityDistribution, categoryBreakdown, buildingBreakdown, staffBreakdown } =
    data;

  return (
    <div className="space-y-8 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Facilities Performance & Operations Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Key operational metrics, resolution speed, campus building hotspots, and staff throughput.
          </p>
        </div>

        <a href="/api/admin/reports" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <Download className="w-3.5 h-3.5" /> Export Raw CSV
          </Button>
        </a>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Mean Time to Resolution</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{kpis.avgResolutionHours} hrs</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">From report to verification</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">User Satisfaction Score</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{kpis.userSatisfaction} / 5.0</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Across {kpis.totalFeedbackCount} ratings
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {kpis.totalIssues > 0 ? Math.round((kpis.resolved / kpis.totalIssues) * 100) : 0}%
          </p>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            {kpis.resolved} of {kpis.totalIssues} closed
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Reopened Tickets</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{kpis.reopened}</p>
          <span className="text-[11px] text-muted-foreground mt-1 block">Marked &apos;Not Fixed&apos; by user</span>
        </div>
      </div>

      {/* Visual Distributions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-500" /> Issue Volume by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {categoryBreakdown.map((cat: any) => {
              const maxCount = Math.max(...categoryBreakdown.map((c: any) => c.total), 1);
              const percentage = Math.round((cat.total / maxCount) * 100);
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{cat.name}</span>
                    <span className="font-mono text-muted-foreground">{cat.total} issues</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(3, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Building Hotspots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-500" /> Campus Facility Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {buildingBreakdown.map((b: any, idx: number) => {
              const maxCount = Math.max(...buildingBreakdown.map((x: any) => x.count), 1);
              const percentage = Math.round((b.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{b.building}</span>
                    <span className="font-mono text-muted-foreground">{b.count} reports</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(3, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Staff Throughput & Workload Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary-500" /> Maintenance Staff Throughput & Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted-foreground uppercase font-bold text-[10px]">
                <tr>
                  <th className="pb-2">Technician</th>
                  <th className="pb-2">Specialization</th>
                  <th className="pb-2">Active Workload</th>
                  <th className="pb-2">Total Assigned</th>
                  <th className="pb-2">Resolved Fixes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staffBreakdown.map((s: any) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="py-2.5 font-semibold text-foreground">{s.name}</td>
                    <td className="py-2.5 text-muted-foreground">{s.specialization}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground">
                        {s.currentWorkload} active
                      </span>
                    </td>
                    <td className="py-2.5 font-mono">{s.totalAssigned}</td>
                    <td className="py-2.5 font-mono text-emerald-600 font-semibold">{s.resolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
