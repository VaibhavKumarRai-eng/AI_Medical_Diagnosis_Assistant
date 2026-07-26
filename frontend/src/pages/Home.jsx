import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, MessageSquare, History, ArrowRight, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <div className="relative glass-panel rounded-3xl p-8 md:p-12 text-center overflow-hidden border border-white/5">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Medical Assistant</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Predict Potential Health Issues from <span className="text-gradient">Natural Symptoms</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl font-light">
            Describe your health symptoms in conversational text. Our NLP-trained Machine Learning engine will analyze your inputs and predict potential medical conditions.
          </p>

          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/checker"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-brand-500/15 transition-all duration-200"
              >
                Launch Symptom Checker
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/chatbot"
                className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
              >
                Chat with Medical AI
                <MessageSquare className="h-4 w-4 text-brand-500" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-brand-500/15 transition-all duration-200"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimers & Alert */}
      <div className="bg-yellow-500/5 border border-yellow-500/15 text-yellow-200 px-6 py-5 rounded-2xl flex items-start gap-4">
        <ShieldAlert className="h-6 w-6 text-yellow-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-left text-sm">
          <h4 className="font-bold text-yellow-400">Important Medical Disclaimer</h4>
          <p className="text-gray-400">
            This platform is built strictly for educational, research, and project demonstration purposes.
            <b> It is not intended to replace professional medical advice, diagnosis, or treatment. </b>
            If you are experiencing severe chest pain, shortness of breath, sudden weakness, or any other emergency symptoms, please contact emergency services (such as 911 / 102) immediately.
          </p>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: NLP Symptom Checker */}
        <div className="glass-panel p-6 rounded-2xl text-left border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-10 w-10 bg-brand-500/10 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-brand-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Symptom Checker</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Enter symptoms in plain natural language (e.g., "headache and high fever for 3 days"). The system processes spelling variations and outputs potential disease classification metrics.
            </p>
          </div>
          <Link
            to={isAuthenticated ? "/checker" : "/login"}
            className="flex items-center gap-2 mt-6 text-sm font-semibold text-brand-500 hover:text-brand-400 transition-colors"
          >
            Start Checkup <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Card 2: AI Medical Chatbot */}
        <div className="glass-panel p-6 rounded-2xl text-left border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Medical AI Chatbot</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Engage in an interactive chat session with our virtual medical consultant. Powered by Google Gemini API, it conducts stateful dialogs to compile and analyze symptom contexts.
            </p>
          </div>
          <Link
            to={isAuthenticated ? "/chatbot" : "/login"}
            className="flex items-center gap-2 mt-6 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Open Virtual Chat <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Card 3: Consultation Logs */}
        <div className="glass-panel p-6 rounded-2xl text-left border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <History className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Consultations Archive</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Track your diagnostic timeline over time. Store records securely on the platform, view previous diagnostic details, and access clean PDF medical report downloads.
            </p>
          </div>
          <Link
            to={isAuthenticated ? "/history" : "/login"}
            className="flex items-center gap-2 mt-6 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Review Logs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* How it Works / Stats section */}
      <div className="glass-panel rounded-3xl p-8 text-left border border-white/5">
        <h3 className="text-2xl font-bold text-white mb-6">How The AI Engine Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <CheckCircle className="h-5 w-5 text-brand-500" />
              <span>1. Text Sanitization</span>
            </div>
            <p className="text-xs text-gray-400">
              Your message is cleaned and lemmatized. Clinical acronyms like "sob" are converted to full phrases.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <CheckCircle className="h-5 w-5 text-brand-500" />
              <span>2. Negation Check</span>
            </div>
            <p className="text-xs text-gray-400">
              Phrases like "no fever" are rewritten as "not_fever" to prevent ML models from false classifications.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <CheckCircle className="h-5 w-5 text-brand-500" />
              <span>3. TF-IDF Vectors</span>
            </div>
            <p className="text-xs text-gray-400">
              Cleaned words are tokenized and mapped into sparse vector indices matching medical feature matrices.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <CheckCircle className="h-5 w-5 text-brand-500" />
              <span>4. ML Classification</span>
            </div>
            <p className="text-xs text-gray-400">
              The model evaluates confidence scores, outputs primary disease targets, precautions, and flags.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
