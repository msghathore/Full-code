/**
 * Send a notification to the user's phone via ntfy.sh
 *
 * @example
 * ```ts
 * await sendNotification({
 *   title: "Task Complete",
 *   message: "Your booking form is ready!",
 *   priority: "high"
 * });
 * ```
 */

export interface NotificationOptions {
  title: string;
  message: string;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  tags?: string[];
  topic?: string;
}

/**
 * Send notification via ntfy.sh
 */
export async function sendNotification({
  title,
  message,
  priority = 'default',
  tags = [],
  topic = 'zavira-claude-notifications'
}: NotificationOptions): Promise<boolean> {
  try {
    const response = await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: {
        'Title': title,
        'Priority': priority,
        'Tags': tags.join(','),
      },
      body: message,
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

/**
 * Send a success notification
 */
export async function notifySuccess(title: string, message: string) {
  return sendNotification({
    title,
    message,
    priority: 'high',
    tags: ['white_check_mark'],
  });
}

/**
 * Send an error notification
 */
export async function notifyError(title: string, message: string) {
  return sendNotification({
    title,
    message,
    priority: 'high',
    tags: ['x', 'rotating_light'],
  });
}

/**
 * Notify when a background task completes
 */
export async function notifyTaskComplete(taskName: string, details?: string) {
  return notifySuccess(
    `✅ Task Complete: ${taskName}`,
    details || `${taskName} has finished successfully!`
  );
}
