import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { apiError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return apiError("FORBIDDEN", "Only administrators can export reports", 403);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    const issues = await prisma.issue.findMany({
      where,
      include: {
        category: true,
        location: true,
        reporter: { select: { name: true, email: true } },
        assignedStaff: { select: { name: true, email: true } },
        feedback: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Issue ID",
      "Title",
      "Category",
      "Priority",
      "Status",
      "Building",
      "Room",
      "Reporter Name",
      "Reporter Email",
      "Assigned Staff",
      "Created At",
      "Resolved At",
      "Satisfaction Rating",
      "Feedback Note",
    ];

    const escapeCsv = (str: string | null | undefined) => {
      if (!str) return '""';
      const clean = str.replace(/"/g, '""').replace(/\n/g, " ");
      return `"${clean}"`;
    };

    const rows = issues.map((i) => [
      escapeCsv(i.publicIssueId),
      escapeCsv(i.title),
      escapeCsv(i.category.name),
      escapeCsv(i.priority),
      escapeCsv(i.status),
      escapeCsv(i.location.building),
      escapeCsv(i.room || i.location.room),
      escapeCsv(i.reporter.name),
      escapeCsv(i.reporter.email),
      escapeCsv(i.assignedStaff?.name || "Unassigned"),
      escapeCsv(i.createdAt.toISOString()),
      escapeCsv(i.resolvedAt ? i.resolvedAt.toISOString() : ""),
      escapeCsv(i.feedback ? `${i.feedback.rating}/5` : "N/A"),
      escapeCsv(i.feedback?.comment || ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="campuscare_report_${dateStr}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export report error:", error);
    return apiError("INTERNAL_ERROR", "Failed to generate report", 500);
  }
}
