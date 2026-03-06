/**
 * Auth domain rules — pure business logic functions.
 * No side effects. No framework dependencies.
 */

/**
 * Toggles the password visibility state.
 */
export function togglePasswordVisibility(current: boolean): boolean {
  return !current;
}

/**
 * Returns true when the given token represents an authenticated user.
 */
export function isAuthenticated(token: string | null | undefined): boolean {
  return typeof token === 'string' && token.length > 0;
}

/**
 * Returns the path to redirect to after successful authentication.
 */
export function getAuthRedirectPath(): string {
  return '/';
}
