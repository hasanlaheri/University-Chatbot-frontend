import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import App from "./App";
import "animate.css";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext";

// 🔇 CRA ResizeObserver overlay fix (DEV ONLY)
const suppressedErrors = [
  "ResizeObserver loop completed with undelivered notifications",
  "ResizeObserver loop limit exceeded"
];

const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    suppressedErrors.some(msg => args[0].includes(msg))
  ) {
    return;
  }
  originalConsoleError(...args);
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

reportWebVitals();
