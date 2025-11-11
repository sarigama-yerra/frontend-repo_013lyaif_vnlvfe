import { useEffect, useRef, useState } from 'react'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const listRef = useRef(null)

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    // scroll to bottom on new messages
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userText = input

    const localId = 'local-' + Date.now()
    setMessages((prev) => [...prev, { id: localId, role: 'user', text: userText }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, user_text: userText })
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()

      setSessionId(data.session_id)

      // merge messages if provided
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages(data.messages.map((m, idx) => ({ id: idx, role: m.role, text: m.text })))
      } else {
        setMessages((prev) => [...prev, { id: 'asst-' + Date.now(), role: 'assistant', text: data.reply }])
      }
    } catch (e) {
      setMessages((prev) => [...prev, { id: 'err-' + Date.now(), role: 'assistant', text: 'Si è verificato un errore. Riprova tra poco.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50 flex flex-col">
      <header className="px-6 py-4 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold">P</div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Peer</h1>
              <p className="text-xs text-gray-500">Il tuo assistente virtuale per tutto</p>
            </div>
          </div>
          <a href="/test" className="text-sm text-sky-600 hover:text-sky-700">Stato backend</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full flex-1 flex flex-col p-4 sm:p-6">
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 p-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-16">
              <p className="text-lg">Ciao! Sono Peer. Come posso aiutarti oggi?</p>
              <p className="text-sm mt-2">Scrivi un messaggio qui sotto e premi Invio.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-sky-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border rounded-bl-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4">
          <div className="bg-white border rounded-2xl shadow-sm p-3 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Scrivi un messaggio per Peer..."
              rows={1}
              className="flex-1 resize-none outline-none text-sm p-2 rounded-md max-h-40"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`px-4 py-2 rounded-md text-white text-sm font-medium ${loading || !input.trim() ? 'bg-sky-300' : 'bg-sky-600 hover:bg-sky-700'}`}
            >
              {loading ? 'Invio...' : 'Invia'}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 text-center">Peer offre risposte pratiche e concise. Non sostituisce consulenze professionali.</p>
        </div>
      </main>
    </div>
  )
}

export default App
