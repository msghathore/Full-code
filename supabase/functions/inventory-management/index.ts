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

    // Check if user has basic or higher access level
    const hasBasicAccess = ['basic', 'limited', 'full', 'manager', 'admin'].includes(userAccessLevel);

    // Handle different request methods
    if (req.method === 'GET') {
      // Get inventory items with filtering and pagination
      const url = new URL(req.url);
      const category = url.searchParams.get('category');
      const status = url.searchParams.get('status');
      const search = url.searchParams.get('search');
      const lowStock = url.searchParams.get('lowStock') === 'true';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      let query = supabaseClient
        .from('inventory')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,supplier.ilike.%${search}%`);
      }
      
      if (lowStock) {
        query = query.lte('current_stock', 'min_stock_level');
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
      // Create new inventory item (only if user has admin access)
      if (userRole !== 'admin' && userRole !== 'manager') {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Parse request body
      const inventoryData = await req.json();

      // Validate required fields
      const requiredFields = ['name', 'category', 'current_stock', 'min_stock_level', 'unit_cost'];
      const missingFields = requiredFields.filter(field => inventoryData[field] === undefined);
      
      if (missingFields.length > 0) {
        return new Response(
          JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Determine status based on current stock
      const status = inventoryData.current_stock === 0 ? 'out-of-stock' :
                     inventoryData.current_stock <= inventoryData.min_stock_level ? 'low-stock' : 'in-stock';

      // Insert new inventory item
      const { data, error } = await supabaseClient
        .from('inventory')
        .insert([{ ...inventoryData, status }])
        .select();

      if (error) {
        throw error;
      }

      // Record the initial stock as a restock transaction
      const { error: transactionError } = await supabaseClient
        .from('inventory_transactions')
        .insert([
          {
            inventory_id: data[0].id,
            transaction_type: 'restock',
            quantity: inventoryData.current_stock,
            notes: 'Initial stock'
          }
        ]);

      if (transactionError) {
        console.error('Transaction record creation error:', transactionError);
        // Continue even if transaction record creation fails
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
      // Update inventory item
      const { id, ...updateData } = await req.json();

      // Check if ID is provided
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Missing inventory item ID' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Get the current item to check for stock changes
      const { data: currentItem, error: fetchError } = await supabaseClient
        .from('inventory')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !currentItem) {
        return new Response(
          JSON.stringify({ error: 'Inventory item not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // If stock is being updated, create a transaction record
      if (updateData.current_stock !== undefined && updateData.current_stock !== currentItem.current_stock) {
        const stockChange = updateData.current_stock - currentItem.current_stock;
        const transactionType = stockChange > 0 ? 'restock' : 'usage';
        
        await supabaseClient
          .from('inventory_transactions')
          .insert([
            {
              inventory_id: id,
              transaction_type: transactionType,
              quantity: Math.abs(stockChange),
              notes: updateData.notes || `Stock ${stockChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(stockChange)}`
            }
          ]);
      }

      // Determine status based on updated stock
      if (updateData.current_stock !== undefined) {
        const updatedStock = updateData.current_stock;
        const minStockLevel = updateData.min_stock_level !== undefined ? updateData.min_stock_level : currentItem.min_stock_level;
        
        updateData.status = updatedStock === 0 ? 'out-of-stock' :
                            updatedStock <= minStockLevel ? 'low-stock' : 'in-stock';
      }

      // Update inventory item
      const { data, error } = await supabaseClient
        .from('inventory')
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
      // Delete inventory item (only if user has admin access)
      if (userRole !== 'admin') {
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
          JSON.stringify({ error: 'Missing inventory item ID' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Delete inventory item
      const { error } = await supabaseClient
        .from('inventory')
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
    console.error('Inventory management error:', error);
    return new Response(
      JSON.stringify({ error: 'Inventory management failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})