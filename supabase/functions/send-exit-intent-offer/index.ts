import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface EmailRequest {
  email: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { email }: EmailRequest = await req.json()

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate unique discount code
    const discountCode = `WELCOME20-${Date.now().toString(36).toUpperCase()}`

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Zavira Salon & Spa <noreply@zavira.ca>',
        to: [email],
        subject: '🎁 Your Exclusive 20% Off Code - Limited Time!',
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: #000000;
      color: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6);
    }
    .content {
      background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0.5) 100%);
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 40px;
    }
    h1 {
      color: #10b981;
      font-size: 28px;
      margin-bottom: 20px;
      text-shadow: 0 0 10px rgba(16,185,129,0.6);
    }
    .discount-code {
      background-color: #10b981;
      color: #000000;
      font-size: 24px;
      font-weight: bold;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
      margin: 30px 0;
      letter-spacing: 2px;
    }
    .cta-button {
      display: inline-block;
      background-color: #10b981;
      color: #000000;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 18px;
      margin: 20px 0;
    }
    .benefits {
      margin: 30px 0;
    }
    .benefit-item {
      display: flex;
      align-items: center;
      margin: 15px 0;
      color: #ffffff;
    }
    .benefit-icon {
      color: #10b981;
      margin-right: 10px;
      font-size: 20px;
    }
    .expiry {
      background-color: rgba(251,191,36,0.2);
      border-left: 4px solid #fbbf24;
      padding: 15px;
      margin: 20px 0;
      color: #fbbf24;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ZAVIRA</div>
      <p style="color: #9ca3af; margin-top: 10px;">Salon & Spa</p>
    </div>

    <div class="content">
      <h1>🎉 Your Exclusive Offer is Here!</h1>

      <p style="font-size: 18px; line-height: 1.6;">
        Thank you for your interest in Zavira! We noticed you were about to leave, so we wanted to give you something special.
      </p>

      <div class="discount-code">${discountCode}</div>

      <div class="expiry">
        ⏰ <strong>This offer expires in 10 minutes!</strong> Don't miss out on this limited-time deal.
      </div>

      <div class="benefits">
        <p style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">Your exclusive benefits:</p>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span><strong>20% OFF</strong> your first booking</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span><strong>FREE upgrade</strong> to premium services (alternative option)</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span><strong>Priority booking</strong> access</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">✓</span>
          <span><strong>Complimentary consultation</strong> with our experts</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="https://zavira.ca/booking?code=${discountCode}" class="cta-button">
          Book Now & Save 20%
        </a>
      </div>

      <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
        Simply use code <strong style="color: #10b981;">${discountCode}</strong> at checkout, or click the button above to book with your discount automatically applied.
      </p>
    </div>

    <div class="footer">
      <p>Zavira Salon & Spa</p>
      <p>283 Tache Avenue, Winnipeg, MB, Canada</p>
      <p>(431) 816-3330 • zavirasalonandspa@gmail.com</p>
      <p style="margin-top: 20px; font-size: 12px;">
        You're receiving this because you visited our website. Don't want emails?
        <a href="#" style="color: #10b981;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      throw new Error('Failed to send email')
    }

    const emailData = await emailResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        discountCode,
        emailId: emailData.id
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
