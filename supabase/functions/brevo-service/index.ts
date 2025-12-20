Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Get environment variables
        const brevoApiKey = Deno.env.get('BREVO_API_KEY');
        const senderEmail = Deno.env.get('BREVO_SENDER_EMAIL') || 'noreply@zavira.ca';
        const senderName = Deno.env.get('BREVO_SENDER_NAME') || 'ZAVIRA Beauty';

        if (!brevoApiKey) {
            throw new Error('BREVO_API_KEY not configured');
        }

        // Parse request body
        const requestData = await req.json();
        const { action, data } = requestData;

        console.log('📧 Brevo service called:', { action, data });

        let result;

        switch (action) {
            case 'addToNewsletter':
                result = await addToNewsletter(brevoApiKey, senderEmail, senderName, data);
                break;
            
            case 'sendAppointmentConfirmation':
                result = await sendAppointmentConfirmation(brevoApiKey, senderEmail, senderName, data);
                break;
            
            case 'sendCancellationEmail':
                result = await sendCancellationEmail(brevoApiKey, senderEmail, senderName, data);
                break;
            
            case 'sendTransactionalEmail':
                result = await sendTransactionalEmail(brevoApiKey, senderEmail, senderName, data);
                break;
            
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Email sent successfully',
            data: result
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Brevo service error:', error);
        
        const errorResponse = {
            success: false,
            error: error.message,
            message: 'Email service error'
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

/**
 * Add subscriber to newsletter and send welcome email
 */
async function addToNewsletter(apiKey: string, senderEmail: string, senderName: string, data: any) {
    const { email, name, source = 'website' } = data;

    if (!email) {
        throw new Error('Email is required');
    }

    // Create luxury ZAVIRA welcome email template
    const emailHtml = createNewsletterWelcomeTemplate(email, name);

    // Send welcome email
    const emailData = {
        to: [{ email, name: name || 'Beauty Enthusiast' }],
        htmlContent: emailHtml,
        subject: '🌟 Welcome to ZAVIRA Beauty Newsletter - Exclusive Beauty Insider',
        sender: { name: senderName, email: senderEmail }
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
    });

    const result = await response.json();

    if (!response.ok) {
        console.error('❌ Brevo API error:', result);
        throw new Error(result.message || 'Failed to send welcome email');
    }

    return {
        messageId: result.messageId,
        subscriberId: `brevo_${Date.now()}`,
        email: email,
        name: name
    };
}

/**
 * Send appointment confirmation email
 */
async function sendAppointmentConfirmation(apiKey: string, senderEmail: string, senderName: string, data: any) {
    const { customerEmail, customerName, serviceName, appointmentDate, appointmentTime, staffName } = data;

    if (!customerEmail || !serviceName || !appointmentDate || !appointmentTime) {
        throw new Error('Missing required appointment data');
    }

    // Create appointment confirmation email template
    const emailHtml = createAppointmentConfirmationTemplate(
        customerName, serviceName, appointmentDate, appointmentTime, staffName
    );

    const emailData = {
        to: [{ email: customerEmail, name: customerName || 'Valued Customer' }],
        htmlContent: emailHtml,
        subject: `✅ Appointment Confirmed - ${serviceName} at ZAVIRA Beauty`,
        sender: { name: senderName, email: senderEmail }
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Failed to send confirmation email');
    }

    return {
        messageId: result.messageId,
        appointmentEmail: customerEmail,
        serviceName: serviceName
    };
}

/**
 * Send appointment cancellation email
 */
async function sendCancellationEmail(apiKey: string, senderEmail: string, senderName: string, data: any) {
    const { customerEmail, customerName, serviceName, appointmentDate, appointmentTime } = data;

    if (!customerEmail || !serviceName || !appointmentDate || !appointmentTime) {
        throw new Error('Missing required cancellation data');
    }

    // Create cancellation email template
    const emailHtml = createCancellationEmailTemplate(
        customerName, serviceName, appointmentDate, appointmentTime
    );

    const emailData = {
        to: [{ email: customerEmail, name: customerName || 'Valued Customer' }],
        htmlContent: emailHtml,
        subject: `❌ Appointment Cancelled - ${serviceName} at ZAVIRA Beauty`,
        sender: { name: senderName, email: senderEmail }
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Failed to send cancellation email');
    }

    return {
        messageId: result.messageId,
        cancellationEmail: customerEmail,
        serviceName: serviceName
    };
}

/**
 * Send custom transactional email
 */
async function sendTransactionalEmail(apiKey: string, senderEmail: string, senderName: string, data: any) {
    const { email, subject, templateData } = data;

    if (!email || !subject) {
        throw new Error('Email and subject are required');
    }

    // Create receipt email template
    const emailHtml = createReceiptTemplate(templateData);

    const emailData = {
        to: [{ email }],
        htmlContent: emailHtml,
        subject: subject,
        sender: { name: senderName, email: senderEmail }
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Failed to send transactional email');
    }

    return {
        messageId: result.messageId,
        email: email
    };
}

/**
 * Newsletter welcome email template
 */
function createNewsletterWelcomeTemplate(email: string, name?: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ZAVIRA Beauty Newsletter</title>
        <style>
            body {
                font-family: 'Georgia', serif;
                background-color: #000000;
                color: #ffffff;
                margin: 0;
                padding: 20px;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                border-radius: 20px;
                padding: 40px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .logo {
                text-align: center;
                font-size: 3rem;
                font-weight: 300;
                color: #ffffff;
                margin-bottom: 30px;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
            }
            .content {
                text-align: center;
                line-height: 1.6;
            }
            .welcome {
                font-size: 1.5rem;
                margin-bottom: 20px;
            }
            .message {
                font-size: 1.1rem;
                margin-bottom: 30px;
                color: #e0e0e0;
            }
            .benefits {
                text-align: left;
                margin: 30px 0;
                background: rgba(255, 255, 255, 0.05);
                padding: 20px;
                border-radius: 10px;
            }
            .benefits ul {
                list-style: none;
                padding: 0;
            }
            .benefits li {
                margin: 10px 0;
                padding-left: 25px;
                position: relative;
            }
            .benefits li:before {
                content: "✨";
                position: absolute;
                left: 0;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 0.9rem;
                color: #888;
            }
            .luxury-glow {
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo luxury-glow">ZAVIRA</div>
            <div class="content">
                <div class="welcome">Welcome ${name || 'Beauty Enthusiast'}! 🌟</div>
                <div class="message">
                    You've successfully joined our exclusive newsletter and are now part of the ZAVIRA beauty family.
                </div>
                
                <div class="benefits">
                    <h3>What you'll receive:</h3>
                    <ul>
                        <li>Exclusive beauty tips and expert advice</li>
                        <li>Early access to new treatments and services</li>
                        <li>Special VIP discounts and promotions</li>
                        <li>Behind-the-scenes content from our salon</li>
                        <li>Monthly beauty trends and product recommendations</li>
                    </ul>
                </div>

                <div class="message">
                    Stay tuned for our first newsletter coming soon! In the meantime, feel free to visit us at our salon or follow us on social media for the latest updates.
                </div>
            </div>
            
            <div class="footer">
                <p>ZAVIRA Beauty • Luxury Salon & Spa</p>
                <p>This email was sent to ${email}</p>
                <p><a href="#" style="color: #ffffff;">Unsubscribe</a> | <a href="#" style="color: #ffffff;">Update Preferences</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
}

/**
 * Appointment confirmation email template
 */
function createAppointmentConfirmationTemplate(customerName: string, serviceName: string, appointmentDate: string, appointmentTime: string, staffName?: string): string {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmed - ZAVIRA Beauty</title>
        <style>
            body {
                font-family: 'Georgia', serif;
                background-color: #000000;
                color: #ffffff;
                margin: 0;
                padding: 20px;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                border-radius: 20px;
                padding: 40px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .logo {
                text-align: center;
                font-size: 3rem;
                font-weight: 300;
                color: #ffffff;
                margin-bottom: 30px;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
            }
            .confirmation-icon {
                text-align: center;
                font-size: 4rem;
                margin-bottom: 20px;
            }
            .title {
                text-align: center;
                font-size: 1.8rem;
                margin-bottom: 30px;
                color: #4ade80;
            }
            .appointment-details {
                background: rgba(255, 255, 255, 0.05);
                padding: 30px;
                border-radius: 15px;
                margin: 30px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 15px 0;
                padding: 10px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .detail-label {
                font-weight: bold;
                color: #e0e0e0;
            }
            .detail-value {
                color: #ffffff;
            }
            .message {
                text-align: center;
                font-size: 1.1rem;
                margin: 30px 0;
                color: #e0e0e0;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 0.9rem;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo luxury-glow">ZAVIRA</div>
            <div class="confirmation-icon">✅</div>
            <div class="title">Appointment Confirmed!</div>
            
            <div class="message">
                Dear ${customerName || 'Valued Customer'},<br><br>
                Your appointment has been successfully confirmed. We're excited to see you at ZAVIRA Beauty!
            </div>

            <div class="appointment-details">
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">${serviceName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formatDate(appointmentDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${appointmentTime}</span>
                </div>
                ${staffName ? `
                <div class="detail-row">
                    <span class="detail-label">Your Stylist:</span>
                    <span class="detail-value">${staffName}</span>
                </div>
                ` : ''}
            </div>

            <div class="message">
                <strong>Important Reminders:</strong><br>
                • Please arrive 10 minutes early for your appointment<br>
                • Bring a valid ID for verification<br>
                • Cancellations must be made 24 hours in advance<br><br>
                
                If you need to reschedule or have any questions, please contact us at (555) 123-4567.
            </div>

            <div class="footer">
                <p>ZAVIRA Beauty • Luxury Salon & Spa</p>
                <p>We look forward to pampering you!</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

/**
 * Cancellation email template
 */
function createCancellationEmailTemplate(customerName: string, serviceName: string, appointmentDate: string, appointmentTime: string): string {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Cancelled - ZAVIRA Beauty</title>
        <style>
            body {
                font-family: 'Georgia', serif;
                background-color: #000000;
                color: #ffffff;
                margin: 0;
                padding: 20px;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                border-radius: 20px;
                padding: 40px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .logo {
                text-align: center;
                font-size: 3rem;
                font-weight: 300;
                color: #ffffff;
                margin-bottom: 30px;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
            }
            .cancellation-icon {
                text-align: center;
                font-size: 4rem;
                margin-bottom: 20px;
            }
            .title {
                text-align: center;
                font-size: 1.8rem;
                margin-bottom: 30px;
                color: #f87171;
            }
            .appointment-details {
                background: rgba(255, 255, 255, 0.05);
                padding: 30px;
                border-radius: 15px;
                margin: 30px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 15px 0;
                padding: 10px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .detail-label {
                font-weight: bold;
                color: #e0e0e0;
            }
            .detail-value {
                color: #ffffff;
            }
            .message {
                text-align: center;
                font-size: 1.1rem;
                margin: 30px 0;
                color: #e0e0e0;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 0.9rem;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo luxury-glow">ZAVIRA</div>
            <div class="cancellation-icon">❌</div>
            <div class="title">Appointment Cancelled</div>
            
            <div class="message">
                Dear ${customerName || 'Valued Customer'},<br><br>
                Your appointment has been cancelled. We're sorry to see you go, but we understand that plans can change.
            </div>

            <div class="appointment-details">
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">${serviceName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formatDate(appointmentDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${appointmentTime}</span>
                </div>
            </div>

            <div class="message">
                <strong>Ready to book again?</strong><br>
                We'd love to see you again! You can easily reschedule through our online booking system or call us at (555) 123-4567.<br><br>
                
                Thank you for choosing ZAVIRA Beauty. We hope to see you soon!
            </div>

            <div class="footer">
                <p>ZAVIRA Beauty • Luxury Salon & Spa</p>
                <p>Your beauty journey continues with us</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

/**
 * Receipt email template
 */
function createReceiptTemplate(data: any): string {
    const { transactionId, totalAmount, cartItems, customerName } = data;
    
    const itemsList = cartItems?.map((item: any) => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('') || '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt - ZAVIRA Beauty</title>
        <style>
            body {
                font-family: 'Georgia', serif;
                background-color: #000000;
                color: #ffffff;
                margin: 0;
                padding: 20px;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                border-radius: 20px;
                padding: 40px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .logo {
                text-align: center;
                font-size: 3rem;
                font-weight: 300;
                color: #ffffff;
                margin-bottom: 30px;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
            }
            .receipt-icon {
                text-align: center;
                font-size: 4rem;
                margin-bottom: 20px;
            }
            .title {
                text-align: center;
                font-size: 1.8rem;
                margin-bottom: 30px;
                color: #4ade80;
            }
            .receipt-details {
                background: rgba(255, 255, 255, 0.05);
                padding: 30px;
                border-radius: 15px;
                margin: 30px 0;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .total-row {
                font-weight: bold;
                font-size: 1.2rem;
                border-top: 2px solid rgba(255, 255, 255, 0.3);
                padding-top: 15px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 0.9rem;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo luxury-glow">ZAVIRA</div>
            <div class="receipt-icon">🧾</div>
            <div class="title">Payment Receipt</div>
            
            <div class="receipt-details">
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Customer:</strong> ${customerName || 'Valued Customer'}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 8px; border-bottom: 2px solid rgba(255,255,255,0.3);">Item</th>
                            <th style="text-align: center; padding: 8px; border-bottom: 2px solid rgba(255,255,255,0.3);">Qty</th>
                            <th style="text-align: right; padding: 8px; border-bottom: 2px solid rgba(255,255,255,0.3);">Price</th>
                            <th style="text-align: right; padding: 8px; border-bottom: 2px solid rgba(255,255,255,0.3);">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsList}
                        <tr class="total-row">
                            <td colspan="3" style="padding: 8px; text-align: right;">Grand Total:</td>
                            <td style="padding: 8px; text-align: right;">$${totalAmount?.toFixed(2) || '0.00'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="footer">
                <p>ZAVIRA Beauty • Luxury Salon & Spa</p>
                <p>Thank you for your business!</p>
            </div>
        </div>
    </body>
    </html>
    `;
}