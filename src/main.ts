import { Expo } from "expo-server-sdk";

const expo = new Expo();

Deno.cron("Push notification", "* * * * *", async () => {
    const pushToken = "ExponentPushToken[yueW4qNgnfYmJ8r7eiO0rA]";

    if (!Expo.isExpoPushToken(pushToken)) {
        return;
    }

    const messages = [{
        to: pushToken,
        title: "hello",
        body: "world",
    }];

    try {
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
        }
    } catch (error) {
        console.error(error);
    }
});
