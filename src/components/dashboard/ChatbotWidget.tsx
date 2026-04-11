import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { type RootState } from "../../redux/store";
import { apiUrl } from "../../config/api";

export function ChatbotWidget() {
  const { user } = useSelector((state: RootState) => state.auth!);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{role: 'user'|'agent', content: string}[]>([
    { role: 'agent', content: "Hello! I'm here to help you unpack your thoughts. What's on your mind today?" }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const userEntry = query.trim();
    setMessages(prev => [...prev, { role: 'user', content: userEntry }]);
    setQuery("");
    setLoading(true);
    try {
      const res = await axios.post(apiUrl("/api/chat"), {
        userId: user?.userId,
        message: userEntry
      });
      setMessages(prev => [...prev, { role: 'agent', content: res.data.message }]);
    } catch {
      setMessages(prev => [...prev, { role: 'agent', content: "It sounds like you have a lot going on. Let's focus on what you can control right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col" style={{ minHeight: '420px' }}>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Guided Reflection</h3>
      <p className="text-xs text-gray-400 mb-4">Your private space to express and process</p>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-hide pr-1 max-h-80">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-700 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-600 rounded-2xl rounded-bl-none px-4 py-2.5 flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="I've been feeling..."
          className="w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 rounded-full px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-200 text-sm"
        />
        <button type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors text-xs"
        >↑</button>
      </form>
    </div>
  );
}
