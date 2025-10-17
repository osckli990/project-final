export default function ResponseCard({ role = "assistant", content = "" }) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={`flex items-start gap-3 ${isAssistant ? "" : "justify-end"}`}
    >
      {isAssistant && (
        <span
          aria-hidden
          className="h-8 w-8 rounded-full grid place-items-center"
          style={{ background: "var(--color-secondary)" }}
        >
          <span className="text-xl" aria-hidden>
            🙂
          </span>
        </span>
      )}

      <div
        className="px-3 py-2 rounded-2xl ring-1 max-w-[70ch]"
        style={{
          background: isAssistant
            ? "var(--color-alttext)"
            : "rgba(174,157,236,0.25)",
          borderColor: isAssistant
            ? "rgba(44,56,60,0.12)"
            : "rgba(174,157,236,0.45)",
          color: "var(--color-text)",
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    </div>
  );
}
