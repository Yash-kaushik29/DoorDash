// import { getToken, onMessage } from "firebase/messaging";
// import { messaging } from "../config/firebaseConfig";
// import api from "./axiosInstance"; 

// const VAPID_KEY = process.env.REACT_APP_FIREBASE_PUBLIC_KEY;

// export async function initPushNotifications() {
//   if (!("Notification" in window)) return;

//   const permission = await Notification.requestPermission();
//   if (permission !== "granted") return;

//   const token = await getToken(messaging, {
//     vapidKey: VAPID_KEY,
//   });

//   if (!token) return;

//   // Send token to backend
//   await api.post("http://localhost:5000/api/user-profile/register-token", { token });

//   console.log("✅ Push token saved", token);
// }

// // Foreground handler
// export function listenForegroundMessages(callback) {
//   onMessage(messaging, (payload) => {
//     console.log("📩 Push received in foreground", payload);
//     callback(payload);
//   });
// }
