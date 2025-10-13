export default function App({ children }) {
  return (
    <div className="min-h-screen bg-[#fff8f2] text-slate-900">
      <header className="max-w-5xl mx-auto p-4 flex items-center justify-between">
        <a className="flex items-center gap-2" href="/">
          <span
            className="h-6 w-6 rounded-md bg-violet-400"
            aria-hidden="true"
          ></span>
          <span className="font-semibold">Mindful Chat</span>
        </a>
        <nav className="text-sm flex gap-4">
          <a href="/chat" className="hover:underline">
            Home
          </a>
          <a href="/mood" className="hover:underline">
            History
          </a>
          <a
            href="/resources"
            className="hover:underline opacity-60 pointer-events-none"
            aria-disabled="true"
          >
            Log in
          </a>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="max-w-5xl mx-auto p-4 text-xs text-slate-500">
        This is a supportive, non-clinical tool.
      </footer>
    </div>
  );
}
