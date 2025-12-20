import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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
    const userStaffId = userMetadata.staff_id;

    // Check if user has basic or higher access level
    const hasBasicAccess = ['basic', 'limited', 'full', 'manager', 'admin'].includes(userAccessLevel);

    // Handle different request methods
    if (req.method === 'GET') {
      // Get appointments - parameters may include date, staff_id, status, etc.
      const url = new URL(req.url);
      const date = url.searchParams.get('date');
      const staffId = url.searchParams.get('staff_id');
      const status = url.searchParams.get('status');
      
      let query = supabaseClient
        .from('appointments')
        .select(`
          *,
          customer:customers(*),
          staff:staff(*),
          service:services(*),
          payment:payments(*)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      // Apply filters
      if (date) {
        query = query.eq('appointment_date', date);
      }
      
      if (staffId) {
        query = query.eq('staff_id', staffId);
      }
      
      if (status) {
        query = query.eq('status', status);
      }

      // Non-admin users can only see appointments related to their staff member
      if (!hasBasicAccess || (userRole !== 'admin' && userRole !== 'manager')) {
        query = query.eq('staff_id', userStaffId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ data }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method === 'POST') {
      // Create new appointment
      const appointmentData = await req.json();

      // Validate required fields
      const requiredFields = ['customer_id', 'staff_id', 'service_id', 'appointment_date', 'appointment_time', 'total_amount'];
      const missingFields = requiredFields.filter(field => !appointmentData[field]);
      
      if (missingFields.length > 0) {
        return new Response(
          JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if there's a conflict
      const { data: conflictData, error: conflictError } = await supabaseClient.rpc(
        'check_appointment_conflict',
        {
          p_staff_id: appointmentData.staff_id,
          p_appointment_date: appointmentData.appointment_date,
          p_appointment_time: appointmentData.appointment_time
        }
      );

      if (conflictError) {
        throw conflictError;
      }

      if (conflictData) {
        return new Response(
          JSON.stringify({ error: 'Time slot conflict: Staff member is already booked at this time' }),
          { 
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Create the appointment using the database function
      const { data, error } = await supabaseClient.rpc(
        'create_appointment',
        {
          p_customer_id: appointmentData.customer_id,
          p_staff_id: appointmentData.staff_id,
          p_service_id: appointmentData.service_id,
          p_appointment_date: appointmentData.appointment_date,
          p_appointment_time: appointmentData.appointment_time,
          p_total_amount: appointmentData.total_amount,
          p_notes: appointmentData.notes || null,
          p_create_customer_if_not_exists: appointmentData.create_customer_if_not_exists || false
        }
      );

      if (error) {
        throw error;
      }

      // If payment was made at the time of booking
      if (appointmentData.payment) {
        const { error: paymentError } = await supabaseClient
          .from('payments')
          .insert([
            {
              appointment_id: data,
              amount: appointmentData.payment.amount,
              payment_method: appointmentData.payment.method,
              status: appointmentData.payment.status || 'completed',
              stripe_payment_id: appointmentData.payment.stripe_payment_id
            }
          ]);

        if (paymentError) {
          console.error('Payment record creation error:', paymentError);
          // Continue even if payment record creation fails
        }
      }

      return new Response(
        JSON.stringify({ data }),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method === 'PUT') {
      // Update appointment status or reschedule
      const { id, ...updateData } = await req.json();

      // Check if ID is provided
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Missing appointment ID' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Get the current appointment to check if user has permission to update it
      const { data: currentAppointment, error: fetchError } = await supabaseClient
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !currentAppointment) {
        return new Response(
          JSON.stringify({ error: 'Appointment not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if user has permission to update this appointment
      if (userRole !== 'admin' && userRole !== 'manager' && currentAppointment.staff_id !== userStaffId) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions to update this appointment' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // If rescheduling (changing date/time/staff), check for conflicts
      if (updateData.appointment_date || updateData.appointment_time || updateData.staff_id) {
        const staffId = updateData.staff_id || currentAppointment.staff_id;
        const date = updateData.appointment_date || currentAppointment.appointment_date;
        const time = updateData.appointment_time || currentAppointment.appointment_time;

        const { data: conflictData, error: conflictError } = await supabaseClient.rpc(
          'check_appointment_conflict',
          {
            p_staff_id: staffId,
            p_appointment_date: date,
            p_appointment_time: time,
            p_exclude_appointment_id: id
          }
        );

        if (conflictError) {
          throw conflictError;
        }

        if (conflictData) {
          return new Response(
            JSON.stringify({ error: 'Time slot conflict: Staff member is already booked at this time' }),
            { 
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // Update the appointment
      const { data, error } = await supabaseClient
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ data: data[0] }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method === 'DELETE') {
      // Cancel/delete appointment
      const { id } = await req.json();

      // Check if ID is provided
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Missing appointment ID' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Get the current appointment to check if user has permission to delete it
      const { data: currentAppointment, error: fetchError } = await supabaseClient
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !currentAppointment) {
        return new Response(
          JSON.stringify({ error: 'Appointment not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if user has permission to delete this appointment
      if (userRole !== 'admin' && userRole !== 'manager' && currentAppointment.staff_id !== userStaffId) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions to delete this appointment' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Delete the appointment (or mark as cancelled)
      const { error } = await supabaseClient
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true }),
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
    console.error('Appointment management error:', error);
    return new Response(
      JSON.stringify({ error: 'Appointment management failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})