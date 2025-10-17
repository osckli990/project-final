import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import LoginSection from "./sections/LoginSection.jsx";
import ChatSection from "./sections/ChatSection.jsx";

import "./Themes.css";
import "./App.css";
import HistorySection from "./sections/HistorySection.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <App>
        <LoginSection />
      </App>
    ),
  },
  {
    path: "/login",
    element: (
      <App>
        <Login />
      </App>
    ),
  },
  {
    path: "/chat",
    element: (
      <App>
        <ChatSection />
      </App>
    ),
  },
  {
    path: "/mood",
    element: (
      <App>
        <HistorySection />
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
