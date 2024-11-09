import { Expo } from "expo-server-sdk";
import type { Item } from "../types/item.ts";
import {
    fetchItemsWithNotificationsEnabled,
    fetchPushToken,
    updateLastNotifiedAt,
} from "./firebaseService.ts";

export const expo = new Expo();

// Determine if a notification should be sent based on the last notification time and interval
export const shouldNotify = (
    lastNotifiedAt: string | null,
    reminderInterval: number,
): boolean => {
    if (!lastNotifiedAt) return true;
    const now = Date.now();
    const lastNotifiedTime = new Date(lastNotifiedAt).getTime();
    return now - lastNotifiedTime >= reminderInterval;
};

// Send push notifications to a specified token with a list of items
export const sendPushNotification = async (
    pushToken: string,
    items: Item[],
) => {
    const messages = [{
        to: pushToken,
        title: "YOU HAVE TO CHECK THIS OUT",
        body: `${
            items.map((item) => item.name).join(", ")
        } might be lost. Please check.`,
        data: {
            ids: items.map((item) => item.id),
        },
    }];
    try {
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
        }
    } catch (error) {
        console.error("Error sending push notifications:", error);
    }
};

const main = async () => {
    try {
        // Retrieve the push token for the user and validate it
        const pushToken = await fetchPushToken();
        if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
            console.error("Invalid or missing push token:", pushToken);
            return;
        }

        // Fetch items with notifications enabled
        const items = await fetchItemsWithNotificationsEnabled();
        if (items.length === 0) {
            console.log("No items found with notifications enabled.");
            return;
        }

        // Filter items that need to be notified based on their last notification time and interval
        const itemsToNotify = items.filter((item) =>
            shouldNotify(item.lastNotifiedAt, item.reminderInterval)
        );

        // If there are items to notify, send push notifications
        if (itemsToNotify.length > 0) {
            await sendPushNotification(pushToken, itemsToNotify);
            console.log("Push notification sent.");
        }

        // Update lastNotifiedAt for each item that was notified
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
    } catch (error) {
        console.error("An error occurred in main:", error);
    }
};

// Execute the main function and handle any uncaught errors
main().catch((error) => {
    console.error("An unhandled error occurred:", error);
});
