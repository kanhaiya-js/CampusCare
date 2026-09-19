import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { duplicateCheckSchema } from "@/lib/validation/schemas";
import { evaluateSimilarity } from "@/lib/services/duplicate-detector";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const body = await req.json();
    const result = duplicateCheckSchema.safeParse(body);
    if (!result.success) {
      return apiError("VALIDATION_ERROR", "Invalid duplicate check data", 422, result.error.format());
    }

    const { title, description, categoryId, locationId, room } = result.data;

    // Fetch active (unresolved or recently resolved) issues
    const activeIssues = await prisma.issue.findMany({
      where: {
        status: {
          notIn: ["CLOSED", "REJECTED"],
        },
      },
      include: {
        category: { select: { id: true, name: true } },
        location: { select: { id: true, name: true, building: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const potentialDuplicates = [];

    for (const issue of activeIssues) {
      const match = evaluateSimilarity(
        { title, description, categoryId, locationId, room },
        {
          id: issue.id,
          publicIssueId: issue.publicIssueId,
          title: issue.title,
          description: issue.description,
          categoryId: issue.category.id,
          categoryName: issue.category.name,
          locationId: issue.location.id,
          locationName: issue.location.name,
          room: issue.room,
          status: issue.status,
          createdAt: issue.createdAt,
        }
      );

      if (match) {
        potentialDuplicates.push(match);
      }
    }

    // Sort by highest similarity score first
    potentialDuplicates.sort((a, b) => b.similarityScore - a.similarityScore);

    return apiSuccess({
      hasDuplicates: potentialDuplicates.length > 0,
      duplicates: potentialDuplicates.slice(0, 5),
    });
  } catch (error) {
    console.error("Duplicate check error:", error);
    return apiError("INTERNAL_ERROR", "Failed to check duplicates", 500);
  }
}
