import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.enum(["job_seeker", "employer", "admin"]),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["job_seeker", "employer"]),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Job schema
export const jobSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  company_name: z.string(),
  location: z.string(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  job_type: z.enum(["full_time", "part_time", "contract", "internship"]),
  experience_level: z.enum(["entry", "mid", "senior", "executive"]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Job = z.infer<typeof jobSchema>;

// Application schema
export const applicationSchema = z.object({
  id: z.number(),
  job_id: z.number(),
  user_id: z.number(),
  status: z.enum(["pending", "reviewed", "shortlisted", "rejected", "hired"]),
  cover_letter: z.string().optional(),
  applied_at: z.string(),
  updated_at: z.string(),
});

export type Application = z.infer<typeof applicationSchema>;

// Profile schemas
export const jobSeekerProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  username: z.string(),
  phone: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience_years: z.number().optional(),
  education_level: z.string().optional(),
  resume_url: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const employerProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  username: z.string(),
  phone: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  company_name: z.string(),
  company_website: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  company_description: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type JobSeekerProfile = z.infer<typeof jobSeekerProfileSchema>;
export type EmployerProfile = z.infer<typeof employerProfileSchema>; 