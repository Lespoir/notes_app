/**
 * Root page — the middleware will redirect:
 *   - Authenticated users → /notes
 *   - Unauthenticated users → /auth/login
 * This page is a fallback that should never be seen in normal usage.
 */
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/notes');
}
