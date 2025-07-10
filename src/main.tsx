import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const GOOGLE_CLIENT_ID =
  "979008466908-8nbt0bj3b6lepci7g9177k80hp3fj2jm.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <>
    <StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </StrictMode>
  </>
);
