"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  HelpCircle,
  Eye,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

interface Category {
  id: string;
  name: string;
  description: string;
  defaultPriority: string;
}

interface Location {
  id: string;
  name: string;
  building: string;
  room?: string;
  latitude?: number;
  longitude?: number;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Club {
  id: string;
  name: string;
  category: string;
}

interface DuplicateMatch {
  issueId: string;
  publicIssueId: string;
  title: string;
  description: string;
  categoryName: string;
  locationName: string;
  room?: string;
  status: string;
  similarityScore: number;
  explanation: string[];
}

const SENSITIVE_KEYWORDS = [
  "ragging",
  "ragged",
  "harass",
  "harassment",
  "sexual",
  "posh",
  "molest",
  "suicide",
  "kill myself",
  "depression",
  "assault",
  "fight",
  "knife",
  "weapon",
  "police",
  "criminal",
];

function ReportIssueForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const locationIdParam = searchParams.get("locationId") || "";
  const roomParam = searchParams.get("room") || "";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState(locationIdParam);
  const [departmentId, setDepartmentId] = useState("");
  const [clubId, setClubId] = useState("");
  const [room, setRoom] = useState(roomParam);
  const [isSensitive, setIsSensitive] = useState(false);
  const [sensitiveModalOpen, setSensitiveModalOpen] = useState(false);
  const [detectedSensitiveTerm, setDetectedSensitiveTerm] = useState("");
  const [attachments, setAttachments] = useState<
    { url: string; fileName: string; fileSize: number; type: "IMAGE" | "VIDEO" | "DOCUMENT" }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  // Duplicate Check Modal State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);

  // Submission success result
  const [submittedIssue, setSubmittedIssue] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (locationIdParam) setLocationId(locationIdParam);
    if (roomParam) setRoom(roomParam);
  }, [locationIdParam, roomParam]);

  const qrLocation = locations.find((l) => l.id === locationId);

  const fetchInitialData = async () => {
    try {
      const [catRes, locRes, deptRes, clubRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/locations"),
        fetch("/api/departments"),
        fetch("/api/clubs"),
      ]);
      const catData = await catRes.json();
      const locData = await locRes.json();
      const deptData = await deptRes.json();
      const clubData = await clubRes.json();

      if (catData.success) setCategories(catData.data);
      if (locData.success) setLocations(locData.data);
      if (deptData.success) setDepartments(deptData.data);
      if (clubData.success) setClubs(clubData.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
          setAttachments((prev) => [...prev, data.data]);
        } else {
          toastError(data.error?.message || "Failed to upload file");
        }
      }
    } catch (err) {
      toastError("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const checkDuplicatesAndProceed = async () => {
    if (!categoryId) {
      toastError("Please select what kind of problem it is (Category)");
      return;
    }
    if (!title.trim() || title.trim().length < 3) {
      toastError("Summary must be at least 3 characters long");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      toastError("Description must be at least 5 characters long");
      return;
    }

    // Check sensitive interceptor keywords
    const fullText = `${title} ${description}`.toLowerCase();
    const foundKeyword = SENSITIVE_KEYWORDS.find((kw) => fullText.includes(kw));
    if (foundKeyword && !isSensitive) {
      setDetectedSensitiveTerm(foundKeyword);
      setSensitiveModalOpen(true);
      return;
    }

    setIsCheckingDuplicates(true);
    try {
      const res = await fetch("/api/issues/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          categoryId,
          locationId: locationId || undefined,
          room: room.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.data.hasDuplicates) {
        setDuplicateMatches(data.data.duplicates);
        setDuplicateModalOpen(true);
      } else {
        setStep(2);
      }
    } catch (err) {
      setStep(2);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const handleSubmit = async () => {
    if (!categoryId) {
      toastError("Please select an issue category");
      setStep(1);
      return;
    }
    if (!title.trim() || title.trim().length < 3) {
      toastError("Please enter a summary for the problem");
      setStep(1);
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      toastError("Please describe the problem in description");
      setStep(1);
      return;
    }
    if (!locationId) {
      toastError("Where is the problem? Please select a campus building or area");
      setStep(2);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          categoryId,
          locationId,
          room: room.trim() || undefined,
          departmentId: departmentId || undefined,
          clubId: clubId || undefined,
          isSensitive: Boolean(isSensitive),
          attachments: attachments.map((a) => ({
            url: a.url,
            fileName: a.fileName || "evidence",
            fileSize: a.fileSize || 0,
            type: a.type || "IMAGE",
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toastError(data.error?.message || "Failed to submit issue");
        return;
      }

      setSubmittedIssue(data.data);
      success(`Ticket #${data.data.publicIssueId} registered!`);
    } catch (err) {
      toastError("Failed to submit issue. Please check network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submittedIssue) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-300">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold font-orbitron text-foreground">Issue Submitted Successfully</h1>
        <p className="text-xs text-muted-foreground mt-1.5">
          Your report has been logged and assigned into the campus maintenance queue.
        </p>

        <div className="mt-6 p-6 rounded-2xl border border-border bg-card shadow-sm max-w-md mx-auto text-left">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground">Unique Complaint ID</span>
            <span className="text-sm font-extrabold font-mono text-primary-600 dark:text-primary-400">
              #{submittedIssue.publicIssueId}
            </span>
          </div>

          <div className="py-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Problem Title:</span>
              <span className="font-semibold text-foreground text-right">{submittedIssue.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned Priority:</span>
              <span className="font-bold text-foreground">{submittedIssue.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Status:</span>
              <span className="font-semibold text-foreground">{submittedIssue.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Technician:</span>
              <span className="font-semibold text-foreground">
                {submittedIssue.assignedStaff?.name || "Auto-assigning in progress"}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col gap-2">
            <Link href={`/issues/${submittedIssue.id}`}>
              <Button size="md" className="w-full">
                Track Ticket Status →
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="md" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          CampusCare — GL Bajaj
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-foreground tracking-tight">
          What problem are you facing on campus?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Tell us what is broken or malfunctioning so our maintenance teams can inspect and fix it.
        </p>

        {/* Wizard Steps indicator */}
        <div className="flex items-center justify-between max-w-sm mt-6 border-b border-border pb-3">
          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? "text-primary-600" : "text-muted-foreground"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? "bg-primary-600 text-white" : "bg-muted text-muted-foreground"}`}>
              1
            </span>
            WHAT?
          </div>
          <div className="w-8 h-[1px] bg-border" />
          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? "text-primary-600" : "text-muted-foreground"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? "bg-primary-600 text-white" : "bg-muted text-muted-foreground"}`}>
              2
            </span>
            WHERE & EVIDENCE?
          </div>
          <div className="w-8 h-[1px] bg-border" />
          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 3 ? "text-primary-600" : "text-muted-foreground"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? "bg-primary-600 text-white" : "bg-muted text-muted-foreground"}`}>
              3
            </span>
            SUBMIT
          </div>
        </div>

        {/* Human Touch Reassurance Guidance */}
        <div className="mt-4 p-3 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs text-foreground/90 flex items-center gap-2.5 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[12px] leading-relaxed">
            <strong>Campus Care Promise:</strong> Including your exact room number or lab name helps GLBITM maintenance specialists arrive with the right replacement parts in under 30 minutes.
          </span>
        </div>

        {qrLocation && (
          <div className="mt-4 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-500/10 dark:bg-emerald-950/40 text-xs text-foreground flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Location Pre-Filled from QR Code
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                    Verified Room
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground">
                  📍 {qrLocation.building} — {qrLocation.name} {room ? `• Room: ${room}` : ""}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-white/70 dark:bg-slate-900/80 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
              Auto-Targeted
            </span>
          </div>
        )}
      </div>

      {/* Step 1: WHAT? - Issue Info & Category */}
      {step === 1 && (
        <div className="p-6 rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              What kind of problem is it? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    categoryId === cat.id
                      ? "border-primary-600 dark:border-indigo-500 bg-primary-50 dark:bg-indigo-950/70 text-primary-900 dark:text-indigo-200 ring-2 ring-primary-500/20"
                      : "border-border dark:border-slate-800 bg-background dark:bg-slate-900/60 hover:bg-muted/60 dark:hover:bg-slate-800/80 text-foreground"
                  }`}
                >
                  <p className="text-xs font-bold">{cat.name}</p>
                  <span className="text-[10px] text-muted-foreground dark:text-slate-400 block mt-1 line-clamp-1">
                    {cat.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Brief Summary of the Problem"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AC leaking water onto student desks in A-204"
            required
          />

          <Textarea
            label="Explain What Happened"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe symptoms (noises, water pooling, sparks, projector discoloration, Wi-Fi dropping)..."
            rows={4}
            required
          />

          {/* Sensitive Issue Notice */}
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Sensitive Safety & Welfare Safeguard:</span>
              <p className="text-[11px] text-rose-700/90 dark:text-rose-300/80">
                If this incident involves harassment, ragging, mental health distress, or medical emergencies, please use our{" "}
                <Link href="/support" className="font-bold underline hover:text-rose-950 dark:hover:text-white">
                  Official Institutional Support Channels
                </Link>{" "}
                instead of logging a maintenance ticket.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              type="button"
              size="md"
              onClick={checkDuplicatesAndProceed}
              isLoading={isCheckingDuplicates}
              className="gap-2"
            >
              Next: Where & Evidence <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: WHERE? - Location, Department, Club & Evidence */}
      {step === 2 && (
        <div className="p-6 rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 shadow-sm space-y-6">
          {qrLocation && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-foreground flex items-center gap-2.5">
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Scanned Room Auto-Selected:</strong> {qrLocation.building} — {qrLocation.name} {room ? `(${room})` : ""}.
                Maintenance dispatch is targeted to this specific room.
              </span>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Where is the problem located? <span className="text-red-500">*</span>
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-lg border border-border dark:border-slate-700/80 bg-background dark:bg-slate-950/80 px-3 py-2 text-sm text-foreground dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500"
              required
            >
              <option value="">-- Choose Campus Building / Block --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} className="dark:bg-slate-900">
                  {loc.building} — {loc.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Specific Room, Lab, or Area"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="e.g. Classroom A-204, 2nd Floor Washroom, Machine Shop Bay 2"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Academic Department (Optional)
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full rounded-lg border border-border dark:border-slate-700/80 bg-background dark:bg-slate-950/80 px-3 py-2 text-xs text-foreground dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="">-- Optional: Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="dark:bg-slate-900">
                    {dept.code} — {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Student Society / Club (Optional)
              </label>
              <select
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="w-full rounded-lg border border-border dark:border-slate-700/80 bg-background dark:bg-slate-950/80 px-3 py-2 text-xs text-foreground dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="">-- Optional: If raised for a Club --</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-slate-900">
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Photo or Video Evidence (Recommended)
            </label>
            <div className="border-2 border-dashed border-border dark:border-slate-800 rounded-xl p-6 text-center hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground dark:text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-semibold text-foreground">Click to upload photos or videos</p>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400 mt-0.5">JPG, PNG, WEBP, or MP4 up to 10MB</p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="mt-3 text-xs text-muted-foreground dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 dark:file:bg-indigo-950 file:text-primary-700 dark:file:text-indigo-300 hover:file:bg-primary-100 dark:hover:file:bg-indigo-900 cursor-pointer"
              />
              {isUploading && <p className="text-xs text-primary-600 dark:text-indigo-400 mt-2">Uploading file evidence...</p>}
            </div>

            {/* Thumbnail previews */}
            {attachments.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-border dark:border-slate-800 bg-muted dark:bg-slate-800 aspect-video"
                  >
                    <img src={att.url} alt={att.fileName} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border dark:border-slate-800">
            <Button variant="outline" size="md" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <Button
              size="md"
              onClick={() => {
                if (!locationId) {
                  toastError("Please specify where the problem is located");
                  return;
                }
                setStep(3);
              }}
            >
              Review Ticket <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: SUBMIT - Review & Confirm */}
      {step === 3 && (
        <div className="p-6 rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-foreground">Review & Submit Report</h3>

          <div className="rounded-xl border border-border dark:border-slate-800 bg-muted/30 dark:bg-slate-950/50 p-4 space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Category</span>
              <span className="font-bold text-foreground">
                {categories.find((c) => c.id === categoryId)?.name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Problem Summary</span>
              <span className="font-bold text-foreground text-sm">{title}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Details</span>
              <p className="text-foreground mt-0.5 leading-relaxed">{description}</p>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Campus Location</span>
              <span className="font-semibold text-foreground">
                {locations.find((l) => l.id === locationId)?.building} — {locations.find((l) => l.id === locationId)?.name}
                {room ? ` (Room: ${room})` : ""}
              </span>
            </div>
            {departmentId && (
              <div>
                <span className="text-muted-foreground block text-[11px]">Department</span>
                <span className="font-semibold text-foreground">
                  {departments.find((d) => d.id === departmentId)?.name}
                </span>
              </div>
            )}
            {clubId && (
              <div>
                <span className="text-muted-foreground block text-[11px]">Society / Club</span>
                <span className="font-semibold text-foreground">
                  {clubs.find((c) => c.id === clubId)?.name}
                </span>
              </div>
            )}
            {attachments.length > 0 && (
              <div>
                <span className="text-muted-foreground block text-[11px] mb-1">Attached Media</span>
                <span className="font-semibold text-foreground">{attachments.length} file(s) attached</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="outline" size="md" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <Button size="lg" onClick={handleSubmit} isLoading={isLoading} className="gap-2">
              <CheckCircle2 className="w-4 h-4" /> Confirm & Submit Problem
            </Button>
          </div>
        </div>
      )}

      {/* Sensitive Issue Interceptor Modal */}
      <Modal
        isOpen={sensitiveModalOpen}
        onClose={() => setSensitiveModalOpen(false)}
        title="Immediate Support Required — Official College Channels"
        description="This issue may require immediate support through official college channels"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-red-800 dark:text-red-300">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Sensitive Subject Detected
            </div>
            <p className="leading-relaxed">
              Your submission mentions terms related to <strong>safety, harassment, ragging, or emergency assistance</strong> (detected: “{detectedSensitiveTerm}”).
            </p>
            <p className="font-semibold">
              CampusCare is strictly designed for physical campus maintenance (broken fans, water leakage, lab equipment). It does NOT handle personal safety or statutory grievances.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
            <span className="font-bold text-foreground block">Recommended Action:</span>
            <p className="text-muted-foreground leading-relaxed">
              Please contact the official GLBITM authority designed to protect your privacy and ensure prompt statutory action:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li><strong>Anti-Ragging Squad & Committee</strong> (24x7 Helpline: 1800-180-5522)</li>
              <li><strong>Internal Complaints Committee (ICC)</strong> for gender safety & POSH</li>
              <li><strong>YourDOST Support</strong> for confidential psychological & emotional counseling</li>
              <li><strong>Campus Medical Dispensary</strong> for acute health emergencies</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSensitive(true);
                setSensitiveModalOpen(false);
                setStep(2);
              }}
            >
              This is strictly physical equipment repair
            </Button>
            <Link href="/support">
              <Button variant="destructive" size="sm" className="gap-1">
                Open Official College Support <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </Modal>

      {/* Intelligent Duplicate Warning Modal */}
      <Modal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        title="We found a similar unresolved issue"
        description="Our duplicate detection system found active tickets matching this facility or problem"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Potential Duplicate Match Found
            </div>
            Submitting duplicate complaints can slow down maintenance response times. Review the existing tickets below:
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {duplicateMatches.map((dup) => (
              <div
                key={dup.issueId}
                className="p-3 rounded-xl border border-border bg-card space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary-600">#{dup.publicIssueId}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {Math.round(dup.similarityScore * 100)}% Similarity
                  </span>
                </div>
                <h4 className="font-bold text-foreground text-sm">{dup.title}</h4>
                <p className="text-muted-foreground line-clamp-1">{dup.description}</p>
                <p className="text-[11px] text-muted-foreground">
                  📍 {dup.locationName} {dup.room ? `(${dup.room})` : ""} · Status: {dup.status}
                </p>

                {dup.explanation && dup.explanation.length > 0 && (
                  <div className="pt-1.5 border-t border-border mt-1">
                    <span className="text-[10px] text-muted-foreground block font-medium">
                      Reasoning: {dup.explanation.join(" • ")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDuplicateModalOpen(false);
                if (duplicateMatches[0]) {
                  window.open(`/issues/${duplicateMatches[0].issueId}`, "_blank");
                }
              }}
            >
              <Eye className="w-3.5 h-3.5 mr-1" /> View Existing Ticket
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setDuplicateModalOpen(false);
                setStep(2);
              }}
            >
              Continue Submitting My Issue →
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function ReportIssuePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-xs text-muted-foreground">
          Loading issue reporting wizard...
        </div>
      }
    >
      <ReportIssueForm />
    </Suspense>
  );
}
