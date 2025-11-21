import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import Stripe from 'https://esm.sh/stripe@12.16.0?target=deno'

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify JWT token
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user metadata to determine access level
    const userMetadata = user.user_metadata || {};
    const userRole = userMetadata.role;
    const userAccessLevel = userMetadata.access_level;

    // Initialize Stripe
    const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      // Store API version for consistency
      apiVersion: '2022-11-15'
    });

    // Handle different request methods
    if (req.method === 'POST') {
      // Create a payment intent for an appointment
      const { appointmentId, amount, customerId } = await req.json();

      // Validate required fields
      if (!appointmentId || !amount) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: appointmentId and amount' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Verify the appointment exists and user has permission to process payment
      const { data: appointmentData, error: appointmentError } = await supabaseClient
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (appointmentError || !appointmentData) {
        return new Response(
          JSON.stringify({ error: 'Appointment not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if user has permission to process payment for this appointment
      if (userRole !== 'admin' && userRole !== 'manager' && appointmentData.staff_id !== userMetadata.staff_id) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions to process payment for this appointment' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        description: `Payment for appointment #${appointmentId}`,
        metadata: {
          appointment_id: appointmentId,
          customer_id: customerId || appointmentData.customer_id
        }
      });

      // Store the payment record in the database
      const { data: paymentRecord, error: paymentError } = await supabaseClient
        .from('payments')
        .insert([
          {
            appointment_id: appointmentId,
            amount: amount,
            payment_method: 'online',
            status: 'pending',
            stripe_payment_id: paymentIntent.id
          }
        ])
        .select()
        .single();

      if (paymentError) {
        console.error('Payment record creation error:', paymentError);
        // Continue even if payment record creation fails
      }

      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentId: paymentRecord?.id
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method === 'PUT') {
      // Update payment status (webhook or manual update)
      const { paymentIntentId, status } = await req.json();

      // Validate required fields
      if (!paymentIntentId || !status) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: paymentIntentId and status' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if payment record exists
      const { data: paymentData, error: paymentError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('stripe_payment_id', paymentIntentId)
        .single();

      if (paymentError || !paymentData) {
        return new Response(
          JSON.stringify({ error: 'Payment not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Update payment status in the database
      const { data: updatedPayment, error: updateError } = await supabaseClient
        .from('payments')
        .update({ status })
        .eq('stripe_payment_id', paymentIntentId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // If payment is completed, update the appointment status
      if (status === 'completed') {
        await supabaseClient
          .from('appointments')
          .update({ status: 'confirmed' })
          .eq('id', paymentData.appointment_id);
      }

      return new Response(
        JSON.stringify({ data: updatedPayment }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method === 'DELETE') {
      // Process refund for a payment
      const { paymentIntentId } = await req.json();

      // Validate required fields
      if (!paymentIntentId) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: paymentIntentId' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if payment record exists
      const { data: paymentData, error: paymentError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('stripe_payment_id', paymentIntentId)
        .single();

      if (paymentError || !paymentData) {
        return new Response(
          JSON.stringify({ error: 'Payment not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if user has permission to process refund
      if (userRole !== 'admin' && userRole !== 'manager') {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions to process refund' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Process refund with Stripe
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId
      });

      // Update payment status in the database
      await supabaseClient
        .from('payments')
        .update({ status: 'refunded' })
        .eq('stripe_payment_id', paymentIntentId);

      return new Response(
        JSON.stringify({ 
          success: true,
          refundId: refund.id
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // If we reach here, the request method is not supported
    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed` }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Payment processing failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})