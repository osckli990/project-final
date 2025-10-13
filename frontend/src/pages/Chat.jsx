import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { useChatStore } from "../store/useChatStore";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function Chat() {
  const { getToken } = useAuth();
  const { messages, setMessages, addMessage } = useChatStore();
  const [input, setInput] = useLocalStorage("draft", "");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch {}
    })();
  }, [getToken, setMessages]);

  async function send() {
    if (!input.trim()) return;
    const token = await getToken();
    const userMsg = { role: "user", content: input };
    addMessage(userMsg);
    setInput("");

    const res = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, { content: userMsg.content }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { userMessage, assistantMessage } = res.data;
    setMessages([...messages, userMessage, assistantMessage]);
  }

  return (
    <section className="max-w-3xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-violet-400 rounded-lg" />
          <h1 className="text-xl font-semibold">Talk to AI</h1>
        </div>
        <nav className="text-sm flex gap-4">
          <a href="/" className="hover:underline">Home</a>
          <a href="/mood" className="hover:underline">Mood</a>
        </nav>
      </header>

      <SignedOut>
        <div className="bg-white rounded-xl p-6 shadow">
          <p className="mb-4">Please sign in to start chatting.</p>
          <SignInButton />
          <picture className="block mt-6 rounded-xl overflow-hidden ring-1 ring-slate-200">
            <img src="/assets/mockups/login-mock.png" alt="Login mockup" />
          </picture>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "assistant" ? "text-left" : "text-right"}>
                <span className={`inline-block px-3 py-2 rounded-2xl ${m.role==="assistant"?"bg-slate-100":"bg-violet-100"}`}>
                  {m.content}
                </span>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="mt-4 flex gap-2">
            <label htmlFor="msg" className="sr-only">Message</label>
            <textarea
              id="msg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded-xl px-3 py-2 min-h-12"
              placeholder="Share what’s on your mind…"
            />
            <button onClick={send} className="px-4 py-2 rounded-xl bg-violet-600 text-white">Send</button>
          </div>
        </div>
      </SignedIn>
    </section>
  );
}
