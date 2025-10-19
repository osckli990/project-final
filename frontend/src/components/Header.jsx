import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

const SiteHeader = () => {
  return (
    <header className="max-w-6xl mx-auto p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to="/chat" className="text-sm sm:text-base hover:underline">
          Home
        </Link>
        <Link to="/chat" aria-label="Home">
          <img
            src="/assets/icon-64.png"
            alt=""
            width="32"
            height="32"
            className="rounded-lg"
            aria-hidden="true"
          />
        </Link>
      </div>

      <nav className="text-sm flex items-center gap-6">
        <Link to="/chat" className="hover:underline">
          Home
        </Link>
        <Link to="/mood" className="hover:underline">
          History
        </Link>
        <Link to="/resources" className="hover:underline">
          Resources
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
  );
};

export default SiteHeader;
