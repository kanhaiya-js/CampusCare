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
  Zap,
  Target,
  Maximize2,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationData {
  id: string;
  name: string;
  building: string;
  floor?: string;
  room?: string;
}

// Play pleasant sci-fi synthesizer chirp using Web Audio API (Zero external assets needed)
function playScanBeep() {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Quick ascending sci-fi double beep
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Ignore audio permission or context restrictions
  }
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

  // Scan simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [targetLocked, setTargetLocked] = useState(false);

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
      if (data.success && Array.isArray(data.data)) {
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
              playScanBeep();
              setTargetLocked(true);
              setTimeout(() => {
                handleScannedUrl(barcodes[0].rawValue);
              }, 600);
            }
          } catch {
            // Frame detection error, continue next frame
          }
        }, 300);
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
    setTargetLocked(false);
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

  // Live Scan Simulation for demoing the animation without a physical QR code
  const triggerScanSimulation = (locId: string, roomName: string) => {
    setIsSimulating(true);
    setTargetLocked(false);
    setCameraError(null);

    // Step 1: Laser sweeps across viewport
    setTimeout(() => {
      // Step 2: Target acquired lock
      playScanBeep();
      setTargetLocked(true);
    }, 1200);

    // Step 3: Navigate to decoded room
    setTimeout(() => {
      setIsSimulating(false);
      setTargetLocked(false);
      router.push(`/scan?locationId=${locId}&room=${encodeURIComponent(roomName)}`);
    }, 1900);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocationId) return;
    triggerScanSimulation(manualLocationId, manualRoom || "Room 101");
  };

  // Determine target report URL
  const targetReportUrl = locationIdParam
    ? `/issues/report?locationId=${locationIdParam}${roomParam ? `&room=${encodeURIComponent(roomParam)}` : ""}`
    : "/issues/report";

  // Login callback URL
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(targetReportUrl)}`;

  // ==========================================
  // SCENARIO 1: SCANNED A SPECIFIC LOCATION QR (CELEBRATORY HOLOGRAM RESULT)
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

        {/* Main Holographic Verified Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Animated decorative glow rings */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* QR Scan Success Hologram Badge with Expanding Ripple Waves */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {/* Ripple Wave 1 */}
            <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping [animation-duration:2.5s] pointer-events-none" />
            {/* Ripple Wave 2 */}
            <div className="absolute -inset-2 rounded-3xl border-2 border-emerald-400/40 animate-pulse [animation-duration:1.8s] pointer-events-none" />
            {/* Core Badge */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 relative z-10">
              <QrCode className="w-10 h-10 animate-pulse" />
            </div>
            {/* Corner Sci-Fi Accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-500" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-500" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-500" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Room QR Verified &amp; Locked
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-orbitron">
              {displayBuilding}
            </h1>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
              {displayName}
            </p>
            {displayRoom && (
              <div className="mt-2 inline-block px-3.5 py-1.5 rounded-xl bg-muted text-xs font-black text-foreground border border-border tracking-wide font-mono">
                📍 ROOM / ZONE: {displayRoom}
              </div>
            )}
          </div>

          {/* User Authentication Status Check */}
          {isAuthChecking ? (
            <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary-500" />
              Verifying student credentials...
            </div>
          ) : currentUser ? (
            // LOGGED IN USER
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary-50/60 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-left">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full bg-slate-200 shrink-0 border border-border"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{currentUser.studentOrEmployeeId || currentUser.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Authenticated
                </span>
              </div>

              <Link href={targetReportUrl} className="block">
                <Button size="lg" className="w-full gap-2 shadow-lg shadow-indigo-500/20 text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white">
                  Continue to Report Issue <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            // NOT LOGGED IN
            <div className="space-y-4 pt-2 border-t border-border text-left">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Sign In Required to Submit Issue
                </p>
                <p className="text-amber-900/90 dark:text-amber-300/90 leading-relaxed text-[11px]">
                  To prevent unauthorized reports, students and staff authenticate before logging campus repairs. You will be taken directly to the dispatch form for <strong>{displayBuilding} ({displayRoom || displayName})</strong>.
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
  // SCENARIO 2: LIVE IN-APP CAMERA SCANNER & ANIMATION VIEWPORT
  // ==========================================
  const isScannerActive = isCameraActive || isSimulating;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-2xs">
          <QrCode className="w-4 h-4 text-primary-600 animate-pulse" />
          GLBITM SmartCampus Scanner
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-orbitron">
          Scan Location / Room QR Code
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Point your device camera at any CampusCare door placard to instantly identify the room and dispatch technicians.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Camera / Animation Viewfinder Box (7 cols) */}
        <div className="md:col-span-7 p-6 rounded-3xl border border-border bg-card shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="font-bold text-sm text-foreground flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary-500" />
              Interactive QR Viewfinder
            </span>
            {isScannerActive ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {targetLocked ? "TARGET LOCKED" : "SCANNING ACTIVE"}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-muted-foreground">Standby</span>
            )}
          </div>

          {/* VIEWPORT CANVAS WITH FUTURISTIC SCI-FI SCANNING LASER */}
          <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner flex items-center justify-center select-none">
            {/* Background scanlines grid */}
            <div className="absolute inset-0 scanline-grid opacity-30 pointer-events-none z-10" />

            {/* Video feed or simulated placard */}
            {isCameraActive ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : isSimulating ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-radial from-slate-900 via-slate-950 to-black text-center">
                {/* Simulated physical door QR placard */}
                <div className={`p-4 rounded-2xl bg-white text-slate-900 border-2 shadow-2xl transition-all duration-300 ${
                  targetLocked ? "scale-105 border-emerald-400 ring-4 ring-emerald-400/50" : "border-slate-300"
                }`}>
                  <div className="flex items-center gap-1.5 mb-2 justify-center">
                    <img src="/logo.png" alt="Logo" className="w-4 h-4 object-contain" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-800">GLBITM Central Library</span>
                  </div>
                  <div className="w-28 h-28 bg-slate-900 p-1 rounded-lg mx-auto flex items-center justify-center">
                    <QrCode className="w-full h-full text-white" />
                  </div>
                  <span className="text-[10px] font-bold font-mono text-indigo-700 block mt-1.5">
                    ROOM: 3rd Floor Quiet Wing
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Camera Scanner is on Standby</p>
                  <p className="text-xs text-slate-500 mt-1">Tap below to activate camera or run the live scan animation</p>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* ADVANCED SCI-FI SCANNING OVERLAY (ACTIVE WHEN SCANNING) */}
            {/* ============================================================ */}
            {isScannerActive && (
              <>
                {/* 1. Four Glowing Animated Corner Brackets */}
                <div className="absolute inset-8 sm:inset-10 pointer-events-none z-20">
                  <div className={`w-8 h-8 border-t-4 border-l-4 rounded-tl-xl absolute top-0 left-0 transition-colors duration-300 ${
                    targetLocked ? "border-emerald-400 shadow-[0_0_15px_#10b981]" : "border-cyan-400 animate-qr-corner shadow-[0_0_12px_#06b6d4]"
                  }`} />
                  <div className={`w-8 h-8 border-t-4 border-r-4 rounded-tr-xl absolute top-0 right-0 transition-colors duration-300 ${
                    targetLocked ? "border-emerald-400 shadow-[0_0_15px_#10b981]" : "border-cyan-400 animate-qr-corner shadow-[0_0_12px_#06b6d4]"
                  }`} />
                  <div className={`w-8 h-8 border-b-4 border-l-4 rounded-bl-xl absolute bottom-0 left-0 transition-colors duration-300 ${
                    targetLocked ? "border-emerald-400 shadow-[0_0_15px_#10b981]" : "border-cyan-400 animate-qr-corner shadow-[0_0_12px_#06b6d4]"
                  }`} />
                  <div className={`w-8 h-8 border-b-4 border-r-4 rounded-br-xl absolute bottom-0 right-0 transition-colors duration-300 ${
                    targetLocked ? "border-emerald-400 shadow-[0_0_15px_#10b981]" : "border-cyan-400 animate-qr-corner shadow-[0_0_12px_#06b6d4]"
                  }`} />
                </div>

                {/* 2. Rotating Radar Reticle Crosshairs */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-36 h-36 rounded-full border border-cyan-500/25 flex items-center justify-center animate-spin [animation-duration:10s]">
                    <div className="w-full h-[1px] bg-cyan-400/20" />
                    <div className="h-full w-[1px] bg-cyan-400/20 absolute" />
                  </div>
                  <div className="w-20 h-20 rounded-full border border-indigo-400/30 absolute animate-pulse" />
                </div>

                {/* 3. High-Energy Oscillating Laser Sweep Beam */}
                {!targetLocked && (
                  <div className="absolute inset-x-8 sm:inset-x-10 animate-qr-laser z-30 pointer-events-none">
                    {/* Glowing trail sheet */}
                    <div className="h-16 w-full bg-gradient-to-t from-cyan-400/35 via-cyan-400/10 to-transparent -top-16 absolute pointer-events-none" />
                    {/* Razor-sharp glowing laser core line */}
                    <div className="h-[2.5px] w-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_16px_rgba(6,182,212,1),0_0_30px_rgba(6,182,212,0.8)] relative" />
                    {/* Traveling focal photon spark */}
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#fff,0_0_16px_#06b6d4] absolute -top-1 left-1/2 -translate-x-1/2" />
                  </div>
                )}

                {/* 4. Target Acquired Lock Flash Banner */}
                {targetLocked && (
                  <div className="absolute inset-0 flex items-center justify-center z-40 bg-emerald-950/40 backdrop-blur-xs animate-in zoom-in-90 fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-emerald-500/90 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl border-2 border-emerald-300">
                      <CheckCircle2 className="w-5 h-5 animate-bounce" />
                      Target Acquired &bull; Decoding QR Placard
                    </div>
                  </div>
                )}

                {/* 5. HUD Status Overlays */}
                <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-cyan-300 font-bold z-20 pointer-events-none">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    AI LOCATOR ACTIVE
                  </span>
                  <span className="opacity-80">60 FPS &bull; 1080p</span>
                </div>

                <div className="absolute bottom-3 inset-x-4 text-center text-[10px] font-mono font-bold text-slate-300 z-20 pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 backdrop-blur-xs">
                    {targetLocked ? "SUCCESSFULLY DECODED" : "ALIGN WITH GLBITM ROOM QR PLACARD"}
                  </span>
                </div>
              </>
            )}
          </div>

          {cameraError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300">
              <AlertCircle className="w-4 h-4 inline mr-1.5" />
              {cameraError}
            </div>
          )}

          {/* Viewfinder Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {!isCameraActive ? (
              <Button size="md" className="w-full gap-2 font-bold shadow-md" onClick={startCamera}>
                <Camera className="w-4 h-4" /> Start Device Camera
              </Button>
            ) : (
              <Button size="md" variant="outline" className="w-full" onClick={stopCamera}>
                Stop Camera
              </Button>
            )}

            <Button
              size="md"
              variant="outline"
              disabled={isSimulating}
              onClick={() => {
                const sampleLoc = allLocations[0] || { id: "sample", room: "3rd Floor Quiet Wing" };
                triggerScanSimulation(sampleLoc.id, "3rd Floor Quiet Reading Wing");
              }}
              className="w-full gap-2 text-primary-600 dark:text-primary-400 font-bold border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-950/50"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              ⚡ Try Scan Animation
            </Button>
          </div>
        </div>

        {/* Manual Room Selector & Quick Test Panel (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl border border-border bg-card shadow-lg space-y-4">
            <div className="pb-3 border-b border-border">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-primary-500" />
                Select Room / Test Scan
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Simulate a QR scan with full laser animations or pick a campus location manually
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
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-primary-500 font-medium"
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
                  placeholder="e.g. Lab A-102, Room 304, AV Booth"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-primary-500 font-medium"
                />
              </div>

              <Button
                type="submit"
                size="md"
                className="w-full gap-2 font-bold mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-indigo-500/20"
                disabled={!manualLocationId || isSimulating}
              >
                <Zap className="w-4 h-4" />
                {isSimulating ? "Scanning Target..." : "Simulate QR Scan with Animation"}
              </Button>
            </form>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-3 text-xs">
            <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>Quick Test Room Scenarios</span>
              <span className="text-[10px] text-primary-600 font-mono">1-Tap Scan</span>
            </span>
            <div className="space-y-2">
              {[
                { name: "Central Library AC (3rd Floor)", room: "3rd Floor North Reading Wing", id: allLocations[0]?.id },
                { name: "CSE Lab 3 Projector", room: "Lab A-102", id: allLocations[1]?.id },
                { name: "Block B Staircase Water Cooler", room: "Ground Floor Staircase Lobby", id: allLocations[2]?.id },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const targetId = item.id || allLocations[0]?.id || "sample";
                    triggerScanSimulation(targetId, item.room);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border bg-background hover:bg-primary-50/50 dark:hover:bg-primary-950/40 hover:border-primary-500 text-left transition-all group"
                >
                  <div>
                    <p className="font-bold text-xs text-foreground group-hover:text-primary-600">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.room}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>

            <div className="pt-2 text-center border-t border-border">
              <Link href="/qr" className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                Open QR Generator &amp; Print Room Placards →
              </Link>
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
