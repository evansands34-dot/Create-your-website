import { useState } from 'react'
import Script from 'next/script'

export default function Home() {
  const [apiKeyPresent, setApiKeyPresent] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('gpt-4o-mini')
  const [messages, setMessages] = useState([])
  const [files, setFiles] = useState(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!prompt.trim()) return alert('Please enter a prompt')
    setLoading(true)
    setMessages([{ role: 'user', text: prompt }])
    setFiles(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model })
      })
      const data = await res.json()
      if (!res.ok) {
        setMessages(m => [...m, { role: 'ai', text: 'Error: ' + (data.error || res.status) }])
        setLoading(false)
        return
      }

      if (!data.files) {
        setMessages(m => [...m, { role: 'ai', text: 'No files returned by the server.' }])
        setLoading(false)
        return
      }

      setFiles(data.files)
      setMessages(m => [...m, { role: 'ai', text: `Generated ${data.files.length} files.` }])
    } catch (err) {
      setMessages(m => [...m, { role: 'ai', text: 'Error: ' + err.message }])
    } finally {
      setLoading(false)
    }
  }

  async function downloadZip() {
    if (!files) return
    // JSZip and saveAs are loaded on the page via CDN
    const zip = new JSZip()
    files.forEach(f => zip.file(f.path, f.content))
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'generated-site.zip')
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, system-ui, sans-serif', background: 'linear-gradient(180deg,#071022 0%, #07182a 100%)', minHeight: '100vh', color: '#e6eef8' }}>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js" strategy="beforeInteractive" />

      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <header style={{ marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Create Your Website — AI Builder</h1>
          <p style={{ margin: 0, color: '#9aa4b2', fontSize: 13 }}>Type a prompt describing the website you want. The AI will return a set of files you can download as a ZIP and deploy.</p>
        </header>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ background: '#3b2414', color: '#ffd6b5', padding: 10, borderRadius: 8, marginBottom: 12 }}>
            <strong>Security:</strong> The server-side endpoint stores your OpenAI key in environment variables. Do NOT paste API keys in the browser.
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#9aa4b2', fontSize: 12 }}>Model</label>
              <input value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', background: 'transparent', color: 'inherit' }} />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ color: '#9aa4b2', fontSize: 12 }}>Prompt (what site do you want?)</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Example: A 3-page portfolio site with contact form, responsive, and uses Google Fonts. Include meta tags and instructions to set up a custom domain on Vercel." style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)', background: 'transparent', color: 'inherit', minHeight: 120 }} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button onClick={generate} style={{ background: '#60a5fa', border: 'none', padding: '10px 14px', borderRadius: 8, color: '#06202e', fontWeight: 600, cursor: 'pointer' }} disabled={loading}>{loading ? 'Generating…' : 'Generate Website'}</button>
            <button onClick={downloadZip} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#9aa4b2', padding: '10px 14px', borderRadius: 8 }} disabled={!files}>Download ZIP</button>
            <button onClick={() => { setPrompt(''); setFiles(null); setMessages([]) }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#9aa4b2', padding: '10px 14px', borderRadius: 8 }}>Clear</button>
          </div>

          <div style={{ marginTop: 14, maxHeight: 320, overflow: 'auto', padding: 12, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.03)' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ padding: 8, borderRadius: 8, marginBottom: 8, background: m.role === 'user' ? 'rgba(96,165,250,0.08)' : 'rgba(255,255,255,0.02)', color: m.role === 'user' ? '#60a5fa' : 'inherit' }}>{m.text}</div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ color: '#9aa4b2', fontSize: 12 }}>Files</div>
            <div style={{ marginTop: 8 }}>
              {files ? files.map((f, i) => (
                <div key={i} style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.25)', padding: '6px 8px', borderRadius: 6, marginBottom: 6 }}>{f.path}</div>
              )) : <div style={{ color: '#9aa4b2', fontSize: 13 }}>No files yet — generate to see results.</div>}
            </div>
          </div>

          <footer style={{ marginTop: 12, color: '#9aa4b2', fontSize: 12 }}>Tip: Set the OPENAI_API_KEY as an environment variable on Vercel (or in .env.local for local dev) so the server endpoint can call OpenAI securely.</footer>
        </div>
      </div>
    </div>
  )
}
