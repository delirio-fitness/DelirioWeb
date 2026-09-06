
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { initAdTracking } from "./services/conversionEvents";
  import { tagAcquisitionChannel } from "./services/organicMeasurement";
  import { initClarity } from "./modules/clarity";
  import { initGoogleAnalytics } from "./modules/googleAnalytics";
  import "./index.css";
  import "./styles/design3.css";

  // Before render: the campaign has to be captured off the landing URL while it
  // is still the landing URL.
  initAdTracking();

  // ═══════════════════════════════════════════════════════════════════════════
  // MICROSOFT CLARITY INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // NO API KEY REQUIRED. NO SUBSCRIPTION REQUIRED.
  // Clarity is 100% free. It only needs a free public "Project ID".
  //
  // THE CLEAREST PLACE TO PUT THE ID:
  //    src/modules/clarity/config.ts
  //
  //   Look for:
  //     export const CLARITY_PROJECT_ID = '';
  //
  //   Paste your Project ID there.
  //
  // Alternative: set VITE_CLARITY_PROJECT_ID in .env.local or hosting dashboard.
  //
  initClarity();
  initGoogleAnalytics();
  tagAcquisitionChannel();

  createRoot(document.getElementById("root")!).render(<App />);
  
