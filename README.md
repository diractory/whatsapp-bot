# RADHEY WhatsApp AI Bot

A WhatsApp bot built with **Node.js**, **[Baileys](https://github.com/WhiskeySockets/Baileys)** (WhatsApp Web protocol — no Selenium/Puppeteer needed) and **Express** (Node's Flask-equivalent) for the web login page. Deployable on **Render** as a Web Service.

> Every bot reply is sent in **bold**, except the AI's own answers, which are sent as plain text (as requested). Every reply signs off with `Master: #RADHEY`.

---

## Why Node.js instead of Python?

You mentioned "Python, Node.js, or more" — WhatsApp bot login is a browser-based multi-device pairing protocol. The most mature, actively-maintained, free libraries for that (Baileys, whatsapp-web.js) are all **Node.js**. There is no equivalently reliable pure-Python option. So the bot itself is Node.js, and the web login page uses **Express**, which plays the exact same role Flask would play in Python — a tiny web server that shows you the QR code so you can click the link and scan it. If you specifically need Python code too (e.g. a Flask wrapper that just proxies to this service), say the word and I'll add it — but it isn't needed for the bot to work.

---

## 1. What you get

| Command | What it does |
|---|---|
| `.cmds` | Lists every command and how to use it |
| `.ping` | Health check + response time + uptime |
| `.owner` | Shows the owner/master's details |
| `.setai on` / `.setai off` | Opt this chat in/out of AI auto-replies |
| `.setai groq\|gemini\|openai\|openrouter` | Choose which AI provider answers |
| `.ai <question>` | Ask AI once without enabling AI mode |
| `.reset` | Clears this chat's AI memory |
| `.fix` | Runs safe self-repair steps |
| `.fixlog` | Shows the most recent errors |
| `.fixlog clear` | Wipes stored logs |
| `.alive` | Quick alive check |
| `.about` | About the bot |

**AI only replies after a user opts in** with `.setai on` in that chat/group — exactly as you specified. Nobody gets AI replies by just DMing the bot.

---

## 2. Get your AI API keys (you only need ONE to start)

You don't need to pay me for keys — every provider below has a **free tier** you sign up for yourself:

### Groq (recommended — fastest, generous free tier)
1. Go to https://console.groq.com/keys
2. Sign up (free), click **Create API Key**
3. Copy it into `GROQ_API_KEY` in your `.env`

### Google Gemini (free tier available)
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with a Google account, click **Create API key**
3. Copy it into `GEMINI_API_KEY`

### OpenRouter (free models available, e.g. Llama 3.3 `:free`)
1. Go to https://openrouter.ai/keys
2. Sign up, create a key
3. Copy it into `OPENROUTER_API_KEY`

### OpenAI (paid, no free tier as of writing)
1. Go to https://platform.openai.com/api-keys
2. Create a key, add billing
3. Copy it into `OPENAI_API_KEY`

Set `DEFAULT_AI_PROVIDER` in `.env` to whichever one you filled in (e.g. `groq`). The bot will automatically fall back to another configured provider if the default one fails, so it's fine to add more than one key.

---

## 3. Run locally (optional, to test before deploying)

```bash
git clone <your-repo-url>
cd whatsapp-ai-bot
cp .env.example .env
# edit .env and paste in at least one AI key
npm install
npm start
```

Open **http://localhost:3000** in your browser — you'll see the QR code page. Scan it with WhatsApp:
**Settings → Linked Devices → Link a Device**.

---

## 4. Deploy on Render

1. Push this folder to a GitHub repo (`.env` is git-ignored on purpose — never commit real keys).
2. On [Render](https://render.com) → **New +** → **Web Service** → connect your repo.
3. Render will detect `render.yaml` automatically (or set manually):
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Under **Environment**, add your AI key(s) (`GROQ_API_KEY`, etc.) and `DEFAULT_AI_PROVIDER`.
5. Deploy. Once live, open your Render URL (e.g. `https://your-app.onrender.com`) — that's your **captivating login link**. It shows the animated QR "signal" page. Scan it once, and the bot logs in.

### Important: keep your session alive across restarts
Free Render web services spin down when idle and use an **ephemeral filesystem** — meaning your `auth_info/` login session can be wiped on redeploy/restart, forcing you to re-scan the QR. To avoid that:
- Upgrade to a paid Render plan and attach a **persistent disk** mounted at `auth_info/` (already configured in `render.yaml` — just enable disks on your plan), **or**
- Use Render's "Background Worker" + a keep-alive ping to `/healthz` on a free plan (still ephemeral on redeploy, but survives idling if pinged), **or**
- Ask me to wire up session storage to a database (MongoDB/Postgres) instead of the filesystem — fully solves this, happy to add it.

---

## 5. Project structure

```
whatsapp-ai-bot/
├── index.js                # Express server + boots the bot
├── src/
│   ├── bot.js               # Baileys WhatsApp connection + message listener
│   ├── commands/             # One file per command
│   │   ├── index.js          # Router: prefix parsing + dispatch
│   │   ├── cmds.js  ping.js  owner.js  fix.js  fixlog.js  setai.js  ai.js  extra.js
│   ├── ai/
│   │   └── providers.js      # Groq / Gemini / OpenAI / OpenRouter integrations + fallback
│   ├── store/
│   │   └── aiState.js        # Per-chat AI on/off + provider + short memory (JSON file)
│   └── utils/
│       ├── logger.js         # File + console logging, powers .fixlog
│       └── formatting.js     # Bold-text helpers
├── public/
│   └── qr.html               # The login page shown at your Render URL
├── package.json
├── render.yaml
├── .env.example
└── .gitignore
```

---

## 6. Adding more commands

Add a new file in `src/commands/`, export a function that returns the reply string, then register it in the `switch` statement inside `src/commands/index.js`. Use `bold()` / `withFooter()` from `src/utils/formatting.js` to match the existing style.

---

## 7. Troubleshooting

- **QR page stuck on "Waking up the bot…"** → check Render logs; likely still installing/booting. Wait ~30s.
- **Bot replies with an AI error** → run `.fixlog` in WhatsApp, or check that at least one `*_API_KEY` is set correctly in Render's Environment tab.
- **Logged out unexpectedly** → delete the `auth_info/` folder (or the persistent disk contents) and redeploy to get a fresh QR.
- **Command not responding** → make sure the message starts with the prefix (default `.`), e.g. `.ping` not `ping`.

---

Built for **#RADHEY** — t.me/youradhey
<!-- hacktoberfest update 20260709191339673055 -->
<!-- run 1 @ 20260709191359985647 -->
<!-- run 2 @ 20260709191413008316 -->
<!-- run 3 @ 20260709191426675285 -->
<!-- run 4 @ 20260709191440535003 -->
<!-- run 5 @ 20260709191458082493 -->
<!-- run 6 @ 20260709191512697759 -->
<!-- run 7 @ 20260709191526305954 -->
<!-- run 8 @ 20260709191539723029 -->
<!-- run 9 @ 20260709191553790747 -->
<!-- run 10 @ 20260709191607447239 -->
<!-- run 11 @ 20260709191621226738 -->
<!-- run 12 @ 20260709191635083886 -->
<!-- run 13 @ 20260709191653816982 -->
<!-- run 14 @ 20260709191707917382 -->
<!-- run 15 @ 20260709191722765972 -->
<!-- run 16 @ 20260709191737165429 -->
<!-- run 17 @ 20260709191751245730 -->
<!-- run 18 @ 20260709191804685458 -->
<!-- run 19 @ 20260709191818776671 -->
<!-- run 20 @ 20260709191832794849 -->
<!-- run 21 @ 20260709191846617362 -->
<!-- run 22 @ 20260709191900696105 -->
<!-- run 23 @ 20260709191913770918 -->
<!-- run 24 @ 20260709191927248299 -->
<!-- run 25 @ 20260709191943246500 -->
<!-- run 26 @ 20260709191957145834 -->
<!-- run 27 @ 20260709192011249330 -->
<!-- run 28 @ 20260709192027246320 -->
<!-- run 29 @ 20260709192043354958 -->
<!-- run 30 @ 20260709192057165061 -->
<!-- run 31 @ 20260709192111657226 -->
<!-- run 32 @ 20260709192125608403 -->
<!-- run 33 @ 20260709192138613666 -->
<!-- run 34 @ 20260709192152523967 -->
<!-- run 35 @ 20260709192207566106 -->
<!-- run 36 @ 20260709192221642786 -->
<!-- run 37 @ 20260709192236366690 -->
<!-- run 38 @ 20260709192250125144 -->
<!-- run 39 @ 20260709192303370146 -->
<!-- run 40 @ 20260709192318253770 -->
<!-- run 41 @ 20260709192332045152 -->
<!-- run 42 @ 20260709192345655697 -->
<!-- run 43 @ 20260709192401064154 -->
<!-- run 44 @ 20260709192414606184 -->
<!-- run 45 @ 20260709192428438101 -->
<!-- run 46 @ 20260709192442765930 -->
<!-- run 47 @ 20260709192459135948 -->
<!-- run 48 @ 20260709192512381540 -->
<!-- run 49 @ 20260709192526216441 -->
<!-- run 50 @ 20260709192540773759 -->
<!-- run 51 @ 20260709192555723983 -->
<!-- run 52 @ 20260709192629966641 -->
<!-- run 53 @ 20260709192643662137 -->
<!-- run 54 @ 20260709192658006475 -->
<!-- run 55 @ 20260709192710477044 -->
<!-- run 56 @ 20260709192723008427 -->
<!-- run 57 @ 20260709192735425107 -->
<!-- run 58 @ 20260709192749013173 -->
<!-- run 59 @ 20260709192802444783 -->
<!-- run 60 @ 20260709192815565378 -->
<!-- run 61 @ 20260709192830591817 -->
<!-- run 62 @ 20260709192845707487 -->
<!-- run 63 @ 20260709192859359144 -->
<!-- run 64 @ 20260709192912402877 -->
<!-- run 65 @ 20260709192924989359 -->
<!-- run 66 @ 20260709192937833463 -->
<!-- run 67 @ 20260709192950819970 -->
<!-- run 68 @ 20260709193004017498 -->
<!-- run 69 @ 20260709193018152219 -->
<!-- run 70 @ 20260709193031463752 -->
<!-- run 71 @ 20260709193045050678 -->
<!-- run 72 @ 20260709193058429134 -->
<!-- run 73 @ 20260709193112834476 -->
<!-- run 74 @ 20260709193127210610 -->
<!-- run 75 @ 20260709193140993175 -->
<!-- run 76 @ 20260709193154425987 -->
<!-- run 77 @ 20260709193208474785 -->
<!-- run 78 @ 20260709193222550664 -->
<!-- run 79 @ 20260709193236588411 -->
<!-- run 80 @ 20260709193251046100 -->
<!-- run 81 @ 20260709193305456858 -->
<!-- run 82 @ 20260709193319084208 -->
<!-- run 83 @ 20260709193332311936 -->
<!-- run 84 @ 20260709193346570856 -->
<!-- run 85 @ 20260709193400952366 -->
<!-- run 86 @ 20260709193414721606 -->
<!-- run 87 @ 20260709193434073387 -->
<!-- run 88 @ 20260709193447803987 -->
<!-- run 89 @ 20260709193501605221 -->
<!-- run 90 @ 20260709193515700599 -->
<!-- run 91 @ 20260709193528806260 -->
<!-- run 92 @ 20260709193543760566 -->
<!-- run 93 @ 20260709193557985493 -->
<!-- run 94 @ 20260709193611193294 -->
<!-- run 95 @ 20260709193624749281 -->
<!-- run 96 @ 20260709193637278745 -->
<!-- run 97 @ 20260709193650172525 -->
<!-- run 98 @ 20260709193703429085 -->
<!-- run 99 @ 20260709193716165347 -->
<!-- run 100 @ 20260709193729169266 -->
<!-- run 101 @ 20260709193743408865 -->
<!-- run 102 @ 20260709193757050951 -->
<!-- run 103 @ 20260709193813252457 -->
<!-- run 104 @ 20260709193825792798 -->
<!-- run 105 @ 20260709193839186503 -->
<!-- run 106 @ 20260709193853064066 -->
<!-- run 107 @ 20260709193906004664 -->
<!-- run 108 @ 20260709193919688113 -->
<!-- run 109 @ 20260709193933148227 -->
<!-- run 110 @ 20260709193946346137 -->
<!-- run 111 @ 20260709194000180956 -->
<!-- run 112 @ 20260709194013478733 -->
<!-- run 113 @ 20260709194035739512 -->
<!-- run 114 @ 20260709194050024689 -->
<!-- run 115 @ 20260709194104072464 -->
<!-- run 116 @ 20260709194118658496 -->
