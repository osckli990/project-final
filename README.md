# Final Project

Avoiding building similair projects to bootcamp, create something new using the tools we have learned, while alowing us to deep-dive into them or related tools.

A responsive React (Vite + Tailwind) app with Clerk auth and Zustand state offers a Clerk-hosted Login landing page, an AI Chat home, and a Mood History page with chat-bubble UI. A Node/Express + MongoDB backend stores per-user messages and moods, calls OpenAI gpt-4o-mini, and tailors replies using recent chat plus mood history. The frontend is deployed on Netlify, the backend on Render, with CORS limited to site origins and secrets kept in environment variables.

## The problem

Describe how you approached to problem, and what tools and techniques you used to solve it. How did you plan? What technologies did you use? If you had more time, what would be next?

Problem: people feeling alone and have noone to talk to.
Solution: creating an AI to chat with in a neutral and safe space.
Tools: React, Vite, Clerk, Tailwind, Zustand, custom hooks, node/express, openAI, Atlas, MongoDB, Netlify, Render
Next: linking to health resources nearby, language support, dark theme, etc.

## View it live

Netlify: https://project-final-oscar.netlify.app/
Render: https://project-final-itk1.onrender.com/

GET / → “Mindful Chat API” (ping)
GET /health → { ok: true, ts }å
GET /messages → chat history (auth required)
POST /chat → send a message; returns { userMessage, assistantMessage } (auth required)
GET /moods → list recent moods (auth required)
POST /moods → add mood { mood, note? } (auth required)
