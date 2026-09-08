/**
 * Secure Event ID Generator for Meta Pixel & Conversions API Deduplication
 * Generates identical deterministic or random UUID event IDs for Browser + Server.
 */

export function generateEventId(prefix = 'evt'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  // Fallback if crypto.randomUUID is unavailable
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${randomPart}`;
}

/**
 * Generate a deterministic event ID for transactional events (Purchase)
 * Ensures that page refreshes or re-renders use the exact same event ID for that transaction.
 */
export function generateTransactionEventId(orderIdOrNumber: string): string {
  const cleanId = String(orderIdOrNumber).trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  return `purchase_${cleanId}`;
}
