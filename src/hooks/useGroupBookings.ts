import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  GroupBooking,
  GroupMember,
  GroupPackage,
  GroupPricingTier,
  CreateGroupBookingInput,
  AddGroupMemberInput,
  UpdateGroupMemberInput,
  GroupStatus,
  PaymentStatus,
  MemberStatus,
} from '@/types/groupBooking';
import { toast } from 'sonner';
import { sendGroupBookingEmail, notifyLeadOfNewMember } from '@/lib/groupBookingEmails';

export function useGroupBookings() {
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all group bookings
  const fetchGroupBookings = useCallback(async (filters?: {
    status?: GroupStatus;
    dateFrom?: string;
    dateTo?: string;
    groupType?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('group_bookings')
        .select(`
          *,
          members:group_members(*)
        `)
        .order('booking_date', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('booking_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('booking_date', filters.dateTo);
      }
      if (filters?.groupType) {
        query = query.eq('group_type', filters.groupType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setGroupBookings(data as GroupBooking[] || []);
      return data as GroupBooking[];
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch group bookings');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single group booking by ID
  const fetchGroupBookingById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('group_bookings')
        .select(`
          *,
          members:group_members(
            *,
            service:services(id, name, price, duration_minutes),
            staff:staff(id, first_name, last_name)
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data as GroupBooking;
    } catch (err: any) {
      toast.error('Failed to fetch group booking');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch group booking by share code (for public access)
  const fetchByShareCode = useCallback(async (shareCode: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('group_bookings')
        .select(`
          *,
          members:group_members(
            *,
            service:services(id, name, price, duration_minutes),
            staff:staff(id, first_name, last_name)
          )
        `)
        .eq('share_code', shareCode)
        .eq('share_link_active', true)
        .single();

      if (fetchError) throw fetchError;
      return data as GroupBooking;
    } catch (err: any) {
      toast.error('Invalid or expired share link');
      return null;
    }
  }, []);

  // Create new group booking
  const createGroupBooking = useCallback(async (input: CreateGroupBookingInput) => {
    setLoading(true);
    try {
      const { data, error: createError } = await supabase
        .from('group_bookings')
        .insert({
          group_name: input.group_name || `${input.lead_name}'s Group`,
          group_type: input.group_type,
          package_id: input.package_id || null,
          lead_name: input.lead_name,
          lead_email: input.lead_email,
          lead_phone: input.lead_phone || null,
          total_members: input.total_members,
          booking_date: input.booking_date,
          start_time: input.start_time,
          scheduling_type: input.scheduling_type || 'parallel',
          payment_type: input.payment_type || 'single',
          special_requests: input.special_requests || null,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add lead as first member
      await addGroupMember({
        group_booking_id: data.id,
        member_name: input.lead_name,
        member_email: input.lead_email,
        member_phone: input.lead_phone,
        is_lead: true,
      });

      toast.success('Group booking created successfully!');
      return data as GroupBooking;
    } catch (err: any) {
      toast.error(`Failed to create group booking: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update group booking
  const updateGroupBooking = useCallback(async (id: string, updates: Partial<GroupBooking>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('group_bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      toast.success('Group booking updated');
      return data as GroupBooking;
    } catch (err: any) {
      toast.error(`Failed to update: ${err.message}`);
      return null;
    }
  }, []);

  // Update group booking status
  const updateGroupStatus = useCallback(async (id: string, status: GroupStatus) => {
    try {
      const updates: Partial<GroupBooking> = { status };

      if (status === 'confirmed') {
        updates.confirmed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
      }

      const { data, error: updateError } = await supabase
        .from('group_bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      toast.success(`Group booking ${status}`);
      return data as GroupBooking;
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message}`);
      return null;
    }
  }, []);

  // Cancel group booking
  const cancelGroupBooking = useCallback(async (id: string, reason?: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from('group_bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      toast.success('Group booking cancelled');
      return data as GroupBooking;
    } catch (err: any) {
      toast.error(`Failed to cancel: ${err.message}`);
      return null;
    }
  }, []);

  // Add member to group
  const addGroupMember = useCallback(async (input: AddGroupMemberInput) => {
    try {
      // Get service price if service_id provided
      let serviceAmount = 0;
      if (input.service_id) {
        const { data: service } = await supabase
          .from('services')
          .select('price, duration_minutes')
          .eq('id', input.service_id)
          .single();

        if (service) {
          serviceAmount = service.price || 0;
        }
      }

      const { data, error: insertError } = await supabase
        .from('group_members')
        .insert({
          group_booking_id: input.group_booking_id,
          member_name: input.member_name,
          member_email: input.member_email || null,
          member_phone: input.member_phone || null,
          is_lead: input.is_lead || false,
          service_id: input.service_id || null,
          staff_id: input.staff_id || null,
          scheduled_time: input.scheduled_time || null,
          service_amount: serviceAmount,
          notes: input.notes || null,
          special_requirements: input.special_requirements || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      toast.success(`${input.member_name} added to group`);
      return data as GroupMember;
    } catch (err: any) {
      toast.error(`Failed to add member: ${err.message}`);
      return null;
    }
  }, []);

  // Update group member
  const updateGroupMember = useCallback(async (input: UpdateGroupMemberInput) => {
    try {
      // Get service price if service_id changed
      let serviceAmount: number | undefined;
      if (input.service_id) {
        const { data: service } = await supabase
          .from('services')
          .select('price')
          .eq('id', input.service_id)
          .single();

        if (service) {
          serviceAmount = service.price || 0;
        }
      }

      const updates: any = { ...input };
      delete updates.id;
      if (serviceAmount !== undefined) {
        updates.service_amount = serviceAmount;
      }

      const { data, error: updateError } = await supabase
        .from('group_members')
        .update(updates)
        .eq('id', input.id)
        .select()
        .single();

      if (updateError) throw updateError;
      toast.success('Member updated');
      return data as GroupMember;
    } catch (err: any) {
      toast.error(`Failed to update member: ${err.message}`);
      return null;
    }
  }, []);

  // Remove member from group
  const removeGroupMember = useCallback(async (memberId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (deleteError) throw deleteError;
      toast.success('Member removed from group');
      return true;
    } catch (err: any) {
      toast.error(`Failed to remove member: ${err.message}`);
      return false;
    }
  }, []);

  // Update member status (check-in, etc.)
  const updateMemberStatus = useCallback(async (memberId: string, status: MemberStatus) => {
    try {
      const updates: any = { status };

      if (status === 'checked_in') {
        updates.checked_in_at = new Date().toISOString();
      } else if (status === 'in_service') {
        updates.service_started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.service_completed_at = new Date().toISOString();
      }

      const { data, error: updateError } = await supabase
        .from('group_members')
        .update(updates)
        .eq('id', memberId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as GroupMember;
    } catch (err: any) {
      toast.error(`Failed to update member status: ${err.message}`);
      return null;
    }
  }, []);

  // Record deposit payment
  const recordDepositPayment = useCallback(async (groupId: string, amount: number) => {
    try {
      // Get current booking
      const { data: booking } = await supabase
        .from('group_bookings')
        .select('deposit_paid, total_amount')
        .eq('id', groupId)
        .single();

      if (!booking) throw new Error('Booking not found');

      const newDepositPaid = (booking.deposit_paid || 0) + amount;
      const isFullyPaid = newDepositPaid >= booking.total_amount;

      const { data, error: updateError } = await supabase
        .from('group_bookings')
        .update({
          deposit_paid: newDepositPaid,
          balance_due: booking.total_amount - newDepositPaid,
          payment_status: isFullyPaid ? 'fully_paid' : 'deposit_paid',
        })
        .eq('id', groupId)
        .select()
        .single();

      if (updateError) throw updateError;
      toast.success(`Payment of $${amount.toFixed(2)} recorded`);
      return data as GroupBooking;
    } catch (err: any) {
      toast.error(`Failed to record payment: ${err.message}`);
      return null;
    }
  }, []);

  return {
    groupBookings,
    loading,
    error,
    fetchGroupBookings,
    fetchGroupBookingById,
    fetchByShareCode,
    createGroupBooking,
    updateGroupBooking,
    updateGroupStatus,
    cancelGroupBooking,
    addGroupMember,
    updateGroupMember,
    removeGroupMember,
    updateMemberStatus,
    recordDepositPayment,
  };
}

// Hook for packages and pricing
export function useGroupPackages() {
  const [packages, setPackages] = useState<GroupPackage[]>([]);
  const [pricingTiers, setPricingTiers] = useState<GroupPricingTier[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('group_packages')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPackages(data as GroupPackage[] || []);
      return data as GroupPackage[];
    } catch (err: any) {
      toast.error('Failed to fetch packages');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPricingTiers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('group_pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .order('min_size');

      if (error) throw error;
      setPricingTiers(data as GroupPricingTier[] || []);
      return data as GroupPricingTier[];
    } catch (err: any) {
      toast.error('Failed to fetch pricing tiers');
      return [];
    }
  }, []);

  const getDiscountForSize = useCallback((memberCount: number) => {
    const tier = pricingTiers.find(
      t => memberCount >= t.min_size && (t.max_size === null || memberCount <= t.max_size)
    );
    return tier?.discount_percentage || 0;
  }, [pricingTiers]);

  // Admin functions
  const createPackage = useCallback(async (pkg: Partial<GroupPackage>) => {
    try {
      const { data, error } = await supabase
        .from('group_packages')
        .insert(pkg)
        .select()
        .single();

      if (error) throw error;
      toast.success('Package created');
      return data as GroupPackage;
    } catch (err: any) {
      toast.error(`Failed to create package: ${err.message}`);
      return null;
    }
  }, []);

  const updatePackage = useCallback(async (id: string, updates: Partial<GroupPackage>) => {
    try {
      const { data, error } = await supabase
        .from('group_packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Package updated');
      return data as GroupPackage;
    } catch (err: any) {
      toast.error(`Failed to update package: ${err.message}`);
      return null;
    }
  }, []);

  const updatePricingTier = useCallback(async (id: string, updates: Partial<GroupPricingTier>) => {
    try {
      const { data, error } = await supabase
        .from('group_pricing_tiers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Pricing tier updated');
      return data as GroupPricingTier;
    } catch (err: any) {
      toast.error(`Failed to update pricing: ${err.message}`);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchPackages();
    fetchPricingTiers();
  }, [fetchPackages, fetchPricingTiers]);

  return {
    packages,
    pricingTiers,
    loading,
    fetchPackages,
    fetchPricingTiers,
    getDiscountForSize,
    createPackage,
    updatePackage,
    updatePricingTier,
  };
}
