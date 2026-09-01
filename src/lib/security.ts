/**
 * Security & Input Sanitization Utilities
 */

/**
 * Validates and sanitizes URLs to ensure they only use safe protocols (http, https, tel, mailto).
 * Strictly blocks javascript:, data:, and malicious protocol schemes.
 */
export function sanitizeSafeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Allow tel: and mailto:
  if (trimmed.startsWith('tel:') || trimmed.startsWith('mailto:')) {
    return trimmed;
  }

  // Allow relative paths starting with /
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, 'https://placeholder.local');
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Escapes Excel & CSV formula injection characters (=, +, -, @, \t, \r).
 */
export function sanitizeExcelCell(val: string | null | undefined | number): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}
