import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Activity, MessageSquare, History, ArrowRight, ShieldAlert, Sparkles, CheckCircle, Brain, Heart, FileText, Database } from 'lucide-react';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  // Stagger Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const statData = [
    { value: '98.6%', label: 'AI Accuracy', desc: 'Validated Clinical Benchmark' },
    { value: '250+', label: 'Diseases', desc: 'Supported Diagnostics' },
    { value: '0.8s', label: 'Prediction', desc: 'Real-time NLP Latency' },
    { value: '10k+', label: 'Consultations', desc: 'Secured Logs Conducted' }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden py-12 px-4 sm:px-6 lg:px-8 space-y-16 grid-bg">
      {/* Background Glowing Orbs */}
      <div className="glow-orb top-20 left-[10%] w-96 h-96 bg-primary" />
      <div className="glow-orb bottom-20 right-[10%] w-96 h-96 bg-secondary" />

      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative max-w-7xl mx-auto text-center"
      >
        <div className="glass-panel rounded-3xl p-8 md:p-16 border border-white/[0.06] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.02] to-secondary/[0.02] pointer-events-none" />
          
          {/* Floating DNA SVG Illustration */}
          <div className="absolute right-6 top-8 w-24 h-48 opacity-10 animate-float-dna hidden lg:block">
            <svg viewBox="0 0 100 200" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <path d="M10,20 Q40,100 90,180" />
              <path d="M90,20 Q60,100 10,180" />
              <line x1="16" y1="30" x2="84" y2="30" />
              <line x1="22" y1="50" x2="78" y2="50" />
              <line x1="28" y1="70" x2="72" y2="70" />
              <line x1="38" y1="90" x2="62" y2="90" />
              <line x1="50" y1="110" x2="50" y2="110" />
              <line x1="38" y1="130" x2="62" y2="130" />
              <line x1="28" y1="150" x2="72" y2="150" />
              <line x1="16" y1="170" x2="84" y2="170" />
            </svg>
          </div>

          {/* Floating ECG SVG Illustration */}
          <div className="absolute left-6 bottom-8 w-32 h-16 opacity-10 animate-float-ecg hidden lg:block">
            <svg viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
              <path d="M0,50 L40,50 L50,20 L60,80 L70,45 L80,55 L90,50 L130,50 L140,10 L150,90 L160,40 L170,60 L180,50 L200,50" />
            </svg>
          </div>

          <div className="relative max-w-4xl mx-auto space-y-8 flex flex-col items-center">
            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(37,99,235,0.1)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Aegis Clinical Inference Engine</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-sans"
            >
              Next-Gen AI <br className="sm:hidden" />
              <span className="text-gradient">Medical Diagnosis</span> Assistant
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed"
            >
              Describe clinical symptoms in simple natural language. Aegis AI evaluates features, tracks negations, and runs real-time classifications.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md pt-4"
            >
              {isAuthenticated ? (
                <>
                  <Link
                    to="/checker"
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
                  >
                    Symptom Checker
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/chatbot"
                    className="flex-1 flex items-center justify-center gap-2 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-white font-bold px-6 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5"
                  >
                    AI Chatbot
                    <MessageSquare className="h-4 w-4 text-secondary" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="flex-1 flex items-center justify-center gap-2 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-white font-bold px-6 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Disclaimers & Alert */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-7xl mx-auto bg-red-500/[0.03] border border-red-500/15 text-red-200 px-6 py-5 rounded-2xl flex items-start gap-4 shadow-xl"
      >
        <ShieldAlert className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-left text-sm">
          <h4 className="font-bold text-red-400">Important Medical Disclaimer</h4>
          <p className="text-gray-400 leading-relaxed text-xs">
            This platform is built strictly for educational, research, and project demonstration purposes.
            <b> It is not intended to replace professional medical advice, clinical diagnosis, or hospital treatment. </b>
            If you are experiencing severe emergency symptoms like chest pain or acute breathing issues, contact emergency response services immediately.
          </p>
        </div>
      </motion.div>

      {/* Stats Cards Section */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statData.map((stat, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-white/[0.06] text-left shadow-lg"
            >
              <h4 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{stat.value}</h4>
              <p className="text-sm font-semibold text-primary mt-1">{stat.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-left border-b border-white/[0.06] pb-4">
          <h2 className="text-2xl font-bold text-white">Platform Modules</h2>
          <p className="text-xs text-gray-400 mt-1">Select an active card below to check symptoms or view consultation stats.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: NLP Symptom Checker */}
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white">Symptom Checker</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Describe patient symptoms in conversational terms. Aegis parses spelling, performs lemmatization checks, and maps feature vector matrices.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/checker" : "/login"}
              className="flex items-center gap-2 mt-6 text-xs font-bold text-primary hover:text-primary/95 transition-colors"
            >
              Analyze Symptoms <ArrowRight className="h-3.5 w-3.5 animate-pulse" />
            </Link>
          </div>

          {/* Card 2: AI Medical Chatbot */}
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center border border-secondary/20">
                <MessageSquare className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-white">Clinical Assistant AI</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Engage in an interactive screen session with the clinical chatbot powered by Google Gemini to clarify patient symptom patterns.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/chatbot" : "/login"}
              className="flex items-center gap-2 mt-6 text-xs font-bold text-secondary hover:text-secondary/95 transition-colors"
            >
              Start Session <ArrowRight className="h-3.5 w-3.5 animate-pulse" />
            </Link>
          </div>

          {/* Card 3: Consultation Logs */}
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-white">Diagnostic Timeline</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Check and download reports for preceding diagnosis runs. Aegis outputs printable clinical summary logs in standard A4 PDF format.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/history" : "/login"}
              className="flex items-center gap-2 mt-6 text-xs font-bold text-accent hover:text-accent/95 transition-colors"
            >
              Review Timeline <ArrowRight className="h-3.5 w-3.5 animate-pulse" />
            </Link>
          </div>
        </div>
      </div>

      {/* How it Works section */}
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-3xl p-8 text-left border border-white/[0.06] relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-32 h-32 opacity-[0.02] pointer-events-none">
            <Database className="w-full h-full text-white" />
          </div>

          <h3 className="text-xl font-bold text-white mb-6">Engine Processing Telemetry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-white">
                <CheckCircle className="h-4.5 w-4.5 text-primary" />
                <span>1. Normalization</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Expands abbreviations (e.g., "sob" to "shortness of breath") and sanitizes spelling characters.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-white">
                <CheckCircle className="h-4.5 w-4.5 text-primary" />
                <span>2. Negation Parsing</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Flags statements like "no headache" as negative weights (`not_headache`) so classifiers avoid incorrect positive marks.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-white">
                <CheckCircle className="h-4.5 w-4.5 text-primary" />
                <span>3. Vector Synthesis</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Computes TF-IDF values matching trained feature matrices (up to 5,000 distinct clinical terms).
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-white">
                <CheckCircle className="h-4.5 w-4.5 text-primary" />
                <span>4. Stratified Prediction</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Runs predictions across Naive Bayes, Random Forest, Support Vector, and XGBoost models, returning top confidence levels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
