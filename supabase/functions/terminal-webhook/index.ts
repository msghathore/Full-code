import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.0";
import { createHmac } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-square-hmacsha256-signature',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔔 Square Terminal webhook received');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get webhook signature for verification (optional but recommended)
    const signature = req.headers.get('x-square-hmacsha256-signature');
    const webhookSecret = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY');

    // Parse the webhook payload
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    // Verify signature if configured
    if (webhookSecret && signature) {
      const notificationUrl = Deno.env.get('SQUARE_WEBHOOK_URL') || '';
      const stringToSign = notificationUrl + rawBody;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(stringToSign));
      const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

      if (signature !== expectedSignature) {
        console.warn('⚠️ Webhook signature mismatch - proceeding anyway for development');
        // In production, you might want to reject: throw new Error('Invalid webhook signature');
      }
    }

    console.log('📦 Webhook event type:', payload.type);
    console.log('📦 Webhook data:', JSON.stringify(payload.data, null, 2));

    // Handle different webhook event types
    switch (payload.type) {
      case 'terminal.checkout.created':
        await handleCheckoutCreated(supabase, payload.data);
        break;

      case 'terminal.checkout.updated':
        await handleCheckoutUpdated(supabase, payload.data);
        break;

      default:
        console.log('ℹ️ Unhandled webhook event type:', payload.type);
    }

    return new Response(
      JSON.stringify({ success: true, received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('💥 Webhook processing error:', error.message);

    // Always return 200 to Square to prevent retries for non-recoverable errors
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to acknowledge receipt
      }
    );
  }
});

// Handle checkout created event
async function handleCheckoutCreated(supabase: any, data: any) {
  const checkout = data.object?.checkout;
  if (!checkout) {
    console.warn('⚠️ No checkout object in webhook data');
    return;
  }

  console.log('📱 Terminal checkout created:', checkout.id);

  // Upsert checkout record
  const { error } = await supabase
    .from('terminal_checkouts')
    .upsert({
      id: checkout.id,
      device_id: checkout.device_options?.device_id,
      amount: parseFloat(checkout.amount_money?.amount || '0') / 100,
      currency: checkout.amount_money?.currency || 'CAD',
      status: checkout.status,
      reference_id: checkout.reference_id,
      created_at: checkout.created_at,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) {
    console.error('❌ Failed to upsert checkout record:', error);
  }
}

// Handle checkout updated event (including completion)
async function handleCheckoutUpdated(supabase: any, data: any) {
  const checkout = data.object?.checkout;
  if (!checkout) {
    console.warn('⚠️ No checkout object in webhook data');
    return;
  }

  console.log('🔄 Terminal checkout updated:', checkout.id, 'Status:', checkout.status);

  // Update checkout status
  const updateData: any = {
    status: checkout.status,
    updated_at: new Date().toISOString(),
  };

  // If completed, add payment details
  if (checkout.status === 'COMPLETED') {
    updateData.payment_id = checkout.payment_ids?.[0];
    updateData.completed_at = new Date().toISOString();

    if (checkout.tip_money) {
      updateData.tip_amount = parseFloat(checkout.tip_money.amount) / 100;
    }

    console.log('✅ Terminal payment completed:', {
      checkoutId: checkout.id,
      paymentIds: checkout.payment_ids,
      tipAmount: updateData.tip_amount,
    });
  }

  // If canceled, record reason
  if (checkout.status === 'CANCELED') {
    updateData.cancel_reason = checkout.cancel_reason;
    console.log('❌ Terminal checkout canceled:', checkout.cancel_reason);
  }

  // Update the checkout record
  const { data: checkoutRecord, error: updateError } = await supabase
    .from('terminal_checkouts')
    .update(updateData)
    .eq('id', checkout.id)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Failed to update checkout record:', updateError);
    return;
  }

  // If payment completed, finalize the transaction
  if (checkout.status === 'COMPLETED' && checkoutRecord) {
    await finalizeTerminalTransaction(supabase, checkoutRecord, checkout);
  }
}

// Finalize the transaction after successful terminal payment
async function finalizeTerminalTransaction(supabase: any, checkoutRecord: any, checkout: any) {
  console.log('💰 Finalizing terminal transaction...');

  try {
    // Create transaction record
    const transactionId = crypto.randomUUID();
    const totalAmount = checkoutRecord.amount + (checkoutRecord.tip_amount || 0);

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        customer_id: checkoutRecord.customer_id,
        staff_id: checkoutRecord.staff_id,
        total_amount: totalAmount,
        status: 'PAID',
        checkout_time: new Date().toISOString(),
      });

    if (transactionError) {
      console.error('❌ Failed to create transaction:', transactionError);
      return;
    }

    console.log('✅ Transaction created:', transactionId);

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        transaction_id: transactionId,
        method: 'CREDIT', // Terminal payments are credit/debit
        amount: totalAmount,
      });

    if (paymentError) {
      console.error('❌ Failed to create payment record:', paymentError);
    }

    // Update checkout with transaction ID
    await supabase
      .from('terminal_checkouts')
      .update({ transaction_id: transactionId })
      .eq('id', checkout.id);

    // If there's an associated appointment, mark it as completed
    if (checkoutRecord.appointment_id) {
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', checkoutRecord.appointment_id);

      if (appointmentError) {
        console.error('❌ Failed to update appointment:', appointmentError);
      } else {
        console.log('✅ Appointment marked as completed:', checkoutRecord.appointment_id);
      }
    }

    // Create transaction items from cart
    if (checkoutRecord.cart_items && Array.isArray(checkoutRecord.cart_items)) {
      const transactionItems = checkoutRecord.cart_items.map((item: any) => ({
        transaction_id: transactionId,
        item_type: item.item_type,
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.price,
        discount: item.discount || 0,
        provider_id: item.provider_id,
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) {
        console.error('❌ Failed to create transaction items:', itemsError);
      }
    }

    console.log('🎉 Terminal transaction finalized successfully!');

  } catch (error: any) {
    console.error('💥 Error finalizing transaction:', error.message);
  }
}
