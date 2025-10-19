import { useEffect } from "react";
import { SignIn, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const LoginSection = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // If already signed in, go home (chat)
  useEffect(() => {
    if (isSignedIn) navigate("/chat");
  }, [isSignedIn, navigate]);

  return (
    <main
      className="min-h-[calc(100vh-120px)] grid place-items-center p-4"
      style={{
        background: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <section className="w-full max-w-md">
        {/* Clerk-hosted SignIn (manages the whole flow) */}
        <SignIn
          routing="hash"
          afterSignInUrl="/chat"
          appearance={{
            elements: {
              rootBox: "rounded-2xl shadow ring-1",
              card: "rounded-2xl",
            },
            variables: {
              colorPrimary: "var(--color-primary)",
              colorBackground: "#ffffff",
            },
          }}
        />
      </section>
    </main>
  );
};

export default LoginSection;
