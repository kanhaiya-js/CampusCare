"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Plus, Building, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

export default function AdminLocationsPage() {
  const { success, error: toastError } = useToast();

  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New location modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    building: "",
    floor: "",
    room: "",
    latitude: 28.545,
    longitude: 77.192,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      if (data.success) {
        setLocations(data.data);
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
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        success(`Location "${formData.name}" added!`);
        fetchLocations();
      } else {
        toastError(data.error?.message || "Failed to create location");
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
            Campus Buildings & Locations
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure campus hierarchy, buildings, floors, rooms, and map coordinates for spatial tracking.
          </p>
        </div>

        <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 font-semibold text-xs">
          <Plus className="w-4 h-4" /> Add Campus Location
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-xs text-muted-foreground">
            Loading locations directory...
          </div>
        ) : (
          locations.map((loc) => (
            <div
              key={loc.id}
              className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-bold text-sm text-foreground">{loc.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground">
                  {loc.building}
                </span>
              </div>

              <div className="space-y-1 text-muted-foreground">
                {loc.floor && <div>Floor: {loc.floor}</div>}
                {loc.room && <div>Designated Room: {loc.room}</div>}
                {loc.latitude && loc.longitude && (
                  <div className="font-mono text-[10px]">
                    📍 {loc.latitude.toFixed(4)}°N, {loc.longitude.toFixed(4)}°E
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-muted-foreground font-mono">
                <span>{loc._count?.issues || 0} tickets linked</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Location Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Campus Location"
        description="Register a building, block, or specific area for issue reporting"
      >
        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          <Input
            label="Location Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Science Quad Lecture Hall 1"
            required
          />

          <Input
            label="Building / Block Code"
            value={formData.building}
            onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            placeholder="e.g. Building B"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Floor (Optional)"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              placeholder="e.g. Floor 1"
            />
            <Input
              label="Room (Optional)"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="e.g. B-101"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
              required
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              Save Location
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
