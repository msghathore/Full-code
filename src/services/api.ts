import { supabase } from '@/integrations/supabase/client';

// Base API URL - using local Supabase Edge Functions
const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

// API response type
interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// API client with proper error handling
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Staff Authentication
  async authenticateStaff(credentials: { employee_id: string }) {
    return this.request('/staff-auth', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Staff Management
  async getStaffList() {
    return this.request('/staff-management');
  }

  async getStaffMember(id: string) {
    return this.request(`/staff-management?id=${id}`);
  }

  async createStaff(staffData: any) {
    return this.request('/staff-management', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  }

  async updateStaff(id: string, staffData: any) {
    return this.request('/staff-management', {
      method: 'PUT',
      body: JSON.stringify({ id, ...staffData }),
    });
  }

  async deleteStaff(id: string) {
    return this.request(`/staff-management?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Appointment Management
  async getAppointments(params: {
    date?: string;
    staff_id?: string;
    status?: string;
  } = {}) {
    const queryParams = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]).toString();
    const endpoint = `/appointment-management${queryParams ? '?' + queryParams : ''}`;
    return this.request(endpoint);
  }

  async createAppointment(appointmentData: any) {
    return this.request('/appointment-management', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id: string, appointmentData: any) {
    return this.request('/appointment-management', {
      method: 'PUT',
      body: JSON.stringify({ id, ...appointmentData }),
    });
  }

  async deleteAppointment(id: string) {
    return this.request(`/appointment-management?id=${id}`, {
      method: 'DELETE',
    });
  }

  async moveAppointment(id: string, newStaffId: string, newTime: string) {
    return this.request('/appointment-management', {
      method: 'PATCH',
      body: JSON.stringify({ id, new_staff_id: newStaffId, new_time: newTime }),
    });
  }

  // Customer Management
  async getCustomers(params: {
    search?: string;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString();
    const endpoint = `/customer-management${queryParams ? '?' + queryParams : ''}`;
    return this.request(endpoint);
  }

  async createCustomer(customerData: any) {
    return this.request('/customer-management', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id: string, customerData: any) {
    return this.request('/customer-management', {
      method: 'PUT',
      body: JSON.stringify({ id, ...customerData }),
    });
  }

  // Service Management
  async getServices() {
    return this.request('/service-management');
  }

  // Inventory Management
  async getInventory() {
    return this.request('/inventory-management');
  }

  async updateInventoryItem(id: string, updateData: any) {
    return this.request('/inventory-management', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updateData }),
    });
  }

  // Admin Settings
  async getAdminSettings() {
    return this.request('/admin-settings');
  }

  async updateAdminSettings(settings: any) {
    return this.request('/admin-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Type definitions
export interface StaffMember {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'senior' | 'junior';
  specialty?: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  access_level: 'full' | 'limited' | 'basic' | 'admin' | 'manager';
  color: string;
  phone?: string;
  hire_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  customer_id: string;
  staff_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'confirmed' | 'arrived' | 'in-progress' | 'completed' | 'cancelled';
  total_amount?: number;
  notes?: string;
  payment_status?: 'pending' | 'paid' | 'refunded';
  created_at?: string;
  updated_at?: string;
  // Joined fields
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  service_name?: string;
  staff_name?: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  total_visits?: number;
  total_spent?: number;
  last_visit?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  category: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_cost: number;
  supplier: string;
  last_restocked?: string;
  expiration_date?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
  created_at?: string;
  updated_at?: string;
}

// Helper functions for common operations
export const staffApi = {
  async authenticate(credentials: { employee_id: string }) {
    const response = await apiClient.authenticateStaff(credentials);
    return response.data;
  },

  async getAll() {
    const response = await apiClient.getStaffList();
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.getStaffMember(id);
    return response.data;
  },

  async create(staffData: Partial<StaffMember>) {
    const response = await apiClient.createStaff(staffData);
    return response.data;
  },

  async update(id: string, staffData: Partial<StaffMember>) {
    const response = await apiClient.updateStaff(id, staffData);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.deleteStaff(id);
    return response.data;
  },
};

export const appointmentApi = {
  async getAll(params: {
    date?: string;
    staff_id?: string;
    status?: string;
  } = {}) {
    const response = await apiClient.getAppointments(params);
    return response.data;
  },

  async create(appointmentData: Partial<Appointment>) {
    const response = await apiClient.createAppointment(appointmentData);
    return response.data;
  },

  async update(id: string, appointmentData: Partial<Appointment>) {
    const response = await apiClient.updateAppointment(id, appointmentData);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.deleteAppointment(id);
    return response.data;
  },

  async move(id: string, newStaffId: string, newTime: string) {
    const response = await apiClient.moveAppointment(id, newStaffId, newTime);
    return response.data;
  },
};

export const customerApi = {
  async getAll(params: {
    search?: string;
    limit?: number;
  } = {}) {
    const response = await apiClient.getCustomers(params);
    return response.data;
  },

  async create(customerData: Partial<Customer>) {
    const response = await apiClient.createCustomer(customerData);
    return response.data;
  },

  async update(id: string, customerData: Partial<Customer>) {
    const response = await apiClient.updateCustomer(id, customerData);
    return response.data;
  },
};

export const serviceApi = {
  async getAll() {
    const response = await apiClient.getServices();
    return response.data;
  },
};

export const inventoryApi = {
  async getAll() {
    const response = await apiClient.getInventory();
    return response.data;
  },

  async updateItem(id: string, updateData: Partial<InventoryItem>) {
    const response = await apiClient.updateInventoryItem(id, updateData);
    return response.data;
  },
};

export const adminApi = {
  async getSettings() {
    const response = await apiClient.getAdminSettings();
    return response.data;
  },

  async updateSettings(settings: any) {
    const response = await apiClient.updateAdminSettings(settings);
    return response.data;
  },
};