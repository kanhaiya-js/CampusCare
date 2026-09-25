"use client";

import React, { useState, useEffect } from "react";
import { Wrench, Plus, CheckCircle2, AlertCircle, Shield, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

export default function AdminStaffPage() {
  const { success, error: toastError } = useToast();

  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New staff modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "Password123!",
    employeeId: "",
    specialization: "ELECTRICAL",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.success) {
        setStaffMembers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });
      const data = await res.json();
      if (data.success) {
        setAddModalOpen(false);
        success(`Staff technician ${newStaff.name} onboarded!`);
        setNewStaff({
          name: "",
          email: "",
          password: "Password123!",
          employeeId: "",
          specialization: "ELECTRICAL",
        });
        fetchStaff();
      } else {
        toastError(data.error?.message || "Failed to add staff member");
      }
    } catch (err) {
      toastError("Error creating staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Maintenance Technicians & Staff Specializations
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage field technicians, assign category specializations, and balance operational workload.
          </p>
        </div>

        <Button size="sm" onClick={() => setAddModalOpen(true)} className="gap-1.5 font-semibold text-xs">
          <Plus className="w-4 h-4" /> Onboard Technician
        </Button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-xs text-muted-foreground">
            Loading staff roster...
          </div>
        ) : staffMembers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-muted-foreground">
            No maintenance technicians found.
          </div>
        ) : (
          staffMembers.map((staff) => (
            <div
              key={staff.id}
              className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <img
                    src={staff.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(staff.name)}&backgroundColor=ffd5dc,ffdfbf,d1d4f9`}
                    alt={staff.name}
                    className="w-8 h-8 rounded-full bg-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{staff.name}</h3>
                    <p className="text-[11px] text-muted-foreground font-mono">{staff.studentOrEmployeeId || "EMP-000"}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                  {staff.specialization}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Contact Email:</span>
                  <span className="font-medium text-foreground">{staff.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Live Queue:</span>
                  <span className="font-bold text-foreground">{staff.currentWorkload} active ticket(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Repairs:</span>
                  <span className="font-bold text-emerald-600">{staff.resolvedTickets} fixes</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Onboard Staff Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Onboard Maintenance Technician"
        description="Add a new technician and assign their specialization domain"
      >
        <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
          <Input
            label="Full Name"
            value={newStaff.name}
            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            placeholder="e.g. David Martinez"
            required
          />

          <Input
            label="Staff Email"
            type="email"
            value={newStaff.email}
            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
            placeholder="e.g. tech.rajesh@glbitm.edu"
            required
          />

          <Input
            label="Employee ID"
            value={newStaff.employeeId}
            onChange={(e) => setNewStaff({ ...newStaff, employeeId: e.target.value })}
            placeholder="e.g. EMP-STF-106"
          />

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Field Specialization
            </label>
            <select
              value={newStaff.specialization}
              onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
            >
              <option value="ELECTRICAL">ELECTRICAL (Lighting, wiring, power)</option>
              <option value="PLUMBING">PLUMBING (Water pipes, sanitation)</option>
              <option value="HVAC">HVAC (Air conditioning, ventilation)</option>
              <option value="NETWORK">NETWORK (Wi-Fi, IT lab hardware)</option>
              <option value="CARPENTRY">CARPENTRY (Desks, doors, chairs)</option>
              <option value="CLEANING">CLEANING (Sanitation, waste)</option>
            </select>
          </div>

          <Input
            label="Initial Password"
            type="password"
            value={newStaff.password}
            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              Onboard Staff Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
