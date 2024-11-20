import { run } from "./sendPushNotifications.ts";

// Scheduled job to check and send notifications every hour
if (true) {
    Deno.cron("Push notification", "0 * * * *", async () => {
        console.log("Running scheduled job to send push notifications...");
        try {
            await run();
        } catch (error) {
            console.error("An error occurred in scheduled job:", error);
        }
    });
}
