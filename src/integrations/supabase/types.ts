export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_audit_log: {
        Row: {
          action_type: string
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          page_accessed: string | null
          staff_id: string | null
          staff_name: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          page_accessed?: string | null
          staff_id?: string | null
          staff_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          page_accessed?: string | null
          staff_id?: string | null
          staff_name?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_audit_log_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_credentials: {
        Row: {
          created_at: string
          id: string
          last_login: string | null
          password_hash: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_login?: string | null
          password_hash: string
          updated_at?: string
          username?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_login?: string | null
          password_hash?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      appointment_management_tokens: {
        Row: {
          action_type: string | null
          appointment_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          action_type?: string | null
          appointment_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          action_type?: string | null
          appointment_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_management_tokens_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_management_tokens_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          arrived_at: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          email: string | null
          full_name: string | null
          group_booking_id: string | null
          group_member_id: string | null
          id: string
          is_group_appointment: boolean | null
          late_arrival_minutes: number | null
          no_show_reason: string | null
          notes: string | null
          old_service_id: string | null
          payment_intent_id: string | null
          payment_status: string | null
          phone: string | null
          reminder_sent: boolean | null
          rescheduled_from_id: string | null
          rescheduled_to_id: string | null
          retention_status: string | null
          review_reminder_sent: boolean | null
          service_id: string | null
          staff_id: string | null
          status: string | null
          total_amount: number | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          arrived_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          email?: string | null
          full_name?: string | null
          group_booking_id?: string | null
          group_member_id?: string | null
          id?: string
          is_group_appointment?: boolean | null
          late_arrival_minutes?: number | null
          no_show_reason?: string | null
          notes?: string | null
          old_service_id?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          phone?: string | null
          reminder_sent?: boolean | null
          rescheduled_from_id?: string | null
          rescheduled_to_id?: string | null
          retention_status?: string | null
          review_reminder_sent?: boolean | null
          service_id?: string | null
          staff_id?: string | null
          status?: string | null
          total_amount?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          arrived_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          email?: string | null
          full_name?: string | null
          group_booking_id?: string | null
          group_member_id?: string | null
          id?: string
          is_group_appointment?: boolean | null
          late_arrival_minutes?: number | null
          no_show_reason?: string | null
          notes?: string | null
          old_service_id?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          phone?: string | null
          reminder_sent?: boolean | null
          rescheduled_from_id?: string | null
          rescheduled_to_id?: string | null
          retention_status?: string | null
          review_reminder_sent?: boolean | null
          service_id?: string | null
          staff_id?: string | null
          status?: string | null
          total_amount?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_group_booking_id_fkey"
            columns: ["group_booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_group_member_id_fkey"
            columns: ["group_member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_rescheduled_from_id_fkey"
            columns: ["rescheduled_from_id"]
            isOneToOne: false
            referencedRelation: "appointment_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_rescheduled_from_id_fkey"
            columns: ["rescheduled_from_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_rescheduled_to_id_fkey"
            columns: ["rescheduled_to_id"]
            isOneToOne: false
            referencedRelation: "appointment_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_rescheduled_to_id_fkey"
            columns: ["rescheduled_to_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_with_variants"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_reorder_rules: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          inventory_item_id: string | null
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          reorder_quantity: number | null
          reorder_quantity_type: string | null
          requires_approval: boolean | null
          supplier_id: string | null
          trigger_conditions: Json
          trigger_type: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          reorder_quantity?: number | null
          reorder_quantity_type?: string | null
          requires_approval?: boolean | null
          supplier_id?: string | null
          trigger_conditions: Json
          trigger_type: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          reorder_quantity?: number | null
          reorder_quantity_type?: string | null
          requires_approval?: boolean | null
          supplier_id?: string | null
          trigger_conditions?: Json
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_reorder_rules_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_reorder_rules_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      beauty_tips: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          likes: number | null
          read_time: number | null
          tags: string[] | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author: string
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          likes?: number | null
          read_time?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          likes?: number | null
          read_time?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          conversion_value: number | null
          converted_at: string | null
          customer_id: string
          delivered_at: string | null
          error_message: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          conversion_value?: number | null
          converted_at?: string | null
          customer_id: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          conversion_value?: number | null
          converted_at?: string | null
          customer_id?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_interactions: {
        Row: {
          content: string | null
          created_at: string | null
          customer_id: string
          direction: string | null
          follow_up_completed: boolean | null
          follow_up_date: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          outcome: string | null
          sentiment: string | null
          staff_id: string | null
          subject: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          customer_id: string
          direction?: string | null
          follow_up_completed?: boolean | null
          follow_up_date?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          outcome?: string | null
          sentiment?: string | null
          staff_id?: string | null
          subject?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          customer_id?: string
          direction?: string | null
          follow_up_completed?: boolean | null
          follow_up_date?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          outcome?: string | null
          sentiment?: string | null
          staff_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_lifecycle_stages: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      customer_memberships: {
        Row: {
          auto_renew: boolean | null
          billing_cycle: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          customer_id: string
          end_date: string | null
          id: string
          next_billing_date: string | null
          services_remaining: number | null
          services_used_this_month: number | null
          start_date: string
          status: string
          tier_id: string
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id: string
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          services_remaining?: number | null
          services_used_this_month?: number | null
          start_date?: string
          status?: string
          tier_id: string
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          services_remaining?: number | null
          services_used_this_month?: number | null
          start_date?: string
          status?: string
          tier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_memberships_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_memberships_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          average_spend: number | null
          churn_risk_score: number | null
          communication_preferences: Json | null
          created_at: string | null
          custom_fields: Json | null
          date_of_birth: string | null
          email: string
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          last_visit_date: string | null
          lifecycle_stage_id: string | null
          lifetime_value: number | null
          loyalty_tier: string | null
          next_appointment_date: string | null
          notes: string | null
          phone: string | null
          preferred_contact_method: string | null
          preferred_staff_id: string | null
          profile_image_url: string | null
          referral_source: string | null
          referred_by: string | null
          satisfaction_score: number | null
          tags: string[] | null
          total_visits: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          average_spend?: number | null
          churn_risk_score?: number | null
          communication_preferences?: Json | null
          created_at?: string | null
          custom_fields?: Json | null
          date_of_birth?: string | null
          email: string
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          last_visit_date?: string | null
          lifecycle_stage_id?: string | null
          lifetime_value?: number | null
          loyalty_tier?: string | null
          next_appointment_date?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          preferred_staff_id?: string | null
          profile_image_url?: string | null
          referral_source?: string | null
          referred_by?: string | null
          satisfaction_score?: number | null
          tags?: string[] | null
          total_visits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          average_spend?: number | null
          churn_risk_score?: number | null
          communication_preferences?: Json | null
          created_at?: string | null
          custom_fields?: Json | null
          date_of_birth?: string | null
          email?: string
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          last_visit_date?: string | null
          lifecycle_stage_id?: string | null
          lifetime_value?: number | null
          loyalty_tier?: string | null
          next_appointment_date?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          preferred_staff_id?: string | null
          profile_image_url?: string | null
          referral_source?: string | null
          referred_by?: string | null
          satisfaction_score?: number | null
          tags?: string[] | null
          total_visits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_lifecycle_stage_id_fkey"
            columns: ["lifecycle_stage_id"]
            isOneToOne: false
            referencedRelation: "customer_lifecycle_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_purchases: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string | null
          customer_id: string
          discount_amount: number | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          product_id: string | null
          service_id: string | null
          tax_amount: number | null
          total_amount: number
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string | null
          customer_id: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id?: string | null
          service_id?: string | null
          tax_amount?: number | null
          total_amount: number
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string | null
          customer_id?: string
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id?: string | null
          service_id?: string | null
          tax_amount?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_purchases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_reviews: {
        Row: {
          appointment_id: string | null
          cleanliness_rating: number | null
          created_at: string | null
          customer_id: string | null
          external_review_id: string | null
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          key_phrases: string[] | null
          overall_rating: number
          platform: string | null
          response_at: string | null
          response_by: string | null
          response_text: string | null
          review_text: string | null
          sentiment_label: string | null
          sentiment_score: number | null
          service_id: string | null
          service_rating: number | null
          staff_id: string | null
          staff_rating: number | null
          topics: string[] | null
          updated_at: string | null
          value_rating: number | null
        }
        Insert: {
          appointment_id?: string | null
          cleanliness_rating?: number | null
          created_at?: string | null
          customer_id?: string | null
          external_review_id?: string | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          key_phrases?: string[] | null
          overall_rating: number
          platform?: string | null
          response_at?: string | null
          response_by?: string | null
          response_text?: string | null
          review_text?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          service_id?: string | null
          service_rating?: number | null
          staff_id?: string | null
          staff_rating?: number | null
          topics?: string[] | null
          updated_at?: string | null
          value_rating?: number | null
        }
        Update: {
          appointment_id?: string | null
          cleanliness_rating?: number | null
          created_at?: string | null
          customer_id?: string | null
          external_review_id?: string | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          key_phrases?: string[] | null
          overall_rating?: number
          platform?: string | null
          response_at?: string | null
          response_by?: string | null
          response_text?: string | null
          review_text?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          service_id?: string | null
          service_rating?: number | null
          staff_id?: string | null
          staff_rating?: number | null
          topics?: string[] | null
          updated_at?: string | null
          value_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_segment_members: {
        Row: {
          added_at: string | null
          customer_id: string
          id: string
          segment_id: string
        }
        Insert: {
          added_at?: string | null
          customer_id: string
          id?: string
          segment_id: string
        }
        Update: {
          added_at?: string | null
          customer_id?: string
          id?: string
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_segment_members_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_segment_members_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "customer_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_segments: {
        Row: {
          created_at: string | null
          criteria: Json
          description: string | null
          id: string
          is_dynamic: boolean | null
          member_count: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          criteria: Json
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          member_count?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          member_count?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_service_preferences: {
        Row: {
          average_spend: number | null
          customer_id: string
          id: string
          last_visit: string | null
          preference_score: number | null
          preferred_staff_ids: string[] | null
          preferred_time_slots: string[] | null
          service_category: string
          updated_at: string | null
          visit_count: number | null
        }
        Insert: {
          average_spend?: number | null
          customer_id: string
          id?: string
          last_visit?: string | null
          preference_score?: number | null
          preferred_staff_ids?: string[] | null
          preferred_time_slots?: string[] | null
          service_category: string
          updated_at?: string | null
          visit_count?: number | null
        }
        Update: {
          average_spend?: number | null
          customer_id?: string
          id?: string
          last_visit?: string | null
          preference_score?: number | null
          preferred_staff_ids?: string[] | null
          preferred_time_slots?: string[] | null
          service_category?: string
          updated_at?: string | null
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_service_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_subscriptions: {
        Row: {
          auto_renew: boolean | null
          box_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          customer_id: string
          delivery_frequency: string
          id: string
          next_delivery_date: string
          shipping_address: Json
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          box_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id: string
          delivery_frequency?: string
          id?: string
          next_delivery_date: string
          shipping_address: Json
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          box_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string
          delivery_frequency?: string
          id?: string
          next_delivery_date?: string
          shipping_address?: Json
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_subscriptions_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "subscription_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          last_visit: string | null
          loyalty_points: number | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          last_visit?: string | null
          loyalty_points?: number | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit?: string | null
          loyalty_points?: number | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      demand_forecasts: {
        Row: {
          confidence_high: number | null
          confidence_low: number | null
          confidence_score: number | null
          created_at: string | null
          factors: Json | null
          forecast_date: string
          hour: number
          id: string
          model_version: string | null
          predicted_bookings: number
          service_category: string | null
        }
        Insert: {
          confidence_high?: number | null
          confidence_low?: number | null
          confidence_score?: number | null
          created_at?: string | null
          factors?: Json | null
          forecast_date: string
          hour: number
          id?: string
          model_version?: string | null
          predicted_bookings: number
          service_category?: string | null
        }
        Update: {
          confidence_high?: number | null
          confidence_low?: number | null
          confidence_score?: number | null
          created_at?: string | null
          factors?: Json | null
          forecast_date?: string
          hour?: number
          id?: string
          model_version?: string | null
          predicted_bookings?: number
          service_category?: string | null
        }
        Relationships: []
      }
      demand_history: {
        Row: {
          average_duration: number | null
          capacity_utilization: number | null
          created_at: string | null
          date: string
          day_of_week: number
          hour: number
          id: string
          is_holiday: boolean | null
          service_category: string | null
          special_event: string | null
          temperature: number | null
          total_bookings: number | null
          total_revenue: number | null
          weather_condition: string | null
        }
        Insert: {
          average_duration?: number | null
          capacity_utilization?: number | null
          created_at?: string | null
          date: string
          day_of_week: number
          hour: number
          id?: string
          is_holiday?: boolean | null
          service_category?: string | null
          special_event?: string | null
          temperature?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
          weather_condition?: string | null
        }
        Update: {
          average_duration?: number | null
          capacity_utilization?: number | null
          created_at?: string | null
          date?: string
          day_of_week?: number
          hour?: number
          id?: string
          is_holiday?: boolean | null
          service_category?: string | null
          special_event?: string | null
          temperature?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
          weather_condition?: string | null
        }
        Relationships: []
      }
      dynamic_pricing_rules: {
        Row: {
          condition_type: string
          conditions: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          max_price: number | null
          min_price: number | null
          name: string
          price_adjustment_type: string
          price_adjustment_value: number
          priority: number | null
          service_category: string | null
          service_id: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          condition_type: string
          conditions: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          name: string
          price_adjustment_type: string
          price_adjustment_value: number
          priority?: number | null
          service_category?: string | null
          service_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          condition_type?: string
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          name?: string
          price_adjustment_type?: string
          price_adjustment_value?: number
          priority?: number | null
          service_category?: string | null
          service_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      edge_function_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      forum_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          reply_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_avatar: string | null
          author_id: string | null
          author_name: string
          category: string
          content: string
          created_at: string | null
          id: string
          is_published: boolean | null
          is_sticky: boolean | null
          likes: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_avatar?: string | null
          author_id?: string | null
          author_name: string
          category?: string
          content: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          is_sticky?: boolean | null
          likes?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          is_sticky?: boolean | null
          likes?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          author_avatar: string | null
          author_id: string | null
          author_name: string
          content: string
          created_at: string | null
          id: string
          likes: number | null
          post_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_id?: string | null
          author_name: string
          content: string
          created_at?: string | null
          id?: string
          likes?: number | null
          post_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string
          content?: string
          created_at?: string | null
          id?: string
          likes?: number | null
          post_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          code: string
          created_at: string | null
          current_balance: number
          expires_at: string | null
          id: string
          initial_balance: number
          is_active: boolean | null
          message: string | null
          purchaser_user_id: string | null
          recipient_email: string | null
          recipient_name: string | null
          used_at: string | null
          used_by_user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_balance: number
          expires_at?: string | null
          id?: string
          initial_balance: number
          is_active?: boolean | null
          message?: string | null
          purchaser_user_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_balance?: number
          expires_at?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean | null
          message?: string | null
          purchaser_user_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_cards_purchaser_user_id_fkey"
            columns: ["purchaser_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_cards_used_by_user_id_fkey"
            columns: ["used_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      glen_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      group_bookings: {
        Row: {
          auto_gratuity_percentage: number | null
          balance_due: number | null
          booking_date: string
          cancellation_notice_hours: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          confirmed_members: number | null
          created_at: string | null
          created_by: string | null
          deposit_paid: number | null
          deposit_required: number | null
          discount_amount: number | null
          discount_percentage: number | null
          end_time: string | null
          group_name: string | null
          group_type: string
          id: string
          internal_notes: string | null
          lead_customer_id: string | null
          lead_email: string
          lead_name: string
          lead_phone: string | null
          member_registration_deadline: string | null
          package_id: string | null
          payment_status: string | null
          payment_type: string | null
          scheduling_type: string | null
          setup_requirements: string | null
          share_code: string | null
          share_link_active: boolean | null
          special_requests: string | null
          start_time: string
          status: string | null
          subtotal_amount: number | null
          total_amount: number | null
          total_members: number
          updated_at: string | null
        }
        Insert: {
          auto_gratuity_percentage?: number | null
          balance_due?: number | null
          booking_date: string
          cancellation_notice_hours?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          confirmed_members?: number | null
          created_at?: string | null
          created_by?: string | null
          deposit_paid?: number | null
          deposit_required?: number | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_time?: string | null
          group_name?: string | null
          group_type?: string
          id?: string
          internal_notes?: string | null
          lead_customer_id?: string | null
          lead_email: string
          lead_name: string
          lead_phone?: string | null
          member_registration_deadline?: string | null
          package_id?: string | null
          payment_status?: string | null
          payment_type?: string | null
          scheduling_type?: string | null
          setup_requirements?: string | null
          share_code?: string | null
          share_link_active?: boolean | null
          special_requests?: string | null
          start_time: string
          status?: string | null
          subtotal_amount?: number | null
          total_amount?: number | null
          total_members?: number
          updated_at?: string | null
        }
        Update: {
          auto_gratuity_percentage?: number | null
          balance_due?: number | null
          booking_date?: string
          cancellation_notice_hours?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          confirmed_members?: number | null
          created_at?: string | null
          created_by?: string | null
          deposit_paid?: number | null
          deposit_required?: number | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_time?: string | null
          group_name?: string | null
          group_type?: string
          id?: string
          internal_notes?: string | null
          lead_customer_id?: string | null
          lead_email?: string
          lead_name?: string
          lead_phone?: string | null
          member_registration_deadline?: string | null
          package_id?: string | null
          payment_status?: string | null
          payment_type?: string | null
          scheduling_type?: string | null
          setup_requirements?: string | null
          share_code?: string | null
          share_link_active?: boolean | null
          special_requests?: string | null
          start_time?: string
          status?: string | null
          subtotal_amount?: number | null
          total_amount?: number | null
          total_members?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_bookings_lead_customer_id_fkey"
            columns: ["lead_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "group_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          added_by: string | null
          appointment_id: string | null
          checked_in_at: string | null
          created_at: string | null
          customer_id: string | null
          deposit_amount: number | null
          discount_amount: number | null
          duration_minutes: number | null
          final_amount: number | null
          group_booking_id: string | null
          id: string
          is_lead: boolean | null
          member_email: string | null
          member_name: string
          member_phone: string | null
          notes: string | null
          payment_status: string | null
          registration_token: string | null
          scheduled_time: string | null
          service_amount: number | null
          service_completed_at: string | null
          service_id: string | null
          service_started_at: string | null
          special_requirements: string | null
          staff_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          appointment_id?: string | null
          checked_in_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          discount_amount?: number | null
          duration_minutes?: number | null
          final_amount?: number | null
          group_booking_id?: string | null
          id?: string
          is_lead?: boolean | null
          member_email?: string | null
          member_name: string
          member_phone?: string | null
          notes?: string | null
          payment_status?: string | null
          registration_token?: string | null
          scheduled_time?: string | null
          service_amount?: number | null
          service_completed_at?: string | null
          service_id?: string | null
          service_started_at?: string | null
          special_requirements?: string | null
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          appointment_id?: string | null
          checked_in_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          discount_amount?: number | null
          duration_minutes?: number | null
          final_amount?: number | null
          group_booking_id?: string | null
          id?: string
          is_lead?: boolean | null
          member_email?: string | null
          member_name?: string
          member_phone?: string | null
          notes?: string | null
          payment_status?: string | null
          registration_token?: string | null
          scheduled_time?: string | null
          service_amount?: number | null
          service_completed_at?: string | null
          service_id?: string | null
          service_started_at?: string | null
          special_requirements?: string | null
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_group_booking_id_fkey"
            columns: ["group_booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_with_variants"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "group_members_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      group_package_services: {
        Row: {
          addon_price: number | null
          created_at: string | null
          id: string
          is_included: boolean | null
          is_required: boolean | null
          order_position: number | null
          package_id: string | null
          service_id: string | null
        }
        Insert: {
          addon_price?: number | null
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          is_required?: boolean | null
          order_position?: number | null
          package_id?: string | null
          service_id?: string | null
        }
        Update: {
          addon_price?: number | null
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          is_required?: boolean | null
          order_position?: number | null
          package_id?: string | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_package_services_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "group_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_package_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_package_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_with_variants"
            referencedColumns: ["service_id"]
          },
        ]
      }
      group_packages: {
        Row: {
          base_price: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          group_type: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_members: number | null
          min_members: number | null
          name: string
          per_person_price: number | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          group_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_members?: number | null
          min_members?: number | null
          name: string
          per_person_price?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          group_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_members?: number | null
          min_members?: number | null
          name?: string
          per_person_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      group_pricing_tiers: {
        Row: {
          created_at: string | null
          discount_percentage: number
          id: string
          is_active: boolean | null
          max_size: number | null
          min_size: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean | null
          max_size?: number | null
          min_size: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean | null
          max_size?: number | null
          min_size?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      guarantees: {
        Row: {
          created_at: string | null
          description: string
          display_order: number | null
          guarantee_type: string
          icon: string | null
          id: string
          is_active: boolean | null
          terms: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order?: number | null
          guarantee_type: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          terms?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number | null
          guarantee_type?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          terms?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      instagram_posts: {
        Row: {
          caption: string | null
          comments: number | null
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string
          is_published: boolean | null
          likes: number | null
          timestamp: string | null
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          comments?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url: string
          is_published?: boolean | null
          likes?: number | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          comments?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string
          is_published?: boolean | null
          likes?: number | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      instagram_stories: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          is_viewed: boolean | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          is_viewed?: boolean | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          is_viewed?: boolean | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          barcode: string | null
          brand: string | null
          category: string | null
          created_at: string | null
          current_stock: number | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          last_received_date: string | null
          last_reorder_date: string | null
          lead_time_days: number | null
          linked_service_ids: string[] | null
          location: string | null
          max_stock: number | null
          name: string
          reorder_point: number
          reorder_quantity: number
          reserved_stock: number | null
          retail_price: number | null
          sku: string
          supplier_id: string | null
          unit_cost: number
          updated_at: string | null
          usage_per_service: number | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_received_date?: string | null
          last_reorder_date?: string | null
          lead_time_days?: number | null
          linked_service_ids?: string[] | null
          location?: string | null
          max_stock?: number | null
          name: string
          reorder_point: number
          reorder_quantity: number
          reserved_stock?: number | null
          retail_price?: number | null
          sku: string
          supplier_id?: string | null
          unit_cost: number
          updated_at?: string | null
          usage_per_service?: number | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_received_date?: string | null
          last_reorder_date?: string | null
          lead_time_days?: number | null
          linked_service_ids?: string[] | null
          location?: string | null
          max_stock?: number | null
          name?: string
          reorder_point?: number
          reorder_quantity?: number
          reserved_stock?: number | null
          retail_price?: number | null
          sku?: string
          supplier_id?: string | null
          unit_cost?: number
          updated_at?: string | null
          usage_per_service?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string
          notes: string | null
          performed_by: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id: string
          notes?: string | null
          performed_by?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          notes?: string | null
          performed_by?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_at: string | null
          cover_letter: string | null
          email: string
          experience: string | null
          full_name: string
          id: string
          job_opening_id: string | null
          phone: string | null
          resume_url: string | null
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          cover_letter?: string | null
          email: string
          experience?: string | null
          full_name: string
          id?: string
          job_opening_id?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          cover_letter?: string | null
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          job_opening_id?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_opening_id_fkey"
            columns: ["job_opening_id"]
            isOneToOne: false
            referencedRelation: "job_openings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_openings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          location: string
          requirements: string | null
          salary_range: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          requirements?: string | null
          salary_range?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          requirements?: string | null
          salary_range?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      lead_magnet_downloads: {
        Row: {
          created_at: string | null
          customer_id: string | null
          downloaded_at: string | null
          email: string
          id: string
          ip_address: unknown
          magnet_id: string
          name: string | null
          phone: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          downloaded_at?: string | null
          email: string
          id?: string
          ip_address?: unknown
          magnet_id: string
          name?: string | null
          phone?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          downloaded_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          magnet_id?: string
          name?: string | null
          phone?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_magnet_downloads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_magnet_downloads_magnet_id_fkey"
            columns: ["magnet_id"]
            isOneToOne: false
            referencedRelation: "lead_magnets"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_magnets: {
        Row: {
          conversion_rate: number | null
          created_at: string | null
          description: string | null
          download_count: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          magnet_type: string
          name: string
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          magnet_type: string
          name: string
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          magnet_type?: string
          name?: string
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_rewards: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          discount_amount: number | null
          id: string
          is_active: boolean | null
          name: string
          points_required: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          points_required: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_required?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          points_change: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          points_change: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          points_change?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          budget: number | null
          campaign_type: string
          click_rate: number | null
          completed_at: string | null
          content: Json
          conversion_count: number | null
          conversion_rate: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          open_rate: number | null
          schedule_at: string | null
          sent_count: number | null
          spent: number | null
          started_at: string | null
          status: string | null
          target_criteria: Json | null
          target_segment_id: string | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          campaign_type: string
          click_rate?: number | null
          completed_at?: string | null
          content: Json
          conversion_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          open_rate?: number | null
          schedule_at?: string | null
          sent_count?: number | null
          spent?: number | null
          started_at?: string | null
          status?: string | null
          target_criteria?: Json | null
          target_segment_id?: string | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          campaign_type?: string
          click_rate?: number | null
          completed_at?: string | null
          content?: Json
          conversion_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          open_rate?: number | null
          schedule_at?: string | null
          sent_count?: number | null
          spent?: number | null
          started_at?: string | null
          status?: string | null
          target_criteria?: Json | null
          target_segment_id?: string | null
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_target_segment_id_fkey"
            columns: ["target_segment_id"]
            isOneToOne: false
            referencedRelation: "customer_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_triggers: {
        Row: {
          campaign_template_id: string | null
          channel: string
          conditions: Json | null
          content: Json
          created_at: string | null
          delay_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          total_converted: number | null
          total_triggered: number | null
          trigger_event: string
        }
        Insert: {
          campaign_template_id?: string | null
          channel: string
          conditions?: Json | null
          content: Json
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          total_converted?: number | null
          total_triggered?: number | null
          trigger_event: string
        }
        Update: {
          campaign_template_id?: string | null
          channel?: string
          conditions?: Json | null
          content?: Json
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          total_converted?: number | null
          total_triggered?: number | null
          trigger_event?: string
        }
        Relationships: []
      }
      membership_credit_transactions: {
        Row: {
          created_at: string | null
          credits_change: number
          description: string | null
          id: string
          membership_id: string | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string | null
        }
        Insert: {
          created_at?: string | null
          credits_change: number
          description?: string | null
          id?: string
          membership_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string | null
        }
        Update: {
          created_at?: string | null
          credits_change?: number
          description?: string | null
          id?: string
          membership_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_credit_transactions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "user_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_perk_usage: {
        Row: {
          appointment_id: string | null
          description: string | null
          id: string
          membership_id: string | null
          perk_type: string | null
          used_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          description?: string | null
          id?: string
          membership_id?: string | null
          perk_type?: string | null
          used_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          description?: string | null
          id?: string
          membership_id?: string | null
          perk_type?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_perk_usage_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_perk_usage_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_perk_usage_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "user_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_tiers: {
        Row: {
          annual_price: number | null
          badge: string | null
          created_at: string | null
          credit_value: number
          credits_per_month: number
          description: string | null
          discount_percentage: number | null
          display_order: number | null
          features: Json | null
          free_upgrades_per_month: number | null
          house_calls_per_year: number | null
          id: string
          is_active: boolean | null
          max_guests: number | null
          monthly_price: number
          name: string
          priority_booking: boolean | null
          rollover_credits: boolean | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          annual_price?: number | null
          badge?: string | null
          created_at?: string | null
          credit_value: number
          credits_per_month: number
          description?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          features?: Json | null
          free_upgrades_per_month?: number | null
          house_calls_per_year?: number | null
          id?: string
          is_active?: boolean | null
          max_guests?: number | null
          monthly_price: number
          name: string
          priority_booking?: boolean | null
          rollover_credits?: boolean | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          annual_price?: number | null
          badge?: string | null
          created_at?: string | null
          credit_value?: number
          credits_per_month?: number
          description?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          features?: Json | null
          free_upgrades_per_month?: number | null
          house_calls_per_year?: number | null
          id?: string
          is_active?: boolean | null
          max_guests?: number | null
          monthly_price?: number
          name?: string
          priority_booking?: boolean | null
          rollover_credits?: boolean | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string | null
          html_body: string | null
          id: string
          is_active: boolean | null
          name: string
          preview_text: string | null
          subject: string | null
          template_type: string
          updated_at: string | null
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string | null
          html_body?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          preview_text?: string | null
          subject?: string | null
          template_type: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string | null
          html_body?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_text?: string | null
          subject?: string | null
          template_type?: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          email_sent: boolean | null
          id: string
          is_active: boolean | null
          name: string | null
          source: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_sent?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_sent?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      offline_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          data: Json
          entity_type: string
          expires_at: string | null
          id: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          data: Json
          entity_type: string
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          data?: Json
          entity_type?: string
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      offline_sync_queue: {
        Row: {
          created_at: string | null
          device_id: string
          entity_id: string | null
          entity_type: string
          error_message: string | null
          id: string
          operation: string
          payload: Json
          retry_count: number | null
          sync_status: string | null
          synced_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          entity_id?: string | null
          entity_type: string
          error_message?: string | null
          id?: string
          operation: string
          payload: Json
          retry_count?: number | null
          sync_status?: string | null
          synced_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          entity_id?: string | null
          entity_type?: string
          error_message?: string | null
          id?: string
          operation?: string
          payload?: Json
          retry_count?: number | null
          sync_status?: string | null
          synced_at?: string | null
        }
        Relationships: []
      }
      operating_hours: {
        Row: {
          close_time: string
          created_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean | null
          open_time: string
          updated_at: string | null
        }
        Insert: {
          close_time: string
          created_at?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          open_time: string
          updated_at?: string | null
        }
        Update: {
          close_time?: string
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          open_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          payment_intent_id: string | null
          shipping: number | null
          shipping_address: string | null
          status: string | null
          subtotal: number | null
          tax: number | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          shipping?: number | null
          shipping_address?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          shipping?: number | null
          shipping_address?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          bonus_items: Json | null
          created_at: string | null
          description: string | null
          discounted_price: number
          expires_at: string | null
          id: string
          image_url: string | null
          included_services: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          limited_quantity: number | null
          name: string
          package_type: string
          regular_price: number
          remaining_quantity: number | null
          savings_amount: number | null
          savings_percentage: number | null
          slug: string
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          bonus_items?: Json | null
          created_at?: string | null
          description?: string | null
          discounted_price: number
          expires_at?: string | null
          id?: string
          image_url?: string | null
          included_services?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          limited_quantity?: number | null
          name: string
          package_type: string
          regular_price: number
          remaining_quantity?: number | null
          savings_amount?: number | null
          savings_percentage?: number | null
          slug: string
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          bonus_items?: Json | null
          created_at?: string | null
          description?: string | null
          discounted_price?: number
          expires_at?: string | null
          id?: string
          image_url?: string | null
          included_services?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          limited_quantity?: number | null
          name?: string
          package_type?: string
          regular_price?: number
          remaining_quantity?: number | null
          savings_amount?: number | null
          savings_percentage?: number | null
          slug?: string
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: string
          payment_intent_id: string | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: string
          payment_intent_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: string
          payment_intent_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_checkout: {
        Row: {
          appointment_id: string | null
          business_address: string | null
          business_name: string | null
          business_phone: string | null
          cart_items: Json
          completed_at: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discount: number
          expires_at: string
          id: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          session_code: string
          staff_id: string | null
          staff_name: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          tip_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          business_address?: string | null
          business_name?: string | null
          business_phone?: string | null
          cart_items?: Json
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number
          expires_at?: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          session_code: string
          staff_id?: string | null
          staff_name?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          tip_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          business_address?: string | null
          business_name?: string | null
          business_phone?: string | null
          cart_items?: Json
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number
          expires_at?: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          session_code?: string
          staff_id?: string | null
          staff_name?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          tip_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_checkout_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_checkout_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_checkout_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_checkouts: {
        Row: {
          appointment_id: string | null
          client_name: string
          completed_at: string | null
          created_at: string | null
          id: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          services: Json
          staff_name: string | null
          status: string
          subtotal: number
          tax_amount: number
          tip_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          client_name: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          services?: Json
          staff_name?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tip_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          client_name?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          services?: Json
          staff_name?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tip_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      personal_tasks: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          description: string
          duration_minutes: number
          id: number
          staff_id: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          description: string
          duration_minutes: number
          id?: number
          staff_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: number
          staff_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          review_text: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          review_text: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          review_text?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          average_rating: number | null
          brand: string | null
          category: string
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          ingredients: string | null
          is_active: boolean | null
          name: string
          price: number
          review_count: number | null
          sale_price: number | null
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
          usage_instructions: string | null
          weight: string | null
        }
        Insert: {
          average_rating?: number | null
          brand?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_active?: boolean | null
          name: string
          price: number
          review_count?: number | null
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          usage_instructions?: string | null
          weight?: string | null
        }
        Update: {
          average_rating?: number | null
          brand?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          review_count?: number | null
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          usage_instructions?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          loyalty_points: number | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          loyalty_points?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          loyalty_points?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          id: string
          inventory_item_id: string
          notes: string | null
          purchase_order_id: string
          quantity_ordered: number
          quantity_received: number | null
          total_cost: number
          unit_cost: number
        }
        Insert: {
          id?: string
          inventory_item_id: string
          notes?: string | null
          purchase_order_id: string
          quantity_ordered: number
          quantity_received?: number | null
          total_cost: number
          unit_cost: number
        }
        Update: {
          id?: string
          inventory_item_id?: string
          notes?: string | null
          purchase_order_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          expected_delivery_date: string | null
          id: string
          is_auto_generated: boolean | null
          notes: string | null
          order_date: string | null
          order_number: string
          received_date: string | null
          shipping_cost: number | null
          status: string | null
          subtotal: number | null
          supplier_id: string | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          is_auto_generated?: boolean | null
          notes?: string | null
          order_date?: string | null
          order_number: string
          received_date?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          is_auto_generated?: boolean | null
          notes?: string | null
          order_date?: string | null
          order_number?: string
          received_date?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_feedback: {
        Row: {
          created_at: string | null
          customer_id: string
          feedback_reason: string | null
          feedback_type: string
          id: string
          recommendation_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          feedback_reason?: string | null
          feedback_type: string
          id?: string
          recommendation_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          feedback_reason?: string | null
          feedback_type?: string
          id?: string
          recommendation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_feedback_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_feedback_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "service_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_programs: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          max_referrals_per_customer: number | null
          minimum_purchase: number | null
          name: string
          program_type: string
          referee_reward_type: string
          referee_reward_value: number
          referrer_reward_type: string
          referrer_reward_value: number
          terms_and_conditions: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_referrals_per_customer?: number | null
          minimum_purchase?: number | null
          name: string
          program_type: string
          referee_reward_type: string
          referee_reward_value: number
          referrer_reward_type: string
          referrer_reward_value: number
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_referrals_per_customer?: number | null
          minimum_purchase?: number | null
          name?: string
          program_type?: string
          referee_reward_type?: string
          referee_reward_value?: number
          referrer_reward_type?: string
          referrer_reward_value?: number
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          claimed: boolean | null
          claimed_at: string | null
          created_at: string | null
          id: string
          points_required: number
          reward_description: string | null
          reward_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          points_required: number
          reward_description?: string | null
          reward_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          points_required?: number
          reward_description?: string | null
          reward_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          joined_date: string | null
          referral_code: string
          referred_email: string
          referred_name: string | null
          referrer_user_id: string
          reward_points: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_date?: string | null
          referral_code: string
          referred_email: string
          referred_name?: string | null
          referrer_user_id: string
          reward_points?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_date?: string | null
          referral_code?: string
          referred_email?: string
          referred_name?: string | null
          referrer_user_id?: string
          reward_points?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_analytics: {
        Row: {
          average_rating: number | null
          average_response_time: number | null
          average_sentiment: number | null
          created_at: string | null
          id: string
          negative_count: number | null
          neutral_count: number | null
          nps_score: number | null
          period_end: string
          period_start: string
          period_type: string
          positive_count: number | null
          response_rate: number | null
          service_id: string | null
          staff_id: string | null
          top_negative_topics: string[] | null
          top_positive_topics: string[] | null
          total_reviews: number | null
        }
        Insert: {
          average_rating?: number | null
          average_response_time?: number | null
          average_sentiment?: number | null
          created_at?: string | null
          id?: string
          negative_count?: number | null
          neutral_count?: number | null
          nps_score?: number | null
          period_end: string
          period_start: string
          period_type: string
          positive_count?: number | null
          response_rate?: number | null
          service_id?: string | null
          staff_id?: string | null
          top_negative_topics?: string[] | null
          top_positive_topics?: string[] | null
          total_reviews?: number | null
        }
        Update: {
          average_rating?: number | null
          average_response_time?: number | null
          average_sentiment?: number | null
          created_at?: string | null
          id?: string
          negative_count?: number | null
          neutral_count?: number | null
          nps_score?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          positive_count?: number | null
          response_rate?: number | null
          service_id?: string | null
          staff_id?: string | null
          top_negative_topics?: string[] | null
          top_positive_topics?: string[] | null
          total_reviews?: number | null
        }
        Relationships: []
      }
      review_response_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          rating_range: unknown
          sentiment_type: string
          template_text: string
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rating_range?: unknown
          sentiment_type: string
          template_text: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rating_range?: unknown
          sentiment_type?: string
          template_text?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: []
      }
      schedule_changes: {
        Row: {
          change_type: string
          changed_by: string
          created_at: string | null
          id: string
          is_synced: boolean | null
          new_value: Json | null
          previous_value: Json | null
          schedule_date: string | null
          slot_id: string | null
        }
        Insert: {
          change_type: string
          changed_by: string
          created_at?: string | null
          id?: string
          is_synced?: boolean | null
          new_value?: Json | null
          previous_value?: Json | null
          schedule_date?: string | null
          slot_id?: string | null
        }
        Update: {
          change_type?: string
          changed_by?: string
          created_at?: string | null
          id?: string
          is_synced?: boolean | null
          new_value?: Json | null
          previous_value?: Json | null
          schedule_date?: string | null
          slot_id?: string | null
        }
        Relationships: []
      }
      schedule_conflicts: {
        Row: {
          conflict_type: string
          conflicting_slot_ids: string[] | null
          detected_at: string | null
          detected_by: string | null
          id: string
          merge_data: Json | null
          resolution: string | null
          resolution_status: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          conflict_type: string
          conflicting_slot_ids?: string[] | null
          detected_at?: string | null
          detected_by?: string | null
          id?: string
          merge_data?: Json | null
          resolution?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          conflict_type?: string
          conflicting_slot_ids?: string[] | null
          detected_at?: string | null
          detected_by?: string | null
          id?: string
          merge_data?: Json | null
          resolution?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: []
      }
      schedule_locks: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          lock_type: string | null
          locked_by: string
          slot_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          lock_type?: string | null
          locked_by: string
          slot_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          lock_type?: string | null
          locked_by?: string
          slot_id?: string
        }
        Relationships: []
      }
      schedule_presence: {
        Row: {
          created_at: string | null
          cursor_position: Json | null
          id: string
          is_active: boolean | null
          last_activity: string | null
          selected_slots: string[] | null
          staff_id: string
          viewing_date: string
        }
        Insert: {
          created_at?: string | null
          cursor_position?: Json | null
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          selected_slots?: string[] | null
          staff_id: string
          viewing_date: string
        }
        Update: {
          created_at?: string | null
          cursor_position?: Json | null
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          selected_slots?: string[] | null
          staff_id?: string
          viewing_date?: string
        }
        Relationships: []
      }
      service_bundles: {
        Row: {
          bundle_price: number
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_percent: number | null
          id: string
          image_url: string | null
          individual_price: number | null
          is_active: boolean | null
          max_uses: number | null
          name: string
          savings_amount: number | null
          services: Json
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          bundle_price: number
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_percent?: number | null
          id?: string
          image_url?: string | null
          individual_price?: number | null
          is_active?: boolean | null
          max_uses?: number | null
          name: string
          savings_amount?: number | null
          services: Json
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          bundle_price?: number
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_percent?: number | null
          id?: string
          image_url?: string | null
          individual_price?: number | null
          is_active?: boolean | null
          max_uses?: number | null
          name?: string
          savings_amount?: number | null
          services?: Json
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      service_recommendations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          customer_id: string
          expires_at: string | null
          factors: Json | null
          id: string
          is_accepted: boolean | null
          is_shown: boolean | null
          reasoning: string | null
          recommendation_type: string
          score: number
          service_id: string
          shown_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          customer_id: string
          expires_at?: string | null
          factors?: Json | null
          id?: string
          is_accepted?: boolean | null
          is_shown?: boolean | null
          reasoning?: string | null
          recommendation_type: string
          score: number
          service_id: string
          shown_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          customer_id?: string
          expires_at?: string | null
          factors?: Json | null
          id?: string
          is_accepted?: boolean | null
          is_shown?: boolean | null
          reasoning?: string | null
          recommendation_type?: string
          score?: number
          service_id?: string
          shown_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_recommendations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_tiers: {
        Row: {
          created_at: string | null
          duration_minutes: number
          id: string
          included_features: Json | null
          is_active: boolean | null
          price: number
          service_id: string
          sort_order: number | null
          tier_description: string | null
          tier_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes: number
          id?: string
          included_features?: Json | null
          is_active?: boolean | null
          price: number
          service_id: string
          sort_order?: number | null
          tier_description?: string | null
          tier_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          id?: string
          included_features?: Json | null
          is_active?: boolean | null
          price?: number
          service_id?: string
          sort_order?: number | null
          tier_description?: string | null
          tier_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_tiers_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tiers_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_with_variants"
            referencedColumns: ["service_id"]
          },
        ]
      }
      service_upsells: {
        Row: {
          acceptance_rate: number | null
          created_at: string | null
          description: string | null
          discounted_price: number | null
          id: string
          is_active: boolean | null
          regular_price: number | null
          service_id: string
          sort_order: number | null
          title: string
          updated_at: string | null
          upsell_product_id: string | null
          upsell_service_id: string | null
          upsell_type: string
        }
        Insert: {
          acceptance_rate?: number | null
          created_at?: string | null
          description?: string | null
          discounted_price?: number | null
          id?: string
          is_active?: boolean | null
          regular_price?: number | null
          service_id: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
          upsell_product_id?: string | null
          upsell_service_id?: string | null
          upsell_type: string
        }
        Update: {
          acceptance_rate?: number | null
          created_at?: string | null
          description?: string | null
          discounted_price?: number | null
          id?: string
          is_active?: boolean | null
          regular_price?: number | null
          service_id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          upsell_product_id?: string | null
          upsell_service_id?: string | null
          upsell_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_upsells_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_upsells_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_with_variants"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_upsells_upsell_product_id_fkey"
            columns: ["upsell_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_upsells_upsell_service_id_fkey"
            columns: ["upsell_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_upsells_upsell_service_id_fkey"
            columns: ["upsell_service_id"]
            isOneToOne: false
            referencedRelation: "services_with_variants"
            referencedColumns: ["service_id"]
          },
        ]
      }
      service_variants: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          price: number
          service_id: string
          sort_order: number
          updated_at: string
          variant_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          price: number
          service_id: string
          sort_order?: number
          updated_at?: string
          variant_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          price?: number
          service_id?: string
          sort_order?: number
          updated_at?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_variants_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_variants_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_with_variants"
            referencedColumns: ["service_id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          category_order: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          duration_minutes: number
          group_booking_enabled: boolean | null
          has_variants: boolean
          id: string
          image_url: string | null
          is_active: boolean | null
          is_parent: boolean | null
          max_group_capacity: number | null
          min_group_size: number | null
          name: string
          parent_service_id: string | null
          price: number
        }
        Insert: {
          category: string
          category_order?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes: number
          group_booking_enabled?: boolean | null
          has_variants?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_parent?: boolean | null
          max_group_capacity?: number | null
          min_group_size?: number | null
          name: string
          parent_service_id?: string | null
          price: number
        }
        Update: {
          category?: string
          category_order?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number
          group_booking_enabled?: boolean | null
          has_variants?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_parent?: boolean | null
          max_group_capacity?: number | null
          min_group_size?: number | null
          name?: string
          parent_service_id?: string | null
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_parent_service_id_fkey"
            columns: ["parent_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_parent_service_id_fkey"
            columns: ["parent_service_id"]
            isOneToOne: false
            referencedRelation: "services_with_variants"
            referencedColumns: ["service_id"]
          },
        ]
      }
      staff: {
        Row: {
          access_level: string | null
          avatar: string | null
          color: string | null
          created_at: string | null
          first_name: string
          id: string
          last_name: string | null
          name: string
          password: string | null
          password_hash: string | null
          password_salt: string | null
          role: string | null
          specialty: string | null
          status: string | null
          temp_password: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          access_level?: string | null
          avatar?: string | null
          color?: string | null
          created_at?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          name: string
          password?: string | null
          password_hash?: string | null
          password_salt?: string | null
          role?: string | null
          specialty?: string | null
          status?: string | null
          temp_password?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          access_level?: string | null
          avatar?: string | null
          color?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          name?: string
          password?: string | null
          password_hash?: string | null
          password_salt?: string | null
          role?: string | null
          specialty?: string | null
          status?: string | null
          temp_password?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      staff_availability: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          is_available: boolean
          staff_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time?: string
          id?: string
          is_available?: boolean
          staff_id: string
          start_time?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean
          staff_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_commissions: {
        Row: {
          amount: number
          commission_type: string
          created_at: string | null
          id: string
          notes: string | null
          paid_date: string | null
          rate: number | null
          source_id: string | null
          staff_id: string
          status: string | null
        }
        Insert: {
          amount: number
          commission_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          rate?: number | null
          source_id?: string | null
          staff_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          commission_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          rate?: number | null
          source_id?: string | null
          staff_id?: string
          status?: string | null
        }
        Relationships: []
      }
      staff_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          goal_type: string
          id: string
          period_end: string
          period_start: string
          period_type: string
          staff_id: string
          status: string | null
          target_value: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          goal_type: string
          id?: string
          period_end: string
          period_start: string
          period_type: string
          staff_id: string
          status?: string | null
          target_value: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          goal_type?: string
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          staff_id?: string
          status?: string | null
          target_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_performance_metrics: {
        Row: {
          average_rating: number | null
          average_service_duration: number | null
          cancelled_appointments: number | null
          completed_appointments: number | null
          created_at: string | null
          id: string
          metric_date: string
          new_clients_served: number | null
          no_show_appointments: number | null
          product_revenue: number | null
          products_sold: number | null
          rebooking_rate: number | null
          returning_clients_served: number | null
          revenue_generated: number | null
          reviews_received: number | null
          staff_id: string
          tips_received: number | null
          total_appointments: number | null
          utilization_rate: number | null
        }
        Insert: {
          average_rating?: number | null
          average_service_duration?: number | null
          cancelled_appointments?: number | null
          completed_appointments?: number | null
          created_at?: string | null
          id?: string
          metric_date: string
          new_clients_served?: number | null
          no_show_appointments?: number | null
          product_revenue?: number | null
          products_sold?: number | null
          rebooking_rate?: number | null
          returning_clients_served?: number | null
          revenue_generated?: number | null
          reviews_received?: number | null
          staff_id: string
          tips_received?: number | null
          total_appointments?: number | null
          utilization_rate?: number | null
        }
        Update: {
          average_rating?: number | null
          average_service_duration?: number | null
          cancelled_appointments?: number | null
          completed_appointments?: number | null
          created_at?: string | null
          id?: string
          metric_date?: string
          new_clients_served?: number | null
          no_show_appointments?: number | null
          product_revenue?: number | null
          products_sold?: number | null
          rebooking_rate?: number | null
          returning_clients_served?: number | null
          revenue_generated?: number | null
          reviews_received?: number | null
          staff_id?: string
          tips_received?: number | null
          total_appointments?: number | null
          utilization_rate?: number | null
        }
        Relationships: []
      }
      staff_permissions: {
        Row: {
          analytics_access: boolean
          calendar_access: boolean
          checkout_access: boolean
          created_at: string
          customer_management_access: boolean
          id: string
          inventory_access: boolean
          read_only_mode: boolean
          settings_access: boolean
          staff_id: string
          updated_at: string
        }
        Insert: {
          analytics_access?: boolean
          calendar_access?: boolean
          checkout_access?: boolean
          created_at?: string
          customer_management_access?: boolean
          id?: string
          inventory_access?: boolean
          read_only_mode?: boolean
          settings_access?: boolean
          staff_id: string
          updated_at?: string
        }
        Update: {
          analytics_access?: boolean
          calendar_access?: boolean
          checkout_access?: boolean
          created_at?: string
          customer_management_access?: boolean
          id?: string
          inventory_access?: boolean
          read_only_mode?: boolean
          settings_access?: boolean
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_permissions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schedules: {
        Row: {
          break_end: string | null
          break_start: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          staff_id: string
          start_time: string
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          staff_id: string
          start_time: string
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          staff_id?: string
          start_time?: string
        }
        Relationships: []
      }
      staff_time_off: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          end_date: string
          id: string
          notes: string | null
          reason: string | null
          staff_id: string
          start_date: string
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          notes?: string | null
          reason?: string | null
          staff_id: string
          start_date: string
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          reason?: string | null
          staff_id?: string
          start_date?: string
          status?: string | null
        }
        Relationships: []
      }
      staff_working_hours: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          staff_id: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          staff_id: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          staff_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_working_hours_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staffing_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          current_staff_count: number | null
          expected_demand: number | null
          id: string
          notes: string | null
          recommendation_date: string
          recommended_staff_count: number
          service_category: string | null
          status: string | null
          time_slot_end: string
          time_slot_start: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          current_staff_count?: number | null
          expected_demand?: number | null
          id?: string
          notes?: string | null
          recommendation_date: string
          recommended_staff_count: number
          service_category?: string | null
          status?: string | null
          time_slot_end: string
          time_slot_start: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          current_staff_count?: number | null
          expected_demand?: number | null
          id?: string
          notes?: string | null
          recommendation_date?: string
          recommended_staff_count?: number
          service_category?: string | null
          status?: string | null
          time_slot_end?: string
          time_slot_start?: string
        }
        Relationships: []
      }
      subscription_boxes: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          included_products: Json | null
          is_active: boolean | null
          monthly_price: number
          name: string
          retail_value: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          included_products?: Json | null
          is_active?: boolean | null
          monthly_price: number
          name: string
          retail_value: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          included_products?: Json | null
          is_active?: boolean | null
          monthly_price?: number
          name?: string
          retail_value?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          rating: number | null
          state: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          state?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          state?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      sync_state: {
        Row: {
          created_at: string | null
          device_id: string
          id: string
          last_sync_version: number | null
          last_synced_at: string | null
          sync_cursor: string | null
          table_name: string
        }
        Insert: {
          created_at?: string | null
          device_id: string
          id?: string
          last_sync_version?: number | null
          last_synced_at?: string | null
          sync_cursor?: string | null
          table_name: string
        }
        Update: {
          created_at?: string | null
          device_id?: string
          id?: string
          last_sync_version?: number | null
          last_synced_at?: string | null
          sync_cursor?: string | null
          table_name?: string
        }
        Relationships: []
      }
      terminal_checkouts: {
        Row: {
          amount: number
          appointment_id: string | null
          cancel_reason: string | null
          cart_items: Json | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          device_id: string
          id: string
          payment_id: string | null
          reference_id: string | null
          staff_id: string | null
          status: string
          tip_amount: number | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          cancel_reason?: string | null
          cart_items?: Json | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          device_id: string
          id: string
          payment_id?: string | null
          reference_id?: string | null
          staff_id?: string | null
          status?: string
          tip_amount?: number | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          cancel_reason?: string | null
          cart_items?: Json | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          device_id?: string
          id?: string
          payment_id?: string | null
          reference_id?: string | null
          staff_id?: string | null
          status?: string
          tip_amount?: number | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terminal_checkouts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terminal_checkouts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terminal_checkouts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terminal_checkouts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terminal_checkouts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      terminal_devices: {
        Row: {
          code: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          location_id: string | null
          name: string
          paired_at: string | null
          product_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id: string
          is_default?: boolean | null
          location_id?: string | null
          name?: string
          paired_at?: string | null
          product_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          location_id?: string | null
          name?: string
          paired_at?: string | null
          product_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transaction_items: {
        Row: {
          created_at: string | null
          discount_applied: number | null
          id: string
          item_id: string | null
          item_type: string
          price_per_unit: number
          quantity: number
          service_provider_id: string | null
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          discount_applied?: number | null
          id?: string
          item_id?: string | null
          item_type: string
          price_per_unit: number
          quantity?: number
          service_provider_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          discount_applied?: number | null
          id?: string
          item_id?: string | null
          item_type?: string
          price_per_unit?: number
          quantity?: number
          service_provider_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          checkout_time: string | null
          created_at: string | null
          customer_id: string | null
          deposit_amount: number | null
          discount_amount: number | null
          final_due_amount: number
          id: string
          staff_id: string | null
          status: string | null
          tax_amount: number | null
          tip_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          checkout_time?: string | null
          created_at?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          discount_amount?: number | null
          final_due_amount: number
          id?: string
          staff_id?: string | null
          status?: string | null
          tax_amount?: number | null
          tip_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          checkout_time?: string | null
          created_at?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          discount_amount?: number | null
          final_due_amount?: number
          id?: string
          staff_id?: string | null
          status?: string | null
          tax_amount?: number | null
          tip_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      transformation_gallery: {
        Row: {
          after_image_url: string
          before_image_url: string
          created_at: string
          customer_consent: boolean
          description: string | null
          display_order: number | null
          id: string
          is_featured: boolean | null
          service_category: string
          updated_at: string
        }
        Insert: {
          after_image_url: string
          before_image_url: string
          created_at?: string
          customer_consent?: boolean
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          service_category: string
          updated_at?: string
        }
        Update: {
          after_image_url?: string
          before_image_url?: string
          created_at?: string
          customer_consent?: boolean
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          service_category?: string
          updated_at?: string
        }
        Relationships: []
      }
      ugc_posts: {
        Row: {
          author_email: string | null
          author_name: string
          caption: string | null
          comments: number | null
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string
          is_published: boolean | null
          likes: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          author_email?: string | null
          author_name: string
          caption?: string | null
          comments?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url: string
          is_published?: boolean | null
          likes?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          author_email?: string | null
          author_name?: string
          caption?: string | null
          comments?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string
          is_published?: boolean | null
          likes?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_memberships: {
        Row: {
          billing_cycle: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          credits_balance: number | null
          id: string
          last_billing_date: string | null
          next_billing_date: string | null
          paused_at: string | null
          started_at: string | null
          status: string | null
          tier_id: string | null
          total_paid: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_cycle?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          credits_balance?: number | null
          id?: string
          last_billing_date?: string | null
          next_billing_date?: string | null
          paused_at?: string | null
          started_at?: string | null
          status?: string | null
          tier_id?: string | null
          total_paid?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_cycle?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          credits_balance?: number | null
          id?: string
          last_billing_date?: string | null
          next_billing_date?: string | null
          paused_at?: string | null
          started_at?: string | null
          status?: string | null
          tier_id?: string | null
          total_paid?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_memberships_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      video_tutorials: {
        Row: {
          author: string
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          duration: string | null
          id: string
          is_published: boolean | null
          likes: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
          views: number | null
        }
        Insert: {
          author: string
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_published?: boolean | null
          likes?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
          views?: number | null
        }
        Update: {
          author?: string
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_published?: boolean | null
          likes?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
          views?: number | null
        }
        Relationships: []
      }
      waitlists: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          date: string
          id: string
          notes: string | null
          staff_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone: string
          date: string
          id?: string
          notes?: string | null
          staff_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          date?: string
          id?: string
          notes?: string | null
          staff_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      appointment_history: {
        Row: {
          appointment_date: string | null
          appointment_time: string | null
          created_at: string | null
          customer_name: string | null
          deposit_amount: number | null
          id: string | null
          notes: string | null
          payment_intent_id: string | null
          payment_status: string | null
          service_category: string | null
          service_id: string | null
          service_name: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_with_variants"
            referencedColumns: ["service_id"]
          },
        ]
      }
      services_with_variants: {
        Row: {
          base_duration: number | null
          base_price: number | null
          category: string | null
          has_variants: boolean | null
          image_url: string | null
          service_active: boolean | null
          service_created_at: string | null
          service_description: string | null
          service_id: string | null
          service_name: string | null
          starting_price: number | null
          variants: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_to_waitlist:
        | {
            Args: {
              p_customer_name: string
              p_customer_phone: string
              p_date: string
              p_notes?: string
              p_staff_id: string
              p_start_time: string
            }
            Returns: string
          }
        | {
            Args: {
              p_customer_name: string
              p_customer_phone: string
              p_date: string
              p_notes?: string
              p_staff_id: string
              p_start_time: string
            }
            Returns: string
          }
      calculate_group_totals: {
        Args: { p_group_id: string }
        Returns: undefined
      }
      cancel_appointment: {
        Args: {
          p_appointment_id: string
          p_cancellation_reason?: string
          p_cancelled_by?: string
        }
        Returns: Json
      }
      check_appointment_conflict_with_internal: {
        Args: {
          p_appointment_date: string
          p_appointment_time: string
          p_exclude_appointment_id?: string
          p_staff_id: string
        }
        Returns: boolean
      }
      cleanup_expired_checkouts: { Args: never; Returns: number }
      cleanup_old_audit_logs: { Args: never; Returns: undefined }
      create_personal_task:
        | {
            Args: {
              p_appointment_date: string
              p_appointment_time: string
              p_description: string
              p_duration_minutes?: number
              p_staff_id: string
            }
            Returns: string
          }
        | {
            Args: {
              appointmentdate: string
              appointmenttime: string
              description: string
              durationminutes?: number
              staffid: string
            }
            Returns: number
          }
        | {
            Args: {
              appointmentdate: string
              appointmenttime: string
              description: string
              durationminutes: number
              staffid: string
            }
            Returns: number
          }
      create_personal_task_uuid: {
        Args: {
          appointmentdate: string
          appointmenttime: string
          description: string
          durationminutes?: number
          staffid: string
        }
        Returns: number
      }
      finalize_transaction: { Args: { transaction_data: Json }; Returns: Json }
      generate_appointment_token: {
        Args: {
          p_action_type: string
          p_appointment_id: string
          p_validity_hours?: number
        }
        Returns: string
      }
      generate_session_code: { Args: never; Returns: string }
      generate_share_code: { Args: never; Returns: string }
      get_personal_tasks: {
        Args: { appointmentdate: string; staffid: string }
        Returns: {
          appointment_date: string
          appointment_time: string
          created_at: string
          description: string
          duration_minutes: number
          id: number
          staff_id: string
          status: string
        }[]
      }
      get_staff_working_hours: {
        Args: { p_date: string; p_staff_id: string }
        Returns: {
          end_time: string
          id: string
          is_available: boolean
          start_time: string
        }[]
      }
      get_waitlist_entries: {
        Args: { p_date?: string; p_staff_id?: string }
        Returns: {
          created_at: string
          customer_name: string
          customer_phone: string
          date: string
          id: string
          notes: string
          staff_id: string
          start_time: string
        }[]
      }
      increment_post_views: { Args: { post_uuid: string }; Returns: undefined }
      mark_appointment_arrived: {
        Args: { p_appointment_id: string; p_minutes_late?: number }
        Returns: Json
      }
      mark_token_used: { Args: { p_token: string }; Returns: boolean }
      reschedule_appointment: {
        Args: {
          p_new_date: string
          p_new_staff_id?: string
          p_new_time: string
          p_original_appointment_id: string
        }
        Returns: Json
      }
      search_glen_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          content: string
          id: string
          similarity: number
          title: string
        }[]
      }
      toggle_post_like: {
        Args: { post_uuid: string; user_uuid: string }
        Returns: number
      }
      toggle_reply_like: {
        Args: { reply_uuid: string; user_uuid: string }
        Returns: number
      }
      update_staff_working_hours: {
        Args: {
          p_date: string
          p_end_time: string
          p_is_available?: boolean
          p_staff_id: string
          p_start_time: string
        }
        Returns: string
      }
      use_membership_credits: {
        Args: {
          p_appointment_id: string
          p_credits_to_use: number
          p_description?: string
          p_membership_id: string
        }
        Returns: Json
      }
      verify_appointment_token: {
        Args: { p_action_type: string; p_token: string }
        Returns: {
          appointment_id: string
          error_message: string
          is_valid: boolean
        }[]
      }
      verify_square_config: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
