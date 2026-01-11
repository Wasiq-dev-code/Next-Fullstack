import z from 'zod';

// Login schema
export const loginUserSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type LoginUserType = z.infer<typeof loginUserSchema>;
