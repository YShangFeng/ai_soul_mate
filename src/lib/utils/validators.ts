import { z } from "zod";
import {
  RELATIONSHIP_TYPES,
  COMPANION_STYLES,
  GENDER_OPTIONS,
  FREE_TIER,
} from "@/lib/constants";

// --- Auth Validators ---

export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required")
  .max(255, "Email is too long")
  .transform((v) => v.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// --- Companion Validators ---

export const companionNameSchema = z
  .string()
  .min(1, "Name is required")
  .max(30, "Name must be 30 characters or less")
  .regex(/^[a-zA-Z0-9\s\-'.]+$/, "Name contains invalid characters")
  .transform((v) => v.trim());

export const relationshipTypeSchema = z.enum(RELATIONSHIP_TYPES, {
  errorMap: () => ({ message: "Please select a valid relationship type" }),
});

export const companionStyleSchema = z.enum(COMPANION_STYLES, {
  errorMap: () => ({ message: "Please select a valid style" }),
});

export const genderSchema = z.enum(GENDER_OPTIONS, {
  errorMap: () => ({ message: "Please select a valid gender option" }),
});

export const companionDescriptionSchema = z
  .string()
  .max(500, "Description must be 500 characters or less")
  .optional();

export const createCompanionSchema = z.object({
  name: companionNameSchema,
  relationshipType: relationshipTypeSchema,
  style: companionStyleSchema,
  gender: genderSchema,
  description: companionDescriptionSchema,
});

// --- Image Upload Validators ---

export const imageUploadSchema = z.object({
  size: z.number().max(FREE_TIER.MAX_UPLOAD_SIZE, "Image must be 10MB or less"),
  type: z.string().refine(
    (type) => (FREE_TIER.ALLOWED_IMAGE_TYPES as readonly string[]).includes(type),
    "Image must be JPEG, PNG, or WebP",
  ),
});

// --- Chat Validators ---

export const messageSchema = z
  .string()
  .min(1, "Message cannot be empty")
  .max(2000, "Message must be 2000 characters or less")
  .transform((v) => v.trim());

// --- Settings Validators ---

export const settingsSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name is too long")
    .optional(),
  notifications: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

// --- Type exports ---
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCompanionInput = z.infer<typeof createCompanionSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
