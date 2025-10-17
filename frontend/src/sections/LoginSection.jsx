import { useEffect, useState } from "react";
import { useAuth, useSignIn, SignUpButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // If already signed in, go to /chat
  useEffect(() => {
    if (isSignedIn) navigate("/chat");
  }, [isSignedIn, navigate]);

  if (!isLoaded) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const res = await signIn.create({
        identifier: email,
        password,
      });

      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        navigate("/chat");
      } else {
        setError("Additional verification required. Please continue the flow.");
      }
    } catch (err) {
      const first =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "We couldn’t sign you in. Please check your details and try again.";
      setError(first);
    } finally {
      setBusy(false);
    }
  };

  const onForgot = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Enter your email above, then press “Forgot?”.");
      return;
    }
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setError("Password reset email sent. Check your inbox.");
    } catch (err) {
      const first =
        err?.errors?.[0]?.longMessage ||
        "Could not start password reset. Please try again.";
      setError(first);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <section
        className="w-full max-w-md rounded-2xl shadow-sm ring-1 p-6"
        aria-label="Login form"
        style={{
          background: "#fff",
          borderColor: "rgba(44,56,60,0.1)",
        }}
      >
        {/* top label (mockup shows “placeholder”) */}
        <p className="text-center text-xl font-semibold mb-2">placeholder</p>

        <h1 className="text-center text-3xl font-bold tracking-tight">
          Log in
        </h1>
        <p
          className="text-center mt-1 mb-6"
          style={{ color: "var(--color-text)" }}
        >
          An account is required for AI recognition.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-3 py-3 border outline-none focus:ring-2"
              style={{
                background: "var(--color-textentry)",
                borderColor: "rgba(44,56,60,0.2)",
              }}
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-3 py-3 pr-20 border outline-none focus:ring-2"
              style={{
                background: "var(--color-textentry)",
                borderColor: "rgba(44,56,60,0.2)",
              }}
              required
              minLength={8}
            />
            <button
              onClick={onForgot}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm hover:underline"
              type="button"
              style={{ color: "var(--color-text)" }}
            >
              Forgot?
            </button>
          </div>

          {error && (
            <p role="alert" className="text-sm" style={{ color: "#b00020" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl py-3 font-medium disabled:opacity-60"
            style={{ background: "var(--color-primary)", color: "#fff" }}
          >
            {busy ? "Signing in…" : "Continue"}
          </button>
        </form>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--color-text)" }}
        >
          Don’t have an account?{" "}
          <SignUpButton mode="modal">
            <span className="font-medium underline cursor-pointer">
              Sign up
            </span>
          </SignUpButton>
        </p>
      </section>
    </main>
  );
};

export default Login;
