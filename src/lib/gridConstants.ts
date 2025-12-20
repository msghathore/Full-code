// Standardized grid layout constants
// ScheduleGrid uses 15-minute slots at 30px each = 2px per minute
export const GRID_CONSTANTS = {
  // Time slot configuration
  MINUTES_PER_SLOT: 15,           // Each slot represents 15 minutes (ScheduleGrid uses 15-min slots)
  SLOT_HEIGHT_PX: 30,             // Each 15-min slot is 30px tall
  HEADER_HEIGHT_PX: 44,           // Height of staff header row

  // Derived calculations
  PX_PER_MINUTE: 2,               // 30px / 15min = 2px per minute

  // Time range
  START_HOUR: 8,                  // Calendar starts at 8 AM
  END_HOUR: 24,                   // Calendar ends at midnight (12 AM next day)

  // Helper functions
  getSlotHeight: (durationMinutes: number): number => {
    // 2px per minute to match ScheduleGrid
    return Math.max(
      durationMinutes * 2,          // 2px per minute
      40                            // Minimum 40px height (20 minutes)
    );
  },

  getTopPosition: (timeString: string, startHour: number = 8): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = (hours * 60 + minutes) - (startHour * 60);
    return totalMinutes * 2;  // Convert to pixels (2px per minute)
  }
};
