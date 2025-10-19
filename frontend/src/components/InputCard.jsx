import { useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useChatStore } from "../store/useChatStore";
import { API, withAuth } from "../API";

const InputCard = ({ className = "" }) => {
  const { getToken } = useAuth();
  const { messages, setMessages, addMessage } = useChatStore();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  const send = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    setError("");

    try {
      const cfg = await withAuth(getToken);

      const optimistic = { role: "user", content: draft };
      addMessage(optimistic);
      setDraft("");

      const res = await API.post("/chat", { content: optimistic.content }, cfg);
      const { userMessage, assistantMessage } = res.data;
      setMessages([...messages, userMessage, assistantMessage]);

      // return focus for a11y
      textareaRef.current?.focus();
    } catch {
      setError("Couldn’t send message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
    // Shift+Enter → normal newline (do nothing)
  };

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <label htmlFor="composer" className="sr-only">
          Message
        </label>
        <textarea
          id="composer"
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Share what’s on your mind…"
          className="flex-1 rounded-xl px-3 py-3 min-h-14 border outline-none focus:ring-2"
          style={{
            background: "var(--color-textentry)",
            borderColor: "rgba(44,56,60,0.2)",
            color: "var(--color-text)",
            boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
          }}
          aria-label="Message input"
        />
        <button
          onClick={send}
          disabled={busy}
          className="rounded-xl px-5 py-3 text-white font-medium disabled:opacity-60"
          style={{ background: "var(--color-primary)" }}
          aria-label="Send message"
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
};

export default InputCard;
