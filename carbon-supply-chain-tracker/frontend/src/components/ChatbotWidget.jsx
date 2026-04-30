import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/axios';

const ChatbotWidget = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initial message based on language
    const initialMsgs = {
      en: 'Hello! I am your CarbonTrace assistant. How can I help you today?',
      hi: 'नमस्ते! मैं आपका CarbonTrace सहायक हूँ। मैं आज आपकी क्या सहायता कर सकता हूँ?',
      es: '¡Hola! Soy su asistente de CarbonTrace. ¿Cómo puedo ayudarle hoy?'
    };
    setMessages([{ role: 'bot', text: initialMsgs[i18n.language] || initialMsgs.en }]);
  }, [i18n.language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (msgText) => {
    const text = msgText || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chatbot/ask', {
        message: text,
        language: i18n.language || 'en'
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'bot', text: response.data.answer }]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const getQuickQuestions = () => {
    const labels = {
      en: [
        { label: 'How to add inventory?', value: 'How to add inventory?' },
        { label: 'Create shipment?', value: 'How to create shipment?' },
        { label: 'Emission calculation?', value: 'How is carbon emission calculated?' },
        { label: 'Show my summary', value: 'Show my summary' },
        { label: 'Sample data', value: 'Give sample data' }
      ],
      hi: [
        { label: 'इन्वेंट्री कैसे जोड़ें?', value: 'How to add inventory?' },
        { label: 'शिपमेंट कैसे बनाएं?', value: 'How to create shipment?' },
        { label: 'उत्सर्जन की गणना?', value: 'How is carbon emission calculated?' },
        { label: 'मेरा सारांश दिखाएं', value: 'Show my summary' },
        { label: 'नमूना डेटा दें', value: 'Give sample data' }
      ],
      es: [
        { label: '¿Cómo agregar inventario?', value: 'How to add inventory?' },
        { label: '¿Crear envío?', value: 'How to create shipment?' },
        { label: '¿Cálculo de emisiones?', value: 'How is carbon emission calculated?' },
        { label: 'Mostrar mi resumen', value: 'Show my summary' },
        { label: 'Dar datos de muestra', value: 'Give sample data' }
      ]
    };
    return labels[i18n.language] || labels.en;
  };

  const quickQuestions = getQuickQuestions();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[520px] glass-card rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-primary/20 to-emerald-500/20 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl text-primary">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">CarbonTrace Assistant</h3>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`shrink-0 p-2 rounded-lg h-fit ${msg.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-slate-800 text-slate-400'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-primary text-dark font-medium rounded-tr-none shadow-lg' 
                      : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="shrink-0 p-2 rounded-lg h-fit bg-slate-800 text-slate-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-800/80 text-slate-400 border border-white/5 rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips */}
          <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5 bg-slate-900/40">
            {quickQuestions.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => handleSend(q.value)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-primary/20 text-slate-300 hover:text-primary border border-white/5 hover:border-primary/30 text-[11px] font-medium transition-all"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-900/60 border-t border-white/5">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative group"
            >
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={i18n.language === 'hi' ? 'इन्वेंट्री, शिपमेंट के बारे में पूछें...' : i18n.language === 'es' ? 'Preguntar sobre inventario, envíos...' : 'Ask about inventory, shipments...'}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary hover:bg-emerald-400 text-dark rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-primary"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-2 group ${
          isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-primary text-dark hover:scale-110 active:scale-95'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">
            {i18n.language === 'hi' ? 'AI के साथ चैट करें' : i18n.language === 'es' ? 'Chatea con AI' : 'Chat with AI'}
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
