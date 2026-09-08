/**
 * Server-Side Meta Conversions API (CAPI) Dispatcher
 * Sends standardized, deduplicated Graph API payloads to Meta CAPI.
 * Features strict privacy hashing (SHA-256), token security, and non-blocking execution.
 */

import { hashSha256, normalizePhone, normalizeEmail, normalizeCity } from './hashing';
import { MetaEventPayload, logMetaDebug } from './metaEvents';

export interface MetaCapiResult {
  success: boolean;
  statusCode: number;
  message: string;
  eventsReceived?: number;
  fbtrace_id?: string;
}

/**
 * Validates and formats user_data object for Meta Graph API
 * Empty arrays or empty strings are excluded because Meta CAPI penalizes them.
 */
export function buildMetaUserData(userData: MetaEventPayload['user_data'] = {}): Record<string, any> {
  const metaUserData: Record<string, any> = {};

  // 1. Phone Number (normalized e.g. 88017... then SHA-256 hashed)
  if (userData.phone) {
    const normalizedPhone = normalizePhone(userData.phone);
    if (normalizedPhone) {
      metaUserData.ph = [hashSha256(normalizedPhone)];
    }
  }

  // 2. First Name (SHA-256 hashed)
  if (userData.name) {
    const cleanName = userData.name.trim().toLowerCase();
    if (cleanName) {
      metaUserData.fn = [hashSha256(cleanName)];
    }
  }

  // 3. Email (normalized then SHA-256 hashed)
  if (userData.email) {
    const cleanEmail = normalizeEmail(userData.email);
    if (cleanEmail) {
      metaUserData.em = [hashSha256(cleanEmail)];
    }
  }

  // 4. City / District (SHA-256 hashed)
  if (userData.district || userData.city) {
    const cleanCity = normalizeCity(userData.district || userData.city);
    if (cleanCity) {
      metaUserData.ct = [hashSha256(cleanCity)];
    }
  }

  // 5. Country: Always SHA-256 hashed lowercase 2-letter ISO code 'bd'
  const countryCode = (userData.country || 'bd').trim().toLowerCase();
  metaUserData.country = [hashSha256(countryCode)];

  // 6. First-Party Meta Cookies (_fbp & _fbc) - NEVER hashed
  if (userData.fbp && userData.fbp.trim()) {
    metaUserData.fbp = userData.fbp.trim();
  }
  if (userData.fbc && userData.fbc.trim()) {
    metaUserData.fbc = userData.fbc.trim();
  } else if (userData.fbclid && userData.fbclid.trim()) {
    metaUserData.fbc = `fb.1.${Date.now()}.${userData.fbclid.trim()}`;
  }

  // 7. External ID (device fingerprint or unique customer ID)
  if (userData.externalId && userData.externalId.trim()) {
    metaUserData.external_id = [hashSha256(userData.externalId.trim())];
  }

  // 8. Client IP Address (Must be public IPv4/IPv6; omit private/loopback)
  const clientIp = userData.ipAddress?.trim();
  const isPrivateIp =
    !clientIp ||
    clientIp === '127.0.0.1' ||
    clientIp === '::1' ||
    clientIp.startsWith('::ffff:127.') ||
    clientIp.startsWith('10.') ||
    clientIp.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(clientIp);

  if (clientIp && !isPrivateIp) {
    metaUserData.client_ip_address = clientIp;
  }

  // 9. Client User Agent
  if (userData.userAgent && userData.userAgent.trim()) {
    metaUserData.client_user_agent = userData.userAgent.trim();
  }

  return metaUserData;
}

/**
 * Dispatches a single event to Meta Conversions API (Graph API v19.0 / v20.0)
 */
export async function sendMetaCapiEvent(
  payload: MetaEventPayload,
  config?: {
    pixelId?: string;
    accessToken?: string;
    testEventCode?: string;
  }
): Promise<MetaCapiResult> {
  const { event_name, event_id, event_time, event_source_url, action_source = 'website', custom_data = {} } = payload;

  // Resolve credentials prioritizing environment variables, then runtime config
  const pixelId = (
    process.env.META_PIXEL_ID ||
    config?.pixelId ||
    '1516207809463394'
  ).trim();

  let accessToken = (
    process.env.META_ACCESS_TOKEN ||
    config?.accessToken ||
    ''
  ).trim();

  // Sanitize access token (remove quotes, spaces, 'Bearer ')
  accessToken = accessToken.replace(/^["']|["']$/g, '').trim();
  if (accessToken.toLowerCase().startsWith('bearer ')) {
    accessToken = accessToken.slice(7).trim();
  }
  accessToken = accessToken.replace(/[\r\n\t\s]+/g, '');

  const testEventCode = (
    process.env.META_TEST_EVENT_CODE ||
    config?.testEventCode ||
    ''
  ).trim();

  const metaUserData = buildMetaUserData(payload.user_data);

  const eventObject: any = {
    event_name,
    event_time: event_time || Math.floor(Date.now() / 1000),
    event_id,
    event_source_url: event_source_url || 'https://malaysianbd.shop',
    action_source,
    user_data: metaUserData,
    custom_data: {
      currency: custom_data.currency || 'BDT',
      value: custom_data.value !== undefined ? custom_data.value : undefined,
      content_name: custom_data.content_name || undefined,
      content_type: custom_data.content_type || 'product',
      content_ids: custom_data.content_ids || ['COD-PROD-01'],
      num_items: custom_data.num_items || undefined,
      delivery_fee: custom_data.delivery_fee || undefined,
      order_id: custom_data.order_id || undefined,
      ...custom_data,
    },
  };

  const requestBody: any = {
    data: [eventObject],
  };

  if (testEventCode) {
    requestBody.test_event_code = testEventCode;
  }

  // If token is absent or a dummy placeholder, simulate safe success
  const isDummyToken =
    !accessToken ||
    accessToken.length < 35 ||
    accessToken.toLowerCase().includes('dummy') ||
    accessToken.toLowerCase().includes('demo');

  if (!pixelId || isDummyToken) {
    logMetaDebug(event_name, event_id, 'Server', 'Simulated', 'Configure META_ACCESS_TOKEN in env/settings');
    return {
      success: true,
      statusCode: 200,
      message: 'Simulated Meta CAPI (Provide valid META_ACCESS_TOKEN)',
      eventsReceived: 1,
    };
  }

  requestBody.access_token = accessToken;

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const resData: any = await response.json();
    const isOk = response.ok && !resData.error;

    if (isOk) {
      logMetaDebug(event_name, event_id, 'Server', 'Sent', `Events: ${resData.events_received || 1}`);
      return {
        success: true,
        statusCode: response.status,
        message: 'Success',
        eventsReceived: resData.events_received || 1,
        fbtrace_id: resData.fbtrace_id,
      };
    } else {
      const errMsg = resData?.error?.message || JSON.stringify(resData);
      logMetaDebug(event_name, event_id, 'Server', 'Failed', errMsg);
      return {
        success: false,
        statusCode: response.status,
        message: errMsg,
        fbtrace_id: resData?.error?.fbtrace_id,
      };
    }
  } catch (err: any) {
    const netErrMsg = err?.message || 'Network fetch error';
    logMetaDebug(event_name, event_id, 'Server', 'Failed', netErrMsg);
    return {
      success: false,
      statusCode: 500,
      message: netErrMsg,
    };
  }
}
