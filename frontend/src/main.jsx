import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Mood from "./pages/Mood.jsx";
import ChatSection from "./sections/ChatSection.jsx";

import "./Themes.css";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <App>
        <Landing />
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
        <Mood />
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
