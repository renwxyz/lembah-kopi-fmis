import { z } from "zod";

export const loginSchema = z.object({
  username_or_email: z.string().min(1, "Username atau email wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
