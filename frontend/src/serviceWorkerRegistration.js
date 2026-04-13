import { Workbox } from "workbox-window";

export function register() {
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    const wb = new Workbox(
      `${process.env.REACT_APP_PUBLIC_URL || ""}/service-worker.js`
    );

    wb.addEventListener("waiting", () => {
      // Use the 'waiting' worker to skip waiting and take control
      wb.messageSkipWaiting();
    });

    // Only reload when the PRIMARY website service worker updates
    wb.addEventListener("controlling", () => {
      window.location.reload();
    });

    wb.register();
  }
}
