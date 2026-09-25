"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Search,
  Filter,
  Building,
  MapPin,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeDisplay } from "@/components/ui/qr-code-display";
import { useToast } from "@/components/ui/toast";

interface LocationItem {
  id: string;
  name: string;
  building: string;
  floor?: string;
  room?: string;
  facilityType?: string;
}

export default function QRGeneratorPage() {
  const { success } = useToast();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"generate" | "directory">("generate");

  // Generator Form State
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [customBuilding, setCustomBuilding] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState<string>("Lab A-102");
  const [customName, setCustomName] = useState<string>("");
  const [facilityType, setFacilityType] = useState<string>("LABORATORY");
  const [copied, setCopied] = useState(false);

  // Placard for printing
  const [printPlacard, setPrintPlacard] = useState<{
    title: string;
    building: string;
    room: string;
    type: string;
    url: string;
  } | null>(null);

  // Directory Search, Filter & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;
  const [useLiveDomain, setUseLiveDomain] = useState(true);

  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBuilding]);

  // Target domain for QR encoding (ensures any external camera can open the URL from any device)
  const origin = useMemo(() => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (isLocal && useLiveDomain) {
        return "https://campuscare.onrender.com";
      }
      return window.location.origin;
    }
    return "https://campuscare.onrender.com";
  }, [useLiveDomain]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLocations(data.data);
        if (data.data.length > 0) {
          setSelectedLocationId(data.data[0].id);
          setCustomBuilding(data.data[0].building);
        }
      }
    } catch (e) {
      console.error("Failed to load campus locations:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Selected location object from DB
  const selectedLocation = useMemo(() => {
    return locations.find((l) => l.id === selectedLocationId) || null;
  }, [locations, selectedLocationId]);

  // Target generated URL
  const generatedUrl = useMemo(() => {
    const locId = selectedLocationId || (locations[0]?.id || "loc-campus");
    const roomParam = roomNumber.trim() ? `&room=${encodeURIComponent(roomNumber.trim())}` : "";
    return `${origin}/scan?locationId=${locId}${roomParam}`;
  }, [origin, selectedLocationId, roomNumber, locations]);

  const displayBuilding = selectedLocation?.building || customBuilding || "GLBITM Campus";
  const displayName = customName.trim() || selectedLocation?.name || `${displayBuilding} ${roomNumber ? `(${roomNumber})` : ""}`;

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      success("Location QR link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrintCurrent = () => {
    setPrintPlacard({
      title: displayName,
      building: displayBuilding,
      room: roomNumber,
      type: facilityType,
      url: generatedUrl,
    });
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handlePrintDirectoryItem = (loc: LocationItem) => {
    const url = `${origin}/scan?locationId=${loc.id}${loc.room ? `&room=${encodeURIComponent(loc.room)}` : ""}`;
    setPrintPlacard({
      title: loc.name,
      building: loc.building,
      room: loc.room || "",
      type: loc.facilityType || "CAMPUS_AREA",
      url,
    });
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Buildings list for filtering
  const allBuildings = useMemo(() => {
    return Array.from(new Set(locations.map((l) => l.building)));
  }, [locations]);

  const filteredDirectory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return locations.filter((loc) => {
      const matchesSearch =
        !q ||
        loc.name.toLowerCase().includes(q) ||
        loc.building.toLowerCase().includes(q) ||
        (loc.room && loc.room.toLowerCase().includes(q));
      const matchesBuilding = filterBuilding === "ALL" || loc.building === filterBuilding;
      return matchesSearch && matchesBuilding;
    });
  }, [locations, searchQuery, filterBuilding]);

  const totalPages = Math.ceil(filteredDirectory.length / PAGE_SIZE) || 1;
  const paginatedDirectory = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDirectory.slice(start, start + PAGE_SIZE);
  }, [filteredDirectory, currentPage]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Printable Placard Template (Visible only when printing) */}
      {printPlacard && (
        <div id="print-placard-area" className="hidden print:block print:p-8 bg-white text-slate-900 min-h-screen">
          <div className="max-w-xl mx-auto border-4 border-slate-900 rounded-3xl p-8 text-center space-y-6 bg-white shadow-none">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img src="/logo.png" alt="GLBITM" className="w-12 h-12 object-contain" />
                <div className="text-left">
                  <h2 className="text-xs font-black tracking-widest uppercase text-slate-700">
                    GL Bajaj Institute of Technology &amp; Management
                  </h2>
                  <h1 className="text-xl font-black font-orbitron text-slate-950">
                    CampusCare Facility Dispatch
                  </h1>
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-600 tracking-wide uppercase">
                Official Campus Maintenance &amp; Classroom Service Station
              </p>
            </div>

            {/* Room Banner */}
            <div className="bg-slate-100 border-2 border-slate-900 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest block">
                {printPlacard.building}
              </span>
              <h2 className="text-2xl font-black text-slate-950 mt-0.5">
                {printPlacard.title}
              </h2>
              {printPlacard.room && (
                <div className="text-lg font-black text-indigo-700 mt-1">
                  ROOM / LAB: {printPlacard.room}
                </div>
              )}
            </div>

            {/* Scannable QR Code */}
            <div className="flex justify-center py-2">
              <QRCodeDisplay
                value={printPlacard.url}
                size={260}
                fgColor="#000000"
                bgColor="#ffffff"
                title={`${printPlacard.building} ${printPlacard.room}`}
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
              <span>Official CampusCare Room Placard</span>
              <span>G.L. Bajaj Institute of Technology &amp; Management</span>
            </div>
          </div>
        </div>
      )}

      {/* Screen Interface */}
      <div className="print:hidden space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-2xs">
            <QrCode className="w-3.5 h-3.5 text-primary-600 animate-pulse" />
            GLBITM Official QR Location System
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight font-orbitron">
            Campus Room QR Generator &amp; Directory
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Create instant, scannable QR tags for classrooms, computer labs, study halls, and hostel rooms.
            Anyone scanning with their smartphone camera can report facility issues in under 30 seconds.
          </p>

          {/* Tab Selector */}
          <div className="inline-flex p-1 rounded-xl bg-muted/80 border border-border shadow-inner mt-4">
            <button
              onClick={() => setActiveTab("generate")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "generate"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              ⚡ Generate QR Code (Recommended)
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "directory"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-primary-500" />
              📋 Campus Locations Directory ({locations.length})
            </button>
          </div>
        </div>

        {/* TAB 1: QR GENERATOR (PREFERRED VIEW) */}
        {activeTab === "generate" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls Column (7 cols) */}
            <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-foreground">Location &amp; Room Parameters</h2>
                    <p className="text-xs text-muted-foreground">Select a campus building or enter custom room details</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Live Sync
                </span>
              </div>

              {/* Building Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  1. Campus Building / Block
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedLocationId(id);
                    const matched = locations.find((l) => l.id === id);
                    if (matched) {
                      setCustomBuilding(matched.building);
                      if (matched.room) setRoomNumber(matched.room);
                    }
                  }}
                  className="w-full p-3 rounded-xl border border-border bg-background text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.building} — {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room / Desk / Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    2. Specific Room / Lab / Desk
                  </label>
                  <Input
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Lab A-102, Room 304, Desk 12"
                    className="font-medium"
                  />
                  <p className="text-[11px] text-muted-foreground">Appears in technician dispatch orders</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    3. Facility Type
                  </label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="LABORATORY">Computer &amp; Engineering Lab</option>
                    <option value="CLASSROOM">Classroom / Lecture Hall</option>
                    <option value="LIBRARY">Library &amp; Reading Room</option>
                    <option value="HOSTEL">Hostel Common / Room</option>
                    <option value="AUDITORIUM">Auditorium &amp; Event Hall</option>
                    <option value="CAFETERIA">Cafeteria &amp; Student Centre</option>
                    <option value="UTILITY">Water Cooler / Restroom / Utility</option>
                  </select>
                </div>
              </div>

              {/* Custom Display Label (Optional) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  4. Custom Placard Name (Optional)
                </label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={`Default: ${displayName}`}
                  className="font-medium"
                />
              </div>

              {/* Encoded URL Preview */}
              <div className="p-3.5 rounded-2xl bg-muted/60 border border-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Encoded Smartphone Deep-Link</span>
                  <span className="text-primary-600 font-mono text-[10px]">Zero App Install Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedUrl}
                    className="flex-1 text-xs font-mono bg-background px-3 py-2 rounded-lg border border-border text-foreground select-all outline-none"
                  />
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 shrink-0 text-xs">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  ⚡ Quick GLBITM Room Presets
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "CSE Lab A-102", room: "Lab A-102", building: "Computer Centre" },
                    { label: "Library 3rd Floor", room: "3rd Floor Quiet Wing", building: "Central Library" },
                    { label: "Block B Staircase Water Cooler", room: "Ground Floor Staircase", building: "Academic Block B" },
                    { label: "Boys Hostel Room 214", room: "Room 214", building: "Boys Hostel Block 2" },
                    { label: "SHD Auditorium AV Booth", room: "Main Stage AV Booth", building: "SHD Auditorium Complex" },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setRoomNumber(preset.room);
                        const match = locations.find((l) => l.building.includes(preset.building) || l.name.includes(preset.building));
                        if (match) setSelectedLocationId(match.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-background hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Live Preview Column (5 cols) */}
            <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-20 text-center">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Universal Scannable Placard
                </div>
                <h3 className="text-xl font-bold text-foreground">{displayName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{displayBuilding}</p>
                {roomNumber && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-muted text-foreground border border-border">
                    📍 {roomNumber}
                  </span>
                )}
              </div>

              {/* Dynamic QR Code */}
              <div className="flex flex-col items-center justify-center p-2 space-y-2">
                <QRCodeDisplay
                  value={generatedUrl}
                  size={240}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  title={`${displayBuilding} - ${roomNumber}`}
                  showDownload={true}
                  showCopy={false}
                  fileName={`campuscare-${displayBuilding.toLowerCase().replace(/\s+/g, "-")}-${roomNumber.toLowerCase().replace(/\s+/g, "-")}`}
                />
                <p className="text-[11px] text-muted-foreground font-medium">
                  📷 Scannable with any camera (iPhone, Google Lens, Paytm, WhatsApp)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={handlePrintCurrent}
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold shadow-md shadow-indigo-500/20"
                >
                  <Printer className="w-4 h-4" />
                  Print Official Door Placard
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="w-full gap-1.5 text-xs font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "Copied" : "Copy Link"}
                  </Button>

                  <Link href={generatedUrl.replace(origin, "")} className="w-full">
                    <Button variant="outline" className="w-full gap-1.5 text-xs font-semibold">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Room Link
                    </Button>
                  </Link>
                </div>
              </div>

              {/* How it works info */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-left text-xs space-y-1.5 text-muted-foreground">
                <p className="font-bold text-foreground text-[11px] uppercase tracking-wide">
                  📱 What happens when scanned?
                </p>
                <p className="text-[11px] leading-relaxed">
                  Smartphones open the CampusCare fast-ticket screen with <strong>{displayBuilding}</strong> and <strong>{roomNumber || "assigned room"}</strong> automatically locked into the ticket dispatch form.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAMPUS LOCATIONS DIRECTORY */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by building, room, or facility..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Building Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setFilterBuilding("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    filterBuilding === "ALL"
                      ? "bg-primary-600 text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Buildings
                </button>
                {allBuildings.slice(0, 5).map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilterBuilding(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      filterBuilding === b
                        ? "bg-primary-600 text-white"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Locations */}
            {isLoading ? (
              <div className="p-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-primary-500" />
                Loading campus locations...
              </div>
            ) : filteredDirectory.length === 0 ? (
              <div className="p-16 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                No campus locations match your filter.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedDirectory.map((loc) => {
                    const locUrl = `${origin}/scan?locationId=${loc.id}${loc.room ? `&room=${encodeURIComponent(loc.room)}` : ""}`;
                    return (
                      <div
                        key={loc.id}
                        className="p-5 rounded-2xl border border-border bg-card hover:border-primary-400 dark:hover:border-primary-700 shadow-sm transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                              {loc.building}
                            </span>
                            <h3 className="font-bold text-sm text-foreground truncate mt-0.5">
                              {loc.name}
                            </h3>
                            {loc.room && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-muted text-foreground border border-border">
                                📍 {loc.room}
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 shrink-0">
                            {loc.facilityType || "CAMPUS"}
                          </span>
                        </div>

                        {/* Scannable Thumbnail */}
                        <div className="flex items-center justify-center p-3 bg-muted/40 rounded-xl">
                          <QRCodeDisplay
                            value={locUrl}
                            size={150}
                            fgColor="#000000"
                            bgColor="#ffffff"
                            title={loc.name}
                          />
                        </div>

                        {/* Card Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrintDirectoryItem(loc)}
                            className="gap-1.5 text-xs font-semibold"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print Tag
                          </Button>

                          <Link href={`/scan?locationId=${loc.id}${loc.room ? `&room=${encodeURIComponent(loc.room)}` : ""}`}>
                            <Button size="sm" variant="primary" className="w-full gap-1.5 text-xs font-semibold">
                              <ExternalLink className="w-3.5 h-3.5" />
                              Scan Link
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Directory Pagination & Stats Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border text-xs text-muted-foreground">
                  <span className="font-medium">
                    Showing {paginatedDirectory.length} of {filteredDirectory.length} campus facilities
                  </span>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="text-xs h-8 px-3"
                      >
                        Previous
                      </Button>
                      <span className="font-bold text-foreground text-xs px-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="text-xs h-8 px-3"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
