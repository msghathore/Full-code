// Group Booking Types

export type GroupType = 'bridal' | 'birthday' | 'corporate' | 'friends' | 'spa_day' | 'custom';
export type SchedulingType = 'parallel' | 'sequential' | 'staggered';
export type GroupStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'deposit_paid' | 'fully_paid' | 'refunded' | 'partial_refund';
export type PaymentType = 'single' | 'split';
export type MemberStatus = 'pending' | 'confirmed' | 'checked_in' | 'in_service' | 'completed' | 'no_show' | 'cancelled';
export type AddedBy = 'lead' | 'self' | 'staff';

export interface GroupPricingTier {
  id: string;
  name: string;
  min_size: number;
  max_size: number | null;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupPackage {
  id: string;
  name: string;
  description: string | null;
  group_type: GroupType | null;
  min_members: number;
  max_members: number;
  base_price: number | null;
  per_person_price: number | null;
  duration_minutes: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupPackageService {
  id: string;
  package_id: string;
  service_id: string;
  is_required: boolean;
  is_included: boolean;
  addon_price: number;
  order_position: number;
  created_at: string;
  // Joined fields
  service?: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  };
}

export interface GroupBooking {
  id: string;
  group_name: string | null;
  group_type: GroupType;
  package_id: string | null;
  lead_customer_id: string | null;
  lead_name: string;
  lead_email: string;
  lead_phone: string | null;
  total_members: number;
  confirmed_members: number;
  booking_date: string;
  start_time: string;
  end_time: string | null;
  scheduling_type: SchedulingType;
  status: GroupStatus;
  subtotal_amount: number;
  discount_percentage: number;
  discount_amount: number;
  total_amount: number;
  deposit_required: number;
  deposit_paid: number;
  balance_due: number;
  payment_status: PaymentStatus;
  payment_type: PaymentType;
  cancellation_notice_hours: number;
  auto_gratuity_percentage: number;
  special_requests: string | null;
  internal_notes: string | null;
  setup_requirements: string | null;
  share_code: string;
  share_link_active: boolean;
  member_registration_deadline: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  // Joined fields
  package?: GroupPackage;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  group_booking_id: string;
  customer_id: string | null;
  member_name: string;
  member_email: string | null;
  member_phone: string | null;
  is_lead: boolean;
  service_id: string | null;
  staff_id: string | null;
  scheduled_time: string | null;
  duration_minutes: number | null;
  service_amount: number;
  discount_amount: number;
  final_amount: number;
  deposit_amount: number;
  payment_status: PaymentStatus | 'pending' | 'paid' | 'refunded';
  status: MemberStatus;
  checked_in_at: string | null;
  service_started_at: string | null;
  service_completed_at: string | null;
  appointment_id: string | null;
  notes: string | null;
  special_requirements: string | null;
  created_at: string;
  updated_at: string;
  added_by: AddedBy;
  registration_token: string | null;
  // Joined fields
  service?: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  };
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

// Form/Input Types
export interface CreateGroupBookingInput {
  group_name?: string;
  group_type: GroupType;
  package_id?: string;
  lead_name: string;
  lead_email: string;
  lead_phone?: string;
  total_members: number;
  booking_date: string;
  start_time: string;
  scheduling_type?: SchedulingType;
  payment_type?: PaymentType;
  special_requests?: string;
}

export interface AddGroupMemberInput {
  group_booking_id: string;
  member_name: string;
  member_email?: string;
  member_phone?: string;
  is_lead?: boolean;
  service_id?: string;
  staff_id?: string;
  scheduled_time?: string;
  notes?: string;
  special_requirements?: string;
}

export interface UpdateGroupMemberInput {
  id: string;
  member_name?: string;
  member_email?: string;
  member_phone?: string;
  service_id?: string;
  staff_id?: string;
  scheduled_time?: string;
  status?: MemberStatus;
  notes?: string;
  special_requirements?: string;
}

// View/Display Types
export interface GroupBookingWithDetails extends GroupBooking {
  package_name?: string;
  package_description?: string;
  member_count: number;
  confirmed_count: number;
  checked_in_count: number;
  member_names: string[];
}

// Constants
export const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  bridal: 'Bridal Party',
  birthday: 'Birthday Celebration',
  corporate: 'Corporate Event',
  friends: 'Friends Group',
  spa_day: 'Spa Day',
  custom: 'Custom Group',
};

export const GROUP_TYPE_ICONS: Record<GroupType, string> = {
  bridal: '💒',
  birthday: '🎂',
  corporate: '💼',
  friends: '👯',
  spa_day: '🧖',
  custom: '✨',
};

export const GROUP_STATUS_LABELS: Record<GroupStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export const GROUP_STATUS_COLORS: Record<GroupStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-slate-50 text-slate-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-orange-100 text-orange-800',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  deposit_paid: 'Deposit Paid',
  fully_paid: 'Fully Paid',
  refunded: 'Refunded',
  partial_refund: 'Partial Refund',
};

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  in_service: 'In Service',
  completed: 'Completed',
  no_show: 'No Show',
  cancelled: 'Cancelled',
};
