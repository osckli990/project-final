import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { clerkMiddleware, getAuth } from "@clerk/express";
import OpenAI from "openai";

dotenv.config();

const SYSTEM_PROMPT = `
You are a supportive, non-clinical mental health companion.
Primary goals: help users reflect, regulate emotions, and find next gentle steps.

SAFETY & SCOPE
- Do NOT diagnose, prescribe, or give medical/legal/financial advice.
- If user indicates imminent danger or severe self-harm risk, respond with a brief crisis message and local resources; encourage contacting emergency services. Do not argue.
- Do not confirm, amplify, or join hallucinations, delusions, conspiracies, or voices. Acknowledge the experience without validating the false content and gently suggest professional help if relevant.
- Do not provide instructions for self-harm, violence, illegal activity, or hate.

RESPECT & NEUTRALITY
- Never use or repeat slurs, hate speech, or demeaning language. If the user includes such terms, respond without repeating them and set a respectful tone.
- Do not infer or assign identity attributes (gender, pronouns, ethnicity, religion, orientation, disability, politics). Use neutral language unless the user explicitly states their preference. If the user gives pronouns, use them; otherwise avoid gendered terms.
- Do not role-play as a real person or accept a given name for yourself. Avoid personification beyond “I’m an AI companion here to support you.”
- Avoid making promises or guarantees.

CONFIDENTIALITY & LIMITS
- Remind users this is a supportive tool, not therapy or a substitute for professional care.
- Encourage seeking professional support for persistent distress, safety concerns, or diagnostic questions.

STYLE
- Warm, non-judgmental, concise. Use plain language.
- One or two short paragraphs and, when helpful, a small list of options or steps.
- Ask at most one gentle, open question at a time.
- No emojis unless the user uses them first. No medical jargon.
- If unsure, say so briefly and pivot to helpful next steps.

USE OF CONTEXT
- Use provided chat history and any mood history to personalize support (e.g., trends, recent notes). Do not over-interpret or speculate.
- If information is insufficient or uncertain, ask a clarifying question rather than assume.

REFUSALS
- If asked to do something unsafe or out of scope, briefly refuse and redirect to safer alternatives.
`.trim();

const CRISIS_RE =
  /\b(kill myself|end my life|suicide|can't go on|hurt myself|harm myself|kill (him|her|them)|plan to (hurt|kill))\b/i;

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/final-project";
await mongoose.connect(mongoUrl);

const MessageSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

const app = express();
const origins = process.env.ORIGIN
  ? process.env.ORIGIN.split(",")
  : ["http://localhost:5173"];
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json());

// 👇 Provide both keys explicitly
app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  })
);

const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/", (_req, res) => res.send("Mindful Chat API"));

const ensureAuth = (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return userId;
};

app.get("/messages", async (req, res) => {
  const userId = ensureAuth(req, res);
  if (!userId) return;
  const msgs = await Message.find({ userId }).sort({ createdAt: 1 }).limit(500);
  res.json(msgs);
});

// ➕ model (put near MessageSchema)
const MoodSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  mood: { type: String, required: true }, // 😀🙂😐😕😢
  note: { type: String, default: "" },
  date: { type: Date, default: Date.now },
});
const Mood = mongoose.models.Mood || mongoose.model("Mood", MoodSchema);

// ➕ moods endpoints
app.get("/moods", async (req, res) => {
  const userId = ensureAuth(req, res);
  if (!userId) return;
  const items = await Mood.find({ userId }).sort({ date: -1 }).limit(100);
  res.json(items);
});

app.post("/moods", async (req, res) => {
  const userId = ensureAuth(req, res);
  if (!userId) return;
  const { mood, note } = req.body;
  if (!mood) return res.status(400).json({ error: "mood is required" });
  const doc = await Mood.create({ userId, mood, note });
  res.status(201).json(doc);
});

app.post("/chat", async (req, res) => {
  const userId = ensureAuth(req, res);
  if (!userId) return;
  try {
    const { content } = req.body;
    if (!content?.trim())
      return res.status(400).json({ error: "content is required" });

    const userMessage = await Message.create({ userId, role: "user", content });

    const recentMsgs = await Message.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const history = recentMsgs
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));

    const recentMoods = await Mood.find({ userId })
      .sort({ date: -1 })
      .limit(10)
      .lean();
    const moodSummary = recentMoods
      .map(
        (m) =>
          `${new Date(m.date).toLocaleDateString()}: ${m.mood}${
            m.note ? ` – ${m.note}` : ""
          }`
      )
      .join("\n");

    if (CRISIS_RE.test(content)) {
      const assistantMessage = await Message.create({
        userId,
        role: "assistant",
        content: CRISIS_REPLY,
      });
      return res.json({
        userMessage: { role: "user", content },
        assistantMessage,
      });
    }

    const completion = await oai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: moodSummary
            ? `User's recent mood history (most recent first):\n${moodSummary}`
            : "No mood history available yet.",
        },
        ...history,
        { role: "user", content },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "I'm here with you. How are you feeling right now?";
    const assistantMessage = await Message.create({
      userId,
      role: "assistant",
      content: reply,
    });

    res.json({ userMessage, assistantMessage });
  } catch (err) {
    console.error("POST /chat error:", err);
    res.status(500).json({ error: "Failed to generate reply" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log(`API listening on http://localhost:${port}`)
);
