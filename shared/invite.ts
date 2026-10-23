import { z } from 'zod';
import { plans } from './plans';
export { plans } from './plans';
export const inviteSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter at least 2 characters.').max(80),
    email: z
      .email('Please enter a valid email address.')
      .max(254)
      .transform((value) => value.toLowerCase()),
    plan: z.enum(plans),
    billing: z.enum(['monthly', 'yearly']),
    consent: z.literal(true, { error: 'Please agree to the privacy notice.' }),
    website: z.string().max(0).optional(),
  })
  .strict();
export type InviteInput = z.infer<typeof inviteSchema>;
