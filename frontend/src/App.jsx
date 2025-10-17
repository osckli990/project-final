import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

const App = ({ children }) => {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <header className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="h-6 w-6 rounded-md"
            aria-hidden="true"
            style={{ background: "var(--color-secondary)" }}
          />
          <span className="font-semibold">Mindful Chat</span>
        </Link>

        <nav className="text-sm flex items-center gap-6">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/mood" className="hover:underline">
            History
          </Link>

          <SignedOut>
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <span className="hover:underline cursor-pointer">Log in</span>
              </SignInButton>
              <SignUpButton mode="modal">
                <span
                  className="px-3 py-1 rounded-lg text-white"
                  style={{ background: "var(--color-primary)" }}
                >
                  Sign up
                </span>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="max-w-6xl mx-auto p-4 text-xs opacity-80">
        This is a supportive, non-clinical tool.
      </footer>
    </div>
  );
};

export default App;
