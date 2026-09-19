"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, ShieldCheck, UserX, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils/format";

export default function AdminUsersPage() {
  const { success, error: toastError } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [search, role, status]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ search, role, status });
      const res = await fetch(`/api/admin/users?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        success(`User ${user.name} is now ${nextStatus}`);
        fetchUsers();
      } else {
        toastError(data.error?.message || "Failed to update status");
      }
    } catch (err) {
      toastError("Error updating user status");
    }
  };

  const handleRoleChange = async (user: any, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        success(`User ${user.name} role changed to ${newRole}`);
        fetchUsers();
      } else {
        toastError(data.error?.message || "Failed to update role");
      }
    } catch (err) {
      toastError("Error updating user role");
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Campus User & Identity Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage authenticated campus users, assign Staff & Admin roles, and control access.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-border bg-card">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background"
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-border bg-background"
        >
          <option value="">All Roles</option>
          <option value="USER">USER (Student/Resident)</option>
          <option value="STAFF">STAFF (Technician)</option>
          <option value="ADMIN">ADMIN (Operations)</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-border bg-background"
        >
          <option value="">All Account Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {/* Quick Help / Instructions */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-primary-200/80 dark:border-primary-900/60 bg-primary-50/50 dark:bg-primary-950/30 text-xs text-foreground">
        <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
        <div className="flex-1">
          <span className="font-bold text-primary-900 dark:text-primary-200">Staff & Admin Management: </span>
          <span className="text-muted-foreground">
            Promote or demote any campus account in 1 click using the <strong className="text-foreground">System Role</strong> dropdown in the directory table below. New staff automatically receive maintenance dispatch profiles.
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Campus ID</th>
                <th className="p-3.5">System Role</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Tickets Activity</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading users directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No users match current filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-7 h-7 rounded-full bg-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">
                      {u.studentOrEmployeeId || "—"}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={u.role === "MAINTENANCE_STAFF" ? "STAFF" : u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer outline-none ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800"
                            : u.role === "STAFF" || u.role === "MAINTENANCE_STAFF"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                            : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                        }`}
                        title="Click to promote or change user system role"
                      >
                        <option value="USER">🎓 USER (Student)</option>
                        <option value="STAFF">🔧 STAFF (Technician)</option>
                        <option value="ADMIN">🏛️ ADMIN (Operations)</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-muted-foreground font-mono">
                      {u._count.reportedIssues} reported · {u._count.assignedIssues} assigned
                    </td>
                    <td className="p-3.5 text-muted-foreground text-[11px]">
                      {formatDateTime(u.lastLoginAt || u.createdAt)}
                    </td>
                    <td className="p-3.5 text-right">
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                            u.status === "ACTIVE"
                              ? "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
