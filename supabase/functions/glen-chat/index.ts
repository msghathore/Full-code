import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// Complete Salon Information - ZAVIRA SALON & SPA OFFICIAL DATA
const SALON_INFO = {
  name: 'Zavira Salon & Spa',
  tagline: 'Where Luxury Meets Excellence',
  foundedYear: 2020,

  // Location & Contact - REAL DATA FROM WEBSITE
  address: '283 Tache Avenue, Winnipeg, MB',
  phone: '(431) 816-3330',
  email: 'zavirasalonandspa@gmail.com',
  website: 'zavira.com',

  // Hours of Operation - REAL DATA: Daily 8:00 AM - 11:30 PM
  hours: {
    monday: '8:00 AM - 11:30 PM',
    tuesday: '8:00 AM - 11:30 PM',
    wednesday: '8:00 AM - 11:30 PM',
    thursday: '8:00 AM - 11:30 PM',
    friday: '8:00 AM - 11:30 PM',
    saturday: '8:00 AM - 11:30 PM',
    sunday: '8:00 AM - 11:30 PM'
  },
  hoursSimple: 'Daily: 8:00 AM - 11:30 PM',

  // Parking & Directions
  parking: 'We don\'t have a dedicated parking spot. However, street parking is free on Horace Street and on Tache Avenue on any side. Feel free to park for up to 2 hours.',
  directions: 'Located on Tache Avenue in Winnipeg, Manitoba. Easy to find with free street parking nearby on Horace Street or Tache Avenue.',

  // Payment & Policies
  paymentMethods: 'We accept all major credit cards (Visa, MasterCard, Amex, Discover), Apple Pay, Google Pay, Square payments, and cash.',
  cancellationPolicy: 'We require 24 hours notice for cancellations. Late cancellations or no-shows may be subject to a 50% service fee.',

  // Social Media
  social: {
    instagram: '@zavirasalonandspa',
    facebook: 'ZaviraSalonSpa',
    tiktok: '@zavirasalonandspa'
  },

  // Service Categories Available
  serviceCategories: ['Hair', 'Nails', 'Skin/Facials', 'Massage', 'Tattoo', 'Piercing', 'Waxing'],

  // Special Features
  features: [
    'Complimentary beverages (coffee, tea, champagne)',
    'Free WiFi throughout the salon',
    'Private VIP rooms available',
    'Wheelchair accessible',
    'Gender-neutral services available',
    'World-class professionals with years of experience',
    'Premium products from leading luxury brands',
    'State-of-the-art facilities in an elegant setting',
    'Personalized service tailored to your needs'
  ],

  // Our Philosophy
  philosophy: 'We believe that beauty is an art form, and every client deserves a personalized experience. Our team of expert stylists and therapists are passionate about bringing out your natural beauty while providing a sanctuary for relaxation and rejuvenation.',

  // Gift Cards
  giftCards: 'Digital and physical gift cards available in any amount. Purchase online or in-salon - the perfect gift for someone special!',

  // Booking
  bookingInfo: 'Book online 24/7 at zavira.com or call us at (431) 816-3330 during business hours. Walk-ins welcome based on availability.',

  // Special Offers
  specialOffers: [
    'First-time clients receive 15% off their first service',
    'Refer a friend and both get $20 off',
    'Birthday month special: 20% off any service',
    'Loyalty rewards program - earn points on every visit'
  ],

  // About Us
  aboutUs: 'Founded in 2020, Zavira Salon & Spa has become the premier destination for luxury beauty and wellness treatments. Our commitment to excellence and attention to detail has made us the choice of discerning clients who seek nothing but the best.'
}

// Service categories for quick filtering
const SERVICE_CATEGORIES = ['hair', 'nails', 'massage', 'skin', 'tattoo', 'piercing', 'waxing']

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

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://stppkvkcjsyusxwtbaej.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey!)

    // Fetch services from database
    const { data: services } = await supabase
      .from('services')
      .select('id, name, category, description, price, duration_minutes')
      .eq('is_active', true)

    // Fetch staff from database
    const { data: staff } = await supabase
      .from('staff')
      .select('id, name, specialty, status')

    const lowerMessage = message.toLowerCase()
    let response = ''
    let type = 'text'
    let serviceCards: any[] = []
    let quickActions: any[] = []

    // Analyze intent - Comprehensive intent detection
    const wantsServices = lowerMessage.includes('service') || lowerMessage.includes('offer') || lowerMessage.includes('what do you') || lowerMessage.includes('menu')
    const wantsPrices = lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('rate') || lowerMessage.includes('fee')
    const wantsHair = lowerMessage.includes('hair') || lowerMessage.includes('cut') || lowerMessage.includes('color') || lowerMessage.includes('style') || lowerMessage.includes('highlights') || lowerMessage.includes('balayage')
    const wantsNails = lowerMessage.includes('nail') || lowerMessage.includes('manicure') || lowerMessage.includes('pedicure') || lowerMessage.includes('gel') || lowerMessage.includes('acrylic')
    const wantsMassage = lowerMessage.includes('massage') || lowerMessage.includes('relax') || lowerMessage.includes('spa') || lowerMessage.includes('therapeutic')
    const wantsSkin = lowerMessage.includes('skin') || lowerMessage.includes('facial') || lowerMessage.includes('face') || lowerMessage.includes('acne') || lowerMessage.includes('anti-aging')
    const wantsTattoo = lowerMessage.includes('tattoo') || lowerMessage.includes('piercing') || lowerMessage.includes('ink') || lowerMessage.includes('body art')
    const wantsWaxing = lowerMessage.includes('wax') || lowerMessage.includes('hair removal')
    const wantsLocation = lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where') || lowerMessage.includes('find you') || lowerMessage.includes('located')
    const wantsHours = lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close') || lowerMessage.includes('time') || lowerMessage.includes('when')
    const wantsBooking = lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('reserve')
    const wantsPopular = lowerMessage.includes('popular') || lowerMessage.includes('recommend') || lowerMessage.includes('best') || lowerMessage.includes('favorite') || lowerMessage.includes('top')
    const wantsStaff = lowerMessage.includes('staff') || lowerMessage.includes('stylist') || lowerMessage.includes('who') || lowerMessage.includes('team') || lowerMessage.includes('artist') || lowerMessage.includes('technician')
    const isGreeting = lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage === 'hi' || lowerMessage === 'hello' || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon')
    const isThanks = lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('appreciate')
    const isBye = lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')

    // NEW: Additional intent detection
    const wantsPhone = lowerMessage.includes('phone') || lowerMessage.includes('call') || lowerMessage.includes('contact') || lowerMessage.includes('number')
    const wantsEmail = lowerMessage.includes('email') || lowerMessage.includes('e-mail') || lowerMessage.includes('mail')
    const wantsParking = lowerMessage.includes('parking') || lowerMessage.includes('park') || lowerMessage.includes('car')
    const wantsDirections = lowerMessage.includes('direction') || lowerMessage.includes('how to get') || lowerMessage.includes('get there') || lowerMessage.includes('find you')
    const wantsPayment = lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('credit card') || lowerMessage.includes('cash') || lowerMessage.includes('apple pay')
    const wantsCancellation = lowerMessage.includes('cancel') || lowerMessage.includes('reschedule') || lowerMessage.includes('policy') || lowerMessage.includes('refund')
    const wantsSocial = lowerMessage.includes('instagram') || lowerMessage.includes('facebook') || lowerMessage.includes('social') || lowerMessage.includes('tiktok') || lowerMessage.includes('follow')
    const wantsGiftCard = lowerMessage.includes('gift') || lowerMessage.includes('voucher') || lowerMessage.includes('present')
    const wantsSpecialOffers = lowerMessage.includes('deal') || lowerMessage.includes('discount') || lowerMessage.includes('offer') || lowerMessage.includes('promotion') || lowerMessage.includes('special') || lowerMessage.includes('first time')
    const wantsAccessibility = lowerMessage.includes('wheelchair') || lowerMessage.includes('accessible') || lowerMessage.includes('disability') || lowerMessage.includes('handicap')
    const wantsAmenities = lowerMessage.includes('amenities') || lowerMessage.includes('wifi') || lowerMessage.includes('drink') || lowerMessage.includes('beverage') || lowerMessage.includes('vip')
    const wantsWalkIn = lowerMessage.includes('walk-in') || lowerMessage.includes('walk in') || lowerMessage.includes('without appointment') || lowerMessage.includes('drop in')
    const wantsAbout = lowerMessage.includes('about') || lowerMessage.includes('history') || lowerMessage.includes('story') || lowerMessage.includes('who are you') || lowerMessage.includes('founded') || lowerMessage.includes('philosophy')

    // Filter services by category
    const filterServices = (category: string) => {
      return services?.filter(s => s.category === category).slice(0, 3) || []
    }

    const formatServicesForCards = (serviceList: any[]) => {
      return serviceList.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        price: s.price,
        duration: s.duration_minutes,
        description: s.description
      }))
    }

    // Generate response based on intent
    if (isGreeting) {
      response = `Welcome to ${SALON_INFO.name}! I'm Glen, your personal beauty consultant. I can help you discover our services, check prices, book appointments, or answer any questions. What would you like to explore?`
      quickActions = [
        { label: 'View All Services', action: 'services', icon: 'sparkles' },
        { label: 'Book Appointment', action: 'book', icon: 'calendar' },
        { label: 'Check Prices', action: 'prices', icon: 'dollar' },
        { label: 'Hours & Location', action: 'location', icon: 'map' }
      ]
    } else if (wantsBooking) {
      response = "I'd love to help you book an appointment! Click below to start booking, or tell me which service you're interested in and I'll show you the options."
      quickActions = [
        { label: 'Book Now', action: 'book', icon: 'calendar' },
        { label: 'Hair Services', action: 'hair', icon: 'sparkles' },
        { label: 'Nail Services', action: 'nails', icon: 'sparkles' },
        { label: 'Massage', action: 'massage', icon: 'sparkles' }
      ]
    } else if (wantsServices || wantsPrices) {
      const topServices = services?.slice(0, 4) || []
      serviceCards = formatServicesForCards(topServices)
      response = wantsPrices
        ? `Here are our services with current prices. Click any service to book instantly!`
        : `Here's a selection of our most popular services. Click any to book, or ask about a specific category!`
      quickActions = [
        { label: 'Hair', action: 'hair', icon: 'sparkles' },
        { label: 'Nails', action: 'nails', icon: 'sparkles' },
        { label: 'Massage', action: 'massage', icon: 'sparkles' },
        { label: 'Skin', action: 'skin', icon: 'sparkles' }
      ]
      type = 'services'
    } else if (wantsHair) {
      const hairServices = filterServices('hair')
      serviceCards = formatServicesForCards(hairServices)
      response = `Our hair services are performed by expert stylists! From precision cuts to stunning colors, we'll help you achieve your perfect look. Here are our most popular hair services:`
      quickActions = [
        { label: 'Book Hair Service', action: 'book', icon: 'calendar' },
        { label: 'See All Services', action: 'services', icon: 'sparkles' }
      ]
      type = 'services'
    } else if (wantsNails) {
      const nailServices = filterServices('nails')
      serviceCards = formatServicesForCards(nailServices)
      response = `Treat yourself to beautiful nails! Our nail technicians use premium products for long-lasting results. Here are our nail services:`
      quickActions = [
        { label: 'Book Nail Service', action: 'book', icon: 'calendar' },
        { label: 'See All Services', action: 'services', icon: 'sparkles' }
      ]
      type = 'services'
    } else if (wantsMassage) {
      const massageServices = filterServices('massage')
      serviceCards = formatServicesForCards(massageServices)
      response = `Relax and rejuvenate with our therapeutic massage services. Our skilled therapists will melt away your stress! Here are our options:`
      quickActions = [
        { label: 'Book Massage', action: 'book', icon: 'calendar' },
        { label: 'See All Services', action: 'services', icon: 'sparkles' }
      ]
      type = 'services'
    } else if (wantsSkin) {
      const skinServices = filterServices('skin')
      serviceCards = formatServicesForCards(skinServices)
      response = `Unlock your skin's natural radiance! Our facial treatments use advanced techniques for visible results. Here are our skin care services:`
      quickActions = [
        { label: 'Book Facial', action: 'book', icon: 'calendar' },
        { label: 'See All Services', action: 'services', icon: 'sparkles' }
      ]
      type = 'services'
    } else if (wantsTattoo) {
      const tattooServices = services?.filter(s => s.category === 'tattoo' || s.category === 'piercing').slice(0, 3) || []
      serviceCards = formatServicesForCards(tattooServices)
      response = `Express yourself with our professional tattoo and piercing services! Our artists create stunning work with the highest safety standards:`
      quickActions = [
        { label: 'Book Consultation', action: 'book', icon: 'calendar' },
        { label: 'See All Services', action: 'services', icon: 'sparkles' }
      ]
      type = 'services'
    } else if (wantsWaxing) {
      const waxingServices = filterServices('waxing')
      serviceCards = formatServicesForCards(waxingServices)
      response = `Smooth, flawless skin awaits! Our waxing services are quick, professional, and use premium products for minimal discomfort:`
      quickActions = [
        { label: 'Book Waxing', action: 'book', icon: 'calendar' },
        { label: 'See All Services', action: 'services', icon: 'sparkles' }
      ]
      type = 'services'
    } else if (wantsLocation) {
      response = `📍 **Location:** ${SALON_INFO.address}\n\n${SALON_INFO.directions}\n\n🅿️ **Parking:** ${SALON_INFO.parking}\n\n📞 **Contact:** ${SALON_INFO.phone} | ${SALON_INFO.email}`
      quickActions = [
        { label: 'Book Appointment', action: 'book', icon: 'calendar' },
        { label: 'Get Directions', action: 'directions', icon: 'map' },
        { label: 'Call Us', action: 'call', icon: 'phone' }
      ]
    } else if (wantsHours) {
      response = `🕐 **Hours of Operation:**\n\n**${SALON_INFO.hoursSimple}**\n\nWe're open every day from 8:00 AM to 11:30 PM for your convenience!\n\n${SALON_INFO.bookingInfo}`
      quickActions = [
        { label: 'Book Appointment', action: 'book', icon: 'calendar' },
        { label: 'Call Us', action: 'call', icon: 'phone' },
        { label: 'View Services', action: 'services', icon: 'sparkles' }
      ]
    } else if (wantsPhone) {
      response = `📞 **Call us at:** ${SALON_INFO.phone}\n\n📧 **Email:** ${SALON_INFO.email}\n\nOur friendly team is available during business hours to assist you with bookings, questions, or concerns!`
      quickActions = [
        { label: 'Book Online', action: 'book', icon: 'calendar' },
        { label: 'View Hours', action: 'hours', icon: 'clock' }
      ]
    } else if (wantsEmail) {
      response = `📧 **Email us at:** ${SALON_INFO.email}\n\n📞 **Or call:** ${SALON_INFO.phone}\n\nWe typically respond to emails within 24 hours. For urgent inquiries, please call us!`
      quickActions = [
        { label: 'Book Online', action: 'book', icon: 'calendar' },
        { label: 'View Services', action: 'services', icon: 'sparkles' }
      ]
    } else if (wantsParking) {
      response = `🅿️ **Parking Information:**\n\n${SALON_INFO.parking}\n\n📍 **We're located at:** ${SALON_INFO.address}\n\n${SALON_INFO.directions}`
      quickActions = [
        { label: 'Get Directions', action: 'directions', icon: 'map' },
        { label: 'Book Appointment', action: 'book', icon: 'calendar' }
      ]
    } else if (wantsDirections) {
      response = `📍 **How to Find Us:**\n\n${SALON_INFO.directions}\n\n**Address:** ${SALON_INFO.address}\n\n🅿️ ${SALON_INFO.parking}`
      quickActions = [
        { label: 'View on Map', action: 'map', icon: 'map' },
        { label: 'Book Appointment', action: 'book', icon: 'calendar' }
      ]
    } else if (wantsPayment) {
      response = `💳 **Payment Methods:**\n\n${SALON_INFO.paymentMethods}\n\n💝 **Gift Cards:** ${SALON_INFO.giftCards}`
      quickActions = [
        { label: 'Book Appointment', action: 'book', icon: 'calendar' },
        { label: 'View Services', action: 'services', icon: 'sparkles' }
      ]
    } else if (wantsCancellation) {
      response = `📋 **Cancellation Policy:**\n\n${SALON_INFO.cancellationPolicy}\n\nNeed to reschedule? We're happy to help! Just give us a call at ${SALON_INFO.phone} or email ${SALON_INFO.email}.`
      quickActions = [
        { label: 'Call to Reschedule', action: 'call', icon: 'phone' },
        { label: 'Book New Appointment', action: 'book', icon: 'calendar' }
      ]
    } else if (wantsSocial) {
      response = `📱 **Follow Us on Social Media:**\n\n• Instagram: ${SALON_INFO.social.instagram}\n• Facebook: ${SALON_INFO.social.facebook}\n• TikTok: ${SALON_INFO.social.tiktok}\n\nFollow us for beauty tips, behind-the-scenes content, and exclusive promotions!`
      quickActions = [
        { label: 'Book Appointment', action: 'book', icon: 'calendar' },
        { label: 'View Services', action: 'services', icon: 'sparkles' }
      ]
    } else if (wantsGiftCard) {
      response = `🎁 **Gift Cards:**\n\n${SALON_INFO.giftCards}\n\nThe perfect gift for someone special! Available for any service or a custom amount.`
      quickActions = [
        { label: 'Purchase Gift Card', action: 'shop', icon: 'gift' },
        { label: 'View Services', action: 'services', icon: 'sparkles' }
      ]
    } else if (wantsSpecialOffers) {
      const offers = SALON_INFO.specialOffers.map(offer => `• ${offer}`).join('\n')
      response = `✨ **Current Special Offers:**\n\n${offers}\n\nDon't miss out on these amazing deals! Book now to take advantage.`
      quickActions = [
        { label: 'Book Now', action: 'book', icon: 'calendar' },
        { label: 'View All Services', action: 'services', icon: 'sparkles' }
      ]
    } else if (wantsAccessibility) {
      response = `♿ **Accessibility:**\n\nOur salon is fully wheelchair accessible! We also offer:\n\n${SALON_INFO.features.filter(f => f.toLowerCase().includes('accessible') || f.toLowerCase().includes('gender')).join('\n')}\n\nPlease let us know if you have any special requirements when booking - we're happy to accommodate!`
      quickActions = [
        { label: 'Book Appointment', action: 'book', icon: 'calendar' },
        { label: 'Contact Us', action: 'call', icon: 'phone' }
      ]
    } else if (wantsAmenities) {
      const amenities = SALON_INFO.features.map(f => `• ${f}`).join('\n')
      response = `✨ **Salon Amenities:**\n\n${amenities}\n\nWe want your experience to be as relaxing as possible!`
      quickActions = [
        { label: 'Book Appointment', action: 'book', icon: 'calendar' },
        { label: 'View Services', action: 'services', icon: 'sparkles' }
      ]
    } else if (wantsWalkIn) {
      response = `🚶 **Walk-ins:**\n\n${SALON_INFO.bookingInfo}\n\nWhile we welcome walk-ins based on availability, we recommend booking in advance to ensure you get your preferred time and stylist!`
      quickActions = [
        { label: 'Book Now', action: 'book', icon: 'calendar' },
        { label: 'View Hours', action: 'hours', icon: 'clock' },
        { label: 'Call Us', action: 'call', icon: 'phone' }
      ]
    } else if (wantsAbout) {
      response = `✨ **About ${SALON_INFO.name}**\n\n${SALON_INFO.aboutUs}\n\n💎 **Our Philosophy:**\n${SALON_INFO.philosophy}\n\n🌟 **Why Choose Us:**\n${SALON_INFO.features.slice(5).map(f => `• ${f}`).join('\n')}`
      quickActions = [
        { label: 'View Services', action: 'services', icon: 'sparkles' },
        { label: 'Book Appointment', action: 'book', icon: 'calendar' },
        { label: 'Meet Our Team', action: 'staff', icon: 'users' }
      ]
    } else if (wantsPopular) {
      const popularServices = services?.slice(0, 4) || []
      serviceCards = formatServicesForCards(popularServices)
      response = `Great question! Here are our client favorites - these services consistently get amazing reviews:`
      quickActions = [
        { label: 'Book Popular Service', action: 'book', icon: 'calendar' }
      ]
      type = 'services'
    } else if (wantsStaff) {
      const availableStaff = staff?.filter(s => s.status === 'available') || []
      const staffNames = availableStaff.map(s => `${s.name} (${s.specialty})`).join(', ')
      response = `Our talented team includes: ${staffNames || 'Sarah (Hair Styling), Emma (Massage), Alex (Facials), and more!'}. Each specialist is highly trained and passionate about helping you look and feel your best!`
      quickActions = [
        { label: 'Book Appointment', action: 'book', icon: 'calendar' },
        { label: 'View Services', action: 'services', icon: 'sparkles' }
      ]
    } else if (isThanks) {
      response = "You're welcome! It's my pleasure to help. Is there anything else you'd like to know about our services or would you like to book an appointment?"
      quickActions = [
        { label: 'Book Appointment', action: 'book', icon: 'calendar' },
        { label: 'Browse Services', action: 'services', icon: 'sparkles' }
      ]
    } else if (isBye) {
      response = `Thank you for chatting with me! Don't forget - you can book online anytime at ${SALON_INFO.website} or call us at ${SALON_INFO.phone}. We can't wait to see you! Have a beautiful day! ✨`
    } else {
      // Default intelligent response
      response = "I'd be happy to help! I can tell you about our services, prices, hours, or help you book an appointment. What interests you most?"
      quickActions = [
        { label: 'View Services', action: 'services', icon: 'sparkles' },
        { label: 'Book Now', action: 'book', icon: 'calendar' },
        { label: 'Prices', action: 'prices', icon: 'dollar' },
        { label: 'Hours & Location', action: 'location', icon: 'map' }
      ]
    }

    return new Response(JSON.stringify({
      response,
      type,
      services: serviceCards.length > 0 ? serviceCards : undefined,
      actions: quickActions.length > 0 ? quickActions : undefined
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error',
      response: `I'm having a moment! Please try again or call us at ${SALON_INFO.phone}.`,
      actions: [
        { label: 'Try Again', action: 'services', icon: 'sparkles' },
        { label: 'Call Us', action: 'call', icon: 'phone' }
      ]
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }
})
