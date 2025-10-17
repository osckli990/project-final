import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { clerkMiddleware, getAuth } from "@clerk/express";
import OpenAI from "openai";

dotenv.config();

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

app.post("/chat", async (req, res) => {
  const userId = ensureAuth(req, res);
  if (!userId) return;

  try {
    const { content } = req.body;
    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "content is required" });
    }

    const userMessage = await Message.create({ userId, role: "user", content });

    const recent = await Message.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const history = recent
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));

    const completion = await oai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a supportive, non-clinical mental health companion. Offer empathy and coping suggestions. Never diagnose or provide medical advice.",
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
