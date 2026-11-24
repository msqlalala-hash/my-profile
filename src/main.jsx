import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { initMotionPreference } from "./lib/motion";

initMotionPreference();

// BASE_URL is "/" on the normal root and "/my-profile/" on GitHub Pages, so the
// same build works in both places without a second code path.
createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <App />
  </BrowserRouter>
);
