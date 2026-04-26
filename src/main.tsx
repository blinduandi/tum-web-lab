import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/global.css";

const container = document.getElementById("root");
if (!container) throw new Error("#root element missing from index.html");

import { ThemeProvider } from "./theme/ThemeProvider";
import { LibraryProvider } from "./data/LibraryContext";

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <LibraryProvider>
        <App />
      </LibraryProvider>
    </ThemeProvider>
  </StrictMode>,
);
