// =====================================================
// INVENTORY AUTO-REORDER SYSTEM SERVICE
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  InventoryItem,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  InventoryTransaction,
  AutoReorderRule,
  PaginatedResponse
} from '@/types/enterprise';

// =====================================================
// INVENTORY ITEM MANAGEMENT
// =====================================================

export async function getInventoryItems(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    search?: string;
    category?: string;
    supplier_id?: string;
    low_stock?: boolean;
    is_active?: boolean;
  }
): Promise<PaginatedResponse<InventoryItem>> {
  let query = supabase
    .from('inventory_items')
    .select('*, supplier:suppliers(*)', { count: 'exact' });

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
  }
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.supplier_id) query = query.eq('supplier_id', filters.supplier_id);
  if (filters?.low_stock) query = query.lte('current_stock', supabase.rpc('reorder_point'));
  if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('name')
    .range(from, to);

  if (error) throw error;

  return {
    data: data as InventoryItem[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | null> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, supplier:suppliers(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

export async function getInventoryItemBySku(sku: string): Promise<InventoryItem | null> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, supplier:suppliers(*)')
    .eq('sku', sku)
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

export async function createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert(item)
    .select('*, supplier:suppliers(*)')
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

export async function updateInventoryItem(
  id: string,
  updates: Partial<InventoryItem>
): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, supplier:suppliers(*)')
    .single();

  if (error) throw error;
  return data as InventoryItem;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// STOCK MANAGEMENT
// =====================================================

export async function getLowStockItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, supplier:suppliers(*)')
    .eq('is_active', true)
    .filter('current_stock', 'lte', 'reorder_point')
    .order('current_stock');

  if (error) throw error;

  // Filter in JS since Supabase doesn't support column comparison directly
  return (data as InventoryItem[]).filter(item => item.current_stock <= item.reorder_point);
}

export async function adjustStock(
  itemId: string,
  quantity: number,
  type: 'received' | 'sold' | 'used' | 'adjustment' | 'damaged' | 'returned',
  referenceType?: string,
  referenceId?: string,
  notes?: string,
  performedBy?: string
): Promise<InventoryTransaction> {
  // Create transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('inventory_transactions')
    .insert({
      inventory_item_id: itemId,
      transaction_type: type,
      quantity: type === 'received' || type === 'returned' ? Math.abs(quantity) : -Math.abs(quantity),
      reference_type: referenceType,
      reference_id: referenceId,
      notes,
      performed_by: performedBy
    })
    .select()
    .single();

  if (transactionError) throw transactionError;

  // Update item stock (handled by trigger, but we can also do it here)
  const item = await getInventoryItemById(itemId);
  if (item) {
    const newStock = item.current_stock + transaction.quantity;
    await updateInventoryItem(itemId, { current_stock: newStock });

    // Check if reorder needed
    if (newStock <= item.reorder_point) {
      await checkAndCreateReorder(item);
    }
  }

  return transaction as InventoryTransaction;
}

export async function getTransactionHistory(
  itemId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<InventoryTransaction>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('inventory_transactions')
    .select('*', { count: 'exact' })
    .eq('inventory_item_id', itemId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data as InventoryTransaction[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

// =====================================================
// SUPPLIER MANAGEMENT
// =====================================================

export async function getSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as Supplier[];
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Supplier;
}

export async function createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .insert(supplier)
    .select()
    .single();

  if (error) throw error;
  return data as Supplier;
}

export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Supplier;
}

export async function deleteSupplier(id: string): Promise<void> {
  const { error } = await supabase
    .from('suppliers')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// PURCHASE ORDER MANAGEMENT
// =====================================================

export async function getPurchaseOrders(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    status?: string;
    supplier_id?: string;
    is_auto_generated?: boolean;
  }
): Promise<PaginatedResponse<PurchaseOrder>> {
  let query = supabase
    .from('purchase_orders')
    .select('*, supplier:suppliers(*), items:purchase_order_items(*, inventory_item:inventory_items(*))', { count: 'exact' });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.supplier_id) query = query.eq('supplier_id', filters.supplier_id);
  if (filters?.is_auto_generated !== undefined) query = query.eq('is_auto_generated', filters.is_auto_generated);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data as PurchaseOrder[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, supplier:suppliers(*), items:purchase_order_items(*, inventory_item:inventory_items(*))')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as PurchaseOrder;
}

export async function createPurchaseOrder(
  order: Partial<PurchaseOrder>,
  items: Partial<PurchaseOrderItem>[]
): Promise<PurchaseOrder> {
  // Generate order number
  const orderNumber = `PO-${Date.now().toString(36).toUpperCase()}`;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.total_cost || 0), 0);
  const total = subtotal + (order.tax_amount || 0) + (order.shipping_cost || 0);

  // Create order
  const { data: newOrder, error: orderError } = await supabase
    .from('purchase_orders')
    .insert({
      ...order,
      order_number: orderNumber,
      subtotal,
      total_amount: total
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = items.map(item => ({
    ...item,
    purchase_order_id: newOrder.id
  }));

  const { error: itemsError } = await supabase
    .from('purchase_order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return getPurchaseOrderById(newOrder.id) as Promise<PurchaseOrder>;
}

export async function updatePurchaseOrder(
  id: string,
  updates: Partial<PurchaseOrder>
): Promise<PurchaseOrder> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return getPurchaseOrderById(id) as Promise<PurchaseOrder>;
}

export async function submitPurchaseOrder(id: string): Promise<PurchaseOrder> {
  return updatePurchaseOrder(id, {
    status: 'submitted',
    order_date: new Date().toISOString().split('T')[0]
  });
}

export async function receivePurchaseOrder(
  id: string,
  receivedItems: { item_id: string; quantity: number }[]
): Promise<PurchaseOrder> {
  const order = await getPurchaseOrderById(id);
  if (!order) throw new Error('Order not found');

  // Update received quantities
  for (const received of receivedItems) {
    await supabase
      .from('purchase_order_items')
      .update({ quantity_received: received.quantity })
      .eq('id', received.item_id);

    // Find the order item to get inventory item id
    const orderItem = order.items?.find(i => i.id === received.item_id);
    if (orderItem) {
      // Add stock
      await adjustStock(
        orderItem.inventory_item_id,
        received.quantity,
        'received',
        'purchase_order',
        id,
        `Received from PO ${order.order_number}`
      );
    }
  }

  // Check if fully received
  const updatedOrder = await getPurchaseOrderById(id);
  const allReceived = updatedOrder?.items?.every(
    item => item.quantity_received >= item.quantity_ordered
  );

  return updatePurchaseOrder(id, {
    status: allReceived ? 'received' : 'shipped',
    received_date: allReceived ? new Date().toISOString().split('T')[0] : undefined
  });
}

export async function cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
  return updatePurchaseOrder(id, { status: 'cancelled' });
}

// =====================================================
// AUTO-REORDER RULES
// =====================================================

export async function getAutoReorderRules(): Promise<AutoReorderRule[]> {
  const { data, error } = await supabase
    .from('auto_reorder_rules')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as AutoReorderRule[];
}

export async function createAutoReorderRule(rule: Partial<AutoReorderRule>): Promise<AutoReorderRule> {
  const { data, error } = await supabase
    .from('auto_reorder_rules')
    .insert(rule)
    .select()
    .single();

  if (error) throw error;
  return data as AutoReorderRule;
}

export async function updateAutoReorderRule(
  id: string,
  updates: Partial<AutoReorderRule>
): Promise<AutoReorderRule> {
  const { data, error } = await supabase
    .from('auto_reorder_rules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AutoReorderRule;
}

export async function deleteAutoReorderRule(id: string): Promise<void> {
  const { error } = await supabase
    .from('auto_reorder_rules')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

async function checkAndCreateReorder(item: InventoryItem): Promise<PurchaseOrder | null> {
  // Find applicable rule
  const { data: rules } = await supabase
    .from('auto_reorder_rules')
    .select('*')
    .eq('is_active', true)
    .or(`inventory_item_id.eq.${item.id},category.eq.${item.category}`);

  const applicableRule = rules?.find(r => {
    if (r.inventory_item_id === item.id) return true;
    if (r.category === item.category && !r.inventory_item_id) return true;
    return false;
  });

  if (!applicableRule) return null;

  // Check trigger conditions
  const conditions = applicableRule.trigger_conditions;
  if (conditions.stock_threshold && item.current_stock > conditions.stock_threshold) {
    return null;
  }

  // Calculate reorder quantity
  let quantity = applicableRule.reorder_quantity || item.reorder_quantity;
  if (applicableRule.reorder_quantity_type === 'to_max' && item.max_stock) {
    quantity = item.max_stock - item.current_stock;
  }

  // Check if there's already a pending order for this item
  const { data: existingOrders } = await supabase
    .from('purchase_order_items')
    .select('purchase_order:purchase_orders(status)')
    .eq('inventory_item_id', item.id)
    .in('purchase_order.status', ['draft', 'submitted', 'confirmed']);

  if (existingOrders && existingOrders.length > 0) {
    return null; // Already has pending order
  }

  // Create auto-generated purchase order
  if (applicableRule.requires_approval) {
    // Create draft order for approval
    return createPurchaseOrder(
      {
        supplier_id: applicableRule.supplier_id || item.supplier_id,
        status: 'draft',
        is_auto_generated: true,
        notes: `Auto-generated reorder for ${item.name}`
      },
      [{
        inventory_item_id: item.id,
        quantity_ordered: quantity,
        unit_cost: item.unit_cost,
        total_cost: quantity * item.unit_cost
      }]
    );
  } else {
    // Create and submit immediately
    const order = await createPurchaseOrder(
      {
        supplier_id: applicableRule.supplier_id || item.supplier_id,
        status: 'draft',
        is_auto_generated: true,
        notes: `Auto-generated reorder for ${item.name}`
      },
      [{
        inventory_item_id: item.id,
        quantity_ordered: quantity,
        unit_cost: item.unit_cost,
        total_cost: quantity * item.unit_cost
      }]
    );
    return submitPurchaseOrder(order.id);
  }
}

export async function runAutoReorderCheck(): Promise<PurchaseOrder[]> {
  const lowStockItems = await getLowStockItems();
  const createdOrders: PurchaseOrder[] = [];

  for (const item of lowStockItems) {
    const order = await checkAndCreateReorder(item);
    if (order) {
      createdOrders.push(order);
    }
  }

  return createdOrders;
}

// =====================================================
// ANALYTICS & REPORTS
// =====================================================

export async function getInventoryStats(): Promise<{
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingOrders: number;
  categoryCounts: { category: string; count: number; value: number }[];
}> {
  const { data: items } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true);

  const allItems = items || [];

  const totalItems = allItems.length;
  const totalValue = allItems.reduce((sum, i) => sum + (i.current_stock * i.unit_cost), 0);
  const lowStockCount = allItems.filter(i => i.current_stock <= i.reorder_point && i.current_stock > 0).length;
  const outOfStockCount = allItems.filter(i => i.current_stock <= 0).length;

  const { count: pendingOrders } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['draft', 'submitted', 'confirmed', 'shipped']);

  // Group by category
  const byCategory: Record<string, { count: number; value: number }> = {};
  allItems.forEach(i => {
    const cat = i.category || 'Uncategorized';
    if (!byCategory[cat]) {
      byCategory[cat] = { count: 0, value: 0 };
    }
    byCategory[cat].count++;
    byCategory[cat].value += i.current_stock * i.unit_cost;
  });

  const categoryCounts = Object.entries(byCategory)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.value - a.value);

  return {
    totalItems,
    totalValue,
    lowStockCount,
    outOfStockCount,
    pendingOrders: pendingOrders || 0,
    categoryCounts
  };
}

export async function getUsageReport(
  startDate: string,
  endDate: string
): Promise<{ itemId: string; itemName: string; used: number; cost: number }[]> {
  const { data: transactions } = await supabase
    .from('inventory_transactions')
    .select('inventory_item_id, quantity, unit_cost, inventory_item:inventory_items(name)')
    .in('transaction_type', ['used', 'sold'])
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const usage: Record<string, { itemName: string; used: number; cost: number }> = {};

  transactions?.forEach(t => {
    const id = t.inventory_item_id;
    if (!usage[id]) {
      usage[id] = {
        itemName: t.inventory_item?.name || 'Unknown',
        used: 0,
        cost: 0
      };
    }
    usage[id].used += Math.abs(t.quantity);
    usage[id].cost += Math.abs(t.quantity) * (t.unit_cost || 0);
  });

  return Object.entries(usage)
    .map(([itemId, data]) => ({ itemId, ...data }))
    .sort((a, b) => b.cost - a.cost);
}

export async function getCategories(): Promise<string[]> {
  const { data } = await supabase
    .from('inventory_items')
    .select('category')
    .eq('is_active', true);

  const categories = [...new Set(data?.map(d => d.category).filter(Boolean))];
  return categories.sort();
}

export default {
  getInventoryItems,
  getInventoryItemById,
  getInventoryItemBySku,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  adjustStock,
  getTransactionHistory,
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  submitPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  getAutoReorderRules,
  createAutoReorderRule,
  updateAutoReorderRule,
  deleteAutoReorderRule,
  runAutoReorderCheck,
  getInventoryStats,
  getUsageReport,
  getCategories
};
