/**
 * Auth domain entities.
 * These are the business objects that features consume — not API DTOs.
 */

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthToken = {
  key: string;
};
