import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { PhoneProvider } from "@/context/PhoneContext";
import { ToastProvider } from "@/context/ToastContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PhoneProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </PhoneProvider>
  </StrictMode>,
);