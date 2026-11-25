import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";
const mount = document.getElementById("root");
if (mount) {
  const router = getRouter();
  createRoot(mount).render(<RouterProvider router={router} />);
}
