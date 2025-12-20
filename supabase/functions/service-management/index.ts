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

    // Check if user has admin or manager access level
    const hasAdminAccess = userAccessLevel === 'admin' || userAccessLevel === 'manager';

    // Handle different request methods
    if (req.method === 'GET') {
      // Get all active services (basic access for all authenticated users)
      const { data, error } = await supabaseClient
        .from('services')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

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
      // Create new service (only if user has admin access)
      if (!hasAdminAccess) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Parse request body
      const serviceData = await req.json();

      // Validate required fields
      const requiredFields = ['name', 'duration', 'price'];
      const missingFields = requiredFields.filter(field => !serviceData[field]);
      
      if (missingFields.length > 0) {
        return new Response(
          JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Insert new service
      const { data, error } = await supabaseClient
        .from('services')
        .insert([serviceData])
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
      // Update service (only if user has admin access)
      if (!hasAdminAccess) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Parse request body
      const { id, ...updateData } = await req.json();

      // Check if ID is provided
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Missing service ID' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Update service
      const { data, error } = await supabaseClient
        .from('services')
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
      // Delete service (only if user has admin access)
      if (!hasAdminAccess) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Parse request body
      const { id } = await req.json();

      // Check if ID is provided
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Missing service ID' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if service has any appointments
      const { data: appointmentData } = await supabaseClient
        .from('appointments')
        .select('id')
        .eq('service_id', id)
        .limit(1);

      if (appointmentData && appointmentData.length > 0) {
        // If service has appointments, just set it as inactive instead of deleting
        const { data, error } = await supabaseClient
          .from('services')
          .update({ active: false })
          .eq('id', id)
          .select();

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({ 
            data: data[0],
            message: 'Service has been deactivated due to existing appointments'
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Delete service
      const { error } = await supabaseClient
        .from('services')
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
    console.error('Service management error:', error);
    return new Response(
      JSON.stringify({ error: 'Service management failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})