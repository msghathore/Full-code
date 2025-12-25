#!/usr/bin/env node

/**
 * Simple script to send yourself a notification
 *
 * Usage:
 *   node notify-me.js "Task Complete" "Your deployment is done!"
 *   node notify-me.js "Quick Test"
 */

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node notify-me.js "Title" "Message (optional)"');
  process.exit(1);
}

const title = args[0];
const message = args[1] || 'Notification from Zavira system';
const topic = 'zavira-claude-notifications';

async function sendNotification() {
  try {
    const response = await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: {
        'Title': title,
        'Priority': 'high',
        'Tags': 'white_check_mark',
      },
      body: message,
    });

    if (response.ok) {
      console.log('✅ Notification sent successfully!');
    } else {
      console.error('❌ Failed to send notification');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendNotification();
