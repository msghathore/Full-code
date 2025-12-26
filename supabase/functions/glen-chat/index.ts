import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Groq API Configuration
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile' // Fast and free

// Validate API key
if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY environment variable is not set')
}

// Configuration constants
const CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_HISTORY_MESSAGES: 6,
  MAX_AI_TOKENS: 200,
  MAX_SERVICE_CARDS: 3,
  REQUEST_TIMEOUT_MS: 10000
}

// Complete Salon Information - ZAVIRA SALON & SPA OFFICIAL DATA
const SALON_INFO = {
  name: 'Zavira Salon & Spa',
  address: '283 Tache Avenue, Winnipeg, MB',
  phone: '(431) 816-3330',
  email: 'zavirasalonandspa@gmail.com',
  website: 'zavira.ca',
  hours: 'Daily: 8:00 AM - 11:30 PM',
  parking: 'Free street parking on Horace Street and Tache Avenue (up to 2 hours)',
  paymentMethods: 'All major credit cards, Apple Pay, Google Pay, Square, cash',
  cancellationPolicy: '24 hours notice required. Late cancellations: 50% fee',
  serviceCategories: ['Hair', 'Nails', 'Skin/Facials', 'Massage', 'Tattoo', 'Piercing', 'Waxing'],
  specialOffers: [
    'First-time clients: 15% off',
    'Refer a friend: $20 off each',
    'Birthday month: 20% off',
    'Loyalty rewards program'
  ]
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { message, conversationHistory } = await req.json()

    // Validate message
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid message string is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // Limit message length to prevent abuse
    if (message.length > CONFIG.MAX_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({
        error: `Message too long (max ${CONFIG.MAX_MESSAGE_LENGTH} characters)`,
        response: "Your message is too long. Please keep it under 1000 characters!",
        actions: [
          { label: 'Try Again', action: 'services', icon: 'sparkles' }
        ]
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // Validate conversation history
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return new Response(JSON.stringify({ error: 'Invalid conversation history format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://stppkvkcjsyusxwtbaej.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseKey) {
      throw new Error('Supabase key not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch services from database with error handling
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name, category, description, price, duration_minutes')
      .eq('is_active', true)

    if (servicesError) {
      console.error('Database error:', servicesError)
      // Continue with empty services rather than failing
    }

    // Format services for context
    const servicesContext = services?.map(s =>
      `${s.name} (${s.category}) - $${s.price}, ${s.duration_minutes}min`
    ).join('\n') || 'Services temporarily unavailable'

    // Build conversation history for Groq
    const messages = [
      {
        role: 'system',
        content: `You are Glen, a friendly booking assistant for ${SALON_INFO.name}.

**YOUR ROLE:** Help customers quickly and guide them to book appointments.

**RESPONSE RULES:**
- Keep responses SHORT (2-3 sentences max)
- Always mention booking if relevant
- Be friendly but concise
- Guide customers towards booking
- Don't repeat information unnecessarily

**SALON INFO:**
- Location: ${SALON_INFO.address}
- Hours: ${SALON_INFO.hours}
- Phone: ${SALON_INFO.phone}
- Website: ${SALON_INFO.website}
- Parking: ${SALON_INFO.parking}

**SERVICES:**
${servicesContext}

**SPECIAL OFFERS:**
${SALON_INFO.specialOffers.join('\n')}

**WHEN ASKED ABOUT:**
- Services: Briefly mention 2-3 popular ones, encourage booking
- Hours: State hours, suggest booking online
- Location: Give address, mention free parking
- Prices: Show a few examples, direct to booking page
- Anything else: Answer briefly, guide to booking

**EXAMPLES:**
User: "What services do you have?"
Glen: "We offer hair, nails, massage, facials, and more! Popular choices are haircuts ($45-85) and gel manicures ($55). Ready to book?"

User: "When are you open?"
Glen: "We're open daily 8 AM to 11:30 PM. You can book anytime online at zavira.ca or call (431) 816-3330!"

User: "Where are you located?"
Glen: "We're at 283 Tache Avenue, Winnipeg. Free parking on Horace St. Need directions or ready to book?"

**REMEMBER:** Short, helpful, always guide to booking!`
      },
      // Add conversation history with validation
      ...(conversationHistory || [])
        .slice(-CONFIG.MAX_HISTORY_MESSAGES)
        .filter((msg: any) => msg && typeof msg === 'object' && msg.text && msg.sender)
        .map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: String(msg.text).substring(0, 500)
        })),
      // Add current message
      {
        role: 'user',
        content: message
      }
    ]

    // Call Groq API with error handling
    let groqResponse;
    try {
      groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: 0.7,
          max_tokens: CONFIG.MAX_AI_TOKENS,
          top_p: 0.9
        })
      })
    } catch (fetchError) {
      console.error('Groq API network error:', fetchError)
      throw new Error('Failed to connect to AI service')
    }

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('Groq API error:', errorText)

      // Handle rate limiting specifically
      if (groqResponse.status === 429) {
        throw new Error('Service temporarily busy, please try again')
      }

      throw new Error(`AI service error: ${groqResponse.status}`)
    }

    const groqData = await groqResponse.json()

    // Validate response structure
    if (!groqData || !groqData.choices || !Array.isArray(groqData.choices) || groqData.choices.length === 0) {
      console.error('Invalid Groq response structure:', groqData)
      throw new Error('Invalid AI response format')
    }

    const aiResponse = groqData.choices[0]?.message?.content?.trim() ||
      "I'm here to help! What would you like to know?"

    // Determine if we should show services based on message content
    const lowerMessage = message.toLowerCase()
    const shouldShowServices =
      lowerMessage.includes('service') ||
      lowerMessage.includes('price') ||
      lowerMessage.includes('hair') ||
      lowerMessage.includes('nail') ||
      lowerMessage.includes('massage') ||
      lowerMessage.includes('facial') ||
      lowerMessage.includes('skin')

    let serviceCards: any[] = []
    if (shouldShowServices && services) {
      // Show relevant services
      let filteredServices = services

      if (lowerMessage.includes('hair')) {
        filteredServices = services.filter(s => s.category.toLowerCase() === 'hair')
      } else if (lowerMessage.includes('nail')) {
        filteredServices = services.filter(s => s.category.toLowerCase() === 'nails')
      } else if (lowerMessage.includes('massage')) {
        filteredServices = services.filter(s => s.category.toLowerCase() === 'massage')
      } else if (lowerMessage.includes('facial') || lowerMessage.includes('skin')) {
        filteredServices = services.filter(s => s.category.toLowerCase() === 'skin')
      }

      serviceCards = filteredServices.slice(0, CONFIG.MAX_SERVICE_CARDS).map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        price: s.price,
        duration: s.duration_minutes,
        description: s.description
      }))
    }

    // Always provide quick actions for booking
    const quickActions = [
      { label: 'Book Now', action: 'book', icon: 'calendar' },
      { label: 'View Services', action: 'services', icon: 'sparkles' },
      { label: 'Hours & Location', action: 'location', icon: 'map' }
    ]

    return new Response(JSON.stringify({
      response: aiResponse,
      type: serviceCards.length > 0 ? 'services' : 'text',
      services: serviceCards.length > 0 ? serviceCards : undefined,
      actions: quickActions
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error',
      response: "I'm having trouble right now. Please call us at (431) 816-3330 or book at zavira.ca!",
      actions: [
        { label: 'Book Online', action: 'book', icon: 'calendar' },
        { label: 'Call Us', action: 'call', icon: 'phone' }
      ]
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})
