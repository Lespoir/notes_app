/**
 * Notes domain entities.
 * These are the business objects that features consume — not API DTOs.
 */

export type NoteCategoryEmbedded = {
  id: string;
  title: string;
  color: string;
};

export type NoteEntity = {
  id: string;
  title: string;
  content: string;
  category: NoteCategoryEmbedded | null;
  createdAt: Date;
  updatedAt: Date;
};
