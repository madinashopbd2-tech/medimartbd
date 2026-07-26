/**
 * Meta Conversions API (CAPI) & Pixel Event Deduplication Service
 * Fires Meta CAPI payloads directly from server actions/API routes
 * with deterministic event_id (purchase_${orderId}) and SHA-256 hashed user signals.
 */

import crypto from 'crypto';

export interface MetaCapiUserData {
  phone: string;
  name: string;
  address: string;
  district: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface MetaCapiEventPayload {
  eventName: string;
  eventId: string;
  eventTime: number;
  eventSourceUrl?: string;
  userData: MetaCapiUserData;
  customData: {
    currency: string;
    value: number;
    content_name?: string;
    content_type?: string;
    content_ids?: string[];
    num_items?: number;
    delivery_fee?: number;
  };
}

export interface CapiLogEntry {
  id: string;
  eventId: string;
  eventName: string;
  status: 'SUCCESS' | 'FAILED' | 'SIMULATED';
  statusCode: number;
  responseMessage: string;
  timestamp: string;
  payloadSummary: string;
}

// In-memory log of recent CAPI events for Admin debugging
export const capiLogsMemory: CapiLogEntry[] = [];

/**
 * SHA-256 Hash helper for Meta CAPI privacy requirements
 */
export function hashData(value: string | undefined | null): string {
  if (!value) return '';
  const normalized = value.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Clean & normalize BD phone number for hashing
 */
export function normalizeBdPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('01')) {
    cleaned = '88' + cleaned;
  }
  return cleaned;
}

/**
 * Fire Meta Conversions API (CAPI) Event
 */
export async function sendMetaCapiEvent(
  pixelId: string | null | undefined,
  accessToken: string | null | undefined,
  payload: MetaCapiEventPayload,
  testEventCode?: string | null
): Promise<{ success: boolean; log: CapiLogEntry }> {
  const { eventName, eventId, eventTime, userData, customData, eventSourceUrl } = payload;

  const hashedPhone = hashData(normalizeBdPhone(userData.phone));
  const hashedName = hashData(userData.name);
  const hashedCity = hashData(userData.district);

  const eventObject: any = {
    event_name: eventName,
    event_time: eventTime || Math.floor(Date.now() / 1000),
    event_id: eventId, // Critical for client + server deduplication
    event_source_url: eventSourceUrl || 'https://my-cod-store.com',
    action_source: 'website',
    user_data: {
      ph: [hashedPhone],
      fn: [hashedName],
      ct: [hashedCity],
      client_ip_address: userData.ipAddress || '127.0.0.1',
      client_user_agent: userData.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    custom_data: {
      currency: customData.currency || 'BDT',
      value: customData.value,
      content_name: customData.content_name || 'Single Product',
      content_type: 'product',
      content_ids: customData.content_ids || ['COD-PROD-01'],
      num_items: customData.num_items || 1,
    },
  };

  const formattedPayload: any = {
    data: [eventObject],
  };

  if (testEventCode) {
    formattedPayload.test_event_code = testEventCode;
  }

  const timestamp = new Date().toISOString();
  const summaryStr = `Order Total: ৳${customData.value}, Phone: ***${userData.phone.slice(-4)}, EventID: ${eventId}`;

  // If Pixel ID or Token is missing, simulate CAPI dispatch for testing
  if (!pixelId || !accessToken) {
    const simLog: CapiLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      eventName,
      status: 'SIMULATED',
      statusCode: 200,
      responseMessage: 'Simulated CAPI Dispatch (No active Meta Token set in Settings)',
      timestamp,
      payloadSummary: summaryStr,
    };
    capiLogsMemory.unshift(simLog);
    if (capiLogsMemory.length > 50) capiLogsMemory.pop();
    return { success: true, log: simLog };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedPayload),
    });

    const resData = await response.json();

    const logEntry: CapiLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      eventName,
      status: response.ok ? 'SUCCESS' : 'FAILED',
      statusCode: response.status,
      responseMessage: response.ok ? `Events Received: ${resData.events_received || 1}` : JSON.stringify(resData.error || resData),
      timestamp,
      payloadSummary: summaryStr,
    };

    capiLogsMemory.unshift(logEntry);
    if (capiLogsMemory.length > 50) capiLogsMemory.pop();

    return { success: response.ok, log: logEntry };
  } catch (error: any) {
    const errLog: CapiLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      eventName,
      status: 'FAILED',
      statusCode: 500,
      responseMessage: error?.message || 'Network error executing CAPI fetch',
      timestamp,
      payloadSummary: summaryStr,
    };
    capiLogsMemory.unshift(errLog);
    if (capiLogsMemory.length > 50) capiLogsMemory.pop();

    return { success: false, log: errLog };
  }
}
