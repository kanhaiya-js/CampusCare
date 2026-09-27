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
          <table className="w-full table-fixed text-left text-xs min-w-[840px] lg:min-w-full">
            <colgroup>
              <col className="w-[110px]" />
              <col className="w-auto" />
              <col className="w-[125px]" />
              <col className="w-[160px]" />
              <col className="w-[85px]" />
              <col className="w-[115px]" />
              <col className="w-[120px]" />
              <col className="w-[110px]" />
            </colgroup>
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold text-[10px]">
              <tr>
                <th className="px-3 py-3">Ticket ID</th>
                <th className="px-3 py-3">Issue Title</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-2 py-3 text-center">Priority</th>
                <th className="px-2 py-3 text-center">Status</th>
                <th className="px-3 py-3">Assigned Staff</th>
                <th className="px-3 py-3 text-right">Actions</th>
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
                    <td className="px-3 py-2.5 font-mono font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap text-xs">
                      #{issue.publicIssueId}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-foreground">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="hover:text-primary-600 transition-colors line-clamp-1 block"
                        title={issue.title}
                      >
                        {issue.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">
                      <span className="truncate block" title={issue.category.name}>
                        {issue.category.name}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <div className="truncate font-medium text-foreground" title={issue.location.building}>
                        {issue.location.building}
                      </div>
                      <div className="truncate text-[10px] text-muted-foreground" title={issue.room || "General Campus"}>
                        {issue.room ? issue.room : "General Campus"}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs">
                      {issue.assignedStaff ? (
                        <span className="font-medium text-foreground truncate block" title={issue.assignedStaff.name}>
                          {issue.assignedStaff.name}
                        </span>
                      ) : (
                        <span className="inline-block text-amber-600 dark:text-amber-400 font-semibold text-[10px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedIssue(issue);
                            setTargetStaffId(issue.assignedStaffId || "");
                            setReassignModalOpen(true);
                            fetchStaff();
                          }}
                          className="px-2 py-1 rounded bg-muted hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] font-semibold text-foreground transition-colors"
                          title="Assign staff technician"
                        >
                          Assign
                        </button>
                        <Link
                          href={`/issues/${issue.id}`}
                          className="px-2.5 py-1 rounded bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/80 dark:hover:bg-primary-900 text-primary-600 dark:text-primary-300 font-semibold text-[11px] transition-colors"
                        >
                          View
                        </Link>
                      </div>
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
        title="Assign / Reassign Maintenance Staff"
        description={`Direct ticket dispatch for #${selectedIssue?.publicIssueId}: "${selectedIssue?.title}"`}
      >
        <div className="space-y-4 text-xs">
          {staffList.length === 0 ? (
            <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> No maintenance staff members found
              </p>
              <p className="text-[11px]">
                Staff technicians need to be registered in the directory before tickets can be assigned.
              </p>
              <Link href="/admin/staff" className="inline-block mt-1">
                <Button size="sm" variant="outline" className="text-xs">
                  Go to Staff Directory →
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-foreground mb-1.5">
                Select Maintenance Staff
              </label>
              <select
                value={targetStaffId}
                onChange={(e) => setTargetStaffId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 font-medium"
              >
                <option value="">-- Choose Staff Member --</option>
                {staffList.filter((s) => s.role === "STAFF").length > 0 && (
                  <optgroup label="Dedicated Maintenance Technicians">
                    {staffList
                      .filter((s) => s.role === "STAFF")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.specialization}) — Active: {s.currentWorkload} ticket(s)
                        </option>
                      ))}
                  </optgroup>
                )}
                {staffList.filter((s) => s.role === "ADMIN").length > 0 && (
                  <optgroup label="Operations Supervisors (Admin)">
                    {staffList
                      .filter((s) => s.role === "ADMIN")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (Admin / Supervisor) — Active: {s.currentWorkload} ticket(s)
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}

          {targetStaffId && (
            <div className="p-3 rounded-lg border border-border bg-muted/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-foreground">
                  {staffList.find((s) => s.id === targetStaffId)?.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold uppercase">
                  {staffList.find((s) => s.id === targetStaffId)?.specialization}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Workload: {staffList.find((s) => s.id === targetStaffId)?.currentWorkload} active tickets
              </span>
            </div>
          )}

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
