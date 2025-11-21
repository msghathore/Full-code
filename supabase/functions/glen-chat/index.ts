import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SALON_SERVICES = [
  'Hair Cut & Styling',
  'Hair Coloring',
  'Massage Therapy',
  'Manicure/Pedicure',
  'Piercing',
  'Tattoo',
  'Facial/Skin Treatment'
]

const COUNTRIES = ['Canada', 'United States']
const CANADIAN_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon'
]
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
]

const N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/booking" // Replace with your n8n webhook URL

// Sales-focused context for Glen
const SALES_PERSONA = `You are Glen, a world-class salesman at Zavira Salon & Spa. Your goal is to sell services, create desire, build urgency, and close deals. Use persuasive language, highlight benefits, offer packages, create FOMO, and always push towards booking. Be charismatic, confident, and results-driven.`

const SYSTEM_PROMPT = `You are Glen, an AI assistant for Zavira Salon & Spa. You help customers with information about our services, booking appointments, pricing, location, and general inquiries. Be friendly, helpful, and professional. Our services include:

- Hair services (cuts, styling, coloring)
- Massage therapy
- Nail care
- Piercings
- Tattoos
- Skin treatments

Location: 123 Beauty Street, Downtown
Hours: Mon-Fri 9AM-7PM, Sat-Sun 8AM-6PM
Phone: (123) 456-7890

Keep responses concise and helpful.`

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { message, conversationHistory } = await req.json()

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      })
    }

    // Context-aware conversation with memory
    const lowerMessage = message.toLowerCase()
    let aiResponse = ''

    // Analyze conversation history for context
    let userInterestedInService = null
    let askedAboutService = false
    let mentionedBooking = false

    if (conversationHistory && conversationHistory.length > 0) {
      // Look through recent messages to understand context
      for (let i = conversationHistory.length - 1; i >= Math.max(0, conversationHistory.length - 6); i--) {
        const msg = conversationHistory[i]
        const msgText = msg.text.toLowerCase()

        if (msg.sender === 'user') {
          if (msgText.includes('hair') && !userInterestedInService) userInterestedInService = 'hair'
          if (msgText.includes('massage') && !userInterestedInService) userInterestedInService = 'massage'
          if (msgText.includes('nail') && !userInterestedInService) userInterestedInService = 'nails'
          if (msgText.includes('piercing') || msgText.includes('tattoo')) userInterestedInService = 'body art'
          if (msgText.includes('skin') || msgText.includes('facial')) userInterestedInService = 'skin'
          if (msgText.includes('book') || msgText.includes('appointment')) mentionedBooking = true
          if (msgText.includes('how') || msgText.includes('what') || msgText.includes('?')) askedAboutService = true
        }
      }
    }

    // Interactive booking with location selection
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('reserve')) {
      if (userInterestedInService) {
        aiResponse = `Perfect! Since you're interested in ${userInterestedInService}, let's get you booked. First, what's your name?`
      } else {
        aiResponse = "Excellent choice! Let's lock this in before someone else takes your spot. First, what's your name?"
      }
    } else if (conversationHistory && conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("what's your name"))) {
      // User provided name, ask for phone
      if (!conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("phone number"))) {
        aiResponse = `Great, ${message}! What's your phone number so we can confirm your booking?`
      }
    } else if (conversationHistory && conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("phone number"))) {
      // User provided phone, ask for email
      if (!conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("email"))) {
        aiResponse = `Perfect! What's your email address for the booking confirmation?`
      }
    } else if (conversationHistory && conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("email"))) {
      // User provided email, ask for location
      if (!conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("location"))) {
        aiResponse = `Awesome! For our North American clients, are you in Canada or the United States?`
      }
    } else if (conversationHistory && conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("Canada or the United States"))) {
      // User selected country, ask for province/state
      if (message.toLowerCase().includes('canada')) {
        aiResponse = `Perfect! Which province? ${CANADIAN_PROVINCES.join(', ')}`
      } else if (message.toLowerCase().includes('united states') || message.toLowerCase().includes('usa') || message.toLowerCase().includes('us')) {
        aiResponse = `Excellent! Which state? ${US_STATES.slice(0, 10).join(', ')}... (and many more!)`
      } else {
        aiResponse = "Let's keep it simple - are you in Canada or the United States?"
      }
    } else if (conversationHistory && conversationHistory.some(msg => msg.sender === 'glen' && (msg.text.includes("province") || msg.text.includes("state")))) {
      // User provided province/state, ask for service
      if (!conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("service"))) {
        aiResponse = `Great location! What service would you like? ${SALON_SERVICES.join(', ')}`
      }
    } else if (conversationHistory && conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("What service"))) {
      // User selected service, ask for date
      if (!conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("preferred date"))) {
        aiResponse = `Perfect choice! What's your preferred date? (MM/DD/YYYY format)`
      }
    } else if (conversationHistory && conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("preferred date"))) {
      // User provided date, ask for time and finalize booking
      if (!conversationHistory.some(msg => msg.sender === 'glen' && msg.text.includes("BOOM!"))) {
        // Extract booking info from conversation
        const recentMessages = conversationHistory.slice(-10) // Last 10 messages
        const bookingInfo: { name?: string; phone?: string; email?: string; location?: string; service?: string; date?: string; time?: string } = {}

        for (const msg of recentMessages) {
          if (msg.sender === 'user') {
            if (!bookingInfo.name && conversationHistory.some(m => m.sender === 'glen' && m.text.includes("what's your name"))) {
              bookingInfo.name = msg.text
            } else if (!bookingInfo.phone && conversationHistory.some(m => m.sender === 'glen' && m.text.includes("phone number"))) {
              bookingInfo.phone = msg.text
            } else if (!bookingInfo.email && conversationHistory.some(m => m.sender === 'glen' && m.text.includes("email"))) {
              bookingInfo.email = msg.text
            } else if (!bookingInfo.location && conversationHistory.some(m => m.sender === 'glen' && (m.text.includes("province") || m.text.includes("state")))) {
              bookingInfo.location = msg.text
            } else if (!bookingInfo.service && conversationHistory.some(m => m.sender === 'glen' && m.text.includes("What service"))) {
              bookingInfo.service = msg.text
            } else if (!bookingInfo.date && conversationHistory.some(m => m.sender === 'glen' && m.text.includes("preferred date"))) {
              bookingInfo.date = msg.text
            }
          }
        }

        bookingInfo.time = message // Current message is the time

        // Validate and submit
        if (bookingInfo.name && bookingInfo.phone && bookingInfo.email && bookingInfo.service) {
          try {
            await fetch(N8N_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...bookingInfo,
                timestamp: new Date().toISOString(),
                source: 'Glen Sales Pro'
              })
            })
            aiResponse = `BOOM! 🎉 Your ${bookingInfo.service} appointment is locked in for ${bookingInfo.date} at ${bookingInfo.time}! You're going to look absolutely incredible. Confirmation details are on the way to ${bookingInfo.email}. Can't wait to see the transformation!`
          } catch (error) {
            aiResponse = `Almost there! Give us a quick call at (123) 456-7890 and we'll get this booked immediately.`
          }
        } else {
          aiResponse = `What's your preferred time for the appointment? (e.g., 2:00 PM)`
        }
      }
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const hooks = [
        "Welcome to the ultimate beauty experience! I'm Glen, your personal transformation specialist.",
        "Hey! Ready to discover why everyone raves about Zavira? I'm Glen - let's make you look incredible!",
        "Hello there! You've found the best salon in town. I'm Glen, and I'm here to make you irresistible."
      ]
      aiResponse = hooks[Math.floor(Math.random() * hooks.length)]
    } else if (lowerMessage === 'yes' || lowerMessage === 'yeah' || lowerMessage === 'sure' || lowerMessage === 'okay') {
      // Context-aware yes responses
      if (userInterestedInService) {
        aiResponse = `Awesome! Since you're interested in ${userInterestedInService}, let me tell you more. Our ${userInterestedInService} services are world-class. Ready to book?`
      } else {
        aiResponse = "Great attitude! What service has been calling your name? Hair, massage, nails, tattoos, or skin treatments?"
      }
    } else if (lowerMessage.includes('how') || (lowerMessage.includes('what') && askedAboutService)) {
      // Follow up on questions
      if (userInterestedInService === 'hair') {
        aiResponse = "Our hair transformations are legendary! We do cuts, colors, styling - whatever makes you feel like a million bucks. Which appeals to you?"
      } else if (userInterestedInService === 'massage') {
        aiResponse = "Massages are our specialty! Swedish for relaxation, deep tissue for those knots, or aromatherapy for pure bliss. What's your preference?"
      } else {
        aiResponse = "I'm here to guide you! Tell me what you're curious about - services, booking, pricing, or our amazing location?"
      }
    } else if (lowerMessage.includes('hair') || lowerMessage.includes('cut') || lowerMessage.includes('styling') || lowerMessage.includes('color')) {
      aiResponse = "Your hair is your crown! Our master stylists create looks that command attention and respect. From trendy cuts to stunning colors, we make dreams happen. Ready to be the center of attention?"
    } else if (lowerMessage.includes('massage')) {
      aiResponse = "Escape the chaos with our heavenly massages! Swedish bliss, deep tissue magic, or aromatherapy dreams - your stress doesn't stand a chance. Which sounds perfect for you?"
    } else if (lowerMessage.includes('nail') || lowerMessage.includes('manicure') || lowerMessage.includes('pedicure')) {
      aiResponse = "Your hands and feet deserve the red carpet treatment! Our nail artists create masterpieces that scream sophistication. Ready for that perfect set?"
    } else if (lowerMessage.includes('piercing') || lowerMessage.includes('tattoo')) {
      aiResponse = "Express yourself permanently! Our expert artists create wearable art with sterilization you can trust. Ready to make a statement that lasts?"
    } else if (lowerMessage.includes('skin') || lowerMessage.includes('facial')) {
      aiResponse = "Unlock your natural glow! Our skin treatments rejuvenate, renew, and radiate beauty. You'll look years younger! Interested in glowing skin?"
    } else if (lowerMessage.includes('service') || lowerMessage.includes('what do you') || lowerMessage.includes('offer')) {
      aiResponse = "We don't just do services - we create transformations! Hair that turns heads, massages that melt stress, nails that demand attention, tattoos that tell your story, and skin that glows. What's your fantasy?"
    } else if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
      aiResponse = "We're open Mon-Fri 9AM-7PM, weekends 8AM-6PM. But why wait? Let's book you in now while you have the chance!"
    } else if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
      aiResponse = "Prime Downtown location at 123 Beauty Street - where luxury meets convenience. Your chariot awaits!"
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      aiResponse = "Worth every penny for the confidence you'll gain! Check our services page for premium pricing that matches our premium results."
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      const closes = [
        "My pleasure! Now let's get you booked for that transformation!",
        "You're welcome! Imagine how amazing you'll feel after our services...",
        "Anytime! Speaking of amazing transformations, have you seen our special packages?"
      ]
      aiResponse = closes[Math.floor(Math.random() * closes.length)]
    } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      aiResponse = "Don't leave yet! Let me hook you up with something special before you go. What's your must-have service?"
    } else if (lowerMessage === 'o really' || lowerMessage === 'oh really' || lowerMessage.includes('really')) {
      // Handle skepticism with enthusiasm
      if (userInterestedInService) {
        aiResponse = `Absolutely! Our ${userInterestedInService} services are in a league of their own. Clients leave transformed every day. Ready to experience it yourself?`
      } else {
        aiResponse = "Absolutely! We're not just good - we're the best in town. What service intrigues you most?"
      }
    } else {
      // Default context-aware responses
      if (userInterestedInService) {
        aiResponse = `I can tell you're interested in ${userInterestedInService}! Let's dive deeper. What specifically about ${userInterestedInService} services appeals to you?`
      } else {
        const salesHooks = [
          "I sense you're ready for an upgrade! What service has been calling your name?",
          "Let's talk about what you really want. Our clients leave transformed - what's your goal?",
          "You deserve the best! Tell me what you're dreaming of and I'll make it happen."
        ]
        aiResponse = salesHooks[Math.floor(Math.random() * salesHooks.length)]
      }
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    })

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    })
  }
})