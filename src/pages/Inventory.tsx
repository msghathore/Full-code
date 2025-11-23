import React, { useState } from 'react';
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
  Search
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_cost: number;
  supplier: string;
  last_restocked: string;
  expiration_date?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
}

// Mock inventory data
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Professional Shampoo - Moisturizing',
    category: 'Hair Care',
    current_stock: 25,
    min_stock_level: 10,
    max_stock_level: 50,
    unit_cost: 15.99,
    supplier: 'Beauty Supply Co.',
    last_restocked: '2024-11-15',
    status: 'in-stock'
  },
  {
    id: '2',
    name: 'Hair Dye - Dark Brown 4.0',
    category: 'Hair Color',
    current_stock: 3,
    min_stock_level: 5,
    max_stock_level: 20,
    unit_cost: 8.50,
    supplier: 'Color Masters',
    last_restocked: '2024-11-10',
    status: 'low-stock'
  },
  {
    id: '3',
    name: 'Nail Polish - Classic Red',
    category: 'Nail Care',
    current_stock: 0,
    min_stock_level: 5,
    max_stock_level: 15,
    unit_cost: 6.99,
    supplier: 'Nail Art Supplies',
    last_restocked: '2024-11-05',
    status: 'out-of-stock'
  },
  {
    id: '4',
    name: 'Massage Oil - Lavender',
    category: 'Spa',
    current_stock: 15,
    min_stock_level: 8,
    max_stock_level: 25,
    unit_cost: 12.50,
    supplier: 'Essential Oils Co.',
    last_restocked: '2024-11-20',
    expiration_date: '2025-06-15',
    status: 'in-stock'
  },
  {
    id: '5',
    name: 'Face Cleansing Foam',
    category: 'Skincare',
    current_stock: 12,
    min_stock_level: 6,
    max_stock_level: 20,
    unit_cost: 14.99,
    supplier: 'Skincare Solutions',
    last_restocked: '2024-11-17',
    expiration_date: '2025-08-20',
    status: 'in-stock'
  }
];

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [searchTerm, setSearchTerm] = useState('');

  const updateInventoryStock = (itemId: string, newStock: number) => {
    setInventory(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, current_stock: newStock }
        : item
    ));
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 content-with-footer">
      <div className="container mx-auto">
        {/* Inventory Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-black">{inventory.length}</p>
                </div>
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-black">{formatCurrency(getTotalInventoryValue())}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{getLowStockItems().length}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">
                    {inventory.filter(item => item.status === 'out-of-stock').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Inventory Management</span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-gray-300 text-black"
                  />
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-black hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button className="bg-white border border-gray-300 text-black hover:bg-gray-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Current Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Min Level</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const status = getInventoryStatus(item);
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-black">{item.name}</div>
                            <div className="text-sm text-gray-500">Supplier: {item.supplier}</div>
                            {item.expiration_date && (
                              <div className="text-sm text-gray-500">Expires: {new Date(item.expiration_date).toLocaleDateString()}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.category}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-black">{item.current_stock}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                onClick={() => updateInventoryStock(item.id, Math.max(0, item.current_stock - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                onClick={() => updateInventoryStock(item.id, item.current_stock + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.min_stock_level}</td>
                        <td className="py-3 px-4">
                          <Badge className={`${status.color} text-white`}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-black">
                          {formatCurrency(item.current_stock * item.unit_cost)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
                              Reorder
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inventory;