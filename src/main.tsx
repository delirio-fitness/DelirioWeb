
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { initAdTracking } from "./services/conversionEvents";
  import "./index.css";
  import "./styles/design3.css";

  // Before render: the campaign has to be captured off the landing URL while it
  // is still the landing URL.
  initAdTracking();

  createRoot(document.getElementById("root")!).render(<App />);
  
