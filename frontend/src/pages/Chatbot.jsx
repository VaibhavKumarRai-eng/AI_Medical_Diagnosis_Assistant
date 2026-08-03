import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { chatbotAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Sparkles, User, Activity, ShieldAlert, 
  RefreshCw, Mic, Volume2, VolumeX, Copy, Check, CornerDownLeft, Brain 
} from 'lucide-react';

const Chatbot = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDiagnosed, setIsDiagnosed] = useState(false);
  const [diagnosisInfo, setDiagnosisInfo] = useState(null);
  
  // Voice & Narration states
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState('en-IN');
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  const sampleQuestions = [
    "I have had a sharp pain in my stomach for two days.",
    "My throat is sore, and I have a dry cough since morning.",
    "Feeling sudden dizziness with mild heart palpitations."
  ];

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Hello! I am Aegis AI, your virtual medical consultant. Let's gather your clinical context. Could you describe your symptoms, when they started, and if you are experiencing any pain or fever?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    if (!textToSend.trim() || loading || isDiagnosed) return;

    const userMessageText = textToSend.trim();
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
      
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      const isEmergency = userMessageText.toLowerCase().includes('chest pain') || data.reply.includes('EMERGENCY WARNING');

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency
      };

      setMessages((prev) => [...prev, botMsg]);

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
    window.speechSynthesis.cancel();
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'assistant',
        text: "Hello! I am Aegis AI, your virtual medical consultant. Let's gather your clinical context. Could you describe your symptoms, when they started, and if you are experiencing any pain or fever?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setConversationId(null);
    setIsDiagnosed(false);
    setDiagnosisInfo(null);
    setIsListening(false);
    setSpeakingMsgId(null);
  };

  // Web Speech API: Dictation / STT
  const startDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = speechLang;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  // Web Speech API: Audio Readout / TTS
  const speakText = (msgId, text) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`~]/g, ''); // strip markdown formatting symbols
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-left space-y-10 relative transition-colors duration-300 ${
      isLight ? 'text-med-text' : 'text-gray-300'
    }`}>
      {/* Background Glowing Orbs */}
      <div className={`absolute top-20 left-[10%] w-80 h-80 rounded-full blur-[100px] pointer-events-none -z-10 opacity-70 ${
        isLight ? 'bg-med-secondary' : 'bg-primary/10'
      }`} />
      <div className={`absolute bottom-20 right-[10%] w-80 h-80 rounded-full blur-[100px] pointer-events-none -z-10 opacity-70 ${
        isLight ? 'bg-[#EEF0FF]' : 'bg-secondary/10'
      }`} />

      <div className={`border-b pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        isLight ? 'border-med-secondary' : 'border-white/[0.06]'
      }`}>
        <div>
          <h1 className={`text-3xl font-extrabold flex items-center gap-3 transition-colors duration-300 ${
            isLight ? 'text-med-text' : 'text-white'
          }`}>
            <div className={`p-2 rounded-xl border shadow-[0_0_15px_rgba(37,99,235,0.15)] ${
              isLight ? 'bg-med-secondary border-med-primary/10 text-med-primary' : 'bg-primary/10 border-primary/20 text-primary'
            }`}>
              <MessageSquare className="h-6 w-6 text-current" />
            </div>
            Clinical AI Assistant
          </h1>
          <p className={`text-xs mt-2 max-w-xl ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
            Converse with Aegis AI to refine symptom details. The assistant will ask clarifying clinical questions and compile predictions when sufficient detail is reached.
          </p>
        </div>

        <button
          onClick={handleRestart}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            isLight 
              ? 'bg-med-secondary border-med-primary/10 text-med-primary hover:bg-med-primary hover:text-white' 
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Restart Consultation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px] items-stretch">
        {/* Left Stats/Clinical Info Pane */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-6 h-full overflow-y-auto shadow-2xl relative transition-all duration-300 ${
          isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/[0.06]'
        }`}>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-med-text' : 'text-white'}`}>
                <Brain className="h-4 w-4 text-primary" />
                Session Telemetry
              </h3>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                As you chat, Aegis checks symptoms and screens severity flags. When details are fully structured, the dialog locks to compile results.
              </p>
            </div>

            <div className={`border-t pt-4 space-y-3 ${isLight ? 'border-med-secondary' : 'border-white/5'}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest block ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>Session Flags</span>
              <div className="space-y-2">
                <div className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-xl border ${
                  isLight ? 'bg-med-secondary/30 border-med-primary/5' : 'bg-white/[0.02] border-white/5'
                }`}>
                  <span className={isLight ? 'text-med-gray' : 'text-gray-400'}>Total Dialog Turns</span>
                  <span className={`font-bold ${isLight ? 'text-med-text' : 'text-white'}`}>
                    {messages.filter(m => m.sender === 'user').length}
                  </span>
                </div>
                <div className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-xl border ${
                  isLight ? 'bg-med-secondary/30 border-med-primary/5' : 'bg-white/[0.02] border-white/5'
                }`}>
                  <span className={isLight ? 'text-med-gray' : 'text-gray-400'}>Emergency Screening</span>
                  <span className="font-bold text-accent">Active</span>
                </div>
                <div className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-xl border ${
                  isLight ? 'bg-med-secondary/30 border-med-primary/5' : 'bg-white/[0.02] border-white/5'
                }`}>
                  <span className={isLight ? 'text-med-gray' : 'text-gray-400'}>Status</span>
                  <span className={`font-bold ${isDiagnosed ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                    {isDiagnosed ? 'Analysis Ready' : 'Gathering Data'}
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnosis Result Box if ready */}
            <AnimatePresence>
              {isDiagnosed && diagnosisInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-2xl border text-xs space-y-3 ${
                    isLight ? 'bg-primary/5 border-primary/20 text-med-text' : 'bg-primary/5 border-primary/20 text-gray-300'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">diagnosis compiled</span>
                    <h4 className={`font-bold text-lg capitalize leading-tight ${isLight ? 'text-med-text' : 'text-white'}`}>{diagnosisInfo.predicted_disease}</h4>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className={isLight ? 'text-med-gray' : 'text-gray-400'}>Confidence Match:</span>
                    <span className={`font-bold ${isLight ? 'text-med-text' : 'text-white'}`}>{(diagnosisInfo.confidence_score * 100).toFixed(1)}%</span>
                  </div>
                  <Link
                    to="/history"
                    className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-primary hover:bg-primary/95 text-[11px] font-bold text-white transition-colors"
                  >
                    Go to Consultation History
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={`border p-4 rounded-2xl flex items-start gap-2.5 shadow-md ${
            isLight ? 'bg-yellow-50 border-yellow-200 text-yellow-950' : 'bg-yellow-500/[0.03] border-yellow-500/10 text-yellow-200/80'
          }`}>
            <ShieldAlert className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className={`text-[10px] leading-normal ${isLight ? 'text-yellow-850' : 'text-gray-500'}`}>
              <b>Emergency Warning:</b> If you report severe, crushing chest pain or extreme breathing struggles, the system triggers alerts immediately.
            </div>
          </div>
        </div>

        {/* Right Chat Stream Pane */}
        <div className={`rounded-3xl border flex flex-col justify-between h-full overflow-hidden shadow-2xl relative transition-all duration-300 ${
          isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/[0.06]'
        }`}>
          
          {/* Empty State suggestions */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[550px] relative">
            <AnimatePresence mode="popLayout">
              {messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4 max-w-lg mx-auto mt-10 text-center flex flex-col items-center"
                >
                  <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center text-primary shadow-inner mb-2 ${
                    isLight ? 'bg-med-secondary border-med-primary/10' : 'bg-white/[0.02] border-white/[0.06]'
                  }`}>
                    <Activity className="h-6 w-6 animate-pulse" />
                  </div>
                  <h3 className={`text-sm font-bold ${isLight ? 'text-med-text' : 'text-white'}`}>Interactive Assessment Chips</h3>
                  <p className={`text-xs ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>
                    Select a sample symptom context below to launch the assessment dialog instantly:
                  </p>
                  <div className="space-y-2 w-full pt-2">
                    {sampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs transition-all cursor-pointer block leading-normal truncate ${
                          isLight 
                            ? 'bg-med-secondary/30 border-med-primary/10 text-med-text hover:bg-primary/5 hover:border-primary/20 hover:text-med-primary' 
                            : 'bg-white/[0.02] border border-white/5 text-gray-300 hover:bg-primary/5 hover:border-primary/20 hover:text-white'
                        }`}
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Stream */}
            <div className="space-y-4">
              {messages.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                if (msg.id === 'welcome' && messages.length > 1) return null; // hide initial welcome once chat starts
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex items-start gap-3 max-w-[85%] ${
                      isAssistant ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        isAssistant
                          ? isLight 
                            ? 'bg-med-secondary text-med-primary border-med-primary/10 shadow-[0_0_10px_rgba(91,76,245,0.05)]' 
                            : 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]'
                          : 'bg-secondary/10 text-secondary border-secondary/20'
                      }`}
                    >
                      {isAssistant ? <Activity className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    
                    <div className="space-y-1">
                      <div
                        className={`p-4 rounded-2xl text-xs leading-relaxed shadow-lg ${
                          isAssistant
                            ? msg.isEmergency 
                              ? isLight 
                                ? 'bg-red-50 border border-red-200 text-red-950' 
                                : 'bg-red-500/10 border border-red-500/20 text-red-200'
                              : isLight 
                                ? 'bg-med-secondary/30 border border-med-primary/5 text-med-text' 
                                : 'bg-white/[0.02] border border-white/[0.05] text-gray-300'
                            : 'bg-primary text-white rounded-tr-none'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      </div>
                      
                      {/* Audio/Copy Actions under assistant messages */}
                      <div className={`flex items-center gap-2 text-[9px] px-1.5 ${
                        isLight ? 'text-med-gray' : 'text-gray-500'
                      } ${
                        isAssistant ? 'justify-start' : 'justify-end'
                      }`}>
                        <span>{msg.time}</span>
                        {isAssistant && msg.id !== 'welcome' && (
                          <>
                            <span className={isLight ? 'text-gray-300' : 'text-gray-700'}>•</span>
                            <button
                              onClick={() => speakText(msg.id, msg.text)}
                              className={`transition-colors cursor-pointer flex items-center gap-0.5 ${
                                isLight ? 'hover:text-med-primary' : 'hover:text-white'
                              }`}
                              title="Read response aloud"
                            >
                              {speakingMsgId === msg.id ? (
                                <VolumeX className="h-3 w-3 text-red-500" />
                              ) : (
                                <Volume2 className="h-3 w-3" />
                              )}
                            </button>
                            <span className={isLight ? 'text-gray-300' : 'text-gray-700'}>•</span>
                            <button
                              onClick={() => copyToClipboard(msg.id, msg.text)}
                              className={`transition-colors cursor-pointer flex items-center gap-0.5 ${
                                isLight ? 'hover:text-med-primary' : 'hover:text-white'
                              }`}
                              title="Copy text"
                            >
                              {copiedId === msg.id ? (
                                <Check className="h-3 w-3 text-accent" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-3 mr-auto text-left">
                  <div className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 ${
                    isLight ? 'bg-med-secondary border-med-primary/10 text-med-primary' : 'bg-primary/10 border border-primary/20 text-primary'
                  }`}>
                    <Activity className="h-4 w-4 animate-spin" />
                  </div>
                  <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2 shadow-md ${
                    isLight ? 'bg-med-secondary/30 border-med-primary/5 text-med-gray' : 'bg-white/[0.02] border border-white/[0.05] text-gray-400'
                  }`}>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <span>Consultant dictation processing...</span>
                  </div>
                </div>
              )}
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className={`p-4 border-t ${
            isLight ? 'border-med-secondary bg-med-secondary/20' : 'border-white/[0.06] bg-white/[0.01]'
          }`}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }} 
              className="flex gap-2"
            >
              {/* Dictation Language Selector */}
              <div className="flex flex-col justify-center shrink-0">
                <select
                  value={speechLang}
                  onChange={(e) => setSpeechLang(e.target.value)}
                  disabled={loading || isDiagnosed}
                  className={`text-[9px] font-bold border rounded-xl px-2.5 py-1.5 cursor-pointer outline-none transition-colors h-11 disabled:opacity-50 ${
                    isLight 
                      ? 'bg-white border-med-secondary text-med-text hover:border-med-primary/40' 
                      : 'bg-[#0B1120] border-white/10 text-gray-300 hover:border-primary/40'
                  }`}
                  title="Speech Recognition Language"
                >
                  <option value="en-IN">EN (IN)</option>
                  <option value="hi-IN">HI (हिंदी)</option>
                </select>
              </div>

              {/* Dictation Trigger */}
              <button
                type="button"
                onClick={startDictation}
                disabled={loading || isDiagnosed}
                className={`p-3 border rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 shrink-0 ${
                  isListening 
                    ? 'bg-red-500/10 text-red-400 border-red-500/25 animate-pulse' 
                    : isLight 
                      ? 'bg-white text-med-gray border-med-secondary hover:text-med-primary hover:bg-med-secondary/50'
                      : 'bg-white/[0.02] text-gray-400 border-white/10 hover:text-white hover:bg-white/[0.05]'
                }`}
                title="Dictate Symptoms (Speech-to-Text)"
              >
                <Mic className="h-4 w-4" />
              </button>

              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  disabled={loading || isDiagnosed}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isDiagnosed
                      ? "Dialogue closed. Results rendered on the left."
                      : "Describe symptoms or reply to follow-up questions..."
                  }
                  className="glass-input flex-1 pl-4 pr-10 py-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className={`absolute right-3 text-[10px] flex items-center gap-1 font-semibold pointer-events-none hidden sm:flex ${
                  isLight ? 'text-med-gray' : 'text-gray-600'
                }`}>
                  <span>Enter</span>
                  <CornerDownLeft className="h-3 w-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !inputValue.trim() || isDiagnosed}
                className="p-3 bg-primary text-white rounded-xl hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-40 shrink-0 shadow-lg shadow-primary/10"
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
