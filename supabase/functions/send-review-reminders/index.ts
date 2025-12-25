// Automated Review Reminder Edge Function
// Runs on a cron schedule to send review requests 2 days after completed appointments

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ReviewReminder {
  id: string;
  full_name: string;
  email: string;
  service_name: string;
  staff_name: string | null;
  updated_at: string; // When status changed to completed
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('⭐ Starting review reminder check...');

    // Calculate 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoDate = twoDaysAgo.toISOString().split('T')[0];

    // Calculate 3 days ago (to get appointments completed exactly 2 days ago)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoDate = threeDaysAgo.toISOString().split('T')[0];

    console.log(`Looking for completed appointments between ${threeDaysAgoDate} and ${twoDaysAgoDate}`);

    // Query appointments completed 2 days ago
    const { data: appointments, error: fetchError } = await supabaseClient
      .from('appointments')
      .select(`
        id,
        full_name,
        email,
        updated_at,
        services (name),
        staff (name)
      `)
      .eq('status', 'completed')
      .is('review_reminder_sent', false)
      .gte('updated_at', `${threeDaysAgoDate}T00:00:00`)
      .lte('updated_at', `${twoDaysAgoDate}T23:59:59`);

    if (fetchError) {
      console.error('Error fetching appointments:', fetchError);
      throw fetchError;
    }

    if (!appointments || appointments.length === 0) {
      console.log('No appointments found for review reminders');
      return new Response(JSON.stringify({
        success: true,
        message: 'No review reminders to send',
        count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${appointments.length} appointments to send review reminders`);

    // Send review reminders using Brevo service
    const reminderResults = [];

    for (const apt of appointments) {
      try {
        console.log(`Sending review reminder to ${apt.email} for completed appointment`);

        // Call Brevo service to send review reminder
        const { error: emailError } = await supabaseClient.functions.invoke('brevo-service', {
          body: {
            action: 'sendReviewReminder',
            data: {
              customerEmail: apt.email,
              customerName: apt.full_name,
              serviceName: apt.services?.name || 'your appointment',
              staffName: apt.staff?.name,
              googleReviewUrl: 'https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review', // Replace with actual URL
              instagramHandle: '@zavira' // Replace with actual handle
            }
          }
        });

        if (emailError) {
          console.error(`Failed to send review reminder for appointment ${apt.id}:`, emailError);
          reminderResults.push({
            appointmentId: apt.id,
            success: false,
            error: emailError.message
          });
          continue;
        }

        // Mark review reminder as sent
        await supabaseClient
          .from('appointments')
          .update({ review_reminder_sent: true })
          .eq('id', apt.id);

        reminderResults.push({
          appointmentId: apt.id,
          customerEmail: apt.email,
          success: true
        });

        console.log(`✅ Review reminder sent successfully for appointment ${apt.id}`);

      } catch (error) {
        console.error(`Error processing review reminder for appointment ${apt.id}:`, error);
        reminderResults.push({
          appointmentId: apt.id,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = reminderResults.filter(r => r.success).length;
    const failureCount = reminderResults.filter(r => !r.success).length;

    console.log(`📊 Review Reminder Summary: ${successCount} sent, ${failureCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Review reminder processing complete',
      summary: {
        total: appointments.length,
        sent: successCount,
        failed: failureCount
      },
      results: reminderResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Review reminder function error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Failed to send review reminders'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
