import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Package,
  Plus,
  Minus,
  RefreshCw,
  BarChart3,
  TrendingDown,
  AlertTriangle,
  Search,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_cost: number;
  supplier?: string;
  last_restocked?: string;
  expiration_date?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

const Inventory = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch inventory data from Supabase
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transform data to match InventoryItem interface
      const transformedData: InventoryItem[] = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        current_stock: product.stock_quantity || 0,
        min_stock_level: 5, // Default values since not in products table
        max_stock_level: 50, // Default values since not in products table
        unit_cost: product.price,
        supplier: 'Unknown', // Default since not in products table
        last_restocked: product.created_at || new Date().toISOString().split('T')[0],
        status: getStatusFromStock(product.stock_quantity || 0),
        description: product.description,
        image_url: product.image_url,
        is_active: product.is_active ?? true,
        created_at: product.created_at || new Date().toISOString()
      }));

      setInventory(transformedData);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory data');
      toast({
        title: 'Error',
        description: 'Failed to load inventory data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromStock = (stock: number): InventoryItem['status'] => {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock'; // Using default min_stock_level
    return 'in-stock';
  };

  const updateInventoryStock = async (itemId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      setInventory(prev => prev.map(item =>
        item.id === itemId
          ? { ...item, current_stock: newStock, status: getStatusFromStock(newStock) }
          : item
      ));

      toast({
        title: 'Success',
        description: 'Stock updated successfully'
      });
    } catch (err) {
      console.error('Error updating stock:', err);
      toast({
        title: 'Error',
        description: 'Failed to update stock',
        variant: 'destructive'
      });
    }
  };

  const addProduct = async (productData: { name: string; category: string; price: number; stock_quantity?: number; description?: string }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newItem: InventoryItem = {
        id: data.id,
        name: data.name,
        category: data.category,
        current_stock: data.stock_quantity || 0,
        min_stock_level: 5,
        max_stock_level: 50,
        unit_cost: data.price,
        supplier: 'Unknown',
        last_restocked: data.created_at || new Date().toISOString().split('T')[0],
        status: getStatusFromStock(data.stock_quantity || 0),
        description: data.description,
        image_url: data.image_url,
        is_active: data.is_active ?? true,
        created_at: data.created_at || new Date().toISOString()
      };

      setInventory(prev => [...prev, newItem]);

      toast({
        title: 'Success',
        description: 'Product added successfully'
      });
    } catch (err) {
      console.error('Error adding product:', err);
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive'
      });
    }
  };

  const updateProduct = async (itemId: string, updates: Partial<{ name: string; category: string; price: number; stock_quantity: number; description: string }>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      setInventory(prev => prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              ...updates,
              current_stock: updates.stock_quantity ?? item.current_stock,
              unit_cost: updates.price ?? item.unit_cost,
              status: updates.stock_quantity !== undefined ? getStatusFromStock(updates.stock_quantity) : item.status
            }
          : item
      ));

      toast({
        title: 'Success',
        description: 'Product updated successfully'
      });
    } catch (err) {
      console.error('Error updating product:', err);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive'
      });
    }
  };

  const deleteProduct = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Remove from local state
      setInventory(prev => prev.filter(item => item.id !== itemId));

      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  const getInventoryStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) return { color: 'bg-red-500', label: 'Out of Stock' };
    if (item.current_stock <= item.min_stock_level) return { color: 'bg-yellow-500', label: 'Low Stock' };
    return { color: 'bg-green-500', label: 'In Stock' };
  };

  const getTotalInventoryValue = () => {
    return inventory.reduce((total, item) => total + (item.current_stock * item.unit_cost), 0);
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.current_stock <= item.min_stock_level);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <div className="bg-white p-6 content-with-footer">
        <div className="container mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inventory</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchInventory} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has write permission (admin only)
  const hasWritePermission = localStorage.getItem('staff_role') === 'admin';

  return (
    <div className="bg-white p-6 content-with-footer">
      <div className="container mx-auto max-w-4xl">
        {/* Simple Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Inventory</h1>
          <p className="text-gray-600 mb-4">Search for products to check availability</p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-lg border-gray-300 text-black bg-white rounded-lg shadow-sm"
            />
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No products found' : 'No products in inventory'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try a different search term' : 'Products will appear here once added'}
              </p>
            </div>
          ) : (
            filteredInventory.map((item) => {
              const status = getInventoryStatus(item);
              return (
                <Card key={item.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Product Image */}
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 text-lg truncate">{item.name}</h3>
                          <Badge className={`${status.color} text-white text-xs flex-shrink-0`}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1 truncate">{item.description}</p>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {item.current_stock}
                        </div>
                        <div className="text-sm text-gray-500">in stock</div>

                        {/* Update Stock - Only show for admins */}
                        {hasWritePermission && (
                          <div className="flex items-center gap-1 mt-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0"
                              onClick={() => updateInventoryStock(item.id, Math.max(0, item.current_stock - 1))}
                              disabled={loading}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0"
                              onClick={() => updateInventoryStock(item.id, item.current_stock + 1)}
                              disabled={loading}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Refresh button at bottom */}
        <div className="mt-6 text-center">
          <Button
            onClick={fetchInventory}
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;