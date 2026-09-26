"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Wrench,
  MessageSquare,
  Shield,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Send,
  Camera,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { StatusBadge, PriorityBadge } from "@/components/issues/status-badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format";

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const { success, error: toastError } = useToast();

  const [issue, setIssue] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Comment state
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackResolved, setFeedbackResolved] = useState(true);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Status update modal (for Staff & Admin)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchIssueAndUser();
  }, [id]);

  const fetchIssueAndUser = async () => {
    setIsLoading(true);
    try {
      const [issueRes, userRes] = await Promise.all([
        fetch(`/api/issues/${id}`),
        fetch("/api/auth/me"),
      ]);
      const issueData = await issueRes.json();
      const userData = await userRes.json();

      if (issueData.success) {
        setIssue(issueData.data);
      } else {
        toastError("Issue not found");
      }

      if (userData.success) {
        setCurrentUser(userData.data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/issues/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentText("");
        setIssue((prev: any) => ({
          ...prev,
          comments: [...(prev.comments || []), data.data],
        }));
        success("Comment added");
      } else {
        toastError(data.error?.message || "Failed to add comment");
      }
    } catch (err) {
      toastError("Failed to submit comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleConfirmResolution = async () => {
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/issues/${id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: feedbackRating,
          resolved: feedbackResolved,
          comment: feedbackComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackModalOpen(false);
        success(
          feedbackResolved
            ? "Resolution confirmed! Ticket archived."
            : "Issue marked as NOT FIXED. Ticket reopened and sent back to technician."
        );
        fetchIssueAndUser();
      } else {
        toastError(data.error?.message || "Failed to submit confirmation");
      }
    } catch (err) {
      toastError("Network error occurred");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/issues/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          comment: statusComment,
          resolutionEvidenceUrl: resolutionPhotoUrl || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusModalOpen(false);
        setStatusComment("");
        setResolutionPhotoUrl("");
        success(`Status updated to ${nextStatus.replace("_", " ")}`);
        fetchIssueAndUser();
      } else {
        toastError(data.error?.message || "Failed to update status");
      }
    } catch (err) {
      toastError("Network error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-semibold text-muted-foreground">Loading issue details...</span>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold">Issue Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1">The requested issue ID does not exist or was removed.</p>
        <Link href="/issues" className="inline-block mt-4">
          <Button size="sm">Browse Campus Issues</Button>
        </Link>
      </div>
    );
  }

  const isReporter = currentUser?.id === issue.reporterId;
  const isAdmin = currentUser?.role === "ADMIN";
  const isAssignedStaff = currentUser?.id === issue.assignedStaffId;
  const canUpdateStatus = isAdmin || isAssignedStaff;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <Link
            href="/issues"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Issues
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-extrabold text-primary-600 dark:text-primary-400">
              #{issue.publicIssueId}
            </span>
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-foreground tracking-tight mt-1">
            {issue.title}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Resolution confirmation button for reporter */}
          {isReporter && issue.status === "RESOLVED" && (
            <Button
              size="md"
              variant="success"
              onClick={() => setFeedbackModalOpen(true)}
              className="gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm Fix & Close
            </Button>
          )}

          {/* Status update button for staff/admin */}
          {canUpdateStatus && (
            <Button
              size="md"
              variant="primary"
              onClick={() => setStatusModalOpen(true)}
              className="gap-1.5 shadow-sm"
            >
              <Wrench className="w-4 h-4" /> Update Progress
            </Button>
          )}
        </div>
      </div>

      {/* Visual Resolution Lifecycle Progress Stepper */}
      <div className="mt-6 p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs">
        <div className="text-[11px] font-bold font-orbitron uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
          <span>Resolution Lifecycle Progress</span>
          <span className="text-primary-600 dark:text-primary-400">
            {issue.status.replace("_", " ")}
          </span>
        </div>

        <div className="flex items-center justify-between w-full">
          {[
            { key: "SUBMITTED", label: "Submitted" },
            { key: "UNDER_REVIEW", label: "Under Review" },
            { key: "IN_PROGRESS", label: "In Progress" },
            { key: "RESOLVED", label: "Resolved" },
            { key: "CLOSED", label: "Closed" },
          ].map((step, idx, arr) => {
            const getStepIndex = (status: string) => {
              switch (status) {
                case "SUBMITTED": return 0;
                case "UNDER_REVIEW":
                case "ASSIGNED": return 1;
                case "IN_PROGRESS": return 2;
                case "RESOLVED": return 3;
                case "CLOSED": return 4;
                default: return 0;
              }
            };
            const currentStepIdx = getStepIndex(issue.status);
            const isCompleted = idx < currentStepIdx || (idx === currentStepIdx && issue.status === "CLOSED");
            const isCurrent = idx === currentStepIdx && issue.status !== "CLOSED";

            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-primary-600 text-white shadow-xs"
                        : isCurrent
                        ? "bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-950/80 shadow-xs animate-pulse"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs whitespace-nowrap ${
                      isCurrent
                        ? "font-bold text-primary-600 dark:text-primary-400"
                        : isCompleted
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < arr.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 sm:mx-3 rounded-full transition-colors ${
                      idx < currentStepIdx
                        ? "bg-primary-600"
                        : "bg-muted dark:bg-slate-800"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left 2 Cols: Details, Photos, Timeline, Comments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description Card */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-orbitron tracking-wide text-foreground">Problem Description</h3>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {issue.description}
            </p>

            {/* Photo & Video Evidence */}
            {issue.attachments && issue.attachments.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold font-orbitron tracking-wide text-foreground mb-3 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-primary-500" /> Evidence Attachments ({issue.attachments.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {issue.attachments.map((att: any) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-xl overflow-hidden border border-border aspect-video bg-muted block hover:ring-2 hover:ring-primary-500"
                    >
                      {att.type === "IMAGE" ? (
                        <img src={att.url} alt={att.fileName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-xs font-medium text-muted-foreground p-2 text-center">
                          <FileText className="w-5 h-5 mb-1 text-primary-500" />
                          <span>{att.fileName}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        View Full Size
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Confirmation Banner if RESOLVED */}
          {issue.status === "RESOLVED" && isReporter && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold font-orbitron flex items-center justify-center sm:justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Maintenance Marked As Complete
                </h4>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">
                  Please verify that the technician resolved the problem in {issue.location.building}. Was it fixed properly?
                </p>
              </div>
              <Button
                variant="success"
                size="md"
                onClick={() => setFeedbackModalOpen(true)}
                className="shrink-0"
              >
                Submit Verification
              </Button>
            </div>
          )}

          {/* Feedback Display if Closed */}
          {issue.feedback && (
            <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-orbitron tracking-wide text-foreground">Reporter Satisfaction & Feedback</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= issue.feedback.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-muted stroke-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                &ldquo;{issue.feedback.comment || (issue.feedback.resolved ? "Verified resolved." : "Issue was not resolved.")}&rdquo;
              </p>
            </div>
          )}

          {/* Audit History Timeline */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-5">
            <h3 className="text-sm font-bold font-orbitron tracking-wide text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" /> Issue Lifecycle Timeline
            </h3>

            <div className="space-y-0 pt-1">
              {issue.history?.map((h: any, idx: number) => {
                const isLast = idx === issue.history.length - 1;
                return (
                  <div key={h.id} className="flex items-stretch gap-4 group">
                    {/* Vertical Progress Line & Centered Node */}
                    <div className="flex flex-col items-center shrink-0 w-5">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary-600 border-2 border-background ring-4 ring-primary-100 dark:ring-primary-950/80 shrink-0 z-10 mt-0.5 shadow-xs" />
                      {!isLast && (
                        <div className="w-[2px] grow bg-border dark:bg-slate-700/80 my-1" />
                      )}
                    </div>

                    {/* Timeline Event Details */}
                    <div className={`grow text-xs ${!isLast ? "pb-6" : "pb-1"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          {h.newStatus.replace("_", " ")}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatRelativeTime(h.createdAt)}
                        </span>
                      </div>
                      {h.comment && (
                        <p className="text-muted-foreground mt-1 leading-relaxed">
                          {h.comment}
                        </p>
                      )}
                      <span className="text-[10px] text-muted-foreground/80 mt-1 block">
                        By <span className="font-medium text-foreground/90">{h.actor.name}</span> ({h.actor.role})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comments Thread */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-orbitron tracking-wide text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary-500" /> Discussion & Updates ({issue.comments?.length || 0})
            </h3>

            <div className="space-y-3">
              {issue.comments?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No comments yet. Start a discussion below.</p>
              ) : (
                issue.comments?.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{c.author.name}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                          {c.author.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-foreground/90 mt-1 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="pt-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post a comment or question about this issue..."
                rows={2}
                required
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" size="sm" isLoading={isSubmittingComment} className="gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Post Comment
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Metadata, Location, Technician */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4 text-xs">
            <h3 className="text-xs font-bold font-orbitron uppercase tracking-wider text-muted-foreground">Ticket Information</h3>

            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground block text-[11px]">Category</span>
                <span className="font-semibold text-foreground text-sm">{issue.category.name}</span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Reported By</span>
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={issue.reporter.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(issue.reporter.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                    alt="Reporter"
                    className="w-6 h-6 rounded-full bg-slate-200"
                  />
                  <div>
                    <span className="font-semibold text-foreground block leading-tight">{issue.reporter.name}</span>
                    <span className="text-[10px] text-muted-foreground">{issue.reporter.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Assigned Technician</span>
                {issue.assignedStaff ? (
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={issue.assignedStaff.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(issue.assignedStaff.name)}&backgroundColor=ffd5dc,ffdfbf,d1d4f9`}
                      alt="Staff"
                      className="w-6 h-6 rounded-full bg-slate-200"
                    />
                    <div>
                      <span className="font-semibold text-foreground block leading-tight">{issue.assignedStaff.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {issue.assignedStaff.staffProfile?.specialization || "Technician"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-amber-600 font-semibold block mt-0.5">Pending Assignment</span>
                )}
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Campus Facility</span>
                <span className="font-semibold text-foreground block mt-0.5">
                  {issue.location.building} - {issue.location.name}
                </span>
                {issue.room && <span className="text-[11px] text-muted-foreground block">Room: {issue.room}</span>}
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Submitted Timestamp</span>
                <span className="text-foreground">{formatDateTime(issue.createdAt)}</span>
              </div>

              {issue.resolvedAt && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Resolved Timestamp</span>
                  <span className="text-foreground">{formatDateTime(issue.resolvedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-Way Confirmation Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Verify Issue Resolution"
        description="Help maintain high facility standards by verifying technician work"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Was the issue actually fixed in {issue.location.building}?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFeedbackResolved(true)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  feedbackResolved
                    ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Yes, Fixed!
              </button>

              <button
                type="button"
                onClick={() => setFeedbackResolved(false)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  !feedbackResolved
                    ? "bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" /> Not Fixed (Reopen)
              </button>
            </div>
          </div>

          {feedbackResolved && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Rate Satisfaction (1 to 5 Stars)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= feedbackRating ? "fill-amber-400" : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <Textarea
            label={feedbackResolved ? "Feedback Comment (Optional)" : "Reason why problem is not fixed *"}
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder={
              feedbackResolved
                ? "Great prompt fix, thank you..."
                : "Water is still leaking when tap is turned on..."
            }
            rows={3}
            required={!feedbackResolved}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={feedbackResolved ? "success" : "destructive"}
              size="sm"
              onClick={handleConfirmResolution}
              isLoading={isSubmittingFeedback}
            >
              Submit Verification
            </Button>
          </div>
        </div>
      </Modal>

      {/* Staff & Admin Update Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Issue Status"
        description="Transition ticket lifecycle and attach progress or resolution notes"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Target Status</label>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <option value="">-- Choose New Status --</option>
              {isAdmin && <option value="VERIFIED">VERIFIED (Admin Approved)</option>}
              {isAdmin && <option value="ASSIGNED">ASSIGNED</option>}
              <option value="IN_PROGRESS">IN_PROGRESS (Technician on Site)</option>
              <option value="RESOLVED">RESOLVED (Repairs Complete)</option>
              {isAdmin && <option value="CLOSED">CLOSED (Archived)</option>}
              {isAdmin && <option value="REJECTED">REJECTED (Invalid / Out of Scope)</option>}
            </select>
          </div>

          <Textarea
            label="Work Summary / Progress Note"
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
            placeholder="Details on parts replaced, diagnostics run, or safety actions taken..."
            rows={3}
          />

          {nextStatus === "RESOLVED" && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Resolution Evidence Photo URL (Optional)
              </label>
              <input
                type="text"
                value={resolutionPhotoUrl}
                onChange={(e) => setResolutionPhotoUrl(e.target.value)}
                placeholder="/uploads/resolution-photo.jpg or image URL"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdateStatus}
              isLoading={isUpdatingStatus}
              disabled={!nextStatus}
            >
              Apply Status Change
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
