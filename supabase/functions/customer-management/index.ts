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

    // Handle different request methods
    if (req.method === 'GET') {
      // Get all customers (limited access for non-admin users)
      const url = new URL(req.url);
      const search = url.searchParams.get('search');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      let query = supabaseClient
        .from('customers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply search filter if provided
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          data, 
          pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil(count / limit)
          }
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method === 'POST') {
      // Create new customer
      const customerData = await req.json();

      // Validate required fields
      const requiredFields = ['first_name', 'last_name'];
      const missingFields = requiredFields.filter(field => !customerData[field]);
      
      if (missingFields.length > 0) {
        return new Response(
          JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if email is already in use (if provided)
      if (customerData.email) {
        const { data: existingCustomer } = await supabaseClient
          .from('customers')
          .select('id')
          .eq('email', customerData.email)
          .single();

        if (existingCustomer) {
          return new Response(
            JSON.stringify({ error: 'Customer with this email already exists' }),
            { 
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // Insert new customer
      const { data, error } = await supabaseClient
        .from('customers')
        .insert([customerData])
        .select();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ data: data[0] }),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method === 'PUT') {
      // Update customer
      const { id, ...updateData } = await req.json();

      // Check if ID is provided
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Missing customer ID' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // If email is being updated, check if it's already in use
      if (updateData.email) {
        const { data: existingCustomer } = await supabaseClient
          .from('customers')
          .select('id')
          .eq('email', updateData.email)
          .neq('id', id)
          .single();

        if (existingCustomer) {
          return new Response(
            JSON.stringify({ error: 'Customer with this email already exists' }),
            { 
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // Update customer
      const { data, error } = await supabaseClient
        .from('customers')
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
      // Delete customer
      const { id } = await req.json();

      // Check if ID is provided
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Missing customer ID' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if customer has appointments
      const { data: appointmentData } = await supabaseClient
        .from('appointments')
        .select('id')
        .eq('customer_id', id)
        .limit(1);

      if (appointmentData && appointmentData.length > 0) {
        return new Response(
          JSON.stringify({ error: 'Cannot delete customer with existing appointments' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Delete customer
      const { error } = await supabaseClient
        .from('customers')
        .delete()
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
    console.error('Customer management error:', error);
    return new Response(
      JSON.stringify({ error: 'Customer management failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})