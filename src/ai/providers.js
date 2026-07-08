const axios = require("axios");

/**
 * Every provider below exposes: async function(prompt, history) -> string
 * "history" is a small array of {role, content} for lightweight context.
 * Add more providers by following the same pattern and registering them
 * in PROVIDERS at the bottom.
 */

const SYSTEM_PROMPT =
  "You are a helpful, friendly WhatsApp AI assistant. Keep answers clear and reasonably concise " +
  "unless the user asks for detail. You were deployed by your master, RADHEY.";

async function askGroq(prompt, history = []) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history, { role: "user", content: prompt }],
      temperature: 0.7,
    },
    { headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, timeout: 30000 }
  );
  return res.data.choices[0].message.content.trim();
}

async function askOpenAI(prompt, history = []) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history, { role: "user", content: prompt }],
      temperature: 0.7,
    },
    { headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, timeout: 30000 }
  );
  return res.data.choices[0].message.content.trim();
}

async function askOpenRouter(prompt, history = []) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");
  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history, { role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/",
        "X-Title": "RADHEY WhatsApp Bot",
      },
      timeout: 30000,
    }
  );
  return res.data.choices[0].message.content.trim();
}

async function askGemini(prompt, history = []) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const contents = [
    ...history.map((h) => ({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.content }] })),
    { role: "user", parts: [{ text: prompt }] },
  ];
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    },
    { headers: { "Content-Type": "application/json" }, timeout: 30000 }
  );
  return res.data.candidates[0].content.parts.map((p) => p.text).join("").trim();
}

const PROVIDERS = {
  groq: askGroq,
  openai: askOpenAI,
  openrouter: askOpenRouter,
  gemini: askGemini,
};

/**
 * Tries the requested provider first; if it fails (missing key / rate limit / network),
 * falls back through the other configured providers so the user still gets an answer
 * whenever possible.
 */
async function askAI(prompt, { provider, history = [] } = {}) {
  const order = [provider, ...Object.keys(PROVIDERS).filter((p) => p !== provider)];
  const tried = [];
  for (const p of order) {
    const fn = PROVIDERS[p];
    if (!fn) continue;
    try {
      const reply = await fn(prompt, history);
      return { reply, providerUsed: p };
    } catch (err) {
      tried.push(`${p}: ${err.response?.data?.error?.message || err.message}`);
    }
  }
  throw new Error(
    `All AI providers failed or are unconfigured.\n${tried.join("\n")}\n` +
      `Add at least one API key to your .env (GROQ_API_KEY is free & fastest to get).`
  );
}

module.exports = { askAI, PROVIDERS };
