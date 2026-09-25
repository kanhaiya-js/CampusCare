"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  QrCode,
  Printer,
  Download,
  Search,
  Filter,
  Building,
  MapPin,
  Sparkles,
  ArrowLeft,
  Plus,
  Check,
  Copy,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeDisplay } from "@/components/ui/qr-code-display";
import { useToast } from "@/components/ui/toast";

interface Location {
  id: string;
  name: string;
  building: string;
  floor?: string;
  room?: string;
  facilityType?: string;
}

export default function AdminQRCodesPage() {
  const { success } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("ALL");

  // Selected location for detailed modal / print view
  const [activePlacard, setActivePlacard] = useState<Location | null>(null);

  // Custom room QR generator state
  const [customBuilding, setCustomBuilding] = useState("");
  const [customRoom, setCustomRoom] = useState("");
  const [customLocationName, setCustomLocationName] = useState("");
  const origin = useMemo(() => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (isLocal) {
        return "https://campuscare.onrender.com";
      }
      return window.location.origin;
    }
    return "https://campuscare.onrender.com";
  }, []);

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
        if (data.data.length > 0) {
          setCustomBuilding(data.data[0].building);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const buildings = Array.from(new Set(locations.map((l) => l.building)));

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.room && loc.room.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBuilding = selectedBuilding === "ALL" || loc.building === selectedBuilding;
    return matchesSearch && matchesBuilding;
  });

  const getQRUrl = (loc: Location, specificRoom?: string) => {
    const roomVal = specificRoom !== undefined ? specificRoom : loc.room || "";
    return `${origin}/scan?locationId=${loc.id}${roomVal ? `&room=${encodeURIComponent(roomVal)}` : ""}`;
  };

  const handlePrint = (loc: Location) => {
    setActivePlacard(loc);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleGenerateCustomPlacard = (e: React.FormEvent) => {
    e.preventDefault();
    const parentLoc = locations.find((l) => l.building === customBuilding);
    if (!parentLoc) return;

    const customLoc: Location = {
      id: parentLoc.id,
      name: customLocationName || `${customBuilding} - ${customRoom}`,
      building: customBuilding,
      room: customRoom,
      facilityType: parentLoc.facilityType,
    };
    setActivePlacard(customLoc);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Print-Only Placard Template */}
      {activePlacard && (
        <div id="print-placard-area" className="hidden print:block print:p-8 bg-white text-slate-900 min-h-screen">
          <div className="max-w-xl mx-auto border-4 border-slate-900 rounded-3xl p-8 text-center space-y-6 bg-white shadow-none">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img src="/logo.png" alt="GLBITM" className="w-12 h-12 object-contain" />
                <div className="text-left">
                  <h2 className="text-xs font-black tracking-widest uppercase text-slate-700">
                    GL Bajaj Institute of Technology & Management
                  </h2>
                  <h1 className="text-xl font-black font-orbitron text-slate-950">
                    CampusCare Facility Dispatch
                  </h1>
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-600 tracking-wide uppercase">
                Official Campus Maintenance & Classroom Service Station
              </p>
            </div>

            {/* Room Banner */}
            <div className="bg-slate-100 border-2 border-slate-900 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest block">
                {activePlacard.building}
              </span>
              <h2 className="text-2xl font-black text-slate-950 mt-0.5">
                {activePlacard.name}
              </h2>
              {activePlacard.room && (
                <div className="text-lg font-black text-indigo-700 mt-1">
                  ROOM / LAB: {activePlacard.room}
                </div>
              )}
            </div>

            {/* Large Scannable QR Code */}
            <div className="flex justify-center py-2">
              <QRCodeDisplay
                value={getQRUrl(activePlacard)}
                size={260}
                fgColor="#000000"
                bgColor="#ffffff"
                title={`${activePlacard.building} ${activePlacard.room || ""}`}
              />
            </div>

            {/* Instructions */}
            <div className="text-left bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-2 text-xs">
              <p className="font-extrabold text-slate-900 uppercase tracking-wide text-[11px]">
                How to report a broken facility in this room:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-slate-700 font-medium text-[11px]">
                <li>Open your smartphone camera or any QR scanner and scan the code above.</li>
                <li>Sign in with your student or faculty GLBITM email.</li>
                <li>Select the problem (AC leak, fan, projector, lights, chair, whiteboard).</li>
                <li>Technicians are dispatched directly to this room with replacement parts.</li>
              </ol>
            </div>

            {/* Placard Footer */}
            <div className="pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Location ID: {activePlacard.id.slice(0, 10)}</span>
              <span>CampusCare Emergency Support: 1800-180-5522</span>
            </div>
          </div>
        </div>
      )}

      {/* Screen Interface */}
      <div className="print:hidden space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
              <QrCode className="w-4 h-4" />
              Facility Management
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight font-orbitron">
              Campus Room QR Code Directory
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Print official door placards and QR codes for every classroom, laboratory, hostel, and hall.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/locations">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5" /> Manage Locations
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => {
                if (locations.length > 0) handlePrint(locations[0]);
              }}
              className="gap-1.5 text-xs font-bold"
            >
              <Printer className="w-3.5 h-3.5" /> Quick Print Placard
            </Button>
          </div>
        </div>

        {/* Custom Room Placard Generator Card */}
        <div className="p-6 rounded-3xl border border-primary-200 dark:border-primary-900 bg-primary-50/40 dark:bg-primary-950/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Custom Room QR Placard Generator
                </h3>
                <p className="text-xs text-muted-foreground">
                  Generate an official door QR placard for any specific room number or lab
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleGenerateCustomPlacard} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Campus Building / Block
              </label>
              <select
                value={customBuilding}
                onChange={(e) => setCustomBuilding(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-primary-500"
                required
              >
                {buildings.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Specific Room Number
              </label>
              <input
                type="text"
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                placeholder="e.g. Room A-301, Lab 4, Audi Wing 2"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Facility Display Title
              </label>
              <input
                type="text"
                value={customLocationName}
                onChange={(e) => setCustomLocationName(e.target.value)}
                placeholder="e.g. Advanced AI & Robotics Lab"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-primary-500"
              />
            </div>

            <div className="flex items-end">
              <Button type="submit" size="md" className="w-full gap-2 font-bold text-xs">
                <Printer className="w-4 h-4" /> Preview & Print Placard
              </Button>
            </div>
          </form>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search building, room, or lab..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus-visible:ring-2 focus-visible:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedBuilding("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedBuilding === "ALL"
                  ? "bg-primary-600 text-white shadow-xs"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              All Buildings ({locations.length})
            </button>
            {buildings.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBuilding(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedBuilding === b
                    ? "bg-primary-600 text-white shadow-xs"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Location Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            <div className="col-span-full p-12 text-center text-xs text-muted-foreground">
              Loading campus QR directory...
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
              No campus locations matched your filter.
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const qrUrl = getQRUrl(loc);
              return (
                <div
                  key={loc.id}
                  className="p-5 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-border">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                          {loc.building}
                        </span>
                        <h4 className="font-bold text-sm text-foreground line-clamp-1">
                          {loc.name}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-muted text-foreground shrink-0">
                        {loc.room || "Main Zone"}
                      </span>
                    </div>

                    {/* QR Display */}
                    <div className="py-2 flex justify-center">
                      <QRCodeDisplay
                        value={qrUrl}
                        size={170}
                        title={`${loc.building} - ${loc.name}`}
                        showCopy={true}
                        showDownload={true}
                        fileName={`campuscare-qr-${loc.building}-${loc.room || "location"}`.toLowerCase().replace(/\s+/g, "-")}
                      />
                    </div>

                    <div className="text-[11px] text-muted-foreground text-center font-mono truncate px-2">
                      {qrUrl}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs font-semibold"
                      onClick={() => handlePrint(loc)}
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Door Placard
                    </Button>
                    <Link
                      href={`/scan?locationId=${loc.id}${loc.room ? `&room=${encodeURIComponent(loc.room)}` : ""}`}
                      className="shrink-0"
                    >
                      <Button variant="ghost" size="sm" className="text-xs">
                        Test Link
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
