// Automated 24-Hour Appointment Reminder Edge Function
// Runs on a cron schedule to send reminders for appointments tomorrow

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface AppointmentReminder {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  service_name: string;
  staff_name: string | null;
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

    console.log('📅 Starting appointment reminder check...');

    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

    console.log(`Looking for appointments on: ${tomorrowDateStr}`);

    // Query appointments for tomorrow that are confirmed
    const { data: appointments, error: fetchError } = await supabaseClient
      .from('appointments')
      .select(`
        id,
        full_name,
        email,
        phone,
        appointment_date,
        appointment_time,
        services (name),
        staff (name)
      `)
      .eq('appointment_date', tomorrowDateStr)
      .in('status', ['confirmed', 'accepted'])
      .is('reminder_sent', false); // Only send once

    if (fetchError) {
      console.error('Error fetching appointments:', fetchError);
      throw fetchError;
    }

    if (!appointments || appointments.length === 0) {
      console.log('No appointments found for tomorrow');
      return new Response(JSON.stringify({
        success: true,
        message: 'No reminders to send',
        count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${appointments.length} appointments to remind`);

    // Send reminders using Brevo service
    const reminderResults = [];

    for (const apt of appointments) {
      try {
        console.log(`Sending reminder to ${apt.email} for ${apt.appointment_time}`);

        // Call Brevo service to send reminder
        const { error: emailError } = await supabaseClient.functions.invoke('brevo-service', {
          body: {
            action: 'sendAppointmentReminder',
            data: {
              customerEmail: apt.email,
              customerName: apt.full_name,
              serviceName: apt.services?.name || 'Your appointment',
              appointmentDate: apt.appointment_date,
              appointmentTime: apt.appointment_time,
              staffName: apt.staff?.name
            }
          }
        });

        if (emailError) {
          console.error(`Failed to send reminder for appointment ${apt.id}:`, emailError);
          reminderResults.push({
            appointmentId: apt.id,
            success: false,
            error: emailError.message
          });
          continue;
        }

        // Mark reminder as sent
        await supabaseClient
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', apt.id);

        reminderResults.push({
          appointmentId: apt.id,
          customerEmail: apt.email,
          success: true
        });

        console.log(`✅ Reminder sent successfully for appointment ${apt.id}`);

      } catch (error) {
        console.error(`Error processing reminder for appointment ${apt.id}:`, error);
        reminderResults.push({
          appointmentId: apt.id,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = reminderResults.filter(r => r.success).length;
    const failureCount = reminderResults.filter(r => !r.success).length;

    console.log(`📊 Reminder Summary: ${successCount} sent, ${failureCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Reminder processing complete',
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
    console.error('❌ Reminder function error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Failed to send reminders'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
