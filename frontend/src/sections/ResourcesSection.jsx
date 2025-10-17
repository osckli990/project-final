import { media } from "../Breakpoints";

const Tile = ({ title, items = [] }) => (
  <div
    className="rounded-2xl ring-1 p-5 h-full"
    style={{ background: "#fff", borderColor: "rgba(44,56,60,0.1)" }}
  >
    <h3 className="font-semibold mb-3" style={{ color: "var(--color-text)" }}>
      {title}
    </h3>
    <ul className="space-y-2 text-sm">
      {items.map((it, i) => (
        <li key={i}>
          <span className="font-medium">{it.name}</span>
          {it.tag && (
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-xs"
              style={{
                background: "rgba(174,157,236,0.25)",
                color: "var(--color-text)",
              }}
            >
              {it.tag}
            </span>
          )}
          <p className="opacity-80">{it.desc}</p>
        </li>
      ))}
    </ul>
  </div>
);

const ResourceSection = () => {
  const frontend = [
    {
      name: "React 18",
      tag: "UI",
      desc: "Component-based UI library for building the SPA.",
    },
    {
      name: "React Router",
      tag: "Routing",
      desc: "Client-side routing for /, /chat, /mood, /resources.",
    },
    {
      name: "Clerk",
      tag: "Auth",
      desc: "Authentication, session management, and user UI elements.",
    },
    {
      name: "Zustand",
      tag: "State",
      desc: "Lightweight global store for chat history and mood entries.",
    },
    {
      name: "Axios",
      tag: "HTTP",
      desc: "API client to call backend endpoints with Clerk bearer tokens.",
    },
    {
      name: "Tailwind CSS",
      tag: "Styling",
      desc: "Utility-first styling guided by project color variables.",
    },
    {
      name: "Vite",
      tag: "Build",
      desc: "Fast dev server and bundler for the frontend.",
    },
  ];

  const backend = [
    {
      name: "Express",
      tag: "API",
      desc: "Node.js web framework powering /messages and /chat endpoints.",
    },
    {
      name: "Mongoose",
      tag: "DB",
      desc: "MongoDB ODM for storing per-user chat messages.",
    },
    {
      name: "OpenAI",
      tag: "AI",
      desc: "GPT model integration via server-side call in /chat route.",
    },
    {
      name: "Clerk (server)",
      tag: "Auth",
      desc: "Server middleware (`@clerk/express`) for auth protection.",
    },
    {
      name: "dotenv",
      tag: "Config",
      desc: "Environment variable management for secrets and URLs.",
    },
    {
      name: "cors",
      tag: "Security",
      desc: "CORS config to allow frontend origin during development.",
    },
    {
      name: "nodemon",
      tag: "DX",
      desc: "Auto-restart server on file changes during development.",
    },
  ];

  const tooling = [
    {
      name: "ESLint",
      tag: "Lint",
      desc: "Enforces clean code and consistent hooks usage.",
    },
    {
      name: "PostCSS + Autoprefixer",
      tag: "CSS",
      desc: "Cross-browser CSS compatibility.",
    },
    {
      name: "@tailwindcss/vite",
      tag: "CSS",
      desc: "Vite plugin for Tailwind processing.",
    },
    {
      name: "Environment vars",
      tag: ".env",
      desc: "Vite: `VITE_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY`; Server: `OPENAI_API_KEY`, `CLERK_SECRET_KEY`, `MONGO_URL`, `ORIGIN`.",
    },
  ];

  return (
    <section
      className="max-w-6xl mx-auto px-4 pb-16"
      style={{ color: "var(--color-text)" }}
    >
      <div className="py-6">
        <h1 className="font-bold tracking-tight title-clamp">
          Project Resources
        </h1>
        <p className="subtitle-clamp opacity-90">
          Tools, libraries, and extensions used to build this app.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Tile title="Frontend" items={frontend} />
        <Tile title="Backend" items={backend} />
        <Tile title="Tooling & DX" items={tooling} />
      </div>

      <div
        className="mt-8 rounded-2xl ring-1 p-5"
        style={{ background: "#fff", borderColor: "rgba(44,56,60,0.1)" }}
      >
        <h3 className="font-semibold mb-2">Environment Setup</h3>
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li>
            <strong>frontend/.env</strong>: VITE_API_URL,
            VITE_CLERK_PUBLISHABLE_KEY
          </li>
          <li>
            <strong>backend/.env</strong>: PORT, MONGO_URL, OPENAI_API_KEY,
            CLERK_SECRET_KEY, ORIGIN
          </li>
          <li>
            Keep keys server-side only; the frontend calls your Express API
            (never OpenAI directly).
          </li>
        </ul>
      </div>

      <style>{`
        .title-clamp { font-size: 2rem; line-height: 1.2; }
        .subtitle-clamp { font-size: 1.125rem; }
        @media ${media.mobile}       { .title-clamp { font-size: 2.5rem; } .subtitle-clamp { font-size: 1.25rem; } }
        @media ${media.tablet}       { .title-clamp { font-size: 3rem; } }
        @media ${media.smalldesktop} { .title-clamp { font-size: 3.25rem; } }
        @media ${media.desktop}      { .title-clamp { font-size: 3.5rem; } }
      `}</style>
    </section>
  );
};

export default ResourceSection;
