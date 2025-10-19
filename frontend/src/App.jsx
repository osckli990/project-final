import Header from "./components/Header";

const App = ({ children, showHeader = true }) => {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      {showHeader && <Header />}

      <main id="main">{children}</main>

      <footer className="max-w-6xl mx-auto p-4 text-xs opacity-80">
        This is a supportive, non-clinical tool.
      </footer>
    </div>
  );
};

export default App;
