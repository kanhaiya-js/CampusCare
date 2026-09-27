"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, ShieldCheck, UserX, UserCheck, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils/format";
import { sanitizeAvatarUrl } from "@/lib/utils/avatar";

export default function AdminUsersPage() {
  const { success, error: toastError } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  // Edit Student/Employee ID State
  const [isEditIdModalOpen, setIsEditIdModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editStudentId, setEditStudentId] = useState("");
  const [isSavingId, setIsSavingId] = useState(false);

  // Delete User Account State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSaveId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingId(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          studentOrEmployeeId: editStudentId.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        success(`Campus ID updated for ${editingUser.name}`);
        setIsEditIdModalOpen(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        toastError(data.error?.message || "Failed to update ID");
      }
    } catch (err) {
      toastError("Error updating ID");
    } finally {
      setIsSavingId(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${userToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        success(`Account for ${userToDelete.name} has been permanently deleted.`);
        setDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        toastError(data.error?.message || "Failed to delete user account.");
      }
    } catch (err) {
      toastError("Network error while deleting user account.");
    } finally {
      setIsDeleting(false);
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
            Promote or demote any campus account in 1 click using the <strong className="text-foreground">System Role</strong> dropdown. You can also modify student admission numbers or staff employee IDs using the edit pencil button.
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
                          src={sanitizeAvatarUrl(u.avatarUrl, u.name)}
                          alt={u.name}
                          className="w-7 h-7 rounded-full bg-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono">
                      <div className="flex items-center gap-2">
                        <span className={u.studentOrEmployeeId ? "text-foreground font-medium" : "text-muted-foreground"}>
                          {u.studentOrEmployeeId || "—"}
                        </span>
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setEditStudentId(u.studentOrEmployeeId || "");
                            setIsEditIdModalOpen(true);
                          }}
                          title="Edit Admission Number / Employee ID (Admin Only)"
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary-600 transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={u.role === "MAINTENANCE_STAFF" ? "STAFF" : u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer outline-none ${
                          u.role === "ADMIN"
                            ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
                            : u.role === "STAFF" || u.role === "MAINTENANCE_STAFF"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                            : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                        }`}
                        title="Click to promote or change user system role"
                      >
                        <option value="USER">USER (Student)</option>
                        <option value="STAFF">STAFF (Technician)</option>
                        <option value="ADMIN">ADMIN (Operations)</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
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
                      <div className="flex items-center justify-end gap-1.5">
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
                        <button
                          onClick={() => {
                            setUserToDelete(u);
                            setDeleteModalOpen(true);
                          }}
                          title={`Permanently delete ${u.name}'s account`}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Admission Number / Employee ID Modal */}
      <Modal
        isOpen={isEditIdModalOpen}
        onClose={() => {
          setIsEditIdModalOpen(false);
          setEditingUser(null);
        }}
        title="Edit Admission No / Employee ID"
        description="Update official institutional identifier. This field is locked on the student's personal settings."
      >
        <form onSubmit={handleSaveId} className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-muted/60 border border-border space-y-1">
            <p className="font-semibold text-foreground text-sm">{editingUser?.name}</p>
            <p className="text-muted-foreground font-mono text-[11px]">{editingUser?.email}</p>
            <div className="pt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                ROLE: {editingUser?.role}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Official Campus ID (Admission No / Staff ID)
            </label>
            <Input
              value={editStudentId}
              onChange={(e) => setEditStudentId(e.target.value)}
              placeholder="e.g. GLB-2023-CS1042 or GLB-STAFF-01"
              className="font-mono text-xs"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              Institutional security rule: Non-admin users cannot alter their ID in account settings. Only administrators have privilege to update this ID.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditIdModalOpen(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSavingId}>
              Save Campus ID
            </Button>
          </div>
        </form>
      </Modal>
      {/* Permanent Account Deletion Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setUserToDelete(null);
          }
        }}
        title="Delete User Account"
        description="Permanently remove user credentials, reported issues, and campus access."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-rose-800 dark:text-rose-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Destructive Action Warning</p>
              <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                This action is irreversible. Deleting this account will permanently erase their personal profile, notifications, feedback, and unassign any ongoing service tickets.
              </p>
            </div>
          </div>

          {userToDelete && (
            <div className="p-3 rounded-lg bg-muted/60 border border-border space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={sanitizeAvatarUrl(userToDelete.avatarUrl, userToDelete.name)}
                  alt={userToDelete.name}
                  className="w-10 h-10 rounded-full border border-border object-cover"
                />
                <div>
                  <p className="font-bold text-foreground text-sm">{userToDelete.name}</p>
                  <p className="text-muted-foreground font-mono text-[11px]">{userToDelete.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                  {userToDelete.role}
                </span>
                <span className="text-muted-foreground">
                  ID: {userToDelete.studentOrEmployeeId || "Not assigned"}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => {
                setDeleteModalOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteUser}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Account Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

