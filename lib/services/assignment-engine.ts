import prisma from "@/lib/db/prisma";

export interface AssignmentCandidate {
  staffUserId: string;
  staffName: string;
  email: string;
  specialization: string;
  currentWorkload: number;
}

const CATEGORY_SPECIALIZATION_MAP: Record<string, string[]> = {
  electrical: ["ELECTRICAL", "MAINTENANCE"],
  plumbing: ["PLUMBING", "SANITATION", "MAINTENANCE"],
  hvac: ["HVAC", "AIR_CONDITIONING", "ELECTRICAL"],
  "wi-fi": ["NETWORK", "IT_SUPPORT"],
  network: ["NETWORK", "IT_SUPPORT"],
  cleaning: ["CLEANING", "JANITORIAL", "SANITATION"],
  washroom: ["PLUMBING", "CLEANING", "SANITATION"],
  furniture: ["CARPENTRY", "MAINTENANCE"],
  infrastructure: ["CIVIL", "MAINTENANCE", "CARPENTRY"],
  safety: ["SAFETY_SECURITY", "FACILITIES", "ELECTRICAL"],
};

export async function findBestStaffForIssue(categoryId: string): Promise<AssignmentCandidate | null> {
  // Fetch category info to get name
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) return null;

  const catNameLower = category.name.toLowerCase();
  let matchedSpecializations: string[] = [];

  for (const [key, specs] of Object.entries(CATEGORY_SPECIALIZATION_MAP)) {
    if (catNameLower.includes(key)) {
      matchedSpecializations = specs;
      break;
    }
  }

  // Find available staff profiles
  const staffProfiles = await prisma.staffProfile.findMany({
    where: {
      availability: true,
      user: {
        status: "ACTIVE",
        role: "STAFF",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      currentWorkload: "asc",
    },
  });

  if (staffProfiles.length === 0) return null;

  // 1. Try to find an exact or related specialization match with lowest workload
  if (matchedSpecializations.length > 0) {
    const specializedStaff = staffProfiles.find((sp) =>
      matchedSpecializations.some(
        (target) => sp.specialization.toUpperCase() === target.toUpperCase()
      )
    );
    if (specializedStaff) {
      return {
        staffUserId: specializedStaff.userId,
        staffName: specializedStaff.user.name,
        email: specializedStaff.user.email,
        specialization: specializedStaff.specialization,
        currentWorkload: specializedStaff.currentWorkload,
      };
    }
  }

  // 2. Otherwise pick the general technician with lowest workload
  const leastBusy = staffProfiles[0];
  return {
    staffUserId: leastBusy.userId,
    staffName: leastBusy.user.name,
    email: leastBusy.user.email,
    specialization: leastBusy.specialization,
    currentWorkload: leastBusy.currentWorkload,
  };
}
