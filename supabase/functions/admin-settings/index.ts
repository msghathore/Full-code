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

    // Check if user has admin access
    const hasAdminAccess = userRole === 'admin' || userAccessLevel === 'admin';

    // Handle different request methods
    if (req.method === 'GET') {
      // Get all admin settings (only if user has admin access)
      if (!hasAdminAccess) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Get settings from the database
      // For simplicity, we'll just return some example settings
      // In a real application, you would have a settings table
      const settings = {
        businessHours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { closed: true }
        },
        appointmentSettings: {
          bufferTime: 15, // minutes
          maxAdvanceBooking: 60, // days
          cancellationWindow: 24, // hours
          confirmationRequired: true,
          reminderEnabled: true,
          reminderTime: 24 // hours before appointment
        },
        notificationSettings: {
          emailEnabled: true,
          smsEnabled: false,
          newAppointmentNotification: true,
          cancellationNotification: true
        },
        colorSettings: {
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#F59E0B'
        }
      };

      return new Response(
        JSON.stringify({ data: settings }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method === 'PUT') {
      // Update admin settings (only if user has admin access)
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
      const { settingCategory, ...updateData } = await req.json();

      // Validate required fields
      if (!settingCategory) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: settingCategory' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // In a real application, you would update the settings in the database
      // For this example, we'll just log the update
      console.log(`Updating ${settingCategory} settings:`, updateData);

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true,
          message: `${settingCategory} settings updated successfully`
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
    console.error('Admin settings error:', error);
    return new Response(
      JSON.stringify({ error: 'Admin settings management failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})