import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { predictionAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, AlertTriangle, CheckSquare, RefreshCw, Sparkles, Heart, 
  ChevronRight, Thermometer, ShieldAlert, Clock, User, Download, Plus, X
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const SymptomChecker = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [symptomText, setSymptomText] = useState('');
  const [severity, setSeverity] = useState('Moderate');
  const [duration, setDuration] = useState('3 Days');
  const [customDuration, setCustomDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const loadingSteps = [
    "Extracting Symptoms...",
    "Running NLP & Negation Checks...",
    "Predicting Disease Classifier Weights...",
    "Generating Clinical Medical Report..."
  ];

  // Animate loading steps
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 900);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const symptomChips = [
    "Fever", "Headache", "Cough", "Vomiting", 
    "Chest Pain", "Fatigue", "Body Pain", "Nausea"
  ];

  const handleChipClick = (symptom) => {
    setSymptomText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return symptom;
      if (trimmed.toLowerCase().includes(symptom.toLowerCase())) return prev;
      return `${trimmed}, ${symptom.toLowerCase()}`;
    });
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!symptomText.trim()) {
      setError('Please describe your symptoms before analyzing.');
      return;
    }

    if (symptomText.trim().length < 10) {
      setError('Please provide a slightly more descriptive summary of your symptoms (at least 10 characters).');
      return;
    }

    setLoading(true);

    const activeDuration = duration === 'Custom' ? (customDuration || ' beberapa hari') : duration;
    // Format combined conversational prompt for the ML pipeline
    const combinedPrompt = `${symptomText} (${severity.toLowerCase()} severity, lasting for ${activeDuration}).`;

    try {
      const data = await predictionAPI.predict(combinedPrompt);
      
      // Delay response slightly if it loads too fast to let the user appreciate the SaaS NLP steps
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 3600);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'An error occurred during symptom analysis. Please check your connection and try again.';
      setError(errMsg);
      if (errMsg.includes("didn't mention any symptoms")) {
        setShowErrorModal(true);
      }
      setLoading(false);
    }
  };

  const getPrecautionsList = (diseaseName) => {
    const precautions = {
      'malaria': ['Use mosquito net', 'Avoid stagnant water', 'Take anti-malarial medication', 'Keep surroundings clean'],
      'typhoid': ['Drink boiled water', 'Avoid street food', 'Maintain hand hygiene', 'Take antibiotics as prescribed'],
      'diabetes': ['Limit sugar intake', 'Exercise daily', 'Monitor blood glucose', 'Consult an endocrinologist'],
      'hypertension': ['Reduce sodium intake', 'Manage stress', 'Exercise regularly', 'Avoid smoking/alcohol'],
      'jaundice': ['Drink plenty of fluids', 'Eat a low-fat diet', 'Get sufficient rest', 'Avoid alcohol'],
      'dengue': ['Use insect repellent', 'Wear long sleeves', 'Remove standing water', 'Take paracetamol (avoid aspirin/ibuprofen)'],
    };
    return precautions[diseaseName.toLowerCase()] || ['Consult a general practitioner', 'Get sufficient bed rest', 'Stay hydrated', 'Monitor body temperature'];
  };

  const getSeverityColor = (score) => {
    if (score >= 0.75) return { border: 'border-red-500/20 bg-red-500/5', text: 'text-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'High Risk' };
    if (score >= 0.4) return { border: 'border-yellow-500/20 bg-yellow-500/5', text: 'text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: 'Medium Risk' };
    return { border: 'border-green-500/20 bg-green-500/5', text: 'text-green-400', badge: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Low Risk' };
  };

  const getChartData = () => {
    if (!result?.top_5_predictions) return [];
    return result.top_5_predictions.map(pred => ({
      name: pred.disease.charAt(0).toUpperCase() + pred.disease.slice(1),
      probability: Math.round(pred.probability * 100)
    }));
  };

  const colors = ['#2563EB', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

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

      <div className={`border-b pb-5 ${isLight ? 'border-med-secondary' : 'border-white/[0.06]'}`}>
        <h1 className={`text-3xl font-extrabold flex items-center gap-3 transition-colors duration-300 ${
          isLight ? 'text-med-text' : 'text-white'
        }`}>
          <div className={`p-2 rounded-xl border shadow-[0_0_15px_rgba(37,99,235,0.15)] ${
            isLight ? 'bg-med-secondary border-med-primary/10 text-med-primary' : 'bg-primary/10 border-primary/20 text-primary'
          }`}>
            <Activity className="h-6 w-6 text-current" />
          </div>
          Symptom Checker
        </h1>
        <p className={`text-xs mt-2 max-w-xl ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
          Enter patient symptoms, customize parameters, and run natural language processing to predict disease targets with detailed probability analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left input card */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-6 rounded-3xl border shadow-xl space-y-6 relative overflow-hidden transition-all duration-300 ${
            isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/[0.06]'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
            
            <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-med-text' : 'text-white'}`}>
              <Sparkles className="h-4 w-4 text-primary" />
              Symptom Description
            </h3>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs border ${
                  isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-500/10 border-red-500/25 text-red-200'
                }`}
              >
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-6">
              {/* Quickchips */}
              <div className="space-y-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Quick Symptom Chips</span>
                <div className="flex flex-wrap gap-1.5">
                  {symptomChips.map((symptom, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleChipClick(symptom)}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] transition-all cursor-pointer flex items-center gap-1 ${
                        isLight 
                          ? 'bg-med-secondary/40 border-med-primary/10 text-med-primary hover:bg-med-primary hover:text-white hover:border-transparent' 
                          : 'bg-white/[0.02] border border-white/5 text-gray-300 hover:bg-primary/10 hover:border-primary/30 hover:text-white'
                      }`}
                    >
                      <Plus className="h-2.5 w-2.5 text-current" />
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>conversational description</span>
                <textarea
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  rows="5"
                  maxLength="500"
                  className="glass-input w-full p-4 text-xs leading-relaxed"
                  placeholder="e.g., I have been feeling a mild headache and chest pain since yesterday..."
                ></textarea>
                <div className={`flex justify-between text-[9px] px-1 ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>
                  <span>Minimum 10 characters</span>
                  <span>{symptomText.length}/500 chars</span>
                </div>
              </div>

              {/* Severity & Duration Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block flex items-center gap-1 ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                    <Thermometer className="h-3.5 w-3.5 text-primary" />
                    Severity
                  </span>
                  <div className={`grid grid-cols-3 gap-1 border rounded-xl p-1 ${isLight ? 'bg-med-secondary border-med-primary/10' : 'bg-white/[0.02] border-white/10'}`}>
                    {['Mild', 'Moderate', 'Severe'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSeverity(lvl)}
                        className={`py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                          severity === lvl 
                            ? 'bg-primary text-white shadow-md' 
                            : isLight 
                              ? 'text-med-gray hover:text-med-primary' 
                              : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block flex items-center gap-1 ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Duration
                  </span>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="glass-input w-full px-3 py-1.5 text-[10px] font-medium"
                  >
                    <option value="1 Day" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>1 Day</option>
                    <option value="3 Days" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>3 Days</option>
                    <option value="1 Week" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>1 Week</option>
                    <option value="Custom" className={isLight ? 'bg-white text-med-text' : 'bg-[#0B1120] text-white'}>Custom</option>
                  </select>
                </div>
              </div>

              {duration === 'Custom' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5"
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>Custom Duration</span>
                  <input
                    type="text"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="e.g., 2 weeks, 1 month..."
                    className="glass-input w-full px-3 py-2 text-xs"
                  />
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Processing Pipeline...
                  </>
                ) : (
                  <>
                    <Activity className="h-3.5 w-3.5" />
                    Analyze Symptoms
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right result card */}
        <div className="lg:col-span-7 h-full">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`p-10 rounded-3xl border flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[420px] shadow-2xl relative transition-all duration-300 ${
                  isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/[0.06]'
                }`}
              >
                <div className="relative flex items-center justify-center h-20 w-20">
                  <Heart className="h-16 w-16 text-primary animate-ping absolute opacity-30" />
                  <div className="relative flex items-center justify-center h-16 w-16 bg-primary/10 border border-primary/20 rounded-2xl shadow-xl shadow-primary/10">
                    <Activity className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className={`font-bold text-sm ${isLight ? 'text-med-text' : 'text-gray-200'}`}>Processing Neural Diagnostics</p>
                  <p className={`text-[10px] max-w-xs leading-normal ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>
                    Evaluating TF-IDF vectors, checking negations, and computing target classifications.
                  </p>
                </div>

                {/* Processing steps list */}
                <div className={`w-full max-w-xs space-y-2 border-t pt-4 text-left ${isLight ? 'border-med-secondary' : 'border-white/5'}`}>
                  {loadingSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${
                        idx < loadingStep 
                          ? 'bg-accent' 
                          : idx === loadingStep 
                            ? 'bg-primary animate-ping' 
                            : isLight ? 'bg-gray-200' : 'bg-white/10'
                      }`} />
                      <span className={
                        idx < loadingStep 
                          ? `font-medium line-through ${isLight ? 'text-gray-300 decoration-gray-200' : 'text-gray-500 decoration-white/10'}` 
                          : idx === loadingStep 
                            ? 'text-primary font-bold' 
                            : isLight ? 'text-gray-400' : 'text-gray-600'
                      }>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Primary Diagnosis Header */}
                {(() => {
                  const style = getSeverityColor(result.confidence_score);
                  const headerBorder = isLight ? 'border-med-secondary' : style.border;
                  return (
                    <div className={`p-6 rounded-3xl border shadow-2xl relative overflow-hidden space-y-4 transition-all duration-300 ${
                      isLight ? 'glass-panel-light bg-white/70' : 'glass-panel bg-dark-surface/50'
                    } ${headerBorder}`}>
                      <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl text-[9px] uppercase font-bold tracking-wider ${
                        isLight ? 'bg-med-secondary text-med-primary' : 'bg-white/[0.03] text-gray-400'
                      }`}>
                        Primary Diagnostic Target
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Predicted Diagnosis</span>
                        <h2 className={`text-3xl font-extrabold capitalize leading-none ${isLight ? 'text-med-text' : 'text-white'}`}>{result.predicted_disease}</h2>
                      </div>

                      {/* Info pills */}
                      <div className="flex gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.badge}`}>
                          {style.label}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isLight ? 'border-med-secondary bg-med-secondary text-med-primary' : 'border-white/10 bg-white/5 text-gray-300'
                        }`}>
                          {severity} Severity
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isLight ? 'border-med-secondary bg-med-secondary text-med-primary' : 'border-white/10 bg-white/5 text-gray-300'
                        }`}>
                          {duration === 'Custom' ? (customDuration || 'Days') : duration} Duration
                        </span>
                      </div>

                      {/* Confidence bar & score */}
                      <div className={`space-y-2 border-t pt-3 ${isLight ? 'border-med-secondary' : 'border-white/5'}`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className={isLight ? 'text-med-gray' : 'text-gray-400'}>Classifier Confidence</span>
                          <span className={`font-extrabold ${isLight ? 'text-med-text' : 'text-white'}`}>{(result.confidence_score * 100).toFixed(2)}%</span>
                        </div>
                        <div className={`h-2 w-full rounded-full overflow-hidden border ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/[0.04] border-white/5'}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence_score * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                          />
                        </div>
                      </div>

                      {result.explanation && (
                        <div className={`text-xs leading-relaxed border-t pt-3 ${
                          isLight ? 'text-med-gray border-med-secondary' : 'text-gray-300 border-white/5'
                        }`}>
                          <span className={`font-bold block mb-1 ${isLight ? 'text-med-text' : 'text-white'}`}>Clinical Insight:</span>
                          <p>{result.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Recharts differential bar chart */}
                {result.top_5_predictions && result.top_5_predictions.length > 1 && (
                  <div className={`p-6 rounded-3xl border shadow-xl space-y-4 transition-all duration-300 ${
                    isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/[0.06]'
                  }`}>
                    <h3 className={`text-sm font-bold tracking-tight ${isLight ? 'text-med-text' : 'text-white'}`}>Differential Probability Mapping</h3>
                    <div className="h-56 w-full text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getChartData()}
                          layout="vertical"
                          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                          <XAxis type="number" domain={[0, 100]} stroke={isLight ? '#666666' : '#9ca3af'} fontSize={9} />
                          <YAxis dataKey="name" type="category" stroke={isLight ? '#666666' : '#9ca3af'} fontSize={9} width={90} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isLight ? '#FFFFFF' : '#111827', 
                              borderColor: isLight ? 'rgba(91, 76, 245, 0.08)' : 'rgba(255,255,255,0.08)', 
                              borderRadius: '12px',
                              color: isLight ? '#1A1A1A' : '#F8FAFC'
                            }}
                            labelStyle={{ color: isLight ? '#1A1A1A' : '#F8FAFC', fontWeight: 'bold' }}
                            itemStyle={{ color: '#2563EB' }}
                            formatter={(value) => [`${value}%`, 'Confidence']}
                          />
                          <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                            {getChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Recommended precautions */}
                <div className={`p-6 rounded-3xl border shadow-xl space-y-4 transition-all duration-300 ${
                  isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/[0.06]'
                }`}>
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-med-text' : 'text-white'}`}>
                    <CheckSquare className="h-4.5 w-4.5 text-secondary" />
                    Clinical Guideline & Precautions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {getPrecautionsList(result.predicted_disease).map((prec, idx) => (
                      <div key={idx} className={`flex items-start gap-2.5 text-xs border p-3.5 rounded-xl transition-colors ${
                        isLight 
                          ? 'bg-med-secondary/30 border-med-primary/5 text-med-text hover:bg-med-secondary/60' 
                          : 'bg-white/[0.02] border-white/[0.04] text-gray-300 hover:bg-white/[0.04]'
                      }`}>
                        <span className="h-5 w-5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full flex items-center justify-center shrink-0 font-bold text-[9px] mt-0.5">
                          ✓
                        </span>
                        <span className="leading-relaxed">{prec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Card Indicator if Chest Pain exists */}
                {symptomText.toLowerCase().includes('chest pain') && (
                  <div className={`border p-5 rounded-2xl flex items-start gap-3.5 text-xs shadow-lg ${
                    isLight ? 'bg-red-50 border-red-200 text-red-950' : 'bg-red-500/[0.04] border-red-500/20 text-red-200'
                  }`}>
                    <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-1 text-left">
                      <p className="font-bold text-red-600 dark:text-red-400">Emergency Caution Required</p>
                      <p className={`leading-normal text-[11px] ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                        Chest tightness or pain has been identified in your symptom description. If these symptoms are accompanied by breath shortness or dizziness, please contact local emergency services immediately.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-10 rounded-3xl border flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[420px] shadow-lg transition-all duration-300 ${
                  isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/[0.06]'
                }`}
              >
                <div className={`h-16 w-16 rounded-2xl border flex items-center justify-center shadow-inner ${
                  isLight ? 'bg-med-secondary border-med-primary/10' : 'bg-white/[0.02] border-white/[0.06]'
                }`}>
                  <Activity className={`h-7 w-7 animate-pulse ${isLight ? 'text-med-primary' : 'text-gray-600'}`} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <p className={`font-bold text-sm ${isLight ? 'text-med-text' : 'text-gray-300'}`}>Diagnostic Telemetry Ready</p>
                  <p className={`text-xs leading-normal ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>
                    Submit symptom configurations on the left to activate classification algorithms, view probability charts, and access guidelines.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error Popup Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowErrorModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative max-w-sm w-full border rounded-[28px] p-6 shadow-2xl overflow-hidden text-center transition-all duration-300 ${
                isLight ? 'bg-white border-red-200' : 'bg-[#151e30] border-red-500/20'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
              
              <button 
                onClick={() => setShowErrorModal(false)}
                className={`absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 ${isLight ? 'text-med-gray' : 'text-gray-400'}`}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto h-12 w-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-4 animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <h3 className={`text-base font-bold font-poppins ${isLight ? 'text-med-text' : 'text-white'}`}>No Symptoms Detected</h3>
              <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
                {error}
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SymptomChecker;
