// ═══════════════════════════════════════════════════════════════════════════
// AfriGate Market — React Entry Point (main.jsx)
// Place this file at: src/main.jsx
// ═══════════════════════════════════════════════════════════════════════════
import React from "react";
import ReactDOM from "react-dom/client";
import AfriGateMarket from "./App";

// Signal to index.html that React has mounted (removes the loading splash)
function signalReady() {
  window.dispatchEvent(new CustomEvent("afrigate-ready"));
}

// Simple error boundary — shows a clean error page instead of blank screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          background: "#0A1128", color: "#fff",
          minHeight: "100vh", display: "flex",
          flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "24px", textAlign: "center"
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🌍</div>
          <h1 style={{ color: "#B8932A", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            AfriGate Market
          </h1>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14, marginBottom: 24 }}>
            Something went wrong loading the app.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "linear-gradient(135deg, #b8962e, #D4AF37, #f0cc5a)",
              color: "#0A1128", border: "none", borderRadius: 12,
              padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}>
            Reload App
          </button>
          {process.env.NODE_ENV === "development" && (
            <pre style={{ color: "#ff6b6b", fontSize: 11, marginTop: 20,
              maxWidth: 380, textAlign: "left", overflow: "auto" }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AfriGateMarket/>
    </ErrorBoundary>
  </React.StrictMode>
);

// Remove the loading splash
signalReady();
