import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return apiError("FORBIDDEN", "Administrative privileges required", 403);
    }

    const [
      totalIssues,
      submittedCount,
      verifiedCount,
      assignedCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      reopenedCount,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      allIssues,
      categories,
      locations,
      staffUsers,
      feedbacks,
    ] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({ where: { status: "SUBMITTED" } }),
      prisma.issue.count({ where: { status: "VERIFIED" } }),
      prisma.issue.count({ where: { status: "ASSIGNED" } }),
      prisma.issue.count({ where: { status: "IN_PROGRESS" } }),
      prisma.issue.count({ where: { status: "RESOLVED" } }),
      prisma.issue.count({ where: { status: "CLOSED" } }),
      prisma.issue.count({ where: { status: "REOPENED" } }),
      prisma.issue.count({ where: { priority: "CRITICAL" } }),
      prisma.issue.count({ where: { priority: "HIGH" } }),
      prisma.issue.count({ where: { priority: "MEDIUM" } }),
      prisma.issue.count({ where: { priority: "LOW" } }),
      prisma.issue.findMany({
        select: {
          id: true,
          createdAt: true,
          resolvedAt: true,
          status: true,
          categoryId: true,
          locationId: true,
        },
      }),
      prisma.category.findMany({
        include: { _count: { select: { issues: true } } },
      }),
      prisma.location.findMany({
        include: { _count: { select: { issues: true } } },
      }),
      prisma.user.findMany({
        where: { role: "STAFF" },
        select: {
          id: true,
          name: true,
          email: true,
          staffProfile: true,
          assignedIssues: {
            select: { id: true, status: true },
          },
        },
      }),
      prisma.feedback.findMany({
        select: { rating: true, resolved: true },
      }),
    ]);

    const activeIssuesCount =
      submittedCount + verifiedCount + assignedCount + inProgressCount + reopenedCount;

    // Calculate Average Resolution Time (MTTR in hours)
    let totalResolutionHours = 0;
    let resolvedWithDatesCount = 0;
    for (const issue of allIssues) {
      if (issue.resolvedAt && issue.createdAt) {
        const hours = (new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) / 3600000;
        if (hours >= 0) {
          totalResolutionHours += hours;
          resolvedWithDatesCount++;
        }
      }
    }
    const avgResolutionTimeHours =
      resolvedWithDatesCount > 0 ? Math.round((totalResolutionHours / resolvedWithDatesCount) * 10) / 10 : 0;

    // User Satisfaction
    let satisfactionAverage = 0;
    if (feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
      satisfactionAverage = Math.round((sum / feedbacks.length) * 10) / 10;
    }

    // Issues by category breakdown
    const categoryBreakdown = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      total: cat._count.issues,
    }));

    // Issues by building
    const buildingMap: Record<string, number> = {};
    for (const loc of locations) {
      buildingMap[loc.building] = (buildingMap[loc.building] || 0) + loc._count.issues;
    }
    const buildingBreakdown = Object.entries(buildingMap).map(([building, count]) => ({
      building,
      count,
    }));

    // Staff workload and performance breakdown
    const staffBreakdown = staffUsers.map((s) => ({
      id: s.id,
      name: s.name,
      specialization: s.staffProfile?.specialization || "GENERAL",
      currentWorkload: s.staffProfile?.currentWorkload || 0,
      totalAssigned: s.assignedIssues.length,
      resolved: s.assignedIssues.filter(
        (i) => i.status === "RESOLVED" || i.status === "CLOSED"
      ).length,
    }));

    return apiSuccess({
      kpis: {
        totalIssues,
        activeIssues: activeIssuesCount,
        inProgress: inProgressCount,
        resolved: resolvedCount + closedCount,
        reopened: reopenedCount,
        critical: criticalCount,
        avgResolutionHours: avgResolutionTimeHours,
        userSatisfaction: satisfactionAverage,
        totalFeedbackCount: feedbacks.length,
      },
      statusDistribution: [
        { name: "Submitted", count: submittedCount, color: "#64748b" },
        { name: "Verified", count: verifiedCount, color: "#3b82f6" },
        { name: "Assigned", count: assignedCount, color: "#8b5cf6" },
        { name: "In Progress", count: inProgressCount, color: "#f59e0b" },
        { name: "Resolved", count: resolvedCount, color: "#10b981" },
        { name: "Closed", count: closedCount, color: "#059669" },
        { name: "Reopened", count: reopenedCount, color: "#ef4444" },
      ],
      priorityDistribution: [
        { name: "Low", count: lowCount, color: "#64748b" },
        { name: "Medium", count: mediumCount, color: "#3b82f6" },
        { name: "High", count: highCount, color: "#f59e0b" },
        { name: "Critical", count: criticalCount, color: "#ef4444" },
      ],
      categoryBreakdown,
      buildingBreakdown,
      staffBreakdown,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return apiError("INTERNAL_ERROR", "Failed to compute analytics", 500);
  }
}
