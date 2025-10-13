export default function Landing() {
  return (
    <section className="max-w-4xl mx-auto p-6 text-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-lg bg-violet-400" aria-hidden="true"></div>
        <h1 className="text-2xl font-semibold">Mindful Chat</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Talk to AI</h2>
          <p className="text-slate-600 mb-4">I’m here to help with your thoughts and feelings. Sign in and start a gentle conversation.</p>
          <a href="/chat" className="inline-block px-4 py-2 rounded-xl bg-violet-600 text-white">Start chatting</a>
        </div>
        <picture className="rounded-2xl overflow-hidden ring-1 ring-slate-200">
          <img src="/assets/mockups/chat-mock.png" alt="Chat mockup" />
        </picture>
      </div>
    </section>
  );
}
