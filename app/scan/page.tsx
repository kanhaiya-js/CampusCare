"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  MapPin,
  Shield,
  ArrowRight,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building,
  RefreshCw,
  Upload,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationData {
  id: string;
  name: string;
  building: string;
  floor?: string;
  room?: string;
}

function ScanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const locationIdParam = searchParams.get("locationId") || "";
  const roomParam = searchParams.get("room") || "";

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [scannedLocation, setScannedLocation] = useState<LocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // In-app camera scanner states
  const [allLocations, setAllLocations] = useState<LocationData[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualLocationId, setManualLocationId] = useState("");
  const [manualRoom, setManualRoom] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
    fetchLocations();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.data?.user) {
        setCurrentUser(data.data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsAuthChecking(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      if (data.success) {
        setAllLocations(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // If locationIdParam exists in URL, fetch location details
  useEffect(() => {
    if (locationIdParam) {
      fetchScannedLocation(locationIdParam);
    }
  }, [locationIdParam]);

  const fetchScannedLocation = async (id: string) => {
    setIsLoadingLocation(true);
    try {
      const res = await fetch(`/api/locations/${id}`);
      const data = await res.json();
      if (data.success) {
        setScannedLocation(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch location", err);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Camera start / stop handlers
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this browser");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check for BarcodeDetector API
      if ("BarcodeDetector" in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ["qr_code"],
        });

        const interval = setInterval(async () => {
          if (!videoRef.current || !streamRef.current) {
            clearInterval(interval);
            return;
          }
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              clearInterval(interval);
              handleScannedUrl(barcodes[0].rawValue);
            }
          } catch {
            // Frame detection error, continue next frame
          }
        }, 500);
      }
    } catch (err: any) {
      setCameraError(err.message || "Could not access device camera");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleScannedUrl = (scannedText: string) => {
    stopCamera();
    try {
      const url = new URL(scannedText);
      const locId = url.searchParams.get("locationId");
      const r = url.searchParams.get("room") || "";
      if (locId) {
        router.push(`/scan?locationId=${locId}${r ? `&room=${encodeURIComponent(r)}` : ""}`);
        return;
      }
    } catch {
      // If it's a relative path or raw ID
      if (scannedText.includes("locationId=")) {
        const params = new URLSearchParams(scannedText.split("?")[1] || scannedText);
        const locId = params.get("locationId");
        const r = params.get("room") || "";
        if (locId) {
          router.push(`/scan?locationId=${locId}${r ? `&room=${encodeURIComponent(r)}` : ""}`);
          return;
        }
      }
    }
    // Fallback: search by name
    const match = allLocations.find(
      (l) => l.name.toLowerCase().includes(scannedText.toLowerCase()) || l.id === scannedText
    );
    if (match) {
      router.push(`/scan?locationId=${match.id}`);
    } else {
      setCameraError("Unrecognized QR code format. Please scan a valid CampusCare room placard.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocationId) return;
    router.push(
      `/scan?locationId=${manualLocationId}${manualRoom ? `&room=${encodeURIComponent(manualRoom)}` : ""}`
    );
  };

  // Determine target report URL
  const targetReportUrl = locationIdParam
    ? `/issues/report?locationId=${locationIdParam}${roomParam ? `&room=${encodeURIComponent(roomParam)}` : ""}`
    : "/issues/report";

  // Login callback URL
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(targetReportUrl)}`;

  // ==========================================
  // SCENARIO 1: SCANNED A SPECIFIC LOCATION QR
  // ==========================================
  if (locationIdParam) {
    const displayBuilding = scannedLocation?.building || "Campus Building";
    const displayName = scannedLocation?.name || "Target Facility";
    const displayRoom = roomParam || scannedLocation?.room || "";

    return (
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 w-full">
        {/* Top return link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Main Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* QR Scan Success Badge */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <QrCode className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Room QR Code Scanned Successfully
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-orbitron">
              {displayBuilding}
            </h1>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
              {displayName}
            </p>
            {displayRoom && (
              <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-muted text-xs font-extrabold text-foreground border border-border">
                📍 Room / Zone: {displayRoom}
              </div>
            )}
          </div>

          {/* User Authentication Status Check */}
          {isAuthChecking ? (
            <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary-500" />
              Checking student login status...
            </div>
          ) : currentUser ? (
            // LOGGED IN USER
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-800/80 text-left text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" /> Signed in as {currentUser.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  You are verified to log maintenance tickets for this campus location. All reported issues will be routed directly to the specialized technician squad for {displayBuilding}.
                </p>
              </div>

              <Link href={targetReportUrl} className="block">
                <Button size="lg" className="w-full gap-2 shadow-md text-sm font-bold">
                  Raise Issue at this Room <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            // NOT LOGGED IN USER
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/80 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-sm">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Student Login Required
                </div>
                <p className="text-amber-900/90 dark:text-amber-300/90 leading-relaxed text-[11px]">
                  To prevent unauthorized or fraudulent reports, students and staff must authenticate before logging campus repairs. After sign-in, you will be taken directly to the issue submission page for <strong>{displayBuilding} ({displayRoom || displayName})</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <Link href={loginUrl} className="block">
                  <Button size="lg" className="w-full gap-2 shadow-md text-sm font-bold">
                    Sign In to Raise Issue <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <div className="text-center pt-2">
                  <Link
                    href={`/register?callbackUrl=${encodeURIComponent(targetReportUrl)}`}
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Don&apos;t have an account? Register new student account
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // SCENARIO 2: IN-APP SCANNER / LOCATION PICKER
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 mb-3">
          <QrCode className="w-4 h-4" />
          Campus QR Dispatch System
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-orbitron">
          Scan Location / Room QR Code
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Point your device camera at any CampusCare QR placard placed on classroom doors, labs, or hostels to instantly report broken facilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Camera Viewfinder Box */}
        <div className="p-6 rounded-3xl border border-border bg-card shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="font-bold text-sm text-foreground flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary-500" /> Device Camera Scanner
            </span>
            {isCameraActive && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 animate-pulse">
                Active Feed
              </span>
            )}
          </div>

          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {/* Viewfinder Target Overlay */}
                <div className="absolute inset-8 border-2 border-primary-500/80 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-primary-400 shadow-[0_0_12px_rgba(99,102,241,1)] animate-bounce" />
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-xs">Camera is currently turned off</p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300">
              <AlertCircle className="w-4 h-4 inline mr-1.5" />
              {cameraError}
            </div>
          )}

          <div className="flex gap-2">
            {!isCameraActive ? (
              <Button size="md" className="w-full gap-2 font-bold" onClick={startCamera}>
                <Camera className="w-4 h-4" /> Start Camera Scanner
              </Button>
            ) : (
              <Button size="md" variant="outline" className="w-full" onClick={stopCamera}>
                Stop Camera
              </Button>
            )}
          </div>
        </div>

        {/* Quick Room Selector / Simulator */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-border bg-card shadow-lg space-y-4">
            <div className="pb-3 border-b border-border">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-primary-500" />
                Select Room / Location
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Simulate a QR scan or select your location manually if camera is unavailable
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Campus Facility / Building <span className="text-red-500">*</span>
                </label>
                <select
                  value={manualLocationId}
                  onChange={(e) => setManualLocationId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-primary-500"
                  required
                >
                  <option value="">-- Choose Campus Facility --</option>
                  {allLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.building} — {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Specific Room / Hall (Optional)
                </label>
                <input
                  type="text"
                  value={manualRoom}
                  onChange={(e) => setManualRoom(e.target.value)}
                  placeholder="e.g. Lab 3, Room 204, Auditorium Wing A"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-primary-500"
                />
              </div>

              <Button
                type="submit"
                size="md"
                className="w-full gap-2 font-bold mt-2"
                disabled={!manualLocationId}
              >
                Proceed to Location Portal <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-2 text-xs">
            <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">
              Popular Campus QR Locations
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allLocations.slice(0, 4).map((loc) => (
                <Link
                  key={loc.id}
                  href={`/scan?locationId=${loc.id}${loc.room ? `&room=${encodeURIComponent(loc.room)}` : ""}`}
                  className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border text-[11px] font-medium text-foreground transition-colors"
                >
                  📍 {loc.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-center text-xs text-muted-foreground">
          Loading QR scanner...
        </div>
      }
    >
      <ScanPageContent />
    </Suspense>
  );
}
