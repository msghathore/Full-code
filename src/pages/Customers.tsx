import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  Trash2,
  Star,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  totalAppointments: number;
  status: 'active' | 'inactive' | 'vip';
  avatar?: string;
  notes?: string;
  preferences?: string[];
}

const Customers: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock customer data
  const customers: Customer[] = [
    {
      id: '1',
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      phone: '(555) 123-4567',
      lastVisit: '2025-11-20',
      totalAppointments: 24,
      status: 'vip',
      avatar: '/images/client-1.jpg',
      notes: 'Prefers natural products',
      preferences: ['Organic treatments', 'Calming ambiance']
    },
    {
      id: '2',
      name: 'David Martinez',
      email: 'david.martinez@email.com',
      phone: '(555) 234-5678',
      lastVisit: '2025-11-18',
      totalAppointments: 12,
      status: 'active',
      avatar: '/images/client-2.jpg',
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 345-6789',
      lastVisit: '2025-11-15',
      totalAppointments: 8,
      status: 'active',
      avatar: '/images/client-3.jpg',
    },
    {
      id: '4',
      name: 'Jessica Brown',
      email: 'j.brown@email.com',
      phone: '(555) 456-7890',
      lastVisit: '2025-10-30',
      totalAppointments: 3,
      status: 'inactive',
    },
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = () => {
    toast({
      title: "Add Customer",
      description: "Opening customer registration form...",
    });
  };

  const handleEditCustomer = (customerId: string) => {
    toast({
      title: "Edit Customer",
      description: `Editing customer ${customerId}...`,
    });
  };

  const handleDeleteCustomer = (customerId: string) => {
    toast({
      title: "Delete Customer",
      description: `Customer ${customerId} deleted successfully`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vip':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">VIP</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600">Manage your customer database</p>
          </div>
        </div>
        <Button onClick={handleAddCustomer} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
              >
                All
              </Button>
              <Button
                variant={selectedStatus === 'vip' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('vip')}
              >
                VIP
              </Button>
              <Button
                variant={selectedStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('active')}
              >
                Active
              </Button>
              <Button
                variant={selectedStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={customer.avatar} alt={customer.name} />
                    <AvatarFallback>
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(customer.status)}
                      {customer.status === 'vip' && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCustomer(customer.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {customer.phone}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Last visit: {new Date(customer.lastVisit).toLocaleDateString()}</span>
                </div>
                <div className="text-gray-900 font-medium">
                  {customer.totalAppointments} visits
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="p-2 bg-gray-50 rounded text-sm">
                  <div className="text-gray-500 text-xs mb-1">Notes:</div>
                  <div className="text-gray-700">{customer.notes}</div>
                </div>
              )}

              {/* Preferences */}
              {customer.preferences && customer.preferences.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">Preferences:</div>
                  <div className="flex flex-wrap gap-1">
                    {customer.preferences.map((pref, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first customer'}
            </p>
            <Button onClick={handleAddCustomer} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Customers;