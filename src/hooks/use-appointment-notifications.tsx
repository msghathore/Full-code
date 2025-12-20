import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AppointmentNotification {
  id: string;
  type: 'reminder' | 'confirmation';
  message: string;
  appointmentDate: string;
  serviceName: string;
  scheduledFor: number; // timestamp when to show notification
  shown: boolean;
}

export function useAppointmentNotifications() {
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const { toast } = useToast();

  // Load notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('appointment-notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      } catch (error) {
        console.error('Error parsing stored notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = (newNotifications: AppointmentNotification[]) => {
    localStorage.setItem('appointment-notifications', JSON.stringify(newNotifications));
    setNotifications(newNotifications);
  };

  // Check for due notifications
  useEffect(() => {
    const checkNotifications = () => {
      const now = Date.now();
      const dueNotifications = notifications.filter(
        (notif) => !notif.shown && notif.scheduledFor <= now
      );

      dueNotifications.forEach((notif) => {
        // Show toast notification
        toast({
          title: notif.type === 'reminder' ? 'Appointment Reminder' : 'Booking Confirmed',
          description: notif.message,
          duration: 8000,
        });

        // Mark as shown
        const updatedNotifications = notifications.map((n) =>
          n.id === notif.id ? { ...n, shown: true } : n
        );
        saveNotifications(updatedNotifications);
      });
    };

    // Check immediately and then every minute
    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);

    return () => clearInterval(interval);
  }, [notifications, toast]);

  // Schedule a reminder notification
  const scheduleReminder = (
    appointmentId: string,
    serviceName: string,
    appointmentDate: string,
    hoursBefore: number = 24
  ) => {
    const appointmentTime = new Date(appointmentDate).getTime();
    const reminderTime = appointmentTime - (hoursBefore * 60 * 60 * 1000);

    if (reminderTime <= Date.now()) return; // Don't schedule past reminders

    const reminder: AppointmentNotification = {
      id: `reminder-${appointmentId}`,
      type: 'reminder',
      message: `Your ${serviceName} appointment is tomorrow at ${new Date(appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      appointmentDate,
      serviceName,
      scheduledFor: reminderTime,
      shown: false,
    };

    const updatedNotifications = [...notifications.filter(n => n.id !== reminder.id), reminder];
    saveNotifications(updatedNotifications);
  };

  // Schedule a confirmation notification
  const scheduleConfirmation = (
    appointmentId: string,
    serviceName: string,
    appointmentDate: string
  ) => {
    const confirmation: AppointmentNotification = {
      id: `confirmation-${appointmentId}`,
      type: 'confirmation',
      message: `Your ${serviceName} appointment on ${new Date(appointmentDate).toLocaleDateString()} has been confirmed.`,
      appointmentDate,
      serviceName,
      scheduledFor: Date.now() + 5000, // Show after 5 seconds
      shown: false,
    };

    const updatedNotifications = [...notifications.filter(n => n.id !== confirmation.id), confirmation];
    saveNotifications(updatedNotifications);
  };

  // Clear old notifications
  const clearOldNotifications = () => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const filtered = notifications.filter(notif => notif.scheduledFor > oneWeekAgo);
    saveNotifications(filtered);
  };

  return {
    scheduleReminder,
    scheduleConfirmation,
    clearOldNotifications,
    notifications,
  };
}