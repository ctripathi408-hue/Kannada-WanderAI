import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  User as UserIcon, 
  RotateCcw, 
  Compass, 
  Bus, 
  Landmark, 
  LogIn
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

interface GeminiChatbotProps {
  currentUser: FirebaseUser | null;
  onRequireLogin: () => void;
  contextCity?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface PersonaConfig {
  id: 'concierge' | 'transit_dispatcher' | 'heritage_scholar';
  name: string;
  roleTitle: string;
  description: string;
  recommendedModel: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';
  modelSpeed: string;
  icon: React.ReactNode;
  suggestedQuestions: string[];
}

const PERSONAS: PersonaConfig[] = [
  {
    id: 'concierge',
    name: 'Travel Concierge',
    roleTitle: 'General Travel & Holiday Architect',
    description: 'Expert on Karnataka destinations, scenic routes, curated homestays, and culinary traditions.',
    recommendedModel: 'gemini-3.8-flash',
    modelSpeed: 'General Tasks (gemini-3.8-flash)',
    icon: <Compass className="w-4 h-4 text-emerald-700" />,
    suggestedQuestions: [
      'What is a 5-day itinerary covering Mysuru and Coorg?',
      'Best places to eat authentic local food in Udupi & Mangaluru?',
      'Can you suggest peaceful coffee estate homestays near Chikmagalur?'
    ]
  },
  {
    id: 'transit_dispatcher',
    name: 'Transit Dispatcher',
    roleTitle: 'High-Speed Transit & Timetables',
    description: 'Instant routes, KSRTC bus classes (Airavat/Flybus), train schedules & ghat road updates.',
    recommendedModel: 'gemini-3.1-flash-lite',
    modelSpeed: 'Fast Responses (gemini-3.1-flash-lite)',
    icon: <Bus className="w-4 h-4 text-emerald-700" />,
    suggestedQuestions: [
      'How do I take the Flybus from BLR Airport to Mysuru?',
      'What are the timings for the Vande Bharat Express between Bangalore & Mysore?',
      'Is Shiradi Ghat open and what is the road condition to Mangaluru?'
    ]
  },
  {
    id: 'heritage_scholar',
    name: 'Heritage Scholar',
    roleTitle: 'Deep Historical & Architectural Analysis',
    description: 'Deep exploration of Vijayanagara ruins at Hampi, Hoysala star temples & Chalukyan caves.',
    recommendedModel: 'gemini-3.8-flash',
    modelSpeed: 'Complex Reasoning (gemini-3.8-flash / gemini-4-argon)',
    icon: <Landmark className="w-4 h-4 text-amber-600" />,
    suggestedQuestions: [
      'Explain the architectural significance of the Hoysala star temples in Belur.',
      'What is the story behind the Stone Chariot and musical pillars at Hampi?',
      'How did Badami Chalukyas pioneer rock-cut cave architecture in Karnataka?'
    ]
  }
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  currentUser,
  onRequireLogin
}) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaConfig>(PERSONAS[0]);
  const [selectedModel, setSelectedModel] = useState<string>(PERSONAS[0].recommendedModel);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `Namaskara! I am your **Karnataka Travel Concierge** powered by Gemini. Ask me about road routes, heritage temples, authentic filter coffee spots, or custom day-by-day plans. How can I help your journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: PERSONAS[0].recommendedModel
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // When switching persona, suggest matching model
  const handleSelectPersona = (persona: PersonaConfig) => {
    setSelectedPersona(persona);
    setSelectedModel(persona.recommendedModel);

    setMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: 'model',
        content: `Switched mode to **${persona.name}** (${persona.roleTitle}). ${persona.description}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: persona.recommendedModel
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Map previous turns for multi-turn history
      const history = newMessages.slice(0, -1).map(m => ({
        role: m.role,
        text: m.content
      }));

      const res = await fetch('/api/chat-multiturn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history,
          message: text,
          persona: selectedPersona.id,
          model: selectedModel
        })
      });

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.reply || 'Karnataka is home to magnificent destinations. Happy exploring!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel
      };

      setMessages([...newMessages, botMessage]);

      // If user is authenticated, persist to Firestore
      if (currentUser) {
        try {
          const sessionRef = doc(db, 'users', currentUser.uid, 'chatSessions', 'current-session');
          await setDoc(sessionRef, {
            id: 'current-session',
            userId: currentUser.uid,
            title: text.slice(0, 50),
            personaRole: selectedPersona.name,
            modelUsed: selectedModel,
            updatedAt: new Date().toISOString()
          }, { merge: true });

          const messagesCol = collection(db, 'users', currentUser.uid, 'chatSessions', 'current-session', 'messages');
          await addDoc(messagesCol, {
            userId: currentUser.uid,
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
          });
          await addDoc(messagesCol, {
            userId: currentUser.uid,
            role: 'model',
            content: botMessage.content,
            timestamp: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn('Firestore chat sync notice:', dbErr);
        }
      }

    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: 'For travel across Karnataka, KSRTC Airavat buses and Vande Bharat express trains connect major cities comfortably. Visit ksrtc.in or irctc.co.in for official ticketing.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'offline-fallback'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `Chat history cleared. I am ready with **${selectedPersona.name}**. What would you like to explore in Karnataka?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel
      }
    ]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col h-[750px] max-w-5xl mx-auto">
      
      {/* Top Header & Role Switcher */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-amber-300 backdrop-blur-md shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold font-heading">Karnataka AI Travel Concierge</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-semibold uppercase tracking-wider">
                  Multi-Turn
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Specialized personas powered by Gemini for every travel inquiry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleClearHistory}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-xs"
              title="Reset Conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {!currentUser && (
              <button
                onClick={onRequireLogin}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Save Chats (Sign In)</span>
              </button>
            )}
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {PERSONAS.map((persona) => {
            const isSelected = selectedPersona.id === persona.id;
            return (
              <div
                key={persona.id}
                onClick={() => handleSelectPersona(persona)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-white dark:border-slate-700 shadow-md'
                    : 'bg-white/10 text-white border-white/15 hover:bg-white/15 backdrop-blur-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-2 font-heading">
                    {persona.icon}
                    <span>{persona.name}</span>
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300' : 'bg-white/20 text-amber-200'
                  }`}>
                    {persona.recommendedModel.replace('gemini-', '')}
                  </span>
                </div>
                <p className={`text-[11px] mt-1.5 line-clamp-1 ${
                  isSelected ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-100/70'
                }`}>
                  {persona.roleTitle}
                </p>
              </div>
            );
          })}
        </div>

        {/* Model Selection Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-emerald-100/90 pt-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-emerald-200">Active Model:</span>
            <div className="inline-flex rounded-xl bg-black/25 p-0.5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedModel === 'gemini-3.1-flash-lite' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                3.1 Flash Lite (Fast)
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedModel === 'gemini-3.8-flash' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                3.8 Flash (General)
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-4-argon')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedModel === 'gemini-4-argon' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                4 Argon (Complex)
              </button>
            </div>
          </div>

          <div className="text-xs text-emerald-200/80">
            {currentUser ? `Saved to ${currentUser.displayName || 'your account'}` : 'Guest Mode (Sign in to sync history)'}
          </div>
        </div>
      </div>

      {/* Suggested Questions Chips */}
      <div className="p-3 bg-slate-50/80 dark:bg-slate-850 border-b border-slate-200/70 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0">Try asking:</span>
        {selectedPersona.suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 bg-slate-50/30 dark:bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'model' && (
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs border border-emerald-200/70 dark:border-emerald-800">
                <Bot className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-400" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-5 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-700 dark:bg-emerald-600 text-white rounded-tr-xs font-medium shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs space-y-2.5 border border-slate-200/70 dark:border-slate-700 shadow-xs'
              }`}
            >
              {/* Message text with basic paragraph formatting */}
              <div className="whitespace-pre-line">
                {msg.content}
              </div>

              <div className={`pt-1 text-[11px] flex items-center justify-between gap-3 ${
                msg.role === 'user' ? 'text-emerald-200' : 'text-slate-400 dark:text-slate-500'
              }`}>
                <span>{msg.timestamp}</span>
                {msg.modelUsed && msg.role === 'model' && (
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-[10px]">
                    {msg.modelUsed}
                  </span>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-9 h-9 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="User" className="w-9 h-9 rounded-2xl object-cover" />
                ) : (
                  <UserIcon className="w-4.5 h-4.5" />
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/70 dark:border-emerald-800">
              <Bot className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2.5 shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 dark:bg-emerald-400 animate-ping" />
              <span>{selectedPersona.name} is formulating advice using {selectedModel}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-3"
      >
        <input
          type="text"
          placeholder={`Ask ${selectedPersona.name} about Karnataka journeys, routes, food, or history...`}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all shadow-xs"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-6 py-3.5 rounded-2xl bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-500 disabled:opacity-50 text-white font-heading font-semibold text-sm shadow-xs hover:shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
