console.log("Hello, Deno!");
import { Expo } from "expo-server-sdk";
import { sendPushNotification, shouldNotify } from "./sendPushNotifications.ts";
import {
    fetchItemsWithNotificationsEnabled,
    fetchPushToken,
    updateLastNotifiedAt,
} from "./firebaseService.ts";

// Scheduled job to check and send notifications every hour
Deno.cron("Push notification", "0 * * * *", async () => {
    try {
        // Fetch push token and validate it
        const pushToken = await fetchPushToken();
        if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
            console.error("Invalid or missing push token.");
            return;
        }

        // Fetch items with notifications enabled
        const items = await fetchItemsWithNotificationsEnabled();
        if (items.length === 0) {
            console.log("No items found with notifications enabled.");
            return;
        }

        // Filter items that should be notified
        const itemsToNotify = items.filter((item) =>
            shouldNotify(item.lastNotifiedAt, item.reminderInterval)
        );

        if (itemsToNotify.length > 0) {
            // Send push notification
            await sendPushNotification(pushToken, itemsToNotify);
            console.log("Push notification sent.");

            // Update lastNotifiedAt for each item
            await Promise.all(itemsToNotify.map(async (item) => {
                try {
                    await updateLastNotifiedAt(item);
                    console.log(`Updated lastNotifiedAt for item ${item.id}`);
                } catch (error) {
                    console.error(
                        `Error updating lastNotifiedAt for item ${item.id}:`,
                        error,
                    );
                }
            }));
        }
    } catch (error) {
        console.error("Error in scheduled job:", error);
    }
});
