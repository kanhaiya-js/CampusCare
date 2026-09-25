"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  Shield,
  ArrowRight,
  Camera,
  CheckCircle2,
  AlertCircle,
  Building,
  RefreshCw,
  Lock,
  ArrowLeft,
  Flashlight,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationData {
  id: string;
  name: string;
  building: string;
  floor?: string;
  room?: string;
}

// Synthesizer audio feedback upon QR lock (Web Audio API)
function playScanChirp() {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // Ignore audio permission or autoplay restrictions
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

  // Camera scanner states
  const [allLocations, setAllLocations] = useState<LocationData[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [targetLocked, setTargetLocked] = useState(false);

  // Manual Facility Direct Selector
  const [manualLocationId, setManualLocationId] = useState("");
  const [manualRoom, setManualRoom] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check auth and load locations on mount
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
    setTargetLocked(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera hardware is not supported or accessible on this browser");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Live BarcodeDetector API for instant QR recognition
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
              playScanChirp();
              setTargetLocked(true);
              setTimeout(() => {
                handleScannedUrl(barcodes[0].rawValue);
              }, 400);
            }
          } catch {
            // Frame detection error, continue next frame
          }
        }, 200);
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
    setTorchOn(false);
    setTargetLocked(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const capabilities = track.getCapabilities?.() as any;
      if (capabilities?.torch) {
        const next = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: next } as any],
        });
        setTorchOn(next);
      } else {
        setTorchOn(!torchOn);
      }
    } catch {
      setTorchOn(!torchOn);
    }
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

    const match = allLocations.find(
      (l) => l.name.toLowerCase().includes(scannedText.toLowerCase()) || l.id === scannedText
    );
    if (match) {
      router.push(`/scan?locationId=${match.id}`);
    } else {
      setCameraError("Unrecognized QR code format. Please scan a valid CampusCare room placard.");
    }
  };

  // Upload QR image from gallery
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const codes = await detector.detect(img);
        if (codes.length > 0) {
          playScanChirp();
          handleScannedUrl(codes[0].rawValue);
          return;
        }
      }
      setCameraError("No valid CampusCare QR code found in the selected image.");
    } catch {
      setCameraError("Could not process the selected image file.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocationId) return;
    router.push(
      `/scan?locationId=${manualLocationId}${manualRoom ? `&room=${encodeURIComponent(manualRoom)}` : ""}`
    );
  };

  const targetReportUrl = locationIdParam
    ? `/issues/report?locationId=${locationIdParam}${roomParam ? `&room=${encodeURIComponent(roomParam)}` : ""}`
    : "/issues/report";

  const loginUrl = `/login?callbackUrl=${encodeURIComponent(targetReportUrl)}`;

  // ==========================================
  // SCENARIO 1: SCANNED ROOM VERIFIED CARD
  // ==========================================
  if (locationIdParam) {
    const displayBuilding = scannedLocation?.building || "Campus Building";
    const displayName = scannedLocation?.name || "Target Facility";
    const displayRoom = roomParam || scannedLocation?.room || "";

    return (
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 w-full">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Verified Facility Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle ambient lighting */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00baf2]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Verified Badge */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping [animation-duration:2.5s] pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 relative z-10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verified Campus Location
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-orbitron">
              {displayBuilding}
            </h1>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
              {displayName}
            </p>
            {displayRoom && (
              <div className="mt-2.5 inline-block px-3.5 py-1.5 rounded-xl bg-muted text-xs font-black text-foreground border border-border tracking-wide font-mono">
                📍 ROOM / LAB: {displayRoom}
              </div>
            )}
          </div>

          {/* Authentication State */}
          {isAuthChecking ? (
            <div className="p-4 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary-500" />
              Verifying student credentials...
            </div>
          ) : currentUser ? (
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
                  Signed In
                </span>
              </div>

              <Link href={targetReportUrl} className="block">
                <Button size="lg" className="w-full gap-2 shadow-lg shadow-indigo-500/20 text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white">
                  Proceed to Report Issue <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-border text-left">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Sign In Required to Submit Issue
                </p>
                <p className="text-amber-900/90 dark:text-amber-300/90 leading-relaxed text-[11px]">
                  Please sign in with your student credentials to log repairs for <strong>{displayBuilding} ({displayRoom || displayName})</strong>.
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
  // SCENARIO 2: PAYTM-STYLE CINEMATIC ANIMATED QR SCANNER
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#00baf2]/10 text-[#00baf2] border border-[#00baf2]/30 shadow-2xs">
          <QrCode className="w-4 h-4 text-[#00baf2]" />
          Instant Campus QR Scanner
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-orbitron">
          Scan Room QR Code
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Align any official CampusCare door placard within the viewfinder to automatically identify the room.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Cinematic Animated Viewfinder (7 cols) */}
        <div className="md:col-span-7 p-6 rounded-3xl border border-border bg-card shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="font-bold text-sm text-foreground flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary-500" />
              Camera Scanner
            </span>
            {isCameraActive && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {targetLocked ? "DECODED" : "SCANNING"}
              </span>
            )}
          </div>

          {/* CINEMATIC VIEWPORT CANVAS */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl flex items-center justify-center select-none">
            {/* Ambient scanlines */}
            <div className="absolute inset-0 scanline-grid opacity-25 pointer-events-none z-10" />

            {/* Video stream feed */}
            {isCameraActive ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">Camera is Ready</p>
                  <p className="text-xs text-slate-500 mt-1">Tap &quot;Activate Camera Scanner&quot; to begin</p>
                </div>
              </div>
            )}

            {/* PAYTM-INSPIRED ANIMATED SCANNER OVERLAY */}
            {isCameraActive && (
              <>
                {/* 1. Curved Glowing Corner Reticles (Paytm Cyan Glow) */}
                <div className="absolute inset-10 pointer-events-none z-20">
                  {/* Top-Left */}
                  <div className={`w-9 h-9 border-t-[3.5px] border-l-[3.5px] rounded-tl-2xl absolute top-0 left-0 transition-all duration-300 ${
                    targetLocked ? "border-emerald-400 shadow-[0_0_18px_#10b981]" : "border-[#00baf2] animate-paytm-glow shadow-[0_0_14px_rgba(0,186,242,0.9)]"
                  }`} />
                  {/* Top-Right */}
                  <div className={`w-9 h-9 border-t-[3.5px] border-r-[3.5px] rounded-tr-2xl absolute top-0 right-0 transition-all duration-300 ${
                    targetLocked ? "border-emerald-400 shadow-[0_0_18px_#10b981]" : "border-[#00baf2] animate-paytm-glow shadow-[0_0_14px_rgba(0,186,242,0.9)]"
                  }`} />
                  {/* Bottom-Left */}
                  <div className={`w-9 h-9 border-b-[3.5px] border-l-[3.5px] rounded-bl-2xl absolute bottom-0 left-0 transition-all duration-300 ${
                    targetLocked ? "border-emerald-400 shadow-[0_0_18px_#10b981]" : "border-[#00baf2] animate-paytm-glow shadow-[0_0_14px_rgba(0,186,242,0.9)]"
                  }`} />
                  {/* Bottom-Right */}
                  <div className={`w-9 h-9 border-b-[3.5px] border-r-[3.5px] rounded-br-2xl absolute bottom-0 right-0 transition-all duration-300 ${
                    targetLocked ? "border-emerald-400 shadow-[0_0_18px_#10b981]" : "border-[#00baf2] animate-paytm-glow shadow-[0_0_14px_rgba(0,186,242,0.9)]"
                  }`} />
                </div>

                {/* 2. Paytm Cinematic Laser Light Curtain ("Lights. Scan. Pay.") */}
                {!targetLocked && (
                  <div className="absolute inset-x-10 animate-paytm-laser z-30 pointer-events-none">
                    {/* Trailing luminous light wash sheet */}
                    <div className="h-20 w-full bg-gradient-to-t from-[#00baf2]/30 via-[#00baf2]/8 to-transparent -top-20 absolute pointer-events-none" />
                    {/* Razor-sharp radiant cyan light bar */}
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00baf2] to-transparent shadow-[0_0_16px_#00baf2,0_0_28px_rgba(0,186,242,0.85)] relative" />
                    {/* Glowing focal photon points at ends and center */}
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#fff,0_0_18px_#00baf2] absolute -top-1 left-1/2 -translate-x-1/2" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00baf2] shadow-[0_0_8px_#00baf2] absolute -top-0.5 left-4" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00baf2] shadow-[0_0_8px_#00baf2] absolute -top-0.5 right-4" />
                  </div>
                )}

                {/* 3. Target Acquired Flash Banner */}
                {targetLocked && (
                  <div className="absolute inset-0 flex items-center justify-center z-40 bg-emerald-950/50 backdrop-blur-xs animate-in zoom-in-95 fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-emerald-500/90 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl border-2 border-emerald-300">
                      <CheckCircle2 className="w-5 h-5 animate-bounce" />
                      QR Code Recognized
                    </div>
                  </div>
                )}

                {/* 4. Top & Bottom HUD Controls */}
                <div className="absolute top-4 inset-x-6 flex items-center justify-between text-[11px] font-mono font-bold text-slate-200 z-30 pointer-events-auto">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-[#00baf2] animate-pulse" />
                    ALIGN QR CODE
                  </span>

                  {/* Flashlight / Torch Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold backdrop-blur-md transition-colors ${
                      torchOn
                        ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30"
                        : "bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white"
                    }`}
                  >
                    <Flashlight className={`w-3.5 h-3.5 ${torchOn ? "fill-slate-950" : ""}`} />
                    <span>{torchOn ? "Torch On" : "Torch"}</span>
                  </button>
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

          {/* Primary Viewfinder Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {!isCameraActive ? (
              <Button size="lg" className="w-full gap-2 font-bold shadow-md bg-gradient-to-r from-[#00baf2] via-blue-600 to-indigo-700 text-white" onClick={startCamera}>
                <Camera className="w-4 h-4" /> Activate Camera Scanner
              </Button>
            ) : (
              <Button size="lg" variant="outline" className="w-full" onClick={stopCamera}>
                Stop Camera Scanner
              </Button>
            )}

            {/* Gallery Upload Scan Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                size="lg"
                variant="outline"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2 text-foreground font-semibold"
              >
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                Upload QR from Gallery
              </Button>
            </div>
          </div>
        </div>

        {/* Direct Facility Selector Panel (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl border border-border bg-card shadow-lg space-y-4">
            <div className="pb-3 border-b border-border">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-primary-500" />
                Select Facility Manually
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                If camera access is restricted on your browser, select your campus location directly
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Campus Facility / Building <span className="text-red-500">*</span>
                </label>
                <select
                  value={manualLocationId}
                  onChange={(e) => setManualLocationId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-primary-500 font-medium"
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
                  Specific Room / Lab / Desk (Optional)
                </label>
                <input
                  type="text"
                  value={manualRoom}
                  onChange={(e) => setManualRoom(e.target.value)}
                  placeholder="e.g. Lab A-102, Room 304, AV Booth"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-primary-500 font-medium"
                />
              </div>

              <Button
                type="submit"
                size="md"
                className="w-full gap-2 font-bold mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-indigo-500/20"
                disabled={!manualLocationId}
              >
                Proceed to Location Portal <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Direct Campus Directory Links */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-3 text-xs">
            <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">
              Popular Campus Locations
            </span>
            <div className="space-y-2">
              {allLocations.slice(0, 3).map((loc) => (
                <Link
                  key={loc.id}
                  href={`/scan?locationId=${loc.id}${loc.room ? `&room=${encodeURIComponent(loc.room)}` : ""}`}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border bg-background hover:bg-muted text-left transition-all group"
                >
                  <div>
                    <p className="font-bold text-xs text-foreground group-hover:text-primary-600">{loc.name}</p>
                    <p className="text-[10px] text-muted-foreground">{loc.building} {loc.room ? `• ${loc.room}` : ""}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>

            <div className="pt-2 text-center border-t border-border">
              <Link href="/qr" className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                View Full Campus QR Directory &rarr;
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
