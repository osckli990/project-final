import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useChatStore } from "../store/useChatStore";

/**
 * InputCard: posts a message to your backend (/chat) and appends
 * both the saved user message and assistant reply to the chat store.
 * Colors follow CSS variables; shapes mirror the mockup.
 */
export default function InputCard({ className = "" }) {
  const { getToken } = useAuth();
  const { messages, setMessages, addMessage } = useChatStore();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!draft.trim() || busy) return;
    setBusy(true);
    setError("");

    try {
      const token = await getToken();
      if (!token) {
        setError("Please log in to send a message.");
        setBusy(false);
        return;
      }

      // optimistic user bubble
      const optimistic = { role: "user", content: draft };
      addMessage(optimistic);
      setDraft("");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat`,
        { content: optimistic.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { userMessage, assistantMessage } = res.data;
      setMessages([...messages, userMessage, assistantMessage]);
    } catch (e) {
      setError("Couldn’t send message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <label htmlFor="composer" className="sr-only">
          Message
        </label>
        <textarea
          id="composer"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share what’s on your mind…"
          className="flex-1 rounded-xl px-3 py-3 min-h-14 border outline-none focus:ring-2"
          style={{
            background: "var(--color-textentry)",
            borderColor: "rgba(44,56,60,0.2)",
            color: "var(--color-text)",
            boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
          }}
        />
        <button
          onClick={send}
          disabled={busy}
          className="rounded-xl px-5 py-3 text-white font-medium disabled:opacity-60"
          style={{ background: "var(--color-primary)" }}
        >
          {busy ? "Sending…" : "Send"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm mt-2" style={{ color: "#b00020" }}>
          {error}
        </p>
      )}
    </div>
  );
}
