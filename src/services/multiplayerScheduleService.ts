// Real-time Multiplayer Scheduling Service
// Handles collaborative schedule editing with presence, locks, and conflict resolution

import { supabase } from '@/integrations/supabase/client';
import type {
  SchedulePresence,
  ScheduleLock,
  ScheduleChange,
  ScheduleConflict,
  UndoRedoStack
} from '@/types/enterprise';

// ============================================================================
// PRESENCE MANAGEMENT
// ============================================================================

interface PresenceState {
  staffId: string;
  staffName: string;
  color: string;
  viewingDate: string;
  cursorPosition?: { x: number; y: number };
  selectedSlots?: string[];
  lastActivity: string;
}

const PRESENCE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

let presenceChannel: ReturnType<typeof supabase.channel> | null = null;
let currentPresence: PresenceState | null = null;
let presenceListeners: ((presences: PresenceState[]) => void)[] = [];

export const initializePresence = async (
  staffId: string,
  staffName: string,
  viewingDate: string
): Promise<void> => {
  // Assign a random color for this user
  const color = PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)];

  currentPresence = {
    staffId,
    staffName,
    color,
    viewingDate,
    lastActivity: new Date().toISOString()
  };

  // Create or join the schedule presence channel
  presenceChannel = supabase.channel('schedule-presence', {
    config: {
      presence: {
        key: staffId
      }
    }
  });

  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const state = presenceChannel?.presenceState() || {};
      const presences: PresenceState[] = [];

      Object.values(state).forEach((presenceList: any) => {
        presenceList.forEach((p: PresenceState) => {
          presences.push(p);
        });
      });

      presenceListeners.forEach(listener => listener(presences));
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && currentPresence) {
        await presenceChannel?.track(currentPresence);
      }
    });

  // Also record in database for persistence
  await supabase.from('schedule_presence').upsert({
    staff_id: staffId,
    viewing_date: viewingDate,
    cursor_position: null,
    selected_slots: [],
    is_active: true,
    last_activity: new Date().toISOString()
  });
};

export const updatePresence = async (updates: Partial<PresenceState>): Promise<void> => {
  if (!currentPresence || !presenceChannel) return;

  currentPresence = {
    ...currentPresence,
    ...updates,
    lastActivity: new Date().toISOString()
  };

  await presenceChannel.track(currentPresence);

  // Update database
  await supabase.from('schedule_presence')
    .update({
      viewing_date: currentPresence.viewingDate,
      cursor_position: currentPresence.cursorPosition,
      selected_slots: currentPresence.selectedSlots || [],
      last_activity: currentPresence.lastActivity
    })
    .eq('staff_id', currentPresence.staffId);
};

export const leavePresence = async (): Promise<void> => {
  if (presenceChannel) {
    await presenceChannel.untrack();
    await presenceChannel.unsubscribe();
    presenceChannel = null;
  }

  if (currentPresence) {
    await supabase.from('schedule_presence')
      .update({ is_active: false })
      .eq('staff_id', currentPresence.staffId);
    currentPresence = null;
  }
};

export const onPresenceChange = (
  callback: (presences: PresenceState[]) => void
): (() => void) => {
  presenceListeners.push(callback);
  return () => {
    presenceListeners = presenceListeners.filter(l => l !== callback);
  };
};

export const getActivePresences = async (
  viewingDate: string
): Promise<SchedulePresence[]> => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('schedule_presence')
    .select('*')
    .eq('viewing_date', viewingDate)
    .eq('is_active', true)
    .gte('last_activity', fiveMinutesAgo);

  if (error) throw error;
  return (data || []) as unknown as SchedulePresence[];
};

// ============================================================================
// SLOT LOCKING
// ============================================================================

export const acquireLock = async (
  slotId: string,
  staffId: string,
  lockType: 'editing' | 'moving' | 'creating' = 'editing'
): Promise<{ success: boolean; lock?: ScheduleLock; heldBy?: string }> => {
  const expiresAt = new Date(Date.now() + 30 * 1000).toISOString(); // 30 second lock

  // Try to acquire lock using upsert with conflict handling
  const { data: existingLock, error: checkError } = await supabase
    .from('schedule_locks')
    .select('*')
    .eq('slot_id', slotId)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (existingLock && existingLock.locked_by !== staffId) {
    return {
      success: false,
      heldBy: existingLock.locked_by
    };
  }

  const { data, error } = await supabase
    .from('schedule_locks')
    .upsert({
      slot_id: slotId,
      locked_by: staffId,
      lock_type: lockType,
      expires_at: expiresAt
    })
    .select()
    .single();

  if (error) {
    return { success: false };
  }

  return { success: true, lock: data as unknown as ScheduleLock };
};

export const releaseLock = async (
  slotId: string,
  staffId: string
): Promise<void> => {
  await supabase
    .from('schedule_locks')
    .delete()
    .eq('slot_id', slotId)
    .eq('locked_by', staffId);
};

export const releaseAllLocks = async (staffId: string): Promise<void> => {
  await supabase
    .from('schedule_locks')
    .delete()
    .eq('locked_by', staffId);
};

export const extendLock = async (
  slotId: string,
  staffId: string
): Promise<boolean> => {
  const expiresAt = new Date(Date.now() + 30 * 1000).toISOString();

  const { error } = await supabase
    .from('schedule_locks')
    .update({ expires_at: expiresAt })
    .eq('slot_id', slotId)
    .eq('locked_by', staffId);

  return !error;
};

export const getActiveLocks = async (): Promise<ScheduleLock[]> => {
  const { data, error } = await supabase
    .from('schedule_locks')
    .select('*')
    .gt('expires_at', new Date().toISOString());

  if (error) throw error;
  return (data || []) as unknown as ScheduleLock[];
};

// ============================================================================
// CHANGE TRACKING & BROADCASTING
// ============================================================================

let changesChannel: ReturnType<typeof supabase.channel> | null = null;
let changeListeners: ((change: ScheduleChange) => void)[] = [];

export const initializeChangesChannel = (date: string): void => {
  changesChannel = supabase.channel(`schedule-changes-${date}`);

  changesChannel
    .on('broadcast', { event: 'schedule-change' }, ({ payload }) => {
      changeListeners.forEach(listener => listener(payload as ScheduleChange));
    })
    .subscribe();
};

export const broadcastChange = async (change: Omit<ScheduleChange, 'id' | 'created_at'>): Promise<void> => {
  // Record change in database
  const { data, error } = await supabase
    .from('schedule_changes')
    .insert({
      ...change,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Broadcast to other users
  if (changesChannel) {
    await changesChannel.send({
      type: 'broadcast',
      event: 'schedule-change',
      payload: data
    });
  }
};

export const onScheduleChange = (
  callback: (change: ScheduleChange) => void
): (() => void) => {
  changeListeners.push(callback);
  return () => {
    changeListeners = changeListeners.filter(l => l !== callback);
  };
};

export const getRecentChanges = async (
  date: string,
  since?: string
): Promise<ScheduleChange[]> => {
  let query = supabase
    .from('schedule_changes')
    .select('*')
    .eq('schedule_date', date)
    .order('created_at', { ascending: false })
    .limit(50);

  if (since) {
    query = query.gt('created_at', since);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as unknown as ScheduleChange[];
};

// ============================================================================
// CONFLICT DETECTION & RESOLUTION
// ============================================================================

export const detectConflicts = async (
  appointmentId: string,
  staffId: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<ScheduleConflict[]> => {
  const conflicts: ScheduleConflict[] = [];

  // Check for overlapping appointments
  let query = supabase
    .from('appointments')
    .select('id, customer_id, service_id, start_time, end_time')
    .eq('staff_id', staffId)
    .lt('start_time', endTime)
    .gt('end_time', startTime)
    .neq('status', 'cancelled');

  if (excludeAppointmentId) {
    query = query.neq('id', excludeAppointmentId);
  }

  const { data: overlapping, error } = await query;

  if (error) throw error;

  if (overlapping && overlapping.length > 0) {
    for (const appt of overlapping) {
      conflicts.push({
        id: crypto.randomUUID(),
        conflicting_slot_ids: [appointmentId, appt.id],
        conflict_type: 'overlap',
        detected_at: new Date().toISOString(),
        detected_by: 'system',
        resolution_status: 'pending'
      });
    }
  }

  // Check for staff availability
  const { data: availability, error: availError } = await supabase
    .from('staff_availability')
    .select('*')
    .eq('staff_id', staffId)
    .eq('is_available', true);

  if (availError) throw availError;

  // Additional conflict checks can be added here
  // - Check staff time off
  // - Check business hours
  // - Check service duration requirements

  return conflicts;
};

export const resolveConflict = async (
  conflictId: string,
  resolution: 'keep_original' | 'keep_new' | 'merge' | 'cancel_both',
  resolvedBy: string,
  mergeData?: any
): Promise<void> => {
  await supabase
    .from('schedule_conflicts')
    .update({
      resolution_status: 'resolved',
      resolution: resolution,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      merge_data: mergeData
    })
    .eq('id', conflictId);
};

export const getPendingConflicts = async (
  date: string
): Promise<ScheduleConflict[]> => {
  const { data, error } = await supabase
    .from('schedule_conflicts')
    .select('*')
    .eq('resolution_status', 'pending')
    .gte('detected_at', `${date}T00:00:00`)
    .lte('detected_at', `${date}T23:59:59`);

  if (error) throw error;
  return (data || []) as unknown as ScheduleConflict[];
};

// ============================================================================
// UNDO/REDO FUNCTIONALITY
// ============================================================================

const undoStacks: Map<string, UndoRedoStack> = new Map();
const MAX_UNDO_HISTORY = 50;

export const initializeUndoRedo = (staffId: string): void => {
  if (!undoStacks.has(staffId)) {
    undoStacks.set(staffId, {
      staffId,
      undoStack: [],
      redoStack: [],
      maxSize: MAX_UNDO_HISTORY
    });
  }
};

export const pushUndoAction = (
  staffId: string,
  action: {
    type: 'create' | 'update' | 'delete' | 'move';
    entityType: 'appointment' | 'block' | 'note';
    entityId: string;
    previousState: any;
    newState: any;
  }
): void => {
  const stack = undoStacks.get(staffId);
  if (!stack) return;

  stack.undoStack.push({
    ...action,
    timestamp: new Date().toISOString()
  });

  // Trim if exceeds max size
  if (stack.undoStack.length > MAX_UNDO_HISTORY) {
    stack.undoStack.shift();
  }

  // Clear redo stack on new action
  stack.redoStack = [];
};

export const undo = async (staffId: string): Promise<{
  success: boolean;
  action?: any;
  error?: string;
}> => {
  const stack = undoStacks.get(staffId);
  if (!stack || stack.undoStack.length === 0) {
    return { success: false, error: 'Nothing to undo' };
  }

  const action = stack.undoStack.pop()!;

  try {
    // Apply the reverse action
    switch (action.type) {
      case 'create':
        // Delete the created entity
        await supabase.from('appointments').delete().eq('id', action.entityId);
        break;

      case 'delete':
        // Restore the deleted entity
        await supabase.from('appointments').insert(action.previousState);
        break;

      case 'update':
      case 'move':
        // Restore previous state
        await supabase
          .from('appointments')
          .update(action.previousState)
          .eq('id', action.entityId);
        break;
    }

    // Push to redo stack
    stack.redoStack.push(action);

    // Broadcast the undo
    await broadcastChange({
      change_type: 'undo',
      slot_id: action.entityId,
      previous_value: action.newState,
      new_value: action.previousState,
      changed_by: staffId,
      schedule_date: new Date().toISOString().split('T')[0],
      is_synced: true
    });

    return { success: true, action };
  } catch (error) {
    // Put action back on undo stack
    stack.undoStack.push(action);
    return { success: false, error: String(error) };
  }
};

export const redo = async (staffId: string): Promise<{
  success: boolean;
  action?: any;
  error?: string;
}> => {
  const stack = undoStacks.get(staffId);
  if (!stack || stack.redoStack.length === 0) {
    return { success: false, error: 'Nothing to redo' };
  }

  const action = stack.redoStack.pop()!;

  try {
    // Apply the action again
    switch (action.type) {
      case 'create':
        // Re-create the entity
        await supabase.from('appointments').insert(action.newState);
        break;

      case 'delete':
        // Delete again
        await supabase.from('appointments').delete().eq('id', action.entityId);
        break;

      case 'update':
      case 'move':
        // Apply new state again
        await supabase
          .from('appointments')
          .update(action.newState)
          .eq('id', action.entityId);
        break;
    }

    // Push back to undo stack
    stack.undoStack.push(action);

    // Broadcast the redo
    await broadcastChange({
      change_type: 'redo',
      slot_id: action.entityId,
      previous_value: action.previousState,
      new_value: action.newState,
      changed_by: staffId,
      schedule_date: new Date().toISOString().split('T')[0],
      is_synced: true
    });

    return { success: true, action };
  } catch (error) {
    // Put action back on redo stack
    stack.redoStack.push(action);
    return { success: false, error: String(error) };
  }
};

export const getUndoRedoState = (staffId: string): {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
} => {
  const stack = undoStacks.get(staffId);
  if (!stack) {
    return { canUndo: false, canRedo: false, undoCount: 0, redoCount: 0 };
  }

  return {
    canUndo: stack.undoStack.length > 0,
    canRedo: stack.redoStack.length > 0,
    undoCount: stack.undoStack.length,
    redoCount: stack.redoStack.length
  };
};

// ============================================================================
// COLLABORATIVE APPOINTMENT OPERATIONS
// ============================================================================

export const createAppointmentCollaborative = async (
  appointment: any,
  staffId: string
): Promise<{ success: boolean; appointment?: any; conflicts?: ScheduleConflict[] }> => {
  // Check for conflicts first
  const conflicts = await detectConflicts(
    'new',
    appointment.staff_id,
    appointment.start_time,
    appointment.end_time
  );

  if (conflicts.length > 0) {
    return { success: false, conflicts };
  }

  // Try to acquire lock
  const lockResult = await acquireLock(`new-${Date.now()}`, staffId, 'creating');
  if (!lockResult.success) {
    return { success: false };
  }

  try {
    // Create the appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;

    // Push to undo stack
    pushUndoAction(staffId, {
      type: 'create',
      entityType: 'appointment',
      entityId: data.id,
      previousState: null,
      newState: data
    });

    // Broadcast the change
    await broadcastChange({
      change_type: 'create',
      slot_id: data.id,
      previous_value: null,
      new_value: data,
      changed_by: staffId,
      schedule_date: new Date(appointment.start_time).toISOString().split('T')[0],
      is_synced: true
    });

    return { success: true, appointment: data };
  } finally {
    await releaseLock(`new-${Date.now()}`, staffId);
  }
};

export const updateAppointmentCollaborative = async (
  appointmentId: string,
  updates: any,
  staffId: string
): Promise<{ success: boolean; appointment?: any; conflicts?: ScheduleConflict[]; lockedBy?: string }> => {
  // Try to acquire lock
  const lockResult = await acquireLock(appointmentId, staffId, 'editing');
  if (!lockResult.success) {
    return { success: false, lockedBy: lockResult.heldBy };
  }

  try {
    // Get current state
    const { data: current, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError) throw fetchError;

    // Check for conflicts if time is changing
    if (updates.start_time || updates.end_time) {
      const conflicts = await detectConflicts(
        appointmentId,
        updates.staff_id || current.staff_id,
        updates.start_time || current.start_time,
        updates.end_time || current.end_time,
        appointmentId
      );

      if (conflicts.length > 0) {
        return { success: false, conflicts };
      }
    }

    // Apply update
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    // Push to undo stack
    pushUndoAction(staffId, {
      type: 'update',
      entityType: 'appointment',
      entityId: appointmentId,
      previousState: current,
      newState: data
    });

    // Broadcast the change
    await broadcastChange({
      change_type: 'update',
      slot_id: appointmentId,
      previous_value: current,
      new_value: data,
      changed_by: staffId,
      schedule_date: new Date(data.start_time).toISOString().split('T')[0],
      is_synced: true
    });

    return { success: true, appointment: data };
  } finally {
    await releaseLock(appointmentId, staffId);
  }
};

export const moveAppointmentCollaborative = async (
  appointmentId: string,
  newStaffId: string,
  newStartTime: string,
  newEndTime: string,
  staffId: string
): Promise<{ success: boolean; appointment?: any; conflicts?: ScheduleConflict[]; lockedBy?: string }> => {
  // Try to acquire lock
  const lockResult = await acquireLock(appointmentId, staffId, 'moving');
  if (!lockResult.success) {
    return { success: false, lockedBy: lockResult.heldBy };
  }

  try {
    // Get current state
    const { data: current, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError) throw fetchError;

    // Check for conflicts
    const conflicts = await detectConflicts(
      appointmentId,
      newStaffId,
      newStartTime,
      newEndTime,
      appointmentId
    );

    if (conflicts.length > 0) {
      return { success: false, conflicts };
    }

    // Apply move
    const { data, error } = await supabase
      .from('appointments')
      .update({
        staff_id: newStaffId,
        start_time: newStartTime,
        end_time: newEndTime
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    // Push to undo stack
    pushUndoAction(staffId, {
      type: 'move',
      entityType: 'appointment',
      entityId: appointmentId,
      previousState: current,
      newState: data
    });

    // Broadcast the change
    await broadcastChange({
      change_type: 'move',
      slot_id: appointmentId,
      previous_value: current,
      new_value: data,
      changed_by: staffId,
      schedule_date: new Date(newStartTime).toISOString().split('T')[0],
      is_synced: true
    });

    return { success: true, appointment: data };
  } finally {
    await releaseLock(appointmentId, staffId);
  }
};

export const deleteAppointmentCollaborative = async (
  appointmentId: string,
  staffId: string
): Promise<{ success: boolean; lockedBy?: string }> => {
  // Try to acquire lock
  const lockResult = await acquireLock(appointmentId, staffId, 'editing');
  if (!lockResult.success) {
    return { success: false, lockedBy: lockResult.heldBy };
  }

  try {
    // Get current state for undo
    const { data: current, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete (or soft delete by setting status to cancelled)
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId);

    if (error) throw error;

    // Push to undo stack
    pushUndoAction(staffId, {
      type: 'delete',
      entityType: 'appointment',
      entityId: appointmentId,
      previousState: current,
      newState: null
    });

    // Broadcast the change
    await broadcastChange({
      change_type: 'delete',
      slot_id: appointmentId,
      previous_value: current,
      new_value: null,
      changed_by: staffId,
      schedule_date: new Date(current.start_time).toISOString().split('T')[0],
      is_synced: true
    });

    return { success: true };
  } finally {
    await releaseLock(appointmentId, staffId);
  }
};

// ============================================================================
// CLEANUP
// ============================================================================

export const cleanupMultiplayerSession = async (staffId: string): Promise<void> => {
  await leavePresence();
  await releaseAllLocks(staffId);

  if (changesChannel) {
    await changesChannel.unsubscribe();
    changesChannel = null;
  }

  changeListeners = [];
  presenceListeners = [];
  undoStacks.delete(staffId);
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const subscribeToScheduleChanges = (
  date: string,
  onAppointmentChange: (payload: any) => void
): (() => void) => {
  const channel = supabase
    .channel(`appointments-${date}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `start_time=gte.${date}T00:00:00&start_time=lt.${date}T23:59:59`
      },
      (payload) => {
        onAppointmentChange(payload);
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};

export default {
  // Presence
  initializePresence,
  updatePresence,
  leavePresence,
  onPresenceChange,
  getActivePresences,

  // Locking
  acquireLock,
  releaseLock,
  releaseAllLocks,
  extendLock,
  getActiveLocks,

  // Changes
  initializeChangesChannel,
  broadcastChange,
  onScheduleChange,
  getRecentChanges,

  // Conflicts
  detectConflicts,
  resolveConflict,
  getPendingConflicts,

  // Undo/Redo
  initializeUndoRedo,
  pushUndoAction,
  undo,
  redo,
  getUndoRedoState,

  // Collaborative Operations
  createAppointmentCollaborative,
  updateAppointmentCollaborative,
  moveAppointmentCollaborative,
  deleteAppointmentCollaborative,

  // Subscriptions
  subscribeToScheduleChanges,

  // Cleanup
  cleanupMultiplayerSession
};
