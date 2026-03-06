/**
 * Categories domain entities.
 * These are the business objects that features consume — not API DTOs.
 */

export type CategoryEntity = {
  id: string;
  title: string;
  color: string;
  noteCount: number;
  createdAt: Date;
};
