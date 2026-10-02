
/**
 * Client-side diagnostic logging.
 *
 * Logging is intentionally fire-and-forget and NEVER throws.
 * A logging failure must never break the application.
 */

const SUPABASE_URL = 'https://ggvmflpvodkqprxixpin.supabase.co'

const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdndm1mbHB2b2RrcXByeGl4cGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDE4MjcsImV4cCI6MjEwNjMxNzgyN30.75bwMX5rgHDqde7OB49_zGowgSY-plyqtWMw8RChI8g'
const DEBUG_TABLE = 'checkout_debug_logs'

/**
 * Send a row to Supabase.
 *
 * This function never throws.
 */
function sendLog(row) {
  try {
    fetch(`${SUPABASE_URL}/rest/v1/${DEBUG_TABLE}`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },

      body: JSON.stringify(row),

      // Allows the request to continue during navigation.
      keepalive: true,
    }).catch(() => {
      // Logging must never break the application.
    })
  } catch (error) {
    // Logging must never break the application.
  }
}

/**
 * Log a checkout/cart diagnostic event.
 *
 * Example:
 *
 * logCheckoutEvent({
 *   action: 'validate_cart_start',
 *   eventId: event.id,
 *   cartToken: token,
 *   data: {
 *     selectedTickets,
 *   },
 * })
 */
export function logCheckoutEvent({
  action,
  eventId,
  cartToken,
  success = null,
  statusCode = null,
  error = null,
  data = null,
} = {}) {
  try {
    const row = {
      action: action || 'unknown',

      event_id:
        eventId != null
          ? String(eventId)
          : null,

      cart_token:
        cartToken != null
          ? String(cartToken)
          : null,

      success,

      status_code:
        statusCode != null
          ? Number(statusCode)
          : null,

      error_name:
        error?.name || null,

      error_message:
        error?.message ||
        (error ? String(error) : null),

      user_agent:
        typeof navigator !== 'undefined'
          ? navigator.userAgent
          : null,

      page_url:
        typeof window !== 'undefined'
          ? window.location.href
          : null,

      extra:
        data != null
          ? data
          : null,
    }

    // Also show it locally while debugging.
    console.log('[CHECKOUT DEBUG]', row)

    sendLog(row)
  } catch (e) {
    // Never allow logging to break the application.
  }
}

/**
 * Existing generic client error logger.
 *
 * Keep this for other application errors.
 */
export function logClientError({
  eventId,
  error,
  extra,
} = {}) {
  try {
    logCheckoutEvent({
      action: 'client_error',
      eventId,
      cartToken:
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('cart_token')
          : null,

      success: false,

      statusCode:
        error?.response?.status ?? null,

      error,

      data: extra || null,
    })
  } catch (e) {
    // Never allow logging to break the application.
  }
}