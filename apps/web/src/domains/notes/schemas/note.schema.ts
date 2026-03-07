/**
 * Zod validation schemas for note domain inputs.
 */
import { z } from 'zod';

export const updateNoteSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().optional(),
  category: z.string().uuid().nullable().optional(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
