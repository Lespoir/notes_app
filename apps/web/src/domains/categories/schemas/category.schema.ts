/**
 * Zod validation schemas for categories domain inputs.
 *
 * Categories are read-only from the client's perspective (created server-side
 * via seed data). Schemas here are provided for any future write operations
 * and for type-safe filtering/selection inputs.
 */
import { z } from 'zod';

/**
 * Schema for selecting/filtering by a category ID.
 * Used when a feature needs to validate a category selection before calling
 * the repository (e.g., filtering notes by category).
 * categoryId is optional — when omitted, all categories are shown.
 */
export const categoryFilterSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').optional(),
});

export type CategoryFilterInput = z.infer<typeof categoryFilterSchema>;
