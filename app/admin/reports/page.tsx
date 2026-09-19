"use client";

import React, { useState, useEffect } from "react";
import { Download, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data);
      })
      .catch(console.error);
  }, []);

  const getExportUrl = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (selectedStatus) params.set("status", selectedStatus);
    return `/api/admin/reports?${params.toString()}`;
  };

  return (
    <div className="space-y-6 max-w-4xl w-full">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Campus Operations Reports & Data Export
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate audit-ready CSV reports on complaints, resolution times, technician assignments, and satisfaction.
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Facility Maintenance CSV Export</h3>
            <p className="text-xs text-muted-foreground">
              Compatible with Microsoft Excel, Google Sheets, PowerBI, and campus ERP systems.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
            >
              <option value="">All Categories (Complete Campus)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
            >
              <option value="">All Lifecycle Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="REOPENED">REOPENED</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Exported Columns Include:</p>
          <p>
            Public Issue ID, Issue Title, Category, Severity/Priority, Lifecycle Status, Campus Building, Room/Area, Reporter Name & Email, Assigned Technician, Created Timestamp, Resolution Timestamp, Satisfaction Star Rating, and User Feedback Comments.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <a href={getExportUrl()} download>
            <Button size="lg" className="gap-2 shadow-sm font-semibold">
              <Download className="w-4 h-4" /> Download Facility CSV Report
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
