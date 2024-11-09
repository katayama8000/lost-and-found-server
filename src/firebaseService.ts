import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    query,
    setDoc,
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

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export const fetchPushToken = async (): Promise<string | null> => {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
            console.warn(`User document for userId ${userId} does not exist.`);
            return null;
        }
        const data = userDoc.data();
        if (!data || !data.pushToken) {
            console.warn("Push token not found in user document.");
            return null;
        }
        return data.pushToken as string;
    } catch (error) {
        console.error("Error fetching push token:", error);
        return null;
    }
};

export const fetchItemsWithNotificationsEnabled = async (): Promise<Item[]> => {
    try {
        const itemsSnapshot = await getDocs(
            query(
                collection(db, "users", userId, "trips", tripId, "items"),
                where("isNotifyEnabled", "==", true),
            ),
        );
        if (itemsSnapshot.empty) {
            console.log("No items found with notifications enabled.");
            return [];
        }
        return itemsSnapshot.docs.map((doc) => doc.data()) as Item[];
    } catch (error) {
        console.error("Error fetching items from Firestore:", error);
        return [];
    }
};

export const updateLastNotifiedAt = async (item: Item): Promise<void> => {
    const todayInJST = new Date(Date.now() + 9 * 60 * 60 * 1000);
    try {
        await setDoc(
            doc(db, "users", userId, "trips", tripId, "items", item.id),
            {
                ...item,
                lastNotifiedAt: todayInJST.toISOString(),
            },
        );
        console.log(`Updated lastNotifiedAt for item ${item.id}.`);
    } catch (error) {
        console.error(
            `Error updating last notified time for item ${item.id}:`,
            error,
        );
    }
};
