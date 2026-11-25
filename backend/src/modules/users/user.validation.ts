import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),

  email: z.string().trim().email().max(255),

  password: z.string().min(8).max(128),

  role: z.enum(["MANAGER", "EMPLOYEE"]),
}).strict();

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),

  email: z.string().trim().email().max(255).optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  "Au moins un champ est obligatoire."
);

export type CreateUserInput = z.infer<typeof createUserSchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;