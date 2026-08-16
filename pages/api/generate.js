export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { prompt, model } = req.body || {}
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not configured on the server' })

  // Construct strict system instruction to force JSON output
  const system = `You are a helpful assistant that outputs ONLY valid JSON. The JSON MUST be an object with a single key \"files\" whose value is an array of objects. Each object must have \"path\" (string) and \"content\" (string). Paths are relative (example: index.html, styles/main.css). The content should be the literal file contents. No extra commentary, no markdown fences.`
  const user = `Create a working static website project based on the user's request. Include any deploy instructions in a file named DEPLOYMENT.md if needed. User prompt:\n${prompt}`

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ]

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model: model || 'gpt-4o-mini', messages, temperature: 0.2, max_tokens: 2000 })
    })

    if (!resp.ok) {
      const text = await resp.text()
      return res.status(502).json({ error: 'OpenAI API error', details: text })
    }

    const data = await resp.json()
    const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
    if (!reply) return res.status(502).json({ error: 'No reply from OpenAI' })

    // Try to parse the JSON strictly
    let json = null
    try {
      json = JSON.parse(reply)
    } catch (e) {
      const first = reply.indexOf('{')
      const last = reply.lastIndexOf('}')
      if (first !== -1 && last !== -1) {
        try {
          json = JSON.parse(reply.substring(first, last + 1))
        } catch (e2) {
          json = null
        }
      }
    }

    if (!json || !Array.isArray(json.files)) {
      return res.status(502).json({ error: 'Model did not return files JSON', raw: reply })
    }

    // Return files to client
    return res.status(200).json({ files: json.files })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
