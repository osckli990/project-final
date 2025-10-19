const ResponseCard = ({ role, content }) => {
  const isAssistant = role === "assistant";
  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-[0.975rem] leading-relaxed ring-1`}
        style={{
          background: isAssistant ? "#ffffff" : "var(--color-secondary)",
          color: isAssistant ? "var(--color-text)" : "var(--color-alttext)",
          borderColor: isAssistant ? "rgba(44,56,60,0.08)" : "transparent",
          boxShadow: isAssistant ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
        }}
      >
        {content}
      </div>
    </div>
  );
};
export default ResponseCard;
