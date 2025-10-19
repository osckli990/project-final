import { useState } from "react";
import { useMoodStore } from "../store/useMoodStore";
import { useAuth } from "@clerk/clerk-react";
import { API, withAuth } from "../API";
import { media } from "../Breakpoints";

const HistorySection = () => {
  const { entries, addEntry } = useMoodStore();
  const { getToken } = useAuth();
  const [mood, setMood] = useState("🙂");
  const [note, setNote] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    addEntry(mood, note); // keep local UX snappy
    try {
      const cfg = await withAuth(getToken);
      await API.post("/moods", { mood, note }, cfg); // persist
    } catch {}
    setNote("");
  };

  return (
    <section
      className="max-w-3xl mx-auto p-4"
      style={{ color: "var(--color-text)" }}
    >
      <h1 className="title-clamp font-semibold mb-4">Mood history</h1>

      <form
        onSubmit={onSubmit}
        className="rounded-xl p-4 shadow flex gap-2 items-center ring-1"
        aria-label="Add mood entry"
        style={{
          background: "#fff",
          borderColor: "rgba(44,56,60,0.12)",
        }}
      >
        <label htmlFor="mood" className="sr-only">
          Mood
        </label>
        <select
          id="mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="rounded-lg px-2 py-2 border"
          style={{
            borderColor: "rgba(44,56,60,0.2)",
            background: "var(--color-textentry)",
          }}
        >
          <option>😀</option>
          <option>🙂</option>
          <option>😐</option>
          <option>😕</option>
          <option>😢</option>
        </select>

        <label htmlFor="note" className="sr-only">
          Note
        </label>
        <input
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note"
          className="flex-1 rounded-lg px-3 py-2 border outline-none focus:ring-2"
          style={{
            borderColor: "rgba(44,56,60,0.2)",
            background: "var(--color-textentry)",
          }}
        />

        <button
          type="submit"
          className="px-3 py-2 rounded-lg text-white font-medium"
          style={{ background: "var(--color-primary)" }}
        >
          Add
        </button>
      </form>

      <ul className="mt-4 space-y-2">
        {entries
          .slice()
          .reverse()
          .map((e, i) => (
            <li
              key={i}
              className="rounded-xl p-3 shadow flex items-center gap-3 ring-1"
              style={{ background: "#fff", borderColor: "rgba(44,56,60,0.12)" }}
            >
              <span className="text-2xl" aria-label="mood">
                {e.mood}
              </span>
              <div>
                <p className="font-medium">
                  {new Date(e.date).toLocaleString()}
                </p>
                {e.note && (
                  <p style={{ color: "var(--color-text)" }}>{e.note}</p>
                )}
              </div>
            </li>
          ))}
      </ul>

      {/* responsive title using your media map */}
      <style>{`
        .title-clamp { font-size: 1.5rem; line-height: 1.2; } /* ~24px */
        @media ${media.mobile}       { .title-clamp { font-size: 1.75rem; } }
        @media ${media.tablet}       { .title-clamp { font-size: 2rem; } }
        @media ${media.smalldesktop} { .title-clamp { font-size: 2.125rem; } }
        @media ${media.desktop}      { .title-clamp { font-size: 2.25rem; } }
      `}</style>
    </section>
  );
};

export default HistorySection;
