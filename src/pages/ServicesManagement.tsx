import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;

const ServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: 0,
    duration_minutes: 60,
    is_active: true,
    image_url: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      console.log('Fetching services...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      console.log('Fetched services:', data);
      console.log('Service count:', data?.length || 0);
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: 0,
      duration_minutes: 60,
      is_active: true,
      image_url: ''
    });
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingService) {
        // Update existing service
        const updateData = {
          ...formData,
          price: parseFloat(formData.price.toString()) // Ensure price is a number
        };
        console.log('Updating service:', editingService.id, 'with data:', JSON.stringify(updateData));
        const { error } = await supabase
          .from('services')
          .update(updateData)
          .eq('id', editingService.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        console.log('Service updated successfully');

        // Update local state immediately for better UX
        setServices(prev => prev.map(service =>
          service.id === editingService.id
            ? { ...service, ...updateData }
            : service
        ));

        toast({
          title: "Success",
          description: "Service updated successfully",
        });
      } else {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert([formData]);

        if (error) throw error;

        // For new services, we need to fetch to get the generated ID
        // But we can show success immediately
        toast({
          title: "Success",
          description: "Service created successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      // Add a small delay to ensure database update is processed
      setTimeout(() => {
        fetchServices();
      }, 500);
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || '',
      price: service.price,
      duration_minutes: service.duration_minutes,
      is_active: service.is_active || true,
      image_url: service.image_url || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', service.id);

      if (error) throw error;

      // Update local state immediately
      setServices(prev => prev.filter(s => s.id !== service.id));

      toast({
        title: "Success",
        description: "Service deleted successfully",
      });

      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;

      // Update local state immediately
      setServices(prev => prev.map(s =>
        s.id === service.id
          ? { ...s, is_active: !service.is_active }
          : s
      ));

      toast({
        title: "Success",
        description: `Service ${!service.is_active ? 'activated' : 'deactivated'}`,
      });

      fetchServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast({
        title: "Error",
        description: "Failed to update service status",
        variant: "destructive",
      });
    }
  };

  const categories = ['Hair', 'Nails', 'Skin', 'Massage', 'Tattoo', 'Piercing'];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading services...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif luxury-glow mb-2">Services Management</h1>
            <p className="text-muted-foreground">Manage your salon services</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchServices} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-white text-black hover:bg-white/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl w-[95vw] md:w-[90vw] bg-black border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl">{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                  <DialogDescription className="text-sm md:text-base">
                    {editingService ? 'Update the service details below.' : 'Fill in the details for the new service.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm md:text-base">Service Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="text-sm md:text-base"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm md:text-base">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="text-sm md:text-base">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-sm md:text-base">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="text-sm md:text-base"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-sm md:text-base">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                        className="text-sm md:text-base"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active" className="text-sm md:text-base">Active</Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="image_url" className="text-sm md:text-base">Image URL (optional)</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="text-sm md:text-base">
                      Cancel
                    </Button>
                    <Button type="submit" className="text-sm md:text-base">
                      {editingService ? 'Update Service' : 'Create Service'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Services Table */}
        <Card className="frosted-glass border-white/10">
          <CardHeader>
            <CardTitle>All Services</CardTitle>
            <CardDescription>Manage your service offerings</CardDescription>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No services found. Add your first service!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Name</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[100px]">Category</TableHead>
                      <TableHead className="min-w-[80px]">Price</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[90px]">Duration</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium text-sm md:text-base">{service.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm md:text-base">{service.category}</TableCell>
                        <TableCell className="text-sm md:text-base">${service.price}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm md:text-base">{service.duration_minutes} min</TableCell>
                        <TableCell>
                          <Badge variant={service.is_active ? "default" : "secondary"} className="text-xs md:text-sm">
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 md:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive(service)}
                              className={`${service.is_active ? 'text-green-400' : 'text-gray-400'} p-1 md:p-2`}
                            >
                              {service.is_active ? <Eye className="h-3 w-3 md:h-4 md:w-4" /> : <EyeOff className="h-3 w-3 md:h-4 md:w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(service)}
                              className="p-1 md:p-2"
                            >
                              <Edit className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(service)}
                              className="text-red-400 hover:text-red-300 p-1 md:p-2"
                            >
                              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ServicesManagement;