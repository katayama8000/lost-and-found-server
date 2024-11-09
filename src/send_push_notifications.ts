console.log("Hello, Deno!");
import { Expo } from "expo-server-sdk";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    query,
    where,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { tripId, userId } from "./constant.ts";
import type { Item } from "../types/item.ts";

const firebaseConfig = {
    apiKey: "AIzaSyCdcXMgdlh4eJK8D4_KiVl1RHjCApJZ8VE",
    authDomain: "lost-and-found-3f83f.firebaseapp.com",
    projectId: "lost-and-found-3f83f",
    storageBucket: "lost-and-found-3f83f.appspot.com",
    messagingSenderId: "844445487537",
    appId: "1:844445487537:web:a8c833490200eb085e2d90",
};

// Initialize Firebase and Firestore
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Initialize Expo SDK for push notifications
export const expo = new Expo();

// Fetch the push token for the user
export const fetchPushToken = async (): Promise<string | null> => {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        return userDoc.exists() ? (userDoc.data().pushToken as string) : null;
    } catch (error) {
        console.error("Error fetching push token:", error);
        return null;
    }
};

// Fetch items with notifications enabled for the current trip
export const fetchItemsWithNotificationsEnabled = async (): Promise<Item[]> => {
    try {
        const itemsSnapshot = await getDocs(
            query(
                collection(db, "users", userId, "trips", tripId, "items"),
                where("isNotifyEnabled", "==", true),
            ),
        );
        return itemsSnapshot.docs.map((doc) => doc.data()) as Item[];
    } catch (error) {
        console.error("Error fetching items from Firestore:", error);
        return [];
    }
};

// Check if an item needs to be notified based on lastNotifiedAt and reminderInterval
export const shouldNotify = (
    lastNotifiedAt: string | null,
    reminderInterval: number,
): boolean => {
    if (!lastNotifiedAt) return true;
    const now = Date.now();
    const lastNotifiedTime = new Date(lastNotifiedAt).getTime();
    return now - lastNotifiedTime >= reminderInterval;
};

// Send push notifications for items that need reminders
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
