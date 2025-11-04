import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { clerkMiddleware, getAuth } from "@clerk/express";
import OpenAI from "openai";

dotenv.config();

/**
 * SYSTEM PROMPT
 * Guides the assistant's tone, scope, and guardrails.
 * This stays constant for each chat completion call.
 */
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

/**
 * CRISIS DETECTION
 * Simple regex to catch explicit crisis language.
 * If matched, we return a prewritten crisis reply (no model call).
 */
const CRISIS_RE =
  /\b(kill myself|end my life|suicide|can't go on|hurt myself|harm myself|kill (him|her|them)|plan to (hurt|kill))\b/i;

/**
 * CRISIS REPLY
 * Short, compassionate, action-oriented. Returned immediately when CRISIS_RE matches.
 * NOTE: Adjust resources to your deployment region as needed.
 */
const CRISIS_REPLY = `
I'm really glad you told me. Your safety matters.
If you feel in immediate danger, please contact your local emergency number now.

You can also reach out to:
• International: https://findahelpline.com
• Sweden (example): 112 (emergency), or Mind Självmordslinjen 90101 / chat via mind.se

If you can, consider telling someone you trust what’s going on. I can stay with you here while you get support.
`.trim();

/* ----------------------------- DATABASE SETUP ----------------------------- */

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/final-project";
await mongoose.connect(mongoUrl);

/**
 * Message model: stores per-user chat history (assistant + user turns).
 */
const MessageSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

/**
 * Mood model: lightweight mood tracking with optional note.
 * Used to build a short mood history summary that conditions the AI.
 */
const MoodSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  mood: { type: String, required: true }, // e.g., 😀🙂😐😕😢 (or any short token/string)
  note: { type: String, default: "" },
  date: { type: Date, default: Date.now },
});
const Mood = mongoose.models.Mood || mongoose.model("Mood", MoodSchema);

/* -------------------------------- APP SETUP -------------------------------- */

const app = express();
const origins = process.env.ORIGIN
  ? process.env.ORIGIN.split(",")
  : ["http://localhost:5173"];

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json());

/**
 * Clerk auth middleware.
 * We pass both keys explicitly to avoid misconfiguration in some setups.
 * - publishableKey: safe for the client.
 * - secretKey: required on the server for verifying sessions.
 */
app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  })
);

/* ------------------------------- OPENAI CLIENT ------------------------------ */

const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* --------------------------------- ROUTES ---------------------------------- */

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/", (_req, res) => res.send("Mindful Chat API"));

/**
 * ensureAuth: gatekeeper used by all protected endpoints.
 * Returns the userId or sends 401 and returns null.
 */
const ensureAuth = (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return userId;
};

/* ----------------------------- MESSAGES ENDPOINTS ----------------------------- */

/**
 * Returns up to 500 messages for the authenticated user in chronological order.
 * Used by the UI to display the full thread.
 */
app.get("/messages", async (req, res) => {
  const userId = ensureAuth(req, res);
  if (!userId) return;
  const msgs = await Message.find({ userId }).sort({ createdAt: 1 }).limit(500);
  res.json(msgs);
});

/* ------------------------------- MOOD ENDPOINTS ------------------------------ */

/**
 * Get recent moods (newest first). Useful for charts or trend views in the client.
 */
app.get("/moods", async (req, res) => {
  const userId = ensureAuth(req, res);
  if (!userId) return;
  const items = await Mood.find({ userId }).sort({ date: -1 }).limit(100);
  res.json(items);
});

/**
 * Create a new mood entry. Body: { mood: string, note?: string }
 */
app.post("/moods", async (req, res) => {
  const userId = ensureAuth(req, res);
  if (!userId) return;
  const { mood, note } = req.body;
  if (!mood) return res.status(400).json({ error: "mood is required" });
  const doc = await Mood.create({ userId, mood, note });
  res.status(201).json(doc);
});

/* --------------------------------- CHAT FLOW -------------------------------- */

/**
 * Chat endpoint:
 * 1) Auth check and input validation.
 * 2) Save the user's message.
 * 3) Load prior chat history (last 20) and mood history (last 10).
 * 4) If crisis regex matches, short-circuit with CRISIS_REPLY (no model call).
 * 5) Otherwise call OpenAI with:
 *    - SYSTEM_PROMPT
 *    - a system message containing the mood summary
 *    - prior chat history + current user message
 * 6) Save and return the assistant reply.
 */
app.post("/chat", async (req, res) => {
  const userId = ensureAuth(req, res);
  if (!userId) return;

  try {
    const { content } = req.body;
    if (!content?.trim())
      return res.status(400).json({ error: "content is required" });

    // Store the new user message immediately so the transcript is consistent.
    const userMessage = await Message.create({ userId, role: "user", content });

    // Load recent conversation history (most recent 20) and present in chronological order.
    const recentMsgs = await Message.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const history = recentMsgs
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));

    // Load last 10 moods and build a one-line-per-entry summary.
    // Example line: "11/03/2025: 🙂 – felt calmer after walk"
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

    // CRISIS SHORT-CIRCUIT: return static crisis guidance if we detect high-risk phrases.
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

    // Call OpenAI with strong system prompt + mood history as additional system context.
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

    // Fallback reply keeps the experience graceful if the API returns no choices.
    const reply =
      completion.choices?.[0]?.message?.content ||
      "I'm here with you. How are you feeling right now?";

    // Persist the assistant's answer into the transcript.
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

/* --------------------------------- SERVER ---------------------------------- */

const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log(`API listening on http://localhost:${port}`)
);
