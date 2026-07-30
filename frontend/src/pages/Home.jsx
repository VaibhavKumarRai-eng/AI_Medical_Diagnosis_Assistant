import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  Activity, 
  MessageSquare, 
  History, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  Brain, 
  FileText, 
  Database,
  User
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

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

  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className={`relative min-h-screen overflow-hidden py-16 px-4 sm:px-6 lg:px-8 space-y-16 transition-colors duration-300 ${
      isLight ? 'grid-bg-light bg-white text-med-text font-inter' : 'grid-bg bg-dark-bg text-gray-300 font-sans'
    }`}>
      {/* Background Glowing Orbs */}
      <div className={`absolute top-20 left-[10%] w-96 h-96 rounded-full blur-[100px] pointer-events-none -z-10 opacity-70 ${
        isLight ? 'bg-med-secondary' : 'bg-primary/10'
      }`} />
      <div className={`absolute bottom-20 right-[10%] w-96 h-96 rounded-full blur-[100px] pointer-events-none -z-10 opacity-70 ${
        isLight ? 'bg-[#EEF0FF]' : 'bg-secondary/10'
      }`} />

      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative max-w-7xl mx-auto text-center"
      >
        <div className={`rounded-[28px] p-8 md:p-16 border shadow-premium-lg relative overflow-hidden transition-all duration-300 ${
          isLight ? 'glass-panel-light bg-white/70 border-med-secondary' : 'glass-panel border-white/5 bg-dark-surface/50'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-med-secondary/10 to-transparent pointer-events-none" />
          
          {/* Floating DNA SVG Illustration */}
          <div className="absolute right-6 top-8 w-24 h-48 opacity-10 animate-float-dna hidden lg:block">
            <svg viewBox="0 0 100 200" fill="none" stroke="currentColor" strokeWidth="2" className={isLight ? 'text-med-primary' : 'text-primary'}>
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
            <svg viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth="2.5" className={isLight ? 'text-med-primary' : 'text-primary'}>
              <path d="M0,50 L40,50 L50,20 L60,80 L70,45 L80,55 L90,50 L130,50 L140,10 L150,90 L160,40 L170,60 L180,50 L200,50" />
            </svg>
          </div>

          <div className="relative max-w-4xl mx-auto space-y-8 flex flex-col items-center">
            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wider uppercase shadow-premium-sm font-poppins transition-colors duration-300 ${
                isLight 
                  ? 'bg-med-secondary border-med-primary/10 text-med-primary' 
                  : 'bg-primary/10 border-primary/20 text-primary'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Aegis Clinical Inference Engine</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-poppins transition-colors duration-300 ${
                isLight ? 'text-med-text' : 'text-white'
              }`}
            >
              Next-Gen AI <br className="sm:hidden" />
              <span className={isLight ? 'text-med-primary' : 'text-gradient bg-clip-text'}>Medical Diagnosis</span> Assistant
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className={`text-base sm:text-lg md:text-xl font-medium max-w-2xl leading-relaxed transition-colors duration-300 ${
                isLight ? 'text-med-gray' : 'text-gray-400'
              }`}
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
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-premium-md hover:shadow-premium-lg transition-all hover:-translate-y-0.5 font-poppins"
                  >
                    Symptom Checker
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                  <Link
                    to="/doctor-consultation"
                    className={`flex-1 flex items-center justify-center gap-2 border font-bold px-6 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 shadow-premium-sm font-poppins ${
                      isLight 
                        ? 'bg-med-secondary border-med-primary/10 text-med-primary hover:bg-med-secondary/80' 
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    Consult Doctor
                    <User className="h-4.5 w-4.5 text-brand-500" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-premium-md hover:shadow-premium-lg transition-all hover:-translate-y-0.5 font-poppins"
                  >
                    Get Started
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                  <Link
                    to="/login"
                    className={`flex-1 flex items-center justify-center gap-2 border font-bold px-6 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 shadow-premium-sm font-poppins ${
                      isLight 
                        ? 'bg-med-secondary border-med-primary/10 text-med-primary hover:bg-med-secondary/80' 
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
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
        className={`max-w-7xl mx-auto border px-6 py-5 rounded-[24px] flex items-start gap-4 shadow-premium-sm text-left ${
          isLight ? 'bg-red-50/50 border-red-100 text-red-900' : 'bg-red-950/10 border-red-500/20 text-red-200'
        }`}
      >
        <ShieldAlert className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm font-inter">
          <h4 className="font-bold text-red-500 font-poppins text-base">Important Medical Disclaimer</h4>
          <p className={`leading-relaxed text-xs ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
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
              className={`p-6 rounded-[24px] border text-left shadow-premium-sm hover:-translate-y-0.5 transition-all duration-300 ${
                isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/5'
              }`}
            >
              <h4 className={`text-3xl md:text-4xl font-extrabold tracking-tight font-poppins ${
                isLight ? 'text-med-primary' : 'text-primary'
              }`}>{stat.value}</h4>
              <p className={`text-sm font-semibold mt-1 ${isLight ? 'text-med-text' : 'text-white'}`}>{stat.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className={`text-left border-b pb-4 ${isLight ? 'border-med-secondary' : 'border-white/5'}`}>
          <h2 className={`text-2xl font-bold font-poppins ${isLight ? 'text-med-text' : 'text-white'}`}>Platform Modules</h2>
          <p className="text-xs text-gray-500 mt-1 font-inter">Select an active card below to check symptoms, consult doctors, or view consultation stats.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: NLP Symptom Checker */}
          <div className={`border p-6 rounded-[24px] text-left flex flex-col justify-between min-h-[220px] transition-all hover:-translate-y-1 hover:shadow-premium-lg duration-300 group cursor-pointer ${
            isLight 
              ? 'bg-[#EEF0FF]/30 border-[#EEF0FF] hover:bg-white hover:border-med-primary/20' 
              : 'bg-white/5 border-white/[0.04] hover:bg-white/[0.08] hover:border-primary/20'
          }`}>
            <div className="space-y-4">
              <div className="h-10 w-10 bg-white dark:bg-white/5 border border-med-secondary dark:border-white/10 rounded-xl flex items-center justify-center shadow-premium-sm group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                <Brain className="h-5 w-5 text-brand-500 group-hover:text-white" />
              </div>
              <h3 className={`text-lg font-bold font-poppins ${isLight ? 'text-med-text' : 'text-white'}`}>Symptom Checker</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-inter">
                Describe patient symptoms in conversational terms. Aegis parses spelling, performs lemmatization checks, and maps feature vector matrices.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/checker" : "/login"}
              className="flex items-center gap-2 mt-6 text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
            >
              Analyze Symptoms <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: AI Medical Chatbot */}
          <div className={`border p-6 rounded-[24px] text-left flex flex-col justify-between min-h-[220px] transition-all hover:-translate-y-1 hover:shadow-premium-lg duration-300 group cursor-pointer ${
            isLight 
              ? 'bg-[#EEF0FF]/30 border-[#EEF0FF] hover:bg-white hover:border-med-primary/20' 
              : 'bg-white/5 border-white/[0.04] hover:bg-white/[0.08] hover:border-primary/20'
          }`}>
            <div className="space-y-4">
              <div className="h-10 w-10 bg-white dark:bg-white/5 border border-med-secondary dark:border-white/10 rounded-xl flex items-center justify-center shadow-premium-sm group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                <MessageSquare className="h-5 w-5 text-secondary group-hover:text-white" />
              </div>
              <h3 className={`text-lg font-bold font-poppins ${isLight ? 'text-med-text' : 'text-white'}`}>Clinical Assistant AI</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-inter">
                Engage in an interactive screen session with the clinical chatbot powered by Google Gemini to clarify patient symptom patterns.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/chatbot" : "/login"}
              className="flex items-center gap-2 mt-6 text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
            >
              Start Session <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 3: Doctor Consultation */}
          <div className={`border p-6 rounded-[24px] text-left flex flex-col justify-between min-h-[220px] transition-all hover:-translate-y-1 hover:shadow-premium-lg duration-300 group cursor-pointer ${
            isLight 
              ? 'bg-[#EEF0FF]/30 border-[#EEF0FF] hover:bg-white hover:border-med-primary/20' 
              : 'bg-white/5 border-white/[0.04] hover:bg-white/[0.08] hover:border-primary/20'
          }`}>
            <div className="space-y-4">
              <div className="h-10 w-10 bg-white dark:bg-white/5 border border-med-secondary dark:border-white/10 rounded-xl flex items-center justify-center shadow-premium-sm group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                <User className="h-5 w-5 text-blue-500 group-hover:text-white" />
              </div>
              <h3 className={`text-lg font-bold font-poppins ${isLight ? 'text-med-text' : 'text-white'}`}>Consult Doctors</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-inter">
                Discuss predicted results with real-time physicians. Schedule mock telemedicine video slots for professional clinical validation.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/doctor-consultation" : "/login"}
              className="flex items-center gap-2 mt-6 text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
            >
              Find Doctors <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 4: Consultation Logs */}
          <div className={`border p-6 rounded-[24px] text-left flex flex-col justify-between min-h-[220px] transition-all hover:-translate-y-1 hover:shadow-premium-lg duration-300 group cursor-pointer ${
            isLight 
              ? 'bg-[#EEF0FF]/30 border-[#EEF0FF] hover:bg-white hover:border-med-primary/20' 
              : 'bg-white/5 border-white/[0.04] hover:bg-white/[0.08] hover:border-primary/20'
          }`}>
            <div className="space-y-4">
              <div className="h-10 w-10 bg-white dark:bg-white/5 border border-med-secondary dark:border-white/10 rounded-xl flex items-center justify-center shadow-premium-sm group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                <FileText className="h-5 w-5 text-purple-500 group-hover:text-white" />
              </div>
              <h3 className={`text-lg font-bold font-poppins ${isLight ? 'text-med-text' : 'text-white'}`}>Diagnostic Timeline</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-inter">
                Check and download reports for preceding diagnosis runs. Aegis outputs printable clinical summary logs in standard A4 PDF format.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/history" : "/login"}
              className="flex items-center gap-2 mt-6 text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors"
            >
              Review Timeline <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* How it Works section */}
      <div className="max-w-7xl mx-auto">
        <div className={`rounded-[28px] p-8 text-left border shadow-premium-md relative overflow-hidden transition-all duration-300 ${
          isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/5 bg-dark-surface/50'
        }`}>
          <div className="absolute right-0 bottom-0 w-32 h-32 opacity-5 pointer-events-none text-brand-500">
            <Database className="w-full h-full" />
          </div>

          <h3 className={`text-xl font-bold mb-6 font-poppins ${isLight ? 'text-med-text' : 'text-white'}`}>Engine Processing Telemetry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className={`flex items-center gap-2 font-semibold text-sm font-poppins ${isLight ? 'text-med-text' : 'text-white'}`}>
                <CheckCircle className="h-4.5 w-4.5 text-brand-500" />
                <span>1. Normalization</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                Expands abbreviations (e.g., "sob" to "shortness of breath") and sanitizes spelling characters.
              </p>
            </div>
            <div className="space-y-2">
              <div className={`flex items-center gap-2 font-semibold text-sm font-poppins ${isLight ? 'text-med-text' : 'text-white'}`}>
                <CheckCircle className="h-4.5 w-4.5 text-brand-500" />
                <span>2. Negation Parsing</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                Flags statements like "no headache" as negative weights (`not_headache`) so classifiers avoid incorrect positive marks.
              </p>
            </div>
            <div className="space-y-2">
              <div className={`flex items-center gap-2 font-semibold text-sm font-poppins ${isLight ? 'text-med-text' : 'text-white'}`}>
                <CheckCircle className="h-4.5 w-4.5 text-brand-500" />
                <span>3. Vector Synthesis</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
                Computes TF-IDF values matching trained feature matrices (up to 5,000 distinct clinical terms).
              </p>
            </div>
            <div className="space-y-2">
              <div className={`flex items-center gap-2 font-semibold text-sm font-poppins ${isLight ? 'text-med-text' : 'text-white'}`}>
                <CheckCircle className="h-4.5 w-4.5 text-brand-500" />
                <span>4. Stratified Prediction</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-inter">
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
