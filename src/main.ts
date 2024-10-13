Deno.cron("Push notification", "* * * * *", async () => {
    console.log("This will push a message to your device every minute.");
    const pushMessage = {
        to: "ExponentPushToken[yueW4qNgnfYmJ8r7eiO0rA]",
        title: "hello",
        body: "world",
    };

    try {
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(pushMessage),
        });

        if (!response.ok) {
            console.error(
                "Failed to send push notification:",
                response.statusText,
            );
        } else {
            console.log("Push notification sent successfully!");
        }
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
});
