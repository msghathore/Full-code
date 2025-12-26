-- =====================================================
-- ZAVIRA ENTERPRISE FEATURES DATABASE MIGRATION
-- Complete schema for all 9 major features
-- =====================================================

-- =====================================================
-- 1. ADVANCED CUSTOMER CRM TABLES
-- =====================================================

-- Customer lifecycle stages
CREATE TABLE IF NOT EXISTS customer_lifecycle_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default lifecycle stages
INSERT INTO customer_lifecycle_stages (name, description, color, sort_order) VALUES
    ('Lead', 'New potential customer', '#94a3b8', 1),
    ('First Visit', 'Completed first appointment', '#22c55e', 2),
    ('Returning', 'Has multiple appointments', '#3b82f6', 3),
    ('VIP', 'High-value loyal customer', '#eab308', 4),
    ('At Risk', 'May be churning', '#ef4444', 5),
    ('Churned', 'No activity in 90+ days', '#6b7280', 6)
ON CONFLICT (name) DO NOTHING;

-- Customer profiles with extended CRM data
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    profile_image_url TEXT,
    preferred_contact_method TEXT DEFAULT 'email',
    preferred_staff_id UUID,
    lifecycle_stage_id UUID REFERENCES customer_lifecycle_stages(id),
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    average_spend DECIMAL(10,2) DEFAULT 0,
    last_visit_date DATE,
    next_appointment_date DATE,
    churn_risk_score DECIMAL(5,2) DEFAULT 0,
    satisfaction_score DECIMAL(3,2),
    referral_source TEXT,
    referred_by UUID REFERENCES customer_profiles(id),
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    communication_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer interactions log
CREATE TABLE IF NOT EXISTS customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    staff_id UUID,
    interaction_type TEXT NOT NULL, -- 'call', 'email', 'sms', 'in_person', 'note', 'appointment', 'purchase'
    direction TEXT, -- 'inbound', 'outbound'
    subject TEXT,
    content TEXT,
    sentiment TEXT, -- 'positive', 'neutral', 'negative'
    outcome TEXT,
    follow_up_date DATE,
    follow_up_completed BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer segments for marketing
CREATE TABLE IF NOT EXISTS customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL, -- {"lifetime_value": {"min": 500}, "visits": {"min": 5}}
    is_dynamic BOOLEAN DEFAULT TRUE,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer segment memberships
CREATE TABLE IF NOT EXISTS customer_segment_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(segment_id, customer_id)
);

-- Customer purchase history
CREATE TABLE IF NOT EXISTS customer_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    appointment_id UUID,
    product_id UUID,
    service_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. STAFF PERFORMANCE DASHBOARD TABLES
-- =====================================================

-- Staff performance metrics (daily aggregation)
CREATE TABLE IF NOT EXISTS staff_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    metric_date DATE NOT NULL,
    total_appointments INTEGER DEFAULT 0,
    completed_appointments INTEGER DEFAULT 0,
    cancelled_appointments INTEGER DEFAULT 0,
    no_show_appointments INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    tips_received DECIMAL(10,2) DEFAULT 0,
    products_sold INTEGER DEFAULT 0,
    product_revenue DECIMAL(10,2) DEFAULT 0,
    average_service_duration INTEGER, -- minutes
    average_rating DECIMAL(3,2),
    reviews_received INTEGER DEFAULT 0,
    new_clients_served INTEGER DEFAULT 0,
    returning_clients_served INTEGER DEFAULT 0,
    utilization_rate DECIMAL(5,2), -- percentage of available time booked
    rebooking_rate DECIMAL(5,2), -- percentage of clients who rebooked
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, metric_date)
);

-- Staff goals
CREATE TABLE IF NOT EXISTS staff_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    goal_type TEXT NOT NULL, -- 'revenue', 'appointments', 'reviews', 'products', 'rebooking'
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'achieved', 'missed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff commissions
CREATE TABLE IF NOT EXISTS staff_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    commission_type TEXT NOT NULL, -- 'service', 'product', 'tip'
    source_id UUID, -- appointment_id or purchase_id
    amount DECIMAL(10,2) NOT NULL,
    rate DECIMAL(5,2), -- percentage rate if applicable
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'paid'
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff schedules and availability
CREATE TABLE IF NOT EXISTS staff_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, day_of_week)
);

-- Staff time off requests
CREATE TABLE IF NOT EXISTS staff_time_off (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'denied'
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. AI DEMAND FORECASTING TABLES
-- =====================================================

-- Historical demand data (hourly aggregation)
CREATE TABLE IF NOT EXISTS demand_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    hour INTEGER NOT NULL, -- 0-23
    day_of_week INTEGER NOT NULL, -- 0-6
    service_category TEXT,
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_duration INTEGER, -- minutes
    capacity_utilization DECIMAL(5,2),
    weather_condition TEXT,
    temperature DECIMAL(5,2),
    is_holiday BOOLEAN DEFAULT FALSE,
    special_event TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, hour, service_category)
);

-- Demand forecasts
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_date DATE NOT NULL,
    hour INTEGER NOT NULL,
    service_category TEXT,
    predicted_bookings INTEGER NOT NULL,
    confidence_low INTEGER,
    confidence_high INTEGER,
    confidence_score DECIMAL(5,2),
    factors JSONB, -- {"weather": 0.8, "day_of_week": 0.9, "holiday": 0.3}
    model_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(forecast_date, hour, service_category, model_version)
);

-- Dynamic pricing rules
CREATE TABLE IF NOT EXISTS dynamic_pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    service_id UUID,
    service_category TEXT,
    condition_type TEXT NOT NULL, -- 'demand', 'time', 'capacity', 'custom'
    conditions JSONB NOT NULL, -- {"demand_level": "high", "days_ahead": {"max": 3}}
    price_adjustment_type TEXT NOT NULL, -- 'percentage', 'fixed'
    price_adjustment_value DECIMAL(10,2) NOT NULL,
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staffing recommendations
CREATE TABLE IF NOT EXISTS staffing_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_date DATE NOT NULL,
    time_slot_start TIME NOT NULL,
    time_slot_end TIME NOT NULL,
    service_category TEXT,
    recommended_staff_count INTEGER NOT NULL,
    current_staff_count INTEGER,
    expected_demand INTEGER,
    confidence_score DECIMAL(5,2),
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. REVIEW & SENTIMENT ANALYSIS TABLES
-- =====================================================

-- Customer reviews
CREATE TABLE IF NOT EXISTS customer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
    appointment_id UUID,
    staff_id UUID,
    service_id UUID,
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    staff_rating INTEGER CHECK (staff_rating >= 1 AND staff_rating <= 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    review_text TEXT,
    sentiment_score DECIMAL(5,2), -- -1 to 1
    sentiment_label TEXT, -- 'positive', 'neutral', 'negative'
    key_phrases TEXT[],
    topics TEXT[], -- extracted topics like 'waiting_time', 'staff_friendliness'
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    response_text TEXT,
    response_by UUID,
    response_at TIMESTAMPTZ,
    platform TEXT DEFAULT 'internal', -- 'internal', 'google', 'yelp', 'facebook'
    external_review_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review analytics aggregation
CREATE TABLE IF NOT EXISTS review_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    staff_id UUID,
    service_id UUID,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    positive_count INTEGER DEFAULT 0,
    neutral_count INTEGER DEFAULT 0,
    negative_count INTEGER DEFAULT 0,
    average_sentiment DECIMAL(5,2),
    top_positive_topics TEXT[],
    top_negative_topics TEXT[],
    response_rate DECIMAL(5,2),
    average_response_time INTEGER, -- hours
    nps_score DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(period_type, period_start, staff_id, service_id)
);

-- Review response templates
CREATE TABLE IF NOT EXISTS review_response_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sentiment_type TEXT NOT NULL, -- 'positive', 'neutral', 'negative'
    rating_range INT4RANGE, -- [1,3) for 1-2 stars, [3,4) for 3 stars, etc.
    template_text TEXT NOT NULL,
    variables TEXT[], -- ['customer_name', 'staff_name', 'service_name']
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. AUTOMATED MARKETING ENGINE TABLES
-- =====================================================

-- Marketing campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT NOT NULL, -- 'email', 'sms', 'push', 'multi_channel'
    status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'active', 'paused', 'completed'
    trigger_type TEXT NOT NULL, -- 'manual', 'scheduled', 'automated'
    trigger_conditions JSONB, -- for automated campaigns
    target_segment_id UUID REFERENCES customer_segments(id),
    target_criteria JSONB, -- alternative to segment
    content JSONB NOT NULL, -- {"subject": "", "body": "", "template_id": ""}
    schedule_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    budget DECIMAL(10,2),
    spent DECIMAL(10,2) DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign analytics
CREATE TABLE IF NOT EXISTS campaign_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_converted INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_complaints INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    open_rate DECIMAL(5,2),
    click_rate DECIMAL(5,2),
    conversion_rate DECIMAL(5,2),
    roi DECIMAL(10,2),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign recipients
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    conversion_value DECIMAL(10,2),
    error_message TEXT,
    UNIQUE(campaign_id, customer_id)
);

-- Automated triggers
CREATE TABLE IF NOT EXISTS marketing_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL, -- 'appointment_completed', 'birthday', 'no_visit_30_days', 'cart_abandoned'
    delay_minutes INTEGER DEFAULT 0,
    conditions JSONB,
    campaign_template_id UUID,
    content JSONB NOT NULL,
    channel TEXT NOT NULL, -- 'email', 'sms', 'push'
    is_active BOOLEAN DEFAULT TRUE,
    total_triggered INTEGER DEFAULT 0,
    total_converted INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email/SMS templates
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    template_type TEXT NOT NULL, -- 'email', 'sms', 'push'
    category TEXT, -- 'transactional', 'marketing', 'reminder'
    subject TEXT,
    body TEXT NOT NULL,
    html_body TEXT,
    variables TEXT[], -- ['customer_name', 'appointment_date', 'service_name']
    preview_text TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. INVENTORY AUTO-REORDER SYSTEM TABLES
-- =====================================================

-- Products/inventory items
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    brand TEXT,
    unit_cost DECIMAL(10,2) NOT NULL,
    retail_price DECIMAL(10,2),
    current_stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    reorder_point INTEGER NOT NULL,
    reorder_quantity INTEGER NOT NULL,
    max_stock INTEGER,
    lead_time_days INTEGER DEFAULT 7,
    supplier_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    last_reorder_date DATE,
    last_received_date DATE,
    usage_per_service DECIMAL(10,4), -- for service-linked products
    linked_service_ids UUID[],
    barcode TEXT,
    location TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'USA',
    website TEXT,
    payment_terms TEXT,
    notes TEXT,
    rating DECIMAL(3,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'confirmed', 'shipped', 'received', 'cancelled'
    order_date DATE,
    expected_delivery_date DATE,
    received_date DATE,
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    is_auto_generated BOOLEAN DEFAULT FALSE,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase order items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    notes TEXT
);

-- Inventory transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
    transaction_type TEXT NOT NULL, -- 'received', 'sold', 'used', 'adjustment', 'damaged', 'returned'
    quantity INTEGER NOT NULL, -- positive for in, negative for out
    reference_type TEXT, -- 'purchase_order', 'appointment', 'sale', 'adjustment'
    reference_id UUID,
    unit_cost DECIMAL(10,2),
    notes TEXT,
    performed_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-reorder rules
CREATE TABLE IF NOT EXISTS auto_reorder_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id),
    category TEXT, -- if applying to category
    trigger_type TEXT NOT NULL, -- 'stock_level', 'forecast', 'schedule'
    trigger_conditions JSONB NOT NULL,
    reorder_quantity_type TEXT DEFAULT 'fixed', -- 'fixed', 'to_max', 'forecast_based'
    reorder_quantity INTEGER,
    supplier_id UUID REFERENCES suppliers(id),
    requires_approval BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. AI SERVICE RECOMMENDER TABLES
-- =====================================================

-- Service recommendations
CREATE TABLE IF NOT EXISTS service_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL,
    recommendation_type TEXT NOT NULL, -- 'upsell', 'cross_sell', 'next_service', 'trending', 'personalized'
    score DECIMAL(5,4) NOT NULL, -- 0-1 confidence score
    reasoning TEXT, -- explanation for the recommendation
    factors JSONB, -- {"purchase_history": 0.8, "similar_customers": 0.7, "trending": 0.6}
    is_shown BOOLEAN DEFAULT FALSE,
    shown_at TIMESTAMPTZ,
    is_accepted BOOLEAN,
    accepted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer service preferences (learned)
CREATE TABLE IF NOT EXISTS customer_service_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    service_category TEXT NOT NULL,
    preference_score DECIMAL(5,2), -- -1 to 1
    visit_count INTEGER DEFAULT 0,
    last_visit DATE,
    average_spend DECIMAL(10,2),
    preferred_time_slots TEXT[],
    preferred_staff_ids UUID[],
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, service_category)
);

-- Service bundles
CREATE TABLE IF NOT EXISTS service_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    services JSONB NOT NULL, -- [{"service_id": "uuid", "is_required": true}]
    bundle_price DECIMAL(10,2) NOT NULL,
    individual_price DECIMAL(10,2), -- sum of individual prices
    savings_amount DECIMAL(10,2),
    savings_percentage DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_until DATE,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendation feedback
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES service_recommendations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL, -- 'accepted', 'rejected', 'saved', 'not_interested'
    feedback_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. REAL-TIME MULTIPLAYER SCHEDULING TABLES
-- =====================================================

-- Active editors (for presence)
CREATE TABLE IF NOT EXISTS schedule_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    staff_id UUID, -- which staff calendar they're viewing
    view_date DATE NOT NULL,
    cursor_position JSONB, -- {"time": "10:00", "x": 100, "y": 200}
    color TEXT NOT NULL, -- assigned color for this user
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule locks (for conflict prevention)
CREATE TABLE IF NOT EXISTS schedule_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    locked_by UUID NOT NULL,
    lock_type TEXT DEFAULT 'editing', -- 'editing', 'dragging', 'creating'
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, appointment_date, time_slot)
);

-- Schedule change history (for undo/redo and audit)
CREATE TABLE IF NOT EXISTS schedule_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID,
    change_type TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'moved', 'rescheduled'
    previous_state JSONB,
    new_state JSONB,
    changed_by UUID NOT NULL,
    change_reason TEXT,
    is_undone BOOLEAN DEFAULT FALSE,
    undone_by UUID,
    undone_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collaboration comments
CREATE TABLE IF NOT EXISTS schedule_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID,
    staff_id UUID, -- for day-level comments
    comment_date DATE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    parent_comment_id UUID REFERENCES schedule_comments(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. OFFLINE-FIRST PWA TABLES
-- =====================================================

-- Sync queue for offline operations
CREATE TABLE IF NOT EXISTS offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    user_id UUID,
    operation_type TEXT NOT NULL, -- 'create', 'update', 'delete'
    table_name TEXT NOT NULL,
    record_id UUID,
    payload JSONB NOT NULL,
    created_offline_at TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'pending', -- 'pending', 'synced', 'conflict', 'failed'
    conflict_resolution TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync state tracking
CREATE TABLE IF NOT EXISTS sync_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    user_id UUID,
    table_name TEXT NOT NULL,
    last_synced_at TIMESTAMPTZ,
    last_sync_version BIGINT DEFAULT 0,
    sync_cursor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(device_id, table_name)
);

-- Conflict resolution log
CREATE TABLE IF NOT EXISTS sync_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    local_version JSONB NOT NULL,
    server_version JSONB NOT NULL,
    resolution TEXT, -- 'local_wins', 'server_wins', 'merged', 'manual'
    resolved_data JSONB,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Customer profiles indexes
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_lifecycle ON customer_profiles(lifecycle_stage_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_churn_risk ON customer_profiles(churn_risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_last_visit ON customer_profiles(last_visit_date);

-- Customer interactions indexes
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_type ON customer_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_date ON customer_interactions(created_at DESC);

-- Staff performance indexes
CREATE INDEX IF NOT EXISTS idx_staff_performance_staff ON staff_performance_metrics(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_performance_date ON staff_performance_metrics(metric_date DESC);

-- Demand forecasting indexes
CREATE INDEX IF NOT EXISTS idx_demand_history_date ON demand_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_date ON demand_forecasts(forecast_date);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON customer_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_staff ON customer_reviews(staff_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON customer_reviews(overall_rating);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON customer_reviews(sentiment_label);

-- Marketing indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_customer ON campaign_recipients(customer_id);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory_items(current_stock) WHERE current_stock <= reorder_point;
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);

-- Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_customer ON service_recommendations(customer_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_score ON service_recommendations(score DESC);

-- Schedule indexes
CREATE INDEX IF NOT EXISTS idx_schedule_locks_expiry ON schedule_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_schedule_presence_active ON schedule_presence(last_active_at DESC);

-- Sync indexes
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON offline_sync_queue(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_device ON offline_sync_queue(device_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- Staff can view their own performance and customers
DROP POLICY IF EXISTS "Staff can view own performance" ON staff_performance_metrics;
CREATE POLICY "Staff can view own performance" ON staff_performance_metrics
    FOR SELECT USING (staff_id::text = auth.jwt()->>'staff_id' OR auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Staff can view customer profiles" ON customer_profiles;
CREATE POLICY "Staff can view customer profiles" ON customer_profiles
    FOR SELECT USING (auth.jwt()->>'role' IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Staff can manage customers" ON customer_profiles;
CREATE POLICY "Staff can manage customers" ON customer_profiles
    FOR ALL USING (auth.jwt()->>'role' IN ('admin', 'staff'));

-- Admin full access policies
DROP POLICY IF EXISTS "Admin full access to campaigns" ON marketing_campaigns;
CREATE POLICY "Admin full access to campaigns" ON marketing_campaigns
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Admin full access to inventory" ON inventory_items;
CREATE POLICY "Admin full access to inventory" ON inventory_items
    FOR ALL USING (auth.jwt()->>'role' IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Admin full access to orders" ON purchase_orders;
CREATE POLICY "Admin full access to orders" ON purchase_orders
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Public can view published reviews
DROP POLICY IF EXISTS "Public can view reviews" ON customer_reviews;
CREATE POLICY "Public can view reviews" ON customer_reviews
    FOR SELECT USING (is_public = TRUE);

-- Customers can view their own data
DROP POLICY IF EXISTS "Customers view own recommendations" ON service_recommendations;
CREATE POLICY "Customers view own recommendations" ON service_recommendations
    FOR SELECT USING (customer_id IN (
        SELECT id FROM customer_profiles WHERE user_id = auth.uid()
    ));

-- Schedule presence for authenticated users
DROP POLICY IF EXISTS "Authenticated users can manage presence" ON schedule_presence;
CREATE POLICY "Authenticated users can manage presence" ON schedule_presence
    FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update customer lifetime value
CREATE OR REPLACE FUNCTION update_customer_lifetime_value()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customer_profiles
    SET
        lifetime_value = (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM customer_purchases
            WHERE customer_id = NEW.customer_id
        ),
        total_visits = (
            SELECT COUNT(DISTINCT appointment_id)
            FROM customer_purchases
            WHERE customer_id = NEW.customer_id
            AND appointment_id IS NOT NULL
        ),
        average_spend = (
            SELECT COALESCE(AVG(total_amount), 0)
            FROM customer_purchases
            WHERE customer_id = NEW.customer_id
        ),
        updated_at = NOW()
    WHERE id = NEW.customer_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_ltv
AFTER INSERT OR UPDATE ON customer_purchases
FOR EACH ROW EXECUTE FUNCTION update_customer_lifetime_value();

-- Function to update inventory stock
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE inventory_items
    SET
        current_stock = current_stock + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.inventory_item_id;

    -- Check if reorder needed
    IF (SELECT current_stock <= reorder_point FROM inventory_items WHERE id = NEW.inventory_item_id) THEN
        -- Insert notification or trigger auto-reorder
        INSERT INTO inventory_transactions (
            inventory_item_id,
            transaction_type,
            quantity,
            notes
        ) VALUES (
            NEW.inventory_item_id,
            'low_stock_alert',
            0,
            'Stock level below reorder point'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_stock
AFTER INSERT ON inventory_transactions
FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

-- Function to clean up expired schedule locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
    DELETE FROM schedule_locks WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update staff performance metrics
CREATE OR REPLACE FUNCTION calculate_daily_staff_metrics(p_staff_id UUID, p_date DATE)
RETURNS void AS $$
DECLARE
    v_total_appointments INTEGER;
    v_completed INTEGER;
    v_cancelled INTEGER;
    v_no_shows INTEGER;
    v_revenue DECIMAL(10,2);
BEGIN
    -- Get appointment counts
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'cancelled'),
        COUNT(*) FILTER (WHERE status = 'no_show'),
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0)
    INTO v_total_appointments, v_completed, v_cancelled, v_no_shows, v_revenue
    FROM appointments
    WHERE staff_id = p_staff_id
    AND appointment_date = p_date;

    -- Upsert metrics
    INSERT INTO staff_performance_metrics (
        staff_id,
        metric_date,
        total_appointments,
        completed_appointments,
        cancelled_appointments,
        no_show_appointments,
        revenue_generated
    ) VALUES (
        p_staff_id,
        p_date,
        v_total_appointments,
        v_completed,
        v_cancelled,
        v_no_shows,
        v_revenue
    )
    ON CONFLICT (staff_id, metric_date)
    DO UPDATE SET
        total_appointments = EXCLUDED.total_appointments,
        completed_appointments = EXCLUDED.completed_appointments,
        cancelled_appointments = EXCLUDED.cancelled_appointments,
        no_show_appointments = EXCLUDED.no_show_appointments,
        revenue_generated = EXCLUDED.revenue_generated;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate churn risk score
CREATE OR REPLACE FUNCTION calculate_churn_risk(p_customer_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_days_since_visit INTEGER;
    v_visit_frequency DECIMAL(10,2);
    v_avg_gap INTEGER;
    v_risk_score DECIMAL(5,2);
BEGIN
    SELECT
        EXTRACT(DAY FROM NOW() - last_visit_date)::INTEGER,
        total_visits
    INTO v_days_since_visit, v_visit_frequency
    FROM customer_profiles
    WHERE id = p_customer_id;

    -- Calculate average gap between visits
    SELECT AVG(gap_days)::INTEGER
    INTO v_avg_gap
    FROM (
        SELECT
            EXTRACT(DAY FROM created_at - LAG(created_at) OVER (ORDER BY created_at))::INTEGER as gap_days
        FROM customer_purchases
        WHERE customer_id = p_customer_id
    ) gaps
    WHERE gap_days IS NOT NULL;

    -- Calculate risk score (0-100)
    v_risk_score := LEAST(100, GREATEST(0,
        CASE
            WHEN v_days_since_visit IS NULL THEN 50
            WHEN v_avg_gap IS NULL OR v_avg_gap = 0 THEN
                CASE WHEN v_days_since_visit > 90 THEN 80 ELSE v_days_since_visit * 0.5 END
            ELSE (v_days_since_visit::DECIMAL / v_avg_gap) * 30
        END
    ));

    RETURN v_risk_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_locks;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_changes;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_comments;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default message templates
INSERT INTO message_templates (name, template_type, category, subject, body, variables) VALUES
    ('Appointment Reminder', 'email', 'reminder', 'Your appointment at Zavira is tomorrow!', 'Hi {{customer_name}}, just a reminder that you have an appointment for {{service_name}} tomorrow at {{appointment_time}}. See you soon!', ARRAY['customer_name', 'service_name', 'appointment_time']),
    ('Review Request', 'email', 'marketing', 'How was your visit to Zavira?', 'Hi {{customer_name}}, thank you for visiting us! We''d love to hear about your experience. Please take a moment to leave us a review.', ARRAY['customer_name', 'service_name']),
    ('Win-Back Campaign', 'email', 'marketing', 'We miss you at Zavira!', 'Hi {{customer_name}}, it''s been a while since your last visit. Come back and enjoy {{discount_percentage}}% off your next service!', ARRAY['customer_name', 'discount_percentage']),
    ('Birthday Greeting', 'email', 'marketing', 'Happy Birthday from Zavira!', 'Happy Birthday, {{customer_name}}! Celebrate with us - enjoy a special birthday treat on your next visit.', ARRAY['customer_name']),
    ('Appointment Confirmation', 'sms', 'transactional', NULL, 'Your appointment at Zavira for {{service_name}} on {{appointment_date}} at {{appointment_time}} is confirmed!', ARRAY['service_name', 'appointment_date', 'appointment_time'])
ON CONFLICT DO NOTHING;

-- Insert default review response templates
INSERT INTO review_response_templates (name, sentiment_type, rating_range, template_text, variables) VALUES
    ('Positive 5-Star', 'positive', '[5,6)', 'Thank you so much for your wonderful review, {{customer_name}}! We''re thrilled that you enjoyed your {{service_name}} experience. We look forward to seeing you again soon!', ARRAY['customer_name', 'service_name']),
    ('Positive 4-Star', 'positive', '[4,5)', 'Thank you for your feedback, {{customer_name}}! We''re glad you had a great experience. We''re always striving for excellence and would love to hear how we can make your next visit even better.', ARRAY['customer_name']),
    ('Neutral Response', 'neutral', '[3,4)', 'Thank you for taking the time to share your feedback, {{customer_name}}. We appreciate your honest review and are always looking for ways to improve. Please reach out if there''s anything specific we can do better.', ARRAY['customer_name']),
    ('Negative Response', 'negative', '[1,3)', 'We''re sorry to hear about your experience, {{customer_name}}. This doesn''t reflect our usual standard of service. Please contact us directly so we can make this right. Your satisfaction is our priority.', ARRAY['customer_name'])
ON CONFLICT DO NOTHING;

COMMIT;
