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

    // Only reload once when the new worker takes control
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!window.__SW_RELOADING__) {
        window.__SW_RELOADING__ = true;
        window.location.reload();
      }
    });

    wb.register();
  }
}
