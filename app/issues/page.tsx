"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  PlusCircle,
  MapPin,
  MessageSquare,
  ArrowUpDown,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, PriorityBadge } from "@/components/issues/status-badge";
import { formatRelativeTime } from "@/lib/utils/format";

function IssuesListContent() {
  const searchParams = useSearchParams();
  const initialScope = searchParams.get("scope") || "";

  const [issues, setIssues] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [priority, setPriority] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [scope, setScope] = useState(initialScope);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [search, status, categoryId, departmentId, priority, sortBy, scope, page]);

  const fetchFilterOptions = async () => {
    try {
      const [catRes, deptRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/departments"),
      ]);
      const catData = await catRes.json();
      const deptData = await deptRes.json();
      if (catData.success) setCategories(catData.data);
      if (deptData.success) setDepartments(deptData.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status,
        categoryId,
        departmentId,
        priority,
        sortBy,
        scope,
      });

      const res = await fetch(`/api/issues?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setIssues(data.data.issues);
        setTotalPages(data.data.pagination.totalPages || 1);
        setTotalCount(data.data.pagination.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setCategoryId("");
    setDepartmentId("");
    setPriority("");
    setSortBy("newest");
    setScope("");
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Page Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-1">
            GLBITM Greater Noida
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-foreground tracking-tight">
            Campus Issues & Maintenance Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Search, inspect, and track active facility tickets across academic blocks, labs, library, and hostels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/issues/report">
            <Button size="md" className="gap-2 shadow-sm font-semibold bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700">
              <PlusCircle className="w-4 h-4" /> Report Problem
            </Button>
          </Link>
        </div>
      </div>

      {/* Human Touch Campus Pulse Guidance Banner */}
      <div className="mt-4 p-3.5 rounded-2xl border border-indigo-200/70 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50/60 via-background to-blue-50/60 dark:from-indigo-950/30 dark:via-background dark:to-blue-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5 text-foreground font-medium">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>
            <strong>Knowledge Park 3 Maintenance Desk:</strong> Active crews on duty across Block A, B, C & Hostels. Average initial response is <strong>~28 minutes</strong> today.
          </span>
        </div>
        <div className="text-muted-foreground shrink-0 text-[11px] font-medium bg-background px-2.5 py-1 rounded-lg border border-border">
          Emergency Desk: Ext. 104
        </div>
      </div>

      {/* Scope Navigation Tabs */}
      <div className="w-full mt-6 bg-muted/60 dark:bg-slate-800/60 p-1 rounded-xl flex items-center gap-1 shadow-inner">
        <button
          onClick={() => {
            setScope("");
            setPage(1);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center ${
            scope === ""
              ? "bg-card text-foreground shadow-sm font-bold dark:bg-slate-900"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          All Campus Issues
        </button>
        <button
          onClick={() => {
            setScope("my");
            setPage(1);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center ${
            scope === "my"
              ? "bg-card text-foreground shadow-sm font-bold dark:bg-slate-900"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          My Reported Issues
        </button>
        <button
          onClick={() => {
            setScope("assigned");
            setPage(1);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center ${
            scope === "assigned"
              ? "bg-card text-foreground shadow-sm font-bold dark:bg-slate-900"
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          }`}
        >
          Assigned to Me
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-6 p-4 rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 shadow-sm">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, title, room..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border dark:border-slate-700/80 bg-background dark:bg-slate-950/80 text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-slate-700/80 bg-background dark:bg-slate-950/80 text-foreground dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="dark:bg-slate-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-slate-700/80 bg-background dark:bg-slate-950/80 text-foreground dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id} className="dark:bg-slate-900">
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-slate-700/80 bg-background dark:bg-slate-950/80 text-foreground dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED" className="dark:bg-slate-900">Submitted</option>
            <option value="UNDER_REVIEW" className="dark:bg-slate-900">Under Review</option>
            <option value="IN_PROGRESS" className="dark:bg-slate-900">In Progress</option>
            <option value="RESOLVED" className="dark:bg-slate-900">Resolved</option>
            <option value="USER_CONFIRMED" className="dark:bg-slate-900">User Confirmed</option>
            <option value="CLOSED" className="dark:bg-slate-900">Closed</option>
          </select>
        </div>

        {/* Priority & Sorting */}
        <div className="flex items-center gap-2">
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="w-1/2 px-2 py-2 text-xs rounded-lg border border-border dark:border-slate-700/80 bg-background dark:bg-slate-950/80 text-foreground dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <option value="">Priority</option>
            <option value="CRITICAL" className="dark:bg-slate-900">Critical</option>
            <option value="HIGH" className="dark:bg-slate-900">High</option>
            <option value="MEDIUM" className="dark:bg-slate-900">Medium</option>
            <option value="LOW" className="dark:bg-slate-900">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="w-1/2 px-2 py-2 text-xs rounded-lg border border-border dark:border-slate-700/80 bg-background dark:bg-slate-950/80 text-foreground dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <option value="newest" className="dark:bg-slate-900">Newest</option>
            <option value="oldest" className="dark:bg-slate-900">Oldest</option>
            <option value="priority" className="dark:bg-slate-900">Priority</option>
            <option value="updated" className="dark:bg-slate-900">Updated</option>
          </select>
        </div>
      </div>

      {/* Issues Count & Active Filters */}
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <span>
          Showing {issues.length} of {totalCount} total issues
        </span>
        {(search || status || categoryId || departmentId || priority || scope) && (
          <button
            onClick={resetFilters}
            className="text-primary-600 hover:underline font-semibold"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Issues Grid */}
      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-muted-foreground">Loading tickets...</span>
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <h3 className="font-semibold text-sm text-foreground">No issues match the selected criteria</h3>
            <p className="text-xs text-muted-foreground mt-1">Try modifying your search keywords or clear the filters.</p>
            <Button size="sm" variant="outline" onClick={resetFilters} className="mt-3">
              Reset Filters
            </Button>
          </div>
        ) : (
          issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/issues/${issue.id}`}
              className="block p-4 sm:p-5 rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    #{issue.publicIssueId}
                  </span>
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                  {issue.department && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200/50 dark:border-blue-800/60">
                      Dept: {issue.department.code}
                    </span>
                  )}
                  {issue.club && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200/50 dark:border-purple-800/60">
                      Club: {issue.club.name}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {formatRelativeTime(issue.createdAt)}
                </span>
              </div>

              <h3 className="font-bold text-base text-foreground mt-1 hover:text-primary-600 dark:hover:text-indigo-400 transition-colors">
                {issue.title}
              </h3>
              <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {issue.description}
              </p>

              <div className="mt-4 pt-3 border-t border-border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-medium text-foreground/90 dark:text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-primary-500 dark:text-indigo-400" />
                    {issue.location.building} {issue.room ? `(${issue.room})` : ""}
                  </span>
                  <span>·</span>
                  <span>{issue.category.name}</span>
                </div>

                <div className="flex items-center gap-4">
                  {issue.assignedStaff ? (
                    <span className="text-[11px] font-medium text-foreground/80">
                      🔧 {issue.assignedStaff.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-600 font-medium">Unassigned</span>
                  )}

                  {issue._count?.comments > 0 && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <MessageSquare className="w-3 h-3" />
                      {issue._count.comments}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function IssuesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-muted-foreground">Loading issues directory...</div>}>
      <IssuesListContent />
    </Suspense>
  );
}
