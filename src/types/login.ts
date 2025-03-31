import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ILogin = z.infer<typeof loginSchema>;
