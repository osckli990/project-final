import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { ClerkExpressWithAuth, requireAuth } from "@clerk/express";
import OpenAI from "openai";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/final-project";
await mongoose.connect(mongoUrl);

const MessageSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", MessageSchema);

const app = express();
app.use(cors({ origin: process.env.ORIGIN?.split(',') || '*'}));
app.use(express.json());
app.use(ClerkExpressWithAuth());

const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => { res.send("Mindful Chat API"); });

app.get("/messages", requireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const msgs = await Message.find({ userId }).sort({ createdAt: 1 }).limit(500);
  res.json(msgs);
});

app.post("/chat", requireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { content } = req.body;

  const userMessage = await Message.create({ userId, role: "user", content });

  const recent = await Message.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();
  const history = recent.reverse().map(m => ({ role: m.role, content: m.content }));

  const completion = await oai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: "You are a supportive, non-clinical mental health companion. Offer empathy, coping suggestions, and encourage seeking professional help if needed. Never diagnose or provide medical advice." },
      ...history,
      { role: "user", content }
    ],
  });

  const reply = completion.choices?.[0]?.message?.content || "I'm here with you. How are you feeling right now?";
  const assistantMessage = await Message.create({ userId, role: "assistant", content: reply });

  res.json({ userMessage, assistantMessage });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
