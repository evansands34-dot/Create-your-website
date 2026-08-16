# Create Your Website — AI Builder

This repository contains a small Next.js app that provides an "AI website builder" UI. Enter a prompt describing the site you want, and the backend will call the OpenAI API to generate a set of static files (HTML/CSS/JS) that you can download and deploy.

Important: Do NOT paste your OpenAI API key into the browser in production. Instead, configure the server-side environment variable OPENAI_API_KEY in your hosting provider (Vercel/GitHub Actions).

Quick start (local)

1. Install dependencies

```bash
npm install
```

2. Create a local env file with your OpenAI key (for development only)

```bash
# .env.local
OPENAI_API_KEY=sk-...
```

3. Run the dev server

```bash
npm run dev
```

4. Open http://localhost:3000 and enter a prompt. The server will call OpenAI using the key from your environment and return generated files as a downloadable ZIP.

Deploy to Vercel (recommended)

1. Push this repo to GitHub (already in your account).
2. Import the repo into Vercel: https://vercel.com/new
3. In Vercel project settings, add an Environment Variable named `OPENAI_API_KEY` with your key.
4. Deploy. The site will call the server-side endpoint securely and will not expose your key to the browser.

Notes & next steps

- If you want automatic repo creation and programmatic deploys (the site can create a new GitHub repo and trigger a Vercel deploy), you'll need to add GH_TOKEN and VERCEL_TOKEN as secrets.
- The server expects the model to return strict JSON with a `files` array. The model prompt enforces that, but outputs might vary — if parsing fails the API will return the raw model reply for debugging.
- This is an MVP. I can harden parsing, add validation on generated files, and add a UI flow to push the generated files directly to a new GitHub repo for you.

Security

- Never store production API keys in client-side code. Always use server-side environment variables.
- If you add domain automation, provide the domain provider token in secrets and I will implement provider-specific DNS automation only with explicit approval.

