import { run } from "./sendPushNotifications.ts";

const isCronEnabled = Deno.env.get("CRON_ENABLED") === "true";

if (isCronEnabled) {
    // Scheduled job to check and send notifications every hour
    Deno.cron("Push notification", "0 * * * *", async () => {
        console.log("Running scheduled job to send push notifications...");
        try {
            await run();
        } catch (error) {
            console.error("An error occurred in scheduled job:", error);
        }
    });
} else {
    console.log("Cron job is disabled.");
}
