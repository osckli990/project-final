import { useMoodStore } from "../store/useMoodStore";
import { useState } from "react";

export default function Mood() {
  const { entries, addEntry } = useMoodStore();
  const [mood, setMood] = useState("🙂");
  const [note, setNote] = useState("");

  return (
    <section className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Mood history</h1>
      <form
        onSubmit={(e) => { e.preventDefault(); addEntry(mood, note); setNote(""); }}
        className="bg-white rounded-xl p-4 shadow flex gap-2 items-center"
        aria-label="Add mood entry"
      >
        <select value={mood} onChange={(e)=>setMood(e.target.value)} className="border rounded-lg px-2 py-2">
          <option>😀</option><option>🙂</option><option>😐</option><option>😕</option><option>😢</option>
        </select>
        <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Optional note" className="flex-1 border rounded-lg px-3 py-2" />
        <button className="px-3 py-2 bg-violet-600 text-white rounded-lg">Add</button>
      </form>

      <ul className="mt-4 space-y-2">
        {entries.slice().reverse().map((e, i) => (
          <li key={i} className="bg-white rounded-xl p-3 shadow flex items-center gap-3">
            <span className="text-2xl">{e.mood}</span>
            <div>
              <p className="font-medium">{new Date(e.date).toLocaleString()}</p>
              {e.note && <p className="text-slate-600">{e.note}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
