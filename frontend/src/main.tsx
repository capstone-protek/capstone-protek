import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/context/theme";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
