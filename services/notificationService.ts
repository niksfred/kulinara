import * as Notifications from 'expo-notifications';
import { GroceryItem } from '../types/GroceryItem';
import { getNotificationIds, setNotificationIds, clearNotificationIds } from '../storage/items';

const DAY_MS = 24 * 60 * 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermissions() {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

function toTriggerDate(target: Date, fallbackMinutes: number): Date {
  const now = Date.now();
  const time = target.getTime();
  if (time <= now) {
    return new Date(now + fallbackMinutes * 60 * 1000);
  }
  return target;
}

function buildNotificationContent(item: GroceryItem, label: string) {
  return {
    title: `Expiration reminder (${label})`,
    body: `${item.name} is nearing expiration.`,
  };
}

export async function scheduleForItem(item: GroceryItem): Promise<void> {
  const granted = await ensurePermissions();
  if (!granted) {
    return;
  }

  const expiration = new Date(item.expirationDate);
  const dayBefore = toTriggerDate(new Date(expiration.getTime() - DAY_MS), 30);
  const onDay = toTriggerDate(new Date(expiration.getTime()), 60);

  const dayBeforeId = await Notifications.scheduleNotificationAsync({
    content: buildNotificationContent(item, '1 day'),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dayBefore,
    },
  });

  const onDayId = await Notifications.scheduleNotificationAsync({
    content: buildNotificationContent(item, 'today'),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: onDay,
    },
  });

  await setNotificationIds(item.id, [dayBeforeId, onDayId]);
}

export async function cancelForItem(itemId: string): Promise<void> {
  const ids = await getNotificationIds(itemId);
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  await clearNotificationIds(itemId);
}
