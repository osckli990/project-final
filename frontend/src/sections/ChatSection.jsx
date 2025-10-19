import { useEffect, useRef } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useAuth,
} from "@clerk/clerk-react";
import { media } from "../Breakpoints";
import { useChatStore } from "../store/useChatStore";
import InputCard from "../components/InputCard";
import ResponseCard from "../components/ResponseCard";
import { API, withAuth } from "../API";
import { useUpdateEffect } from "../hooks/useUpdateEffect";

const ChatSection = () => {
  const { getToken } = useAuth();
  const { messages, setMessages } = useChatStore();
  const endRef = useRef(null);

  // Smooth scroll only when messages update (custom hook)
  useUpdateEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial fetch
  useEffect(() => {
    (async () => {
      try {
        const cfg = await withAuth(getToken);
        const res = await API.get("/messages", cfg);
        setMessages(res.data);
      } catch {
        /* signed out or network error */
      }
    })();
  }, [getToken, setMessages]);

  const hasMessages = (messages?.length ?? 0) > 0;

  return (
    <div
      className="min-h-[calc(100vh-120px)]"
      style={{
        background: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <a href="#main" className="sr-only focus:not-sr-only underline p-2">
        Skip to content
      </a>

      <main id="main" className="max-w-6xl mx-auto px-4 pb-16">
        <section className="grid gap-8">
          <div>
            <h1 className="font-bold tracking-tight mb-2 title-clamp">
              Talk to AI
            </h1>
            <p className="subtitle-clamp">
              I’m here to help with your thoughts and feelings.
            </p>

            <div
              className="rounded-2xl ring-1 p-4 mt-6"
              style={{
                background: "#fff",
                borderColor: "rgba(44,56,60,0.1)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="space-y-3 max-h-[50vh] overflow-y-auto pr-1"
                aria-live="polite"
                aria-atomic="false"
              >
                {!hasMessages && (
                  <ResponseCard
                    role="assistant"
                    content="Hello! How are you doing today?"
                  />
                )}
                {messages.map((m, i) => (
                  <ResponseCard
                    key={m._id ?? i}
                    role={m.role}
                    content={m.content}
                  />
                ))}
                <div ref={endRef} />
              </div>

              <SignedOut>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <textarea
                    disabled
                    className="flex-1 rounded-xl px-3 py-3 min-h-14 border"
                    style={{
                      background: "var(--color-textentry)",
                      borderColor: "rgba(44,56,60,0.2)",
                      color: "var(--color-text)",
                    }}
                    placeholder="Please log in to start chatting…"
                    aria-label="Message input (disabled, please log in)"
                  />
                  <SignInButton mode="modal">
                    <button
                      className="px-5 py-3 rounded-xl text-white"
                      style={{ background: "var(--color-primary)" }}
                    >
                      Log in to chat
                    </button>
                  </SignInButton>
                </div>
                <p className="text-sm mt-2">
                  Don’t have an account?{" "}
                  <SignUpButton mode="modal">
                    <span className="font-medium underline cursor-pointer">
                      Sign up
                    </span>
                  </SignUpButton>
                </p>
              </SignedOut>

              <SignedIn>
                <InputCard className="mt-4" />
              </SignedIn>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .title-clamp { font-size: 2.25rem; line-height: 1.1; }
        .subtitle-clamp { font-size: 1.125rem; color: var(--color-text); }
        @media ${media.mobile}       { .title-clamp { font-size: 3rem; }   .subtitle-clamp { font-size: 1.25rem; } }
        @media ${media.tablet}       { .title-clamp { font-size: 3.5rem; } }
        @media ${media.smalldesktop} { .title-clamp { font-size: 3.75rem; } }
        @media ${media.desktop}      { .title-clamp { font-size: 4rem; } }
      `}</style>
    </div>
  );
};

export default ChatSection;
