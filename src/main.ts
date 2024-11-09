import { Expo } from "expo-server-sdk";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
    addDoc,
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

const fetchPushToken = async (): Promise<string> => {
    const pushTokens = await getDoc(
        doc(db, "users", userId),
    );

    return pushTokens.data().pushToken as string;
};

const fetchItems = async (): Promise<Item[]> => {
    const items = await getDocs(
        query(
            collection(db, "users", userId, "trips", tripId, "items"),
        ),
    );

    console.log(items.docs.map((item) => item.data()));

    return items.docs.map((item) => item.data()) as Item[];
};

fetchPushToken();
fetchItems();

// const expo = new Expo();
// Deno.cron("Push notification", "* * * * *", async () => {
//     const pushToken = "ExponentPushToken[yueW4qNgnfYmJ8r7eiO0rA]";

//     if (!Expo.isExpoPushToken(pushToken)) {
//         return;
//     }

//     const messages = [{
//         to: pushToken,
//         title: "hello",
//         body: "world",
//     }];

//     try {
//         const chunks = expo.chunkPushNotifications(messages);
//         for (const chunk of chunks) {
//             await expo.sendPushNotificationsAsync(chunk);
//         }
//     } catch (error) {
//         console.error(error);
//     }
// });
