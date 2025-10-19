import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import LoginSection from "./sections/LoginSection.jsx";
import ChatSection from "./sections/ChatSection.jsx";
import HistorySection from "./sections/HistorySection.jsx";
import ResourcesSection from "./sections/ResourcesSection.jsx";

import "./Themes.css";
import "./App.css";

const router = createBrowserRouter([
  // Landing = Login (NO HEADER)
  {
    path: "/",
    element: (
      <App showHeader={false}>
        <LoginSection />
      </App>
    ),
  },

  // Home = Chat (header visible)
  {
    path: "/chat",
    element: (
      <App>
        <ChatSection />
      </App>
    ),
  },

  // History (header visible)
  {
    path: "/mood",
    element: (
      <App>
        <HistorySection />
      </App>
    ),
  },

  // Resources (header visible)
  {
    path: "/resources",
    element: (
      <App>
        <ResourcesSection />
      </App>
    ),
  },
]);

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </React.StrictMode>
);
