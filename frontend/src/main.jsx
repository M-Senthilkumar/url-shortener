import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(30, 27, 75, 0.95)",
            color: "#e2e8f0",
            border: "1px solid rgba(102, 126, 234, 0.3)",
            borderRadius: "12px",
            backdropFilter: "blur(20px)",
            fontSize: "0.9rem",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "white" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "white" },
          },
          duration: 4000,
        }}
      />
    </AuthProvider>
  </StrictMode>
);