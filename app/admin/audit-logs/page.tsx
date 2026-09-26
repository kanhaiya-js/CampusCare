"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils/format";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [search, page]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ search, page: page.toString(), limit: "20" });
      const res = await fetch(`/api/admin/audit-logs?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs);
        setTotalPages(data.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Security & Operations Audit Trail
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable log of all administrative actions, status transitions, staff assignments, and user logins.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter by action, actor, entity ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background"
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground font-sans text-xs">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground font-sans text-xs">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-sans">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="p-3.5 font-sans font-semibold text-foreground">
                      {log.actor?.name || "System"} ({log.actor?.role || "SYSTEM"})
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-muted text-foreground font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {log.entityType} {log.entityId ? `#${log.entityId.slice(0, 8)}...` : ""}
                    </td>
                    <td className="p-3.5 text-muted-foreground max-w-xs truncate font-sans text-[11px]">
                      {log.metadata || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
    </div>
  );
}
