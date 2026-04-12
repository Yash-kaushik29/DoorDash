import { Workbox } from "workbox-window";

export function register() {
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    const wb = new Workbox(
      `${process.env.REACT_APP_PUBLIC_URL || ""}/service-worker.js`
    );

    // Removed automatic reload on controllerchange to prevent infinite refresh loops
    // with multiple service workers (offline + messaging).

    wb.register();
  }
}
