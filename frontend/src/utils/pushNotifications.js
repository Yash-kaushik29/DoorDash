import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebaseConfig";
import api from "../config/api";

const VAPID_KEY = process.env.REACT_APP_FIREBASE_PUBLIC_KEY;

// Request notification permission (call this early, e.g., in App.js)
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (!token) {
      console.log("No FCM token available");
      return null;
    }

    console.log("FCM Token obtained:", token.substring(0, 20) + "...");
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

// Register push token for user (call this AFTER user logs in or on app load for existing users)
export async function registerPushToken() {
  if (!("Notification" in window)) return;

  try {
    // If permission is not granted yet, we request it
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    } else if (Notification.permission !== "granted") {
      return; // Permisson denied
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (!token) return;

    // Save to DB (backend logic uses $addToSet to prevent duplicates)
    const response = await api.post("/api/user-profile/register-token", { token });
    console.log("Push token registered successfully:", response.data);
  } catch (err) {
    console.error("Push token registration error:", err.response?.data || err.message);
  }
}

// Register push token for delivery boy (call this AFTER delivery boy logs in)
export async function registerDeliveryBoyPushToken() {
  if (!("Notification" in window)) return;

  try {
    // If permission is not granted yet, we request it
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    } else if (Notification.permission !== "granted") {
      return; // Permisson denied
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (!token) return;

    const response = await api.post("/api/delivery/register-token", { token });
    console.log("Delivery boy push token registered successfully:", response.data);
  } catch (err) {
    console.error("Delivery boy push token registration error:", err.response?.data || err.message);
  }
}

// Foreground message handler
export function listenForegroundMessages(callback) {
  onMessage(messaging, (payload) => {
    console.log("📩 Push received in foreground", payload);
    callback(payload);
  });
}
