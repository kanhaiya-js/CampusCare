"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/issues/status-badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatRelativeTime } from "@/lib/utils/format";

export default function AdminIssuesPage() {
  const { success, error: toastError } = useToast();

  const [issues, setIssues] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reassign modal
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [targetStaffId, setTargetStaffId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchIssues();
    fetchStaff();
  }, [search, status, priority, page]);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.success) setStaffList(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        search,
        status,
        priority,
      });
      const res = await fetch(`/api/issues?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setIssues(data.data.issues);
        setTotalPages(data.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedIssue || !targetStaffId) return;
    setIsAssigning(true);
    try {
      const res = await fetch(`/api/issues/${selectedIssue.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: targetStaffId, comment: "Reassigned by Administrator" }),
      });
      const data = await res.json();
      if (data.success) {
        setReassignModalOpen(false);
        success(`Issue #${selectedIssue.publicIssueId} reassigned!`);
        fetchIssues();
      } else {
        toastError(data.error?.message || "Failed to reassign");
      }
    } catch (err) {
      toastError("Error reassigning issue");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Campus Issue Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full oversight of all reported complaints, triage priority, and dispatch assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a href="/api/admin/reports" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </a>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-border bg-card">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, title, room..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-lg border border-border bg-background"
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
          <option value="REOPENED">REOPENED</option>
        </select>

        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-lg border border-border bg-background"
        >
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Issues Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Ticket ID</th>
                <th className="p-3.5">Issue Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned Staff</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    Loading issue directory...
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No tickets found matching current filters.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-primary-600 dark:text-primary-400">
                      #{issue.publicIssueId}
                    </td>
                    <td className="p-3.5 font-semibold text-foreground max-w-[200px] truncate">
                      {issue.title}
                    </td>
                    <td className="p-3.5 text-muted-foreground">{issue.category.name}</td>
                    <td className="p-3.5 text-muted-foreground">
                      {issue.location.building} {issue.room ? `(${issue.room})` : ""}
                    </td>
                    <td className="p-3.5">
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="p-3.5">
                      {issue.assignedStaff ? (
                        <span className="font-medium text-foreground">{issue.assignedStaff.name}</span>
                      ) : (
                        <span className="text-amber-600 font-semibold">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setTargetStaffId(issue.assignedStaffId || "");
                          setReassignModalOpen(true);
                        }}
                        className="px-2 py-1 rounded bg-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold transition-colors"
                      >
                        Assign
                      </button>
                      <Link
                        href={`/issues/${issue.id}`}
                        className="px-2 py-1 rounded bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-300 font-semibold text-[11px] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border flex items-center justify-between text-xs">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Staff Reassignment Modal */}
      <Modal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        title="Assign / Reassign Issue"
        description={`Direct dispatch for #${selectedIssue?.publicIssueId}: "${selectedIssue?.title}"`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1.5">
              Select Maintenance Staff
            </label>
            <select
              value={targetStaffId}
              onChange={(e) => setTargetStaffId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
            >
              <option value="">-- Choose Staff Member --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.specialization}) — Workload: {s.currentWorkload} active
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleReassign}
              isLoading={isAssigning}
              disabled={!targetStaffId}
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
