import React, { useState } from 'react';
import { predictionAPI } from '../services/api';
import { Activity, AlertTriangle, CheckSquare, RefreshCw, Sparkles, Heart } from 'lucide-react';

const SymptomChecker = () => {
  const [symptomText, setSymptomText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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
    try {
      const data = await predictionAPI.predict(symptomText);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'An error occurred during symptom analysis. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPrecautionsList = (diseaseName) => {
    // Basic frontend fallback precautions; backend returns details, but let's provide visual indicators
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-left space-y-8">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Activity className="h-8 w-8 text-brand-500 animate-pulse" />
          NLP Symptom Checker
        </h1>
        <p className="text-sm text-gray-400">
          Enter your symptoms in plain natural language. The machine learning engine will extract vector coordinates and output possible disease conditions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left input card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-500" />
              Symptom Description
            </h3>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg flex items-start gap-2.5 text-xs">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <textarea
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  rows="6"
                  maxLength="500"
                  className="glass-input w-full p-4 text-sm leading-relaxed"
                  placeholder="Describe how you are feeling... (e.g., I have been feeling dizzy, with high blood pressure and mild chest tightness since this morning.)"
                ></textarea>
                <div className="flex justify-between text-[10px] text-gray-400 px-1 mt-1">
                  <span>Minimum 10 characters</span>
                  <span>{symptomText.length}/500 chars</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4" />
                    Analyze Symptoms
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right result card */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[300px]">
              <div className="relative">
                <Heart className="h-16 w-16 text-brand-500 animate-ping absolute opacity-40" />
                <Activity className="h-16 w-16 text-brand-500 animate-pulse relative" />
              </div>
              <p className="text-gray-300 font-semibold">Running Clinical Classification models...</p>
              <p className="text-xs text-gray-400 max-w-sm">Cleaning tokens, applying lemmatizations, checking negations, and computing XGBoost probability distributions.</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Primary Prediction */}
              <div className="glass-panel p-6 rounded-2xl border border-brand-500/20 bg-brand-500/5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 bg-brand-500/10 rounded-bl-2xl text-[10px] uppercase font-bold text-brand-500 tracking-wider">
                  Primary Target
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest">Predicted Diagnosis</span>
                  <h2 className="text-3xl font-extrabold text-white capitalize">{result.predicted_disease}</h2>
                </div>

                {/* Accuracy score bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Confidence Score</span>
                    <span className="font-bold text-white">{(result.confidence_score * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${result.confidence_score * 100}%` }}
                    ></div>
                  </div>
                </div>

                {result.explanation && (
                  <div className="text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-3">
                    <p className="font-semibold text-white mb-1">Explanation:</p>
                    {result.explanation}
                  </div>
                )}
              </div>

              {/* Precautions */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-emerald-400" />
                  Recommended Precautions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getPrecautionsList(result.predicted_disease).map((prec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="h-5 w-5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        ✓
                      </span>
                      <span>{prec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Candidates */}
              {result.top_5_predictions && result.top_5_predictions.length > 1 && (
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-lg font-bold text-white">Differential Diagnosis (Alternatives)</h3>
                  <div className="space-y-3">
                    {result.top_5_predictions.slice(1).map((pred, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-300 capitalize">{pred.disease}</span>
                          <span className="text-gray-400">{(pred.probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500/50 rounded-full"
                            style={{ width: `${pred.probability * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[300px]">
              <Activity className="h-16 w-16 text-gray-600 animate-pulse-slow" />
              <p className="text-gray-400 text-sm">Submit your symptoms on the left to see diagnosis results, confidence logs, and clinical precaution directives.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
