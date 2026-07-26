import React, { useState, useEffect, useRef } from 'react';
import { chatbotAPI } from '../services/api';
import { MessageSquare, Send, Sparkles, User, Activity, ShieldAlert, AlertTriangle, RefreshCw } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDiagnosed, setIsDiagnosed] = useState(false);
  const [diagnosisInfo, setDiagnosisInfo] = useState(null);

  const messagesEndRef = useRef(null);

  // Initialize with a welcome message on mount
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Hello! I am your AI Virtual Medical Consultant. Please describe what symptoms you are experiencing (e.g. 'I have had headache and chest tightness since yesterday'), and how long you've had them.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading || isDiagnosed) return;

    const userMessageText = inputValue.trim();
    setInputValue('');

    const newMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const data = await chatbotAPI.chat(userMessageText, conversationId);
      
      // Save conversation ID for state persistence
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      // Check if emergency warning triggered
      const isEmergency = userMessageText.toLowerCase().includes('chest pain') || data.reply.includes('EMERGENCY WARNING');

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency
      };

      setMessages((prev) => [...prev, botMsg]);

      // If diagnosis triggers, stop dialogue and show diagnostics
      if (data.diagnosis_ready) {
        setIsDiagnosed(true);
        setDiagnosisInfo(data.prediction);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue connecting to the core LLM server. Fallback system ready. Please re-state your symptoms.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'assistant',
        text: "Hello! I am your AI Virtual Medical Consultant. Please describe what symptoms you are experiencing (e.g. 'I have had headache and chest tightness since yesterday'), and how long you've had them.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setConversationId(null);
    setIsDiagnosed(false);
    setDiagnosisInfo(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-left space-y-6">
      <div className="border-b border-white/5 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
            <MessageSquare className="h-8 w-8 text-brand-500" />
            AI Virtual Consultant
          </h1>
          <p className="text-sm text-gray-400">
            Stateful interactive chatbot conversation to gather details, screen warnings, and call machine learning diagnostics.
          </p>
        </div>
        
        {(messages.length > 1 || isDiagnosed) && (
          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            New Consultation
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px] items-stretch">
        {/* Left Info Panel */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-6 h-full overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-500" />
                Live Session Details
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                The chatbot operates in a conversational sequence. It uses **Google Gemini AI** or a fallback state machine to extract critical elements. Once sufficient symptom data is gathered, the session automatically deactivates and triggers the diagnostic results.
              </p>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">Screening Flags</span>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                  <span className="text-gray-300">Active Dialog Turn:</span>
                  <span className="font-bold text-white">
                    {messages.filter(m => m.sender === 'user').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                  <span className="text-gray-300">Emergency Screening:</span>
                  <span className="font-bold text-green-400">Online</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                  <span className="text-gray-300">Status:</span>
                  <span className={`font-bold ${isDiagnosed ? 'text-red-400' : 'text-brand-500'}`}>
                    {isDiagnosed ? 'Diagnostic Ready' : 'Awaiting Symptoms'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/15 text-yellow-200 p-4 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-gray-400 leading-normal">
              <b>Disclaimer:</b> AI reviews symptom history for educational references. If you feel extreme tightness in chest or shortness of breath, please immediately visit a nearby hospital.
            </div>
          </div>
        </div>

        {/* Right Chat Panel */}
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-white/5 flex flex-col justify-between h-full overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[550px]">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-[85%] ${
                    isAssistant ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                      isAssistant
                        ? 'bg-brand-500/10 text-brand-500 border-brand-500/20'
                        : 'bg-blue-600/10 text-blue-500 border-blue-500/20'
                    }`}
                  >
                    {isAssistant ? <Activity className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  
                  <div className="space-y-1">
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isAssistant
                          ? msg.isEmergency 
                            ? 'bg-red-500/10 border border-red-500/20 text-red-100'
                            : 'bg-white/5 border border-white/5 text-gray-200'
                          : 'bg-brand-500 text-white rounded-tr-none'
                      }`}
                    >
                      {/* Render line breaks or simple formatting */}
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-gray-500 px-1">{msg.time}</span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3 mr-auto text-left">
                <div className="h-8 w-8 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-gray-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input form */}
          <div className="p-4 border-t border-white/5 bg-white/10">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                disabled={loading || isDiagnosed}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isDiagnosed
                    ? "Session complete. Diagnosis has been rendered."
                    : "Describe your symptoms or answer the follow-up..."
                }
                className="glass-input flex-1 px-4 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim() || isDiagnosed}
                className="p-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
