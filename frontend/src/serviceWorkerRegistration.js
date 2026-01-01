import { Workbox } from "workbox-window";

export function register() {
  if ("serviceWorker" in navigator) {
    const wb = new Workbox(
      `${process.env.REACT_APP_PUBLIC_URL || ""}/service-worker.js`
    );

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });

    wb.register();
  }
}
