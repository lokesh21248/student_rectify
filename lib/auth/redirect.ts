/**
 * Client-safe redirect URL validator to prevent open redirect vulnerabilities.
 * This file has zero server-only dependencies and can be safely imported by Client Components.
 */
export function getSafeRedirectUrl(url?: string | null, fallback = "/admin/dashboard"): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  // Must be an internal relative path starting with a single '/'
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) {
    if (trimmed === "/admin/sign-in" || trimmed === "/admin/sign-up") {
      return fallback;
    }
    return trimmed;
  }
  return fallback;
}
