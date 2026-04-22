import { z } from 'zod';

export const loginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(128),
});

export type LoginDto = z.infer<typeof loginDtoSchema>;
