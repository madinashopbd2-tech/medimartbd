/**
 * Privacy Hashing & User Data Normalization for Meta Conversions API (CAPI)
 * Standardizes inputs according to Meta Graph API specifications:
 * - SHA-256 lowercase hex
 * - Phone numbers normalized with country code (e.g., 88017...)
 * - Email trimmed and lowercased
 */

import crypto from 'crypto';

/**
 * SHA-256 hash string value to lowercase hex.
 * Returns empty string if input is null, undefined, or empty.
 */
export function hashSha256(value: string | undefined | null): string {
  if (!value) return '';
  const normalized = value.trim().toLowerCase();
  if (!normalized) return '';
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Normalizes a phone number for Meta CAPI (removes spaces, symbols, and prefixes with country code).
 * For Bangladesh: e.g. "01712-345678" -> "8801712345678"
 */
export function normalizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  if (!clean) return '';

  // Bangladesh numbers starting with 01 (11 digits)
  if (clean.length === 11 && clean.startsWith('01')) {
    clean = '88' + clean;
  } else if (clean.length === 10 && clean.startsWith('1')) {
    clean = '880' + clean;
  }
  return clean;
}

/**
 * Normalizes email address for Meta CAPI (trimmed, lowercase, no extra whitespace).
 */
export function normalizeEmail(email: string | undefined | null): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Normalizes city/district (trimmed, lowercase, latin letters preferred).
 */
export function normalizeCity(city: string | undefined | null): string {
  if (!city) return '';
  return city.trim().toLowerCase().replace(/[^a-z0-9\s]/gi, '');
}
