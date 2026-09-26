"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Filter, AlertTriangle, ArrowRight, Layers, CheckCircle2 } from "lucide-react";
import CampusMap from "@/components/maps/campus-map";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/issues/status-badge";

export default function CampusMapPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMapIssues();
  }, [filterPriority, filterStatus]);

  const fetchMapIssues = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ limit: "50" });
      if (filterPriority) query.set("priority", filterPriority);
      if (filterStatus) query.set("status", filterStatus);

      const res = await fetch(`/api/issues?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        // Map into format required by CampusMap
        const formatted = data.data.issues.map((i: any) => ({
          id: i.id,
          publicIssueId: i.publicIssueId,
          title: i.title,
          latitude: i.latitude || i.location?.latitude || null,
          longitude: i.longitude || i.location?.longitude || null,
          priority: i.priority,
          status: i.status,
          locationName: i.location?.name || "Campus Location",
          room: i.room,
          categoryName: i.category?.name || "Maintenance",
        }));
        setIssues(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activePinsCount = issues.filter((i) => i.latitude && i.longitude).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-primary-100 dark:bg-primary-950 text-primary-600">
              <MapPin className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              GLBITM Knowledge Park 3, Greater Noida
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Interactive Campus Facility Map
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Geographic hotspot visualization of classroom, laboratory, library, and hostel maintenance tickets.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold bg-muted/60 p-2.5 rounded-xl border border-border">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            Critical Hazard
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            High Urgency
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            Routine
          </span>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter Pins:
          </span>
          <button
            onClick={() => setFilterPriority("")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filterPriority === "" ? "bg-primary-600 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Severities
          </button>
          <button
            onClick={() => setFilterPriority("CRITICAL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filterPriority === "CRITICAL"
                ? "bg-red-600 text-white"
                : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
            }`}
          >
            Critical Only
          </button>
          <button
            onClick={() => setFilterPriority("HIGH")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filterPriority === "HIGH"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
            }`}
          >
            High
          </button>
        </div>

        <span className="text-xs text-muted-foreground font-medium">
          Plotting {activePinsCount} geocoded campus issues
        </span>
      </div>

      {/* Map & Inspector Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[500px]">
        {/* Leaflet Map */}
        <div className="lg:col-span-3 h-[550px]">
          <CampusMap zoom={17} issues={issues} onSelectIssue={(issue: any) => setSelectedIssue(issue)} />
        </div>

        {/* Selected Marker Inspector Panel */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between h-[550px]">
          {selectedIssue ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="font-mono font-bold text-xs text-primary-600 dark:text-primary-400">
                  #{selectedIssue.publicIssueId}
                </span>
                <StatusBadge status={selectedIssue.status} />
              </div>

              <div>
                <PriorityBadge priority={selectedIssue.priority} className="mb-2" />
                <h3 className="font-bold text-base text-foreground mt-1 leading-snug">
                  {selectedIssue.title}
                </h3>
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Facility Location</span>
                  <span className="font-semibold text-foreground">{selectedIssue.locationName}</span>
                  {selectedIssue.room && (
                    <span className="block text-muted-foreground text-[11px]">Room: {selectedIssue.room}</span>
                  )}
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Category</span>
                  <span className="font-semibold text-foreground">{selectedIssue.categoryName}</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Coordinates</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {selectedIssue.latitude.toFixed(4)}°N, {selectedIssue.longitude.toFixed(4)}°E
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Link href={`/issues/${selectedIssue.id}`}>
                  <Button size="md" className="w-full gap-2">
                    Open Issue Details <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <MapPin className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <h4 className="text-sm font-bold text-foreground">Select an Issue Marker</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Click any pulsing pin on the map to inspect ticket details, severity, room location, and live status.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            {selectedIssue ? (
              <Link href={`/issues/report?locationId=${selectedIssue.locationId || ""}&room=${encodeURIComponent(selectedIssue.room || "")}`}>
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5 border-primary-500/40 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40">
                  <MapPin className="w-3.5 h-3.5" />
                  Report Issue At Selected Location
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full text-xs opacity-50 cursor-not-allowed gap-1.5 bg-muted/40 text-muted-foreground border-dashed pointer-events-none"
                title="Please select an issue pin on the map first"
              >
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                Report Issue At Current Location
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
