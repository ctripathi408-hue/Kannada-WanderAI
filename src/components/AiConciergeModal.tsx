import React, { useState } from 'react';
import { X, Send, Bot, HelpCircle } from 'lucide-react';

interface AiConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextCity?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUERIES = [
  'Best time for morning sunrise at Matanga Hill, Hampi?',
  'How do I take the KSRTC Flybus from BLR Airport to Mysuru?',
  'Where is the original authentic Mysore Pak store?',
  'Is Western Ghats / Coorg safe to drive during monsoon?',
  'What should I wear for visiting temples like Chamundeshwari?'
];

export const AiConciergeModal: React.FC<AiConciergeModalProps> = ({
  isOpen,
  onClose,
  contextCity
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Namaskara! I am your local Karnataka travel guide. ${
        contextCity ? `I see you are interested in ${contextCity}. ` : ''
      }Ask me anything about KSRTC bus timetables, Vande Bharat train bookings, temple timings, authentic local cuisines, or road conditions across Karnataka.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend, contextCity })
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.answer || 'Karnataka has boundless wonders to discover. Safe travels!' }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'For smooth travel across Karnataka, book your KSRTC Airavat buses on ksrtc.in and morning train tickets via irctc.co.in. Enjoy delicious filter coffee along the expressway!'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl h-[620px] shadow-2xl flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xs">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-heading">Karnataka AI Travel Concierge</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 uppercase tracking-wider font-semibold">
                  Guide
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">Local logistics, temple tips &amp; authentic foodie recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="p-3 bg-slate-50/80 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-2 no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 self-center shrink-0 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Suggested:</span>
          </span>
          {SUGGESTED_QUERIES.map((query, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(query)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              {query}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/40">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 border border-emerald-200/70 dark:border-emerald-800 shadow-xs">
                  AI
                </div>
              )}
              <div
                className={`max-w-[82%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-700 dark:bg-emerald-600 text-white rounded-tr-xs font-medium shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs space-y-2 border border-slate-200/70 dark:border-slate-700 shadow-xs'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 shadow-xs">
                  You
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 p-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 dark:bg-emerald-400 animate-ping" />
              <span>Consulting Karnataka travel archives &amp; timetables...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-2.5"
        >
          <input
            type="text"
            placeholder="Ask about travel timings, KSRTC buses, places to eat, or road conditions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all shadow-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3.5 rounded-2xl bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-500 text-white disabled:opacity-50 transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};
