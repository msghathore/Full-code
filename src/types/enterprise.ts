// =====================================================
// ZAVIRA ENTERPRISE FEATURES TYPE DEFINITIONS
// =====================================================

// =====================================================
// 1. CUSTOMER CRM TYPES
// =====================================================

export interface CustomerLifecycleStage {
  id: string;
  name: string;
  description?: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface CustomerProfile {
  id: string;
  user_id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  profile_image_url?: string;
  preferred_contact_method: 'email' | 'sms' | 'phone';
  preferred_staff_id?: string;
  lifecycle_stage_id?: string;
  lifecycle_stage?: CustomerLifecycleStage;
  lifetime_value: number;
  total_visits: number;
  average_spend: number;
  last_visit_date?: string;
  next_appointment_date?: string;
  churn_risk_score: number;
  satisfaction_score?: number;
  referral_source?: string;
  referred_by?: string;
  notes?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  communication_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  staff_id?: string;
  interaction_type: 'call' | 'email' | 'sms' | 'in_person' | 'note' | 'appointment' | 'purchase';
  direction?: 'inbound' | 'outbound';
  subject?: string;
  content?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  outcome?: string;
  follow_up_date?: string;
  follow_up_completed: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  criteria: SegmentCriteria;
  is_dynamic: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface SegmentCriteria {
  lifetime_value?: { min?: number; max?: number };
  total_visits?: { min?: number; max?: number };
  last_visit_days?: { min?: number; max?: number };
  average_spend?: { min?: number; max?: number };
  tags?: string[];
  lifecycle_stages?: string[];
  services_used?: string[];
}

export interface CustomerPurchase {
  id: string;
  customer_id: string;
  appointment_id?: string;
  product_id?: string;
  service_id?: string;
  amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method?: string;
  payment_status: string;
  notes?: string;
  created_at: string;
}

// =====================================================
// 2. STAFF PERFORMANCE TYPES
// =====================================================

export interface StaffPerformanceMetrics {
  id: string;
  staff_id: string;
  metric_date: string;
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  revenue_generated: number;
  tips_received: number;
  products_sold: number;
  product_revenue: number;
  average_service_duration?: number;
  average_rating?: number;
  reviews_received: number;
  new_clients_served: number;
  returning_clients_served: number;
  utilization_rate?: number;
  rebooking_rate?: number;
  created_at: string;
}

export interface StaffGoal {
  id: string;
  staff_id: string;
  goal_type: 'revenue' | 'appointments' | 'reviews' | 'products' | 'rebooking';
  target_value: number;
  current_value: number;
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  period_start: string;
  period_end: string;
  status: 'active' | 'achieved' | 'missed';
  created_at: string;
  updated_at: string;
}

export interface StaffCommission {
  id: string;
  staff_id: string;
  commission_type: 'service' | 'product' | 'tip';
  source_id?: string;
  amount: number;
  rate?: number;
  status: 'pending' | 'approved' | 'paid';
  paid_date?: string;
  notes?: string;
  created_at: string;
}

export interface StaffSchedule {
  id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
  is_available: boolean;
  created_at: string;
}

export interface StaffTimeOff {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
}

// =====================================================
// 3. AI DEMAND FORECASTING TYPES
// =====================================================

export interface DemandHistory {
  id: string;
  date: string;
  hour: number;
  day_of_week: number;
  service_category?: string;
  total_bookings: number;
  total_revenue: number;
  average_duration?: number;
  capacity_utilization?: number;
  weather_condition?: string;
  temperature?: number;
  is_holiday: boolean;
  special_event?: string;
  created_at: string;
}

export interface DemandForecast {
  id: string;
  forecast_date: string;
  hour: number;
  service_category?: string;
  predicted_bookings: number;
  confidence_low?: number;
  confidence_high?: number;
  confidence_score?: number;
  factors?: Record<string, number>;
  model_version?: string;
  created_at: string;
}

export interface DynamicPricingRule {
  id: string;
  name: string;
  service_id?: string;
  service_category?: string;
  condition_type: 'demand' | 'time' | 'capacity' | 'custom';
  conditions: PricingConditions;
  price_adjustment_type: 'percentage' | 'fixed';
  price_adjustment_value: number;
  min_price?: number;
  max_price?: number;
  is_active: boolean;
  priority: number;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
}

export interface PricingConditions {
  demand_level?: 'low' | 'medium' | 'high';
  days_ahead?: { min?: number; max?: number };
  time_slots?: string[];
  day_of_week?: number[];
  capacity_threshold?: number;
}

export interface StaffingRecommendation {
  id: string;
  recommendation_date: string;
  time_slot_start: string;
  time_slot_end: string;
  service_category?: string;
  recommended_staff_count: number;
  current_staff_count?: number;
  expected_demand: number;
  confidence_score?: number;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
  created_at: string;
}

// =====================================================
// 4. REVIEW & SENTIMENT ANALYSIS TYPES
// =====================================================

export interface CustomerReview {
  id: string;
  customer_id?: string;
  appointment_id?: string;
  staff_id?: string;
  service_id?: string;
  overall_rating: number;
  service_rating?: number;
  staff_rating?: number;
  cleanliness_rating?: number;
  value_rating?: number;
  review_text?: string;
  sentiment_score?: number;
  sentiment_label?: 'positive' | 'neutral' | 'negative';
  key_phrases?: string[];
  topics?: string[];
  is_verified: boolean;
  is_public: boolean;
  response_text?: string;
  response_by?: string;
  response_at?: string;
  platform: 'internal' | 'google' | 'yelp' | 'facebook';
  external_review_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewAnalytics {
  id: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  staff_id?: string;
  service_id?: string;
  total_reviews: number;
  average_rating?: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  average_sentiment?: number;
  top_positive_topics?: string[];
  top_negative_topics?: string[];
  response_rate?: number;
  average_response_time?: number;
  nps_score?: number;
  created_at: string;
}

export interface ReviewResponseTemplate {
  id: string;
  name: string;
  sentiment_type: 'positive' | 'neutral' | 'negative';
  rating_range?: string;
  template_text: string;
  variables: string[];
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

// =====================================================
// 5. AUTOMATED MARKETING ENGINE TYPES
// =====================================================

export interface MarketingCampaign {
  id: string;
  name: string;
  description?: string;
  campaign_type: 'email' | 'sms' | 'push' | 'multi_channel';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  trigger_type: 'manual' | 'scheduled' | 'automated';
  trigger_conditions?: TriggerConditions;
  target_segment_id?: string;
  target_criteria?: SegmentCriteria;
  content: CampaignContent;
  schedule_at?: string;
  started_at?: string;
  completed_at?: string;
  budget?: number;
  spent: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignContent {
  subject?: string;
  body: string;
  html_body?: string;
  template_id?: string;
  preview_text?: string;
  variables?: Record<string, string>;
}

export interface TriggerConditions {
  event: string;
  delay_minutes?: number;
  filters?: Record<string, any>;
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_converted: number;
  total_unsubscribed: number;
  total_bounced: number;
  total_complaints: number;
  revenue_generated: number;
  open_rate?: number;
  click_rate?: number;
  conversion_rate?: number;
  roi?: number;
  updated_at: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  customer_id: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  converted_at?: string;
  conversion_value?: number;
  error_message?: string;
}

export interface MarketingTrigger {
  id: string;
  name: string;
  trigger_event: 'appointment_completed' | 'birthday' | 'no_visit_30_days' | 'cart_abandoned' | 'review_requested';
  delay_minutes: number;
  conditions?: Record<string, any>;
  campaign_template_id?: string;
  content: CampaignContent;
  channel: 'email' | 'sms' | 'push';
  is_active: boolean;
  total_triggered: number;
  total_converted: number;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  template_type: 'email' | 'sms' | 'push';
  category?: 'transactional' | 'marketing' | 'reminder';
  subject?: string;
  body: string;
  html_body?: string;
  variables: string[];
  preview_text?: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// 6. INVENTORY AUTO-REORDER SYSTEM TYPES
// =====================================================

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  unit_cost: number;
  retail_price?: number;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  reorder_point: number;
  reorder_quantity: number;
  max_stock?: number;
  lead_time_days: number;
  supplier_id?: string;
  supplier?: Supplier;
  is_active: boolean;
  last_reorder_date?: string;
  last_received_date?: string;
  usage_per_service?: number;
  linked_service_ids?: string[];
  barcode?: string;
  location?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country: string;
  website?: string;
  payment_terms?: string;
  notes?: string;
  rating?: number;
  is_active: boolean;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id?: string;
  supplier?: Supplier;
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  order_date?: string;
  expected_delivery_date?: string;
  received_date?: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  notes?: string;
  is_auto_generated: boolean;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  items?: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  inventory_item?: InventoryItem;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
}

export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  transaction_type: 'received' | 'sold' | 'used' | 'adjustment' | 'damaged' | 'returned';
  quantity: number;
  reference_type?: 'purchase_order' | 'appointment' | 'sale' | 'adjustment';
  reference_id?: string;
  unit_cost?: number;
  notes?: string;
  performed_by?: string;
  created_at: string;
}

export interface AutoReorderRule {
  id: string;
  name: string;
  inventory_item_id?: string;
  category?: string;
  trigger_type: 'stock_level' | 'forecast' | 'schedule';
  trigger_conditions: ReorderTriggerConditions;
  reorder_quantity_type: 'fixed' | 'to_max' | 'forecast_based';
  reorder_quantity?: number;
  supplier_id?: string;
  requires_approval: boolean;
  is_active: boolean;
  last_triggered_at?: string;
  created_at: string;
}

export interface ReorderTriggerConditions {
  stock_threshold?: number;
  days_of_supply?: number;
  schedule_day?: number;
  schedule_frequency?: 'weekly' | 'monthly';
}

// =====================================================
// 7. AI SERVICE RECOMMENDER TYPES
// =====================================================

export interface ServiceRecommendation {
  id: string;
  customer_id: string;
  service_id: string;
  recommendation_type: 'upsell' | 'cross_sell' | 'next_service' | 'trending' | 'personalized';
  score: number;
  reasoning?: string;
  factors?: Record<string, number>;
  is_shown: boolean;
  shown_at?: string;
  is_accepted?: boolean;
  accepted_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface CustomerServicePreference {
  id: string;
  customer_id: string;
  service_category: string;
  preference_score?: number;
  visit_count: number;
  last_visit?: string;
  average_spend?: number;
  preferred_time_slots?: string[];
  preferred_staff_ids?: string[];
  updated_at: string;
}

export interface ServiceBundle {
  id: string;
  name: string;
  description?: string;
  services: BundleService[];
  bundle_price: number;
  individual_price?: number;
  savings_amount?: number;
  savings_percentage?: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  max_uses?: number;
  current_uses: number;
  image_url?: string;
  created_at: string;
}

export interface BundleService {
  service_id: string;
  is_required: boolean;
}

export interface RecommendationFeedback {
  id: string;
  recommendation_id: string;
  customer_id: string;
  feedback_type: 'accepted' | 'rejected' | 'saved' | 'not_interested';
  feedback_reason?: string;
  created_at: string;
}

// =====================================================
// 8. REAL-TIME MULTIPLAYER SCHEDULING TYPES
// =====================================================

export interface SchedulePresence {
  id: string;
  user_id: string;
  staff_id?: string;
  view_date: string;
  cursor_position?: CursorPosition;
  color: string;
  last_active_at: string;
  created_at: string;
}

export interface CursorPosition {
  time: string;
  x: number;
  y: number;
}

export interface ScheduleLock {
  id: string;
  staff_id: string;
  appointment_date: string;
  time_slot: string;
  locked_by: string;
  lock_type: 'editing' | 'dragging' | 'creating';
  expires_at: string;
  created_at: string;
}

export interface ScheduleChange {
  id: string;
  appointment_id?: string;
  change_type: 'created' | 'updated' | 'deleted' | 'moved' | 'rescheduled';
  previous_state?: Record<string, any>;
  new_state?: Record<string, any>;
  changed_by: string;
  change_reason?: string;
  is_undone: boolean;
  undone_by?: string;
  undone_at?: string;
  created_at: string;
}

export interface ScheduleComment {
  id: string;
  appointment_id?: string;
  staff_id?: string;
  comment_date?: string;
  content: string;
  author_id: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  parent_comment_id?: string;
  replies?: ScheduleComment[];
  created_at: string;
}

// =====================================================
// 9. OFFLINE-FIRST PWA TYPES
// =====================================================

export interface OfflineSyncQueue {
  id: string;
  device_id: string;
  user_id?: string;
  operation_type: 'create' | 'update' | 'delete';
  table_name: string;
  record_id?: string;
  payload: Record<string, any>;
  created_offline_at: string;
  synced_at?: string;
  sync_status: 'pending' | 'synced' | 'conflict' | 'failed';
  conflict_resolution?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
}

export interface SyncState {
  id: string;
  device_id: string;
  user_id?: string;
  table_name: string;
  last_synced_at?: string;
  last_sync_version: number;
  sync_cursor?: string;
  created_at: string;
}

export interface SyncConflict {
  id: string;
  table_name: string;
  record_id: string;
  local_version: Record<string, any>;
  server_version: Record<string, any>;
  resolution?: 'local_wins' | 'server_wins' | 'merged' | 'manual';
  resolved_data?: Record<string, any>;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

// =====================================================
// ANALYTICS & DASHBOARD TYPES
// =====================================================

export interface DashboardMetrics {
  totalCustomers: number;
  newCustomersToday: number;
  totalRevenue: number;
  revenueToday: number;
  appointmentsToday: number;
  averageRating: number;
  churnRiskCustomers: number;
  pendingReviews: number;
  lowStockItems: number;
  activeStaff: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  staff_id: string;
  staff_name: string;
  avatar_url?: string;
  metric_value: number;
  metric_label: string;
  change_percentage?: number;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
