import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required").max(128, "Password is too long"),
  turnstileToken: z.string().optional().nullable(),
  "cf-turnstile-response": z.string().optional().nullable(),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password cannot exceed 128 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one number or special character"),
    confirmPassword: z.string().optional().nullable().or(z.literal("")),
    studentOrEmployeeId: z.string().max(50).optional().nullable().or(z.literal("")),
    role: z
      .enum([
        "USER",
        "STUDENT",
        "FACULTY",
        "STAFF",
        "MAINTENANCE_STAFF",
        "DEPARTMENT_COORDINATOR",
        "ADMIN",
      ])
      .optional()
      .default("STUDENT"),
    adminKey: z.string().optional().nullable().or(z.literal("")),
    departmentId: z.string().optional().nullable().or(z.literal("")),
    turnstileToken: z.string().optional().nullable(),
    "cf-turnstile-response": z.string().optional().nullable(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid registered email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(20, "Invalid reset token").max(128, "Invalid reset token"),
    password: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .max(128, "Password cannot exceed 128 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one number or special character"),
    confirmPassword: z.string().optional().nullable().or(z.literal("")),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .max(128, "New password cannot exceed 128 characters")
      .regex(/[a-zA-Z]/, "New password must contain at least one letter")
      .regex(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "New password must contain at least one number or special character"),
    confirmNewPassword: z.string().optional().nullable().or(z.literal("")),
  })
  .refine((data) => !data.confirmNewPassword || data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const createIssueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters to explain the problem clearly")
    .max(3000, "Description cannot exceed 3000 characters"),
  categoryId: z.string().min(1, "Please select an issue category"),
  locationId: z.string().min(1, "Please select a campus location"),
  room: z.string().max(100).optional().nullable().or(z.literal("")),
  departmentId: z.string().optional().nullable().or(z.literal("")),
  clubId: z.string().optional().nullable().or(z.literal("")),
  isSensitive: z.boolean().optional().default(false),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  attachments: z
    .array(
      z.object({
        url: z.string().min(1, "Attachment URL is required"),
        fileName: z.string().optional().default("attachment"),
        fileSize: z.number().optional().default(0),
        type: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]).default("IMAGE"),
      })
    )
    .optional()
    .default([]),
});

export const updateIssueStatusSchema = z.object({
  status: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "VERIFIED",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "USER_CONFIRMED",
    "CLOSED",
    "REOPENED",
    "REJECTED",
    "DUPLICATE",
    "ON_HOLD",
  ]),
  comment: z.string().max(1000).optional(),
  resolutionEvidenceUrl: z.string().optional(),
});

export const assignStaffSchema = z.object({
  staffId: z.string().min(1, "Staff ID is required"),
  comment: z.string().max(500).optional(),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  comment: z.string().max(500).optional(),
});

// SECURITY (V7): Partial schema for issue PATCH - validates all fields with safe bounds
export const updateIssueSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150).optional(),
  description: z.string().trim().min(5).max(3000).optional(),
  room: z.string().max(100).optional().nullable(),
  categoryId: z.string().min(1).optional(),
  locationId: z.string().min(1).optional(),
  departmentId: z.string().optional().nullable(),
  clubId: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum([
    "SUBMITTED", "UNDER_REVIEW", "VERIFIED", "ASSIGNED", "IN_PROGRESS",
    "RESOLVED", "USER_CONFIRMED", "CLOSED", "REOPENED", "REJECTED", "DUPLICATE", "ON_HOLD",
  ]).optional(),
  comment: z.string().max(1000).optional(),
}).strict(); // Reject any unexpected fields

// SECURITY (V8): Schema for admin staff onboarding - enforces password strength
export const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  specialization: z.string().min(2, "Specialization is required").max(50),
  employeeId: z.string().max(50).optional().nullable().or(z.literal("")),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
});

export const createFeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  resolved: z.boolean(),
  comment: z.string().max(1000).optional().nullable(),
});

export const duplicateCheckSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  categoryId: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().default("AlertCircle"),
  defaultPriority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  active: z.boolean().default(true),
});

export const locationSchema = z.object({
  name: z.string().min(2).max(100),
  building: z.string().min(2).max(100),
  floor: z.string().max(50).optional().nullable(),
  room: z.string().max(50).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  parentLocationId: z.string().optional().nullable(),
});

export const departmentSchema = z.object({
  name: z.string().min(2).max(150),
  code: z.string().min(2).max(20),
  description: z.string().max(500).optional().nullable(),
  active: z.boolean().default(true),
});

export const programSchema = z.object({
  name: z.string().min(2).max(150),
  code: z.string().min(2).max(50),
  degree: z.string().min(2).max(50),
  departmentId: z.string().min(1),
  active: z.boolean().default(true),
});

export const clubSchema = z.object({
  name: z.string().min(2).max(150),
  category: z.string().min(2).max(100),
  description: z.string().max(1000).optional().nullable(),
  leadName: z.string().max(100).optional().nullable(),
  facultyCoordinator: z.string().max(100).optional().nullable(),
  active: z.boolean().default(true),
});

export const transportRouteSchema = z.object({
  routeNumber: z.string().min(1).max(50),
  routeName: z.string().min(2).max(150),
  startPoint: z.string().min(2).max(150),
  endPoint: z.string().min(2).max(150).default("GLBITM Campus"),
  stops: z.string().max(500).optional().nullable(),
  timings: z.string().max(100).optional().nullable(),
  busNumber: z.string().max(50).optional().nullable(),
  driverName: z.string().max(100).optional().nullable(),
  active: z.boolean().default(true),
});
