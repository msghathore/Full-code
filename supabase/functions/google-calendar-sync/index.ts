import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Environment variables - these need to be set in the Supabase project settings
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || ''
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || ''
const GOOGLE_OAUTH_REDIRECT_URI = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI') || ''
const TOKEN_ENCRYPTION_KEY = Deno.env.get('TOKEN_ENCRYPTION_KEY') || ''

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Encryption utilities for OAuth tokens
const ALGORITHM = 'aes-256-gcm'

function encryptToken(token: string): string {
  const key = TOKEN_ENCRYPTION_KEY || generateKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()
  
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  ).then(key =>
    crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(token)
    )
  ).then(encrypted => {
    const encryptedArray = new Uint8Array(encrypted)
    const combined = new Uint8Array(iv.length + encryptedArray.length)
    combined.set(iv, 0)
    combined.set(encryptedArray, iv.length)
    return Array.from(combined, byte => byte.toString(16).padStart(2, '0')).join('')
  })
}

function decryptToken(encryptedToken: string): Promise<string> {
  const key = TOKEN_ENCRYPTION_KEY || generateKey()
  const encoder = new TextEncoder()
  
  return Promise.resolve().then(() => {
    const combined = new Uint8Array(
      encryptedToken.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    )
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)
    
    return crypto.subtle.importKey(
      'raw',
      encoder.encode(key),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    ).then(key =>
      crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      ).then(decrypted => new TextDecoder().decode(decrypted))
    )
  })
}

function generateKey(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Google OAuth scopes
const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly'
]

// Create OAuth URL for Google authentication
function createOAuthUrl(staffId: string): string {
  const state = Buffer.from(JSON.stringify({ staffId })).toString('base64')
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
    scope: GOOGLE_CALENDAR_SCOPES.join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    state: state
  })
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// Exchange authorization code for tokens
async function exchangeCodeForTokens(code: string): Promise<any> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_OAUTH_REDIRECT_URI
    })
  })
  
  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`)
  }
  
  return await response.json()
}

// Refresh access token using refresh token
async function refreshAccessToken(refreshToken: string): Promise<any> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  })
  
  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`)
  }
  
  return await response.json()
}

// Get user's calendars to find the primary calendar
async function getUserCalendars(accessToken: string): Promise<any> {
  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch calendars: ${response.statusText}`)
  }
  
  return await response.json()
}

// Initialize OAuth flow
async function initiateOAuthFlow(staffId: string): Promise<Response> {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_OAUTH_REDIRECT_URI) {
      throw new Error('Google OAuth credentials not configured')
    }
    
    const oauthUrl = createOAuthUrl(staffId)
    
    return new Response(
      JSON.stringify({ oauth_url: oauthUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('OAuth initiation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

// Handle OAuth callback
async function handleOAuthCallback(request: Request, staffId: string): Promise<Response> {
  try {
    const { code } = await request.json()
    
    if (!code) {
      throw new Error('Authorization code is required')
    }
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    const { access_token, refresh_token, expires_in } = tokens
    
    // Get user's calendars to find the primary calendar ID
    const calendars = await getUserCalendars(access_token)
    const primaryCalendar = calendars.items.find((cal: any) => cal.primary) || calendars.items[0]
    
    if (!primaryCalendar) {
      throw new Error('No calendar found')
    }
    
    // Encrypt tokens
    const encryptedAccessToken = await encryptToken(access_token)
    const encryptedRefreshToken = await encryptToken(refresh_token)
    
    // Calculate expiry date
    const expiryDate = new Date(Date.now() + (expires_in * 1000))
    
    // Store tokens in database
    const { error } = await supabaseClient
      .from('staff_google_calendar_integrations')
      .upsert({
        staff_id: staffId,
        google_calendar_id: primaryCalendar.id,
        access_token_encrypted: encryptedAccessToken,
        refresh_token_encrypted: encryptedRefreshToken,
        token_expires_at: expiryDate.toISOString(),
        calendar_sync_enabled: true
      })
    
    if (error) {
      throw new Error(`Failed to store tokens: ${error.message}`)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        calendar_id: primaryCalendar.id,
        calendar_summary: primaryCalendar.summary 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

// Get access token for staff (with refresh if needed)
async function getAccessToken(staffId: string): Promise<string> {
  const { data: integration, error } = await supabaseClient
    .from('staff_google_calendar_integrations')
    .select('*')
    .eq('staff_id', staffId)
    .eq('calendar_sync_enabled', true)
    .single()
  
  if (error || !integration) {
    throw new Error('No active calendar integration found')
  }
  
  let accessToken = await decryptToken(integration.access_token_encrypted)
  const expiryDate = new Date(integration.token_expires_at)
  
  // Check if token needs refresh
  if (Date.now() >= expiryDate.getTime() - 60000) { // Refresh 1 minute early
    const refreshToken = await decryptToken(integration.refresh_token_encrypted)
    const newTokens = await refreshAccessToken(refreshToken)
    
    accessToken = newTokens.access_token
    
    // Update stored tokens
    const newExpiryDate = new Date(Date.now() + (newTokens.expires_in * 1000))
    const encryptedAccessToken = await encryptToken(accessToken)
    
    await supabaseClient
      .from('staff_google_calendar_integrations')
      .update({
        access_token_encrypted: encryptedAccessToken,
        token_expires_at: newExpiryDate.toISOString(),
        last_sync_at: new Date().toISOString()
      })
      .eq('staff_id', staffId)
  }
  
  return accessToken
}

// Create calendar event
async function createCalendarEvent(request: Request, staffId: string): Promise<Response> {
  try {
    const { appointment_id, appointment_date, appointment_time, customer_name, service_name, duration } = await request.json()
    
    if (!appointment_id || !appointment_date || !appointment_time || !customer_name || !service_name) {
      throw new Error('Missing required fields')
    }
    
    const accessToken = await getAccessToken(staffId)
    
    // Get integration details
    const { data: integration } = await supabaseClient
      .from('staff_google_calendar_integrations')
      .select('google_calendar_id')
      .eq('staff_id', staffId)
      .single()
    
    if (!integration) {
      throw new Error('Calendar integration not found')
    }
    
    // Create event end time
    const startDateTime = new Date(`${appointment_date}T${appointment_time}:00`)
    const endDateTime = new Date(startDateTime.getTime() + (duration * 60000))
    
    const eventData = {
      summary: `${service_name} - ${customer_name}`,
      description: `Salon appointment for ${service_name}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Toronto'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Toronto'
      }
    }
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${integration.google_calendar_id}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      }
    )
    
    if (!response.ok) {
      throw new Error(`Failed to create calendar event: ${response.statusText}`)
    }
    
    const event = await response.json()
    
    // Store event mapping
    const { error } = await supabaseClient
      .from('calendar_event_mappings')
      .upsert({
        appointment_id,
        google_event_id: event.id,
        staff_id: staffId,
        sync_status: 'active'
      })
    
    if (error) {
      console.error('Failed to store event mapping:', error)
      // Don't throw error as the event was created successfully
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        google_event_id: event.id,
        event_link: event.htmlLink
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Create event error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

// Update calendar event
async function updateCalendarEvent(request: Request, staffId: string): Promise<Response> {
  try {
    const { appointment_id, appointment_date, appointment_time, customer_name, service_name, duration } = await request.json()
    
    if (!appointment_id) {
      throw new Error('Appointment ID is required')
    }
    
    // Get existing event mapping
    const { data: mapping } = await supabaseClient
      .from('calendar_event_mappings')
      .select('google_event_id')
      .eq('appointment_id', appointment_id)
      .eq('staff_id', staffId)
      .eq('sync_status', 'active')
      .single()
    
    if (!mapping) {
      throw new Error('No active calendar event mapping found')
    }
    
    const accessToken = await getAccessToken(staffId)
    
    // Get integration details
    const { data: integration } = await supabaseClient
      .from('staff_google_calendar_integrations')
      .select('google_calendar_id')
      .eq('staff_id', staffId)
      .single()
    
    // Create event data if appointment details are provided
    let eventData: any = {}
    if (appointment_date && appointment_time && customer_name && service_name) {
      const startDateTime = new Date(`${appointment_date}T${appointment_time}:00`)
      const endDateTime = new Date(startDateTime.getTime() + (duration * 60000))
      
      eventData = {
        summary: `${service_name} - ${customer_name}`,
        description: `Salon appointment for ${service_name}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Toronto'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Toronto'
        }
      }
    }
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${integration.google_calendar_id}/events/${mapping.google_event_id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      }
    )
    
    if (!response.ok) {
      throw new Error(`Failed to update calendar event: ${response.statusText}`)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        google_event_id: mapping.google_event_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Update event error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

// Delete calendar event
async function deleteCalendarEvent(request: Request, staffId: string): Promise<Response> {
  try {
    const { appointment_id } = await request.json()
    
    if (!appointment_id) {
      throw new Error('Appointment ID is required')
    }
    
    // Get existing event mapping
    const { data: mapping } = await supabaseClient
      .from('calendar_event_mappings')
      .select('google_event_id')
      .eq('appointment_id', appointment_id)
      .eq('staff_id', staffId)
      .eq('sync_status', 'active')
      .single()
    
    if (!mapping) {
      throw new Error('No active calendar event mapping found')
    }
    
    const accessToken = await getAccessToken(staffId)
    
    // Get integration details
    const { data: integration } = await supabaseClient
      .from('staff_google_calendar_integrations')
      .select('google_calendar_id')
      .eq('staff_id', staffId)
      .single()
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${integration.google_calendar_id}/events/${mapping.google_event_id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    )
    
    if (!response.ok && response.status !== 410) { // 410 = Gone (already deleted)
      throw new Error(`Failed to delete calendar event: ${response.statusText}`)
    }
    
    // Update sync status to deleted
    await supabaseClient
      .from('calendar_event_mappings')
      .update({ sync_status: 'deleted' })
      .eq('appointment_id', appointment_id)
      .eq('staff_id', staffId)
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Delete event error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

// Get integration status
async function getIntegrationStatus(staffId: string): Promise<Response> {
  try {
    const { data, error } = await supabaseClient
      .rpc('get_staff_calendar_integration_status', { p_staff_id: staffId })
      .single()
    
    if (error) {
      throw error
    }
    
    return new Response(
      JSON.stringify({ 
        integration_exists: data?.integration_exists || false,
        calendar_id: data?.calendar_id || null,
        sync_enabled: data?.sync_enabled || false,
        last_sync_at: data?.last_sync_at || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Status check error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

// Disconnect calendar integration
async function disconnectCalendar(staffId: string): Promise<Response> {
  try {
    const { data, error } = await supabaseClient
      .rpc('delete_staff_calendar_integration', { p_staff_id: staffId })
    
    if (error) {
      throw error
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        disconnected: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Disconnect error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { action, staff_id } = await req.json()
    
    if (!action || !staff_id) {
      return new Response(
        JSON.stringify({ error: 'Action and staff_id are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    
    // Route to appropriate handler
    switch (action) {
      case 'oauth-initiate':
        return await initiateOAuthFlow(staff_id)
      
      case 'oauth-callback':
        return await handleOAuthCallback(req, staff_id)
      
      case 'create-event':
        return await createCalendarEvent(req, staff_id)
      
      case 'update-event':
        return await updateCalendarEvent(req, staff_id)
      
      case 'delete-event':
        return await deleteCalendarEvent(req, staff_id)
      
      case 'status':
        return await getIntegrationStatus(staff_id)
      
      case 'disconnect':
        return await disconnectCalendar(staff_id)
      
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
    }
  } catch (error) {
    console.error('Request handling error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})