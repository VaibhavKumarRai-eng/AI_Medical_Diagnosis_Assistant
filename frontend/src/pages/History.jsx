import React, { useState, useEffect } from 'react';
import { historyAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Search, Trash2, Calendar, FileText, ArrowRight, 
  Download, Activity, AlertCircle, X, SlidersHorizontal, ArrowUpDown, CheckSquare 
} from 'lucide-react';

const ConsultationHistory = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState('');
  
  // Advanced sorting & filtering states
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, confidence_high, confidence_low
  const [filterRisk, setFilterRisk] = useState('all'); // all, high, medium, low

  // Fetch consultation history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await historyAPI.list(query);
      setHistoryList(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch diagnostic history records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory(searchQuery);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid opening detail card
    if (!window.confirm('Are you sure you want to delete this consultation log? This action is permanent.')) {
      return;
    }

    try {
      await historyAPI.delete(id);
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete history record.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const getRiskLabel = (confidence) => {
    if (confidence >= 0.75) return { text: 'High Risk', class: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (confidence >= 0.4) return { text: 'Medium Risk', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    return { text: 'Low Risk', class: 'bg-green-500/10 text-green-400 border-green-500/20' };
  };

  // Client-side sorting and filtering logic
  const getProcessedList = () => {
    let list = [...historyList];

    // 1. Filter by Risk
    if (filterRisk !== 'all') {
      list = list.filter(item => {
        const score = item.prediction?.confidence_score || 0;
        if (filterRisk === 'high') return score >= 0.75;
        if (filterRisk === 'medium') return score >= 0.4 && score < 0.75;
        return score < 0.4;
      });
    }

    // 2. Sort List
    list.sort((a, b) => {
      const scoreA = a.prediction?.confidence_score || 0;
      const scoreB = b.prediction?.confidence_score || 0;
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'confidence_high') return scoreB - scoreA;
      return scoreA - scoreB;
    });

    return list;
  };

  const processedList = getProcessedList();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-left space-y-8 relative">
      {/* Printable Area Wrapper for Reports */}
      <div className="print:hidden border-b border-white/[0.06] pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
              <History className="h-6 w-6 text-primary" />
            </div>
            Diagnostic Consultations
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">
            Review timeline logs, filter past diagnostic results, and print PDF-formatted medical summaries.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms / diseases..."
              className="glass-input pl-9 pr-4 py-2.5 text-xs w-full md:w-64"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-500" />
          </div>
          <button
            type="submit"
            className="px-4.5 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-primary/10 shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="print:hidden bg-red-500/10 border border-red-500/25 text-red-200 p-4 rounded-xl flex items-start gap-2.5 text-xs">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Sorting & Filter Controls */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 bg-white/[0.01] border border-white/[0.04] p-3 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter Risk:</span>
          </div>
          <div className="flex gap-1.5">
            {['all', 'high', 'medium', 'low'].map(risk => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={`px-3 py-1 rounded-lg border text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all ${
                  filterRisk === risk 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-input px-2.5 py-1 text-[10px] font-bold"
          >
            <option value="newest" className="bg-[#0B1120] text-white">Newest First</option>
            <option value="oldest" className="bg-[#0B1120] text-white">Oldest First</option>
            <option value="confidence_high" className="bg-[#0B1120] text-white">Highest Match</option>
            <option value="confidence_low" className="bg-[#0B1120] text-white">Lowest Match</option>
          </select>
        </div>
      </div>

      {/* Grid listing */}
      <div className="print:hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left list: Logs */}
        <div className="lg:col-span-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Fetching consultations archive...</span>
            </div>
          ) : processedList.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-white/[0.06] text-center text-gray-400 shadow-md">
              <FileText className="h-10 w-10 mx-auto mb-3 text-gray-600" />
              <p className="text-xs font-semibold text-gray-300">No consultation records match the filters.</p>
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); fetchHistory(''); }} 
                  className="text-primary underline text-xs mt-2.5 cursor-pointer font-bold block mx-auto"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            <div className="relative border-l border-white/5 pl-4 ml-2 space-y-5">
              {processedList.map((item, idx) => {
                const isSelected = selectedRecord?.id === item.id;
                const score = item.prediction?.confidence_score || 0;
                const disease = item.prediction?.predicted_disease || 'Unknown Disease';
                const symptoms = item.prediction?.symptom_text || 'No details provided.';
                const risk = getRiskLabel(score);
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center group ${
                      isSelected 
                        ? 'border-primary bg-primary/[0.04] shadow-[0_0_15px_rgba(37,99,235,0.05)]' 
                        : 'border-white/[0.05] bg-white/[0.01] hover:border-primary/30 hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Timeline Node dot */}
                    <div className={`absolute -left-[21px] top-7 h-2.5 w-2.5 rounded-full border ring-4 ring-[#0B1120] transition-colors ${
                      isSelected ? 'bg-primary border-primary ring-primary/10' : 'bg-gray-700 border-white/10'
                    }`} />

                    <div className="space-y-2 max-w-[80%]">
                      <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      <h3 className="font-bold text-white capitalize leading-tight truncate">{disease}</h3>
                      <p className="text-xs text-gray-400 truncate leading-relaxed">
                        "{symptoms}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${risk.class}`}>
                        {(score * 100).toFixed(0)}%
                      </span>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/10"
                        title="Delete log permanently"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Detail Card */}
        <div className="lg:col-span-6 h-full">
          <AnimatePresence mode="wait">
            {selectedRecord ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                key={selectedRecord.id}
                className="glass-panel p-6 rounded-3xl border border-white/[0.06] shadow-2xl space-y-6 relative overflow-hidden text-left"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />

                <div className="flex justify-between items-start border-b border-white/[0.06] pb-4">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Consultation record details</span>
                    <h3 className="text-2xl font-extrabold text-white capitalize leading-tight">
                      {selectedRecord.prediction?.predicted_disease || 'Unknown'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{formatDate(selectedRecord.created_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="p-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/25 rounded-xl transition-all cursor-pointer shadow-lg shadow-primary/5 flex items-center justify-center"
                    title="Print / Save PDF Report"
                  >
                    <Download className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Details sections */}
                <div className="space-y-5 text-xs text-gray-300">
                  <div className="space-y-2 bg-white/[0.01] p-4.5 rounded-2xl border border-white/[0.05]">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Submitted Symptom Text</span>
                    <p className="leading-relaxed text-white font-medium italic">
                      "{selectedRecord.prediction?.symptom_text || 'No details'}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.01] p-4 rounded-2xl border border-white/[0.05]">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Statistical Match</span>
                      <span className="text-xl font-extrabold text-gradient">
                        {((selectedRecord.prediction?.confidence_score || 0) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="bg-white/[0.01] p-4 rounded-2xl border border-white/[0.05]">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Log Status</span>
                      <span className="text-xl font-extrabold text-accent">Secured & Archived</span>
                    </div>
                  </div>

                  {selectedRecord.prediction?.explanation && (
                    <div className="space-y-2 bg-white/[0.01] p-4.5 rounded-2xl border border-white/[0.05]">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Clinical Assessment Inference</span>
                      <p className="leading-relaxed text-gray-300 font-medium whitespace-pre-line">
                        {selectedRecord.prediction.explanation}
                      </p>
                    </div>
                  )}

                  {/* Precautions */}
                  {selectedRecord.prediction?.precautions && selectedRecord.prediction.precautions.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Precautions Logged</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {selectedRecord.prediction.precautions.map((prec, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                            <span className="text-accent text-xs font-bold mr-1">✓</span>
                            <span>{prec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Differential Diagnosis (Disease Percentage list) */}
                  {selectedRecord.prediction?.top_5_predictions && selectedRecord.prediction.top_5_predictions.length > 0 && (
                    <div className="space-y-3 border-t border-white/5 pt-4">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Differential Probability List</span>
                      <div className="space-y-2">
                        {selectedRecord.prediction.top_5_predictions.map((pred, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="capitalize font-semibold text-gray-300">{pred.disease}</span>
                              <span className="font-bold text-white">{(pred.probability * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${pred.probability * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-12 rounded-3xl border border-white/[0.06] text-center text-gray-400 h-full min-h-[380px] flex flex-col items-center justify-center space-y-4 shadow-xl"
              >
                <div className="h-14 w-14 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-gray-600 shadow-inner">
                  <FileText className="h-6 w-6 animate-pulse" />
                </div>
                <p className="text-xs text-gray-500 max-w-xs leading-normal">
                  Select a consultation record on the left to examine detailed diagnostic insights, confidence matches, and clinical precaution details.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Printable Sheet (styled specifically for A4 printing/PDF generation) */}
      {selectedRecord && (
        <div className="hidden print:block p-10 bg-white text-black min-h-screen text-left font-sans">
          <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-800">Aegis AI Medical Report</h1>
              <p className="text-xs text-gray-500">Autonomous Clinical Machine Learning Telemetry</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block font-mono">ID: {selectedRecord.id}</span>
              <p className="text-xs font-semibold mt-1">Date: {formatDate(selectedRecord.created_at)}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Subjective (Symptom Summary)</h3>
              <p className="text-sm italic text-gray-800">"{selectedRecord.prediction?.symptom_text || 'None'}"</p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Assessment (Clinical Telemetry)</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-[10px] text-gray-500 block uppercase">Primary Predicted Condition</span>
                  <span className="text-lg font-bold capitalize text-red-600">
                    {selectedRecord.prediction?.predicted_disease || 'Unknown'}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-[10px] text-gray-500 block uppercase">Classifier Match Confidence</span>
                  <span className="text-lg font-bold">
                    {((selectedRecord.prediction?.confidence_score || 0) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {selectedRecord.prediction?.explanation && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Diagnostic Narrative</h3>
                <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-line">{selectedRecord.prediction.explanation}</p>
              </div>
            )}

            {/* Precautions inside PDF */}
            {selectedRecord.prediction?.precautions && selectedRecord.prediction.precautions.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Recommended Precautions</h3>
                <ul className="list-disc pl-5 text-xs text-gray-700 space-y-1 mt-1">
                  {selectedRecord.prediction.precautions.map((prec, i) => (
                    <li key={i}>{prec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Differential Diagnosis list inside PDF */}
            {selectedRecord.prediction?.top_5_predictions && selectedRecord.prediction.top_5_predictions.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Differential Diagnosis List</h3>
                <div className="space-y-1.5 mt-2">
                  {selectedRecord.prediction.top_5_predictions.map((pred, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-700 border-b border-gray-100 pb-1">
                      <span className="capitalize font-medium">{pred.disease}</span>
                      <span className="font-bold">{(pred.probability * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-gray-200 mt-12 text-[10px] text-gray-400 space-y-2 leading-relaxed">
              <p><b>Important Medical Disclaimer:</b> This document is automatically generated by an experimental NLP machine learning classifier model as an educational project. It is not an officially verified clinical diagnosis. Please visit a certified practitioner to verify these conditions.</p>
              <div className="flex justify-between pt-8 font-semibold text-xs text-gray-700">
                <span>Verified Signature: _________________________</span>
                <span>Date: _________________________</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationHistory;
