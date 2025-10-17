import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import LoginSection from "./sections/LoginSection.jsx";
import ChatSection from "./sections/ChatSection.jsx";
import HistorySection from "./sections/HistorySection.jsx";
import ResourceSection from "./sections/ResourceSection.jsx";

import "./Themes.css";
import "./App.css";

const router = createBrowserRouter([
  // Landing shows Login
  {
    path: "/",
    element: (
      <App>
        <LoginSection />
      </App>
    ),
  },
  // Home = Chat
  {
    path: "/chat",
    element: (
      <App>
        <ChatSection />
      </App>
    ),
  },
  // History
  {
    path: "/mood",
    element: (
      <App>
        <HistorySection />
      </App>
    ),
  },
  // Resources
  {
    path: "/resources",
    element: (
      <App>
        <ResourceSection />
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
