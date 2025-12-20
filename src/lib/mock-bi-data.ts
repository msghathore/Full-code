// Mock data for Business Intelligence features

export interface BookingData {
  id: string;
  date: string;
  service: string;
  staff: string;
  customerId: string;
  price: number;
  duration: number;
  status: 'completed' | 'cancelled' | 'no-show';
  location: string;
}

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalSpent: number;
  totalBookings: number;
  lastVisit: string;
  segment: 'VIP' | 'Regular' | 'New' | 'At-Risk';
  age: number;
  gender: 'M' | 'F' | 'Other';
  preferredServices: string[];
}

export interface RevenueData {
  date: string;
  bookings: number;
  revenue: number;
  servicesRevenue: number;
  productsRevenue: number;
  avgBookingValue: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface FeedbackData {
  id: string;
  customerId: string;
  bookingId: string;
  service: string;
  rating: number; // 1-5
  npsScore: number; // 0-10
  comment: string;
  date: string;
  promoterType: 'promoter' | 'passive' | 'detractor';
}

export interface CampaignData {
  id: string;
  name: string;
  type: 'welcome' | 'reactivation' | 'promotion' | 'birthday' | 'loyalty';
  status: 'draft' | 'scheduled' | 'sent' | 'completed';
  targetSegment: string;
  sendDate: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  subject: string;
  content: string;
}

export interface StaffData {
  id: string;
  name: string;
  role: string;
  availability: { [key: string]: string[] }; // day -> time slots
  bookings: number;
  revenue: number;
  rating: number;
  specialties: string[];
}

export interface DemandPattern {
  day: string;
  hour: number;
  demand: number; // 0-100
  avgBookings: number;
}

// Mock Bookings Data (last 6 months)
export const mockBookings: BookingData[] = [
  {
    id: 'BK-001',
    date: '2024-11-15',
    service: 'Luxury Hair Styling',
    staff: 'Maria Rodriguez',
    customerId: 'C-001',
    price: 120,
    duration: 90,
    status: 'completed',
    location: 'Downtown Salon'
  },
  {
    id: 'BK-002',
    date: '2024-11-15',
    service: 'Deep Tissue Massage',
    staff: 'David Chen',
    customerId: 'C-002',
    price: 95,
    duration: 60,
    status: 'completed',
    location: 'Spa Center'
  },
  {
    id: 'BK-003',
    date: '2024-11-14',
    service: 'Facial Treatment',
    staff: 'Emma Wilson',
    customerId: 'C-003',
    price: 85,
    duration: 75,
    status: 'completed',
    location: 'Downtown Salon'
  },
  // Add more booking data...
  {
    id: 'BK-004',
    date: '2024-11-13',
    service: 'Manicure',
    staff: 'Sarah Johnson',
    customerId: 'C-004',
    price: 45,
    duration: 45,
    status: 'completed',
    location: 'Downtown Salon'
  },
  {
    id: 'BK-005',
    date: '2024-11-12',
    service: 'Hair Color',
    staff: 'Maria Rodriguez',
    customerId: 'C-005',
    price: 150,
    duration: 120,
    status: 'completed',
    location: 'Downtown Salon'
  },
  // Generate more data programmatically
  ...Array.from({ length: 200 }, (_, i) => ({
    id: `BK-${String(i + 6).padStart(3, '0')}`,
    date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    service: ['Luxury Hair Styling', 'Deep Tissue Massage', 'Facial Treatment', 'Manicure', 'Hair Color', 'Pedicure', 'Body Scrub'][Math.floor(Math.random() * 7)],
    staff: ['Maria Rodriguez', 'David Chen', 'Emma Wilson', 'Sarah Johnson', 'Mike Davis'][Math.floor(Math.random() * 5)],
    customerId: `C-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
    price: Math.floor(Math.random() * 200) + 30,
    duration: [45, 60, 75, 90, 120][Math.floor(Math.random() * 5)],
    status: ['completed', 'cancelled', 'no-show'][Math.floor(Math.random() * 3)] as 'completed' | 'cancelled' | 'no-show',
    location: ['Downtown Salon', 'Spa Center'][Math.floor(Math.random() * 2)]
  }))
];

// Mock Customers Data
export const mockCustomers: CustomerData[] = [
  {
    id: 'C-001',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    joinDate: '2023-01-15',
    totalSpent: 2847,
    totalBookings: 23,
    lastVisit: '2024-11-15',
    segment: 'VIP',
    age: 32,
    gender: 'F',
    preferredServices: ['Luxury Hair Styling', 'Facial Treatment']
  },
  {
    id: 'C-002',
    name: 'Michael Chen',
    email: 'm.chen@email.com',
    phone: '+1 (555) 234-5678',
    joinDate: '2023-03-20',
    totalSpent: 1850,
    totalBookings: 15,
    lastVisit: '2024-11-15',
    segment: 'Regular',
    age: 28,
    gender: 'M',
    preferredServices: ['Deep Tissue Massage', 'Body Scrub']
  },
  // Generate more customers
  ...Array.from({ length: 98 }, (_, i) => ({
    id: `C-${String(i + 3).padStart(3, '0')}`,
    name: ['Emma Wilson', 'David Brown', 'Lisa Garcia', 'James Miller', 'Anna Taylor'][i % 5] + ` ${i + 1}`,
    email: `customer${i + 3}@email.com`,
    phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalSpent: Math.floor(Math.random() * 5000) + 100,
    totalBookings: Math.floor(Math.random() * 30) + 1,
    lastVisit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    segment: ['VIP', 'Regular', 'New', 'At-Risk'][Math.floor(Math.random() * 4)] as 'VIP' | 'Regular' | 'New' | 'At-Risk',
    age: Math.floor(Math.random() * 50) + 18,
    gender: ['M', 'F', 'Other'][Math.floor(Math.random() * 3)] as 'M' | 'F' | 'Other',
    preferredServices: [['Luxury Hair Styling'], ['Deep Tissue Massage'], ['Facial Treatment'], ['Manicure'], ['Hair Color']][Math.floor(Math.random() * 5)]
  }))
];

// Mock Revenue Data (daily for last 6 months)
export const mockRevenue: RevenueData[] = Array.from({ length: 180 }, (_, i) => {
  const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
  const bookings = Math.floor(Math.random() * 20) + 5;
  const servicesRevenue = bookings * (Math.floor(Math.random() * 150) + 50);
  const productsRevenue = Math.floor(Math.random() * 1000) + 200;
  const revenue = servicesRevenue + productsRevenue;

  return {
    date: date.toISOString().split('T')[0],
    bookings,
    revenue,
    servicesRevenue,
    productsRevenue,
    avgBookingValue: Math.round(revenue / bookings),
    newCustomers: Math.floor(Math.random() * 3),
    returningCustomers: bookings - Math.floor(Math.random() * 3)
  };
}).reverse();

// Mock Feedback Data
export const mockFeedback: FeedbackData[] = [
  {
    id: 'F-001',
    customerId: 'C-001',
    bookingId: 'BK-001',
    service: 'Luxury Hair Styling',
    rating: 5,
    npsScore: 9,
    comment: 'Amazing service! Maria is incredibly talented.',
    date: '2024-11-15',
    promoterType: 'promoter'
  },
  {
    id: 'F-002',
    customerId: 'C-002',
    bookingId: 'BK-002',
    service: 'Deep Tissue Massage',
    rating: 4,
    npsScore: 7,
    comment: 'Very relaxing experience. Would recommend.',
    date: '2024-11-15',
    promoterType: 'passive'
  },
  // Generate more feedback
  ...Array.from({ length: 150 }, (_, i) => {
    const rating = Math.floor(Math.random() * 5) + 1;
    const npsScore = Math.floor(Math.random() * 11);
    const promoterType: 'promoter' | 'passive' | 'detractor' = npsScore >= 9 ? 'promoter' : npsScore >= 7 ? 'passive' : 'detractor';

    return {
      id: `F-${String(i + 3).padStart(3, '0')}`,
      customerId: `C-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
      bookingId: `BK-${String(Math.floor(Math.random() * 200) + 1).padStart(3, '0')}`,
      service: ['Luxury Hair Styling', 'Deep Tissue Massage', 'Facial Treatment', 'Manicure', 'Hair Color'][Math.floor(Math.random() * 5)],
      rating,
      npsScore,
      comment: ['Great service!', 'Could be better', 'Excellent experience', 'Average', 'Outstanding work'][Math.floor(Math.random() * 5)],
      date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      promoterType
    };
  })
];

// Mock Campaigns Data
export const mockCampaigns: CampaignData[] = [
  {
    id: 'CMP-001',
    name: 'Welcome Series',
    type: 'welcome',
    status: 'completed',
    targetSegment: 'New Customers',
    sendDate: '2024-10-01',
    sentCount: 150,
    openRate: 45.2,
    clickRate: 12.8,
    conversionRate: 8.5,
    revenue: 4250,
    subject: 'Welcome to Zavira Beauty!',
    content: 'Welcome message content...'
  },
  {
    id: 'CMP-002',
    name: 'Holiday Promotion',
    type: 'promotion',
    status: 'sent',
    targetSegment: 'All Customers',
    sendDate: '2024-11-01',
    sentCount: 1200,
    openRate: 38.7,
    clickRate: 9.3,
    conversionRate: 5.2,
    revenue: 8900,
    subject: 'Holiday Special: 20% Off All Services',
    content: 'Holiday promotion content...'
  },
  {
    id: 'CMP-003',
    name: 'Reactivation Campaign',
    type: 'reactivation',
    status: 'scheduled',
    targetSegment: 'At-Risk Customers',
    sendDate: '2024-12-01',
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
    revenue: 0,
    subject: 'We Miss You! Special Offer Inside',
    content: 'Reactivation message content...'
  }
];

// Mock Staff Data
export const mockStaff: StaffData[] = [
  {
    id: 'S-001',
    name: 'Maria Rodriguez',
    role: 'Senior Stylist',
    availability: {
      'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Tuesday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Wednesday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Thursday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Friday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Saturday': ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00']
    },
    bookings: 45,
    revenue: 8500,
    rating: 4.8,
    specialties: ['Hair Styling', 'Hair Color', 'Hair Treatment']
  },
  {
    id: 'S-002',
    name: 'David Chen',
    role: 'Massage Therapist',
    availability: {
      'Monday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      'Tuesday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      'Wednesday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      'Thursday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      'Friday': ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      'Saturday': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00']
    },
    bookings: 38,
    revenue: 7200,
    rating: 4.9,
    specialties: ['Deep Tissue Massage', 'Swedish Massage', 'Aromatherapy']
  },
  {
    id: 'S-003',
    name: 'Emma Wilson',
    role: 'Esthetician',
    availability: {
      'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
      'Tuesday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
      'Wednesday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
      'Thursday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
      'Friday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
      'Saturday': ['08:00', '09:00', '10:00', '11:00', '12:00']
    },
    bookings: 32,
    revenue: 5800,
    rating: 4.7,
    specialties: ['Facial Treatment', 'Chemical Peel', 'Microdermabrasion']
  },
  {
    id: 'S-004',
    name: 'Sarah Johnson',
    role: 'Nail Technician',
    availability: {
      'Monday': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      'Tuesday': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      'Wednesday': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      'Thursday': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      'Friday': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      'Saturday': ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
    },
    bookings: 52,
    revenue: 4200,
    rating: 4.6,
    specialties: ['Manicure', 'Pedicure', 'Nail Art']
  },
  {
    id: 'S-005',
    name: 'Mike Davis',
    role: 'Barber',
    availability: {
      'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Tuesday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Wednesday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Thursday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Friday': ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      'Saturday': ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00']
    },
    bookings: 41,
    revenue: 6150,
    rating: 4.8,
    specialties: ['Men\'s Haircut', 'Beard Trim', 'Hot Towel Shave']
  }
];

// Mock Demand Patterns (hourly demand for each day of week)
export const mockDemandPatterns: DemandPattern[] = [
  // Monday
  ...Array.from({ length: 12 }, (_, i) => ({
    day: 'Monday',
    hour: i + 8, // 8 AM to 7 PM
    demand: Math.max(20, Math.min(100, 30 + Math.sin((i - 4) * Math.PI / 6) * 40 + Math.random() * 20)),
    avgBookings: Math.floor(Math.random() * 3) + 1
  })),
  // Tuesday
  ...Array.from({ length: 12 }, (_, i) => ({
    day: 'Tuesday',
    hour: i + 8,
    demand: Math.max(20, Math.min(100, 35 + Math.sin((i - 4) * Math.PI / 6) * 35 + Math.random() * 20)),
    avgBookings: Math.floor(Math.random() * 3) + 1
  })),
  // Wednesday
  ...Array.from({ length: 12 }, (_, i) => ({
    day: 'Wednesday',
    hour: i + 8,
    demand: Math.max(20, Math.min(100, 40 + Math.sin((i - 4) * Math.PI / 6) * 30 + Math.random() * 20)),
    avgBookings: Math.floor(Math.random() * 3) + 1
  })),
  // Thursday
  ...Array.from({ length: 12 }, (_, i) => ({
    day: 'Thursday',
    hour: i + 8,
    demand: Math.max(20, Math.min(100, 45 + Math.sin((i - 4) * Math.PI / 6) * 25 + Math.random() * 20)),
    avgBookings: Math.floor(Math.random() * 3) + 1
  })),
  // Friday
  ...Array.from({ length: 12 }, (_, i) => ({
    day: 'Friday',
    hour: i + 8,
    demand: Math.max(20, Math.min(100, 50 + Math.sin((i - 4) * Math.PI / 6) * 20 + Math.random() * 20)),
    avgBookings: Math.floor(Math.random() * 4) + 2
  })),
  // Saturday
  ...Array.from({ length: 12 }, (_, i) => ({
    day: 'Saturday',
    hour: i + 8,
    demand: Math.max(30, Math.min(100, 60 + Math.sin((i - 4) * Math.PI / 6) * 15 + Math.random() * 20)),
    avgBookings: Math.floor(Math.random() * 4) + 3
  })),
  // Sunday (lower demand)
  ...Array.from({ length: 8 }, (_, i) => ({
    day: 'Sunday',
    hour: i + 10, // 10 AM to 5 PM
    demand: Math.max(10, Math.min(60, 25 + Math.sin((i - 3) * Math.PI / 4) * 20 + Math.random() * 15)),
    avgBookings: Math.floor(Math.random() * 2) + 1
  }))
];

// Helper functions for data analysis
export const calculateNPS = (feedback: FeedbackData[]): number => {
  const promoters = feedback.filter(f => f.npsScore >= 9).length;
  const detractors = feedback.filter(f => f.npsScore <= 6).length;
  const total = feedback.length;

  if (total === 0) return 0;
  return Math.round(((promoters - detractors) / total) * 100);
};

export const getRevenueKPIs = (revenue: RevenueData[]) => {
  const totalRevenue = revenue.reduce((sum, r) => sum + r.revenue, 0);
  const totalBookings = revenue.reduce((sum, r) => sum + r.bookings, 0);
  const avgRevenuePerDay = totalRevenue / revenue.length;
  const avgBookingsPerDay = totalBookings / revenue.length;

  return {
    totalRevenue,
    totalBookings,
    avgRevenuePerDay,
    avgBookingsPerDay,
    growthRate: 12.5 // Mock growth rate
  };
};

export const getCustomerInsights = (customers: CustomerData[]) => {
  const segments = customers.reduce((acc, customer) => {
    acc[customer.segment] = (acc[customer.segment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgLifetimeValue = customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length;
  const avgBookingsPerCustomer = customers.reduce((sum, c) => sum + c.totalBookings, 0) / customers.length;

  return {
    segments,
    avgLifetimeValue,
    avgBookingsPerCustomer,
    retentionRate: 78.5 // Mock retention rate
  };
};