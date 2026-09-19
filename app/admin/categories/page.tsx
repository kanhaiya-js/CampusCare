"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PriorityBadge } from "@/components/issues/status-badge";
import { useToast } from "@/components/ui/toast";

export default function AdminCategoriesPage() {
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Category modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "AlertCircle",
    defaultPriority: "MEDIUM",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        success(`Category "${formData.name}" created!`);
        setFormData({ name: "", description: "", icon: "AlertCircle", defaultPriority: "MEDIUM" });
        fetchCategories();
      } else {
        toastError(data.error?.message || "Failed to create category");
      }
    } catch (err) {
      toastError("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Campus Issue Categories
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure issue taxonomy, baseline priority triggers, and icon indicators.
          </p>
        </div>

        <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 font-semibold text-xs">
          <Plus className="w-4 h-4" /> Add New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-xs text-muted-foreground">
            Loading categories...
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground">{cat.name}</h3>
                <PriorityBadge priority={cat.defaultPriority} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {cat.description || "No description provided."}
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>{cat._count?.issues || 0} tickets linked</span>
                <span className="text-emerald-600 font-semibold">Active</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Issue Category"
        description="Add a new classification for campus problem reports"
      >
        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Elevators & Lifts"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what kind of complaints fall under this classification..."
            rows={3}
          />

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Baseline Default Priority
            </label>
            <select
              value={formData.defaultPriority}
              onChange={(e) => setFormData({ ...formData, defaultPriority: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
