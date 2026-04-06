import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { BrowserRouter as Router } from "react-router-dom";
import { OfflineContextProvider } from "./context/OfflineContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <OfflineContextProvider>
    <Router>
      <App />
    </Router>
  </OfflineContextProvider>,
);

serviceWorkerRegistration.register();
