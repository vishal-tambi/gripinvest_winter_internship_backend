import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handler to suppress browser extension related errors
window.addEventListener('error', (event) => {
  // Suppress browser extension related errors
  if (event.error?.message?.includes('message channel closed') ||
      event.error?.message?.includes('A listener indicated an asynchronous response') ||
      event.filename === 'chrome-extension://' ||
      event.filename?.includes('extension')) {
    event.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (typeof reason === 'object' && reason?.message) {
    if (reason.message.includes('message channel closed') ||
        reason.message.includes('A listener indicated an asynchronous response') ||
        reason.message.includes('Extension')) {
      event.preventDefault();
      return false;
    }
  }
});

createRoot(document.getElementById("root")!).render(<App />);
