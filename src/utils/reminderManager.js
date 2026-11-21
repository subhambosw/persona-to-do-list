import dayjs from 'dayjs';
import { asset } from './assets.js';

class ReminderManager {
  constructor() {
    this.intervalId = null;
    this.listeners = new Set();
  }

  // Request browser notification permission
  async requestNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Send desktop notification (via Service Worker or Notification API)
  sendDesktopNotification(task) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const title = 'TAKE YOUR TIME // MISSION CALLING CARD!';
    const body = `Objective: "${task.title}" is due now! Infiltration commences.`;

    // Try service worker first for background support
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_REMINDER_NOTIFICATION',
        title,
        body
      });
      return;
    }

    try {
      new Notification(title, {
        body,
        icon: asset('hat.png'),
        badge: asset('hat.png'),
        tag: `reminder-${task.id}`,
        requireInteraction: true
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }

  startChecking(getTasksCallback, onTriggerCallback) {
    if (this.intervalId) clearInterval(this.intervalId);

    const check = () => {
      const tasks = getTasksCallback();
      if (!tasks || !tasks.length) return;

      const now = dayjs();

      tasks.forEach((task) => {
        if (!task.reminderTime || task.isComplete || task.reminderFired) return;

        // Parse reminder time (could be 'HH:mm' for today, or 'YYYY-MM-DDTHH:mm')
        let reminderDate;
        if (task.reminderTime.includes('T') || task.reminderTime.includes('-')) {
          reminderDate = dayjs(task.reminderTime);
        } else {
          // 'HH:mm' -> attach to task's date or today
          const dateStr = task.date || now.format('YYYY-MM-DD');
          reminderDate = dayjs(`${dateStr} ${task.reminderTime}`);
        }

        // If the reminder time has arrived or passed (within the last 2 hours to avoid ancient reminders)
        if (now.isAfter(reminderDate) && now.diff(reminderDate, 'hour') < 2) {
          task.reminderFired = true;
          this.sendDesktopNotification(task);
          onTriggerCallback(task);
        }
      });
    };

    // Run check immediately, then every 3 seconds
    check();
    this.intervalId = setInterval(check, 3000);
  }

  stopChecking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const reminderManager = new ReminderManager();
