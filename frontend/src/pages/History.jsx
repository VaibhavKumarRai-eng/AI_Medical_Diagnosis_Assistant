import React, { useState, useEffect } from 'react';
import { historyAPI } from '../services/api';
import { History, Search, Trash2, Calendar, FileText, ArrowRight, Download, Activity, AlertCircle, X } from 'lucide-react';

const ConsultationHistory = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [error, setError] = useState('');

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
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-left space-y-8">
      {/* Printable Area Wrapper for Reports */}
      <div className="print:hidden border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
            <History className="h-8 w-8 text-brand-500" />
            Diagnostic Consultations
          </h1>
          <p className="text-sm text-gray-400">
            Review your diagnostic history, track symptoms progression, and download official medical reports.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms / diseases..."
              className="glass-input pl-9 pr-4 py-2 text-xs w-60"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="print:hidden bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg flex items-start gap-2.5 text-sm">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid listing */}
      <div className="print:hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left list: Logs */}
        <div className="lg:col-span-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-2">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Fetching archive...</span>
            </div>
          ) : historyList.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-600" />
              <p>No consultation records found.</p>
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); fetchHistory(''); }} className="text-brand-500 underline text-xs mt-2 cursor-pointer">
                  Clear search filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedRecord(item)}
                  className={`glass-panel p-4 rounded-xl border transition-all duration-200 cursor-pointer flex justify-between items-center ${
                    selectedRecord?.id === item.id 
                      ? 'border-brand-500 bg-brand-500/5' 
                      : 'border-white/5 hover:border-brand-500/30'
                  }`}
                >
                  <div className="space-y-1.5 max-w-[80%]">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-brand-500" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <h3 className="font-bold text-white capitalize truncate">{item.disease_predicted}</h3>
                    <p className="text-xs text-gray-400 truncate leading-relaxed">
                      Symptom text: "{item.symptom_text_summary}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-semibold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Detail Card */}
        <div className="lg:col-span-6">
          {selectedRecord ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 relative">
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-brand-500 uppercase tracking-widest">Consultation Record Details</span>
                  <h3 className="text-2xl font-extrabold text-white capitalize">{selectedRecord.disease_predicted}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(selectedRecord.created_at)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer border border-white/5"
                    title="Print / Save PDF Report"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Details sections */}
              <div className="space-y-4 text-sm text-gray-300">
                <div className="space-y-1.5 bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Submitted Symptom Text</span>
                  <p className="leading-relaxed text-white">"{selectedRecord.symptom_text_summary}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Confidence Match</span>
                    <span className="text-xl font-bold text-gradient">{(selectedRecord.confidence * 100).toFixed(2)}%</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Status</span>
                    <span className="text-xl font-bold text-green-400">Archived</span>
                  </div>
                </div>

                {selectedRecord.explanation && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Diagnostic Inference</span>
                    <p className="leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">{selectedRecord.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center text-gray-400 h-full min-h-[300px] flex flex-col items-center justify-center space-y-4">
              <FileText className="h-16 w-16 text-gray-600 animate-pulse-slow" />
              <p>Select a consultation record on the left to examine detailed diagnostic insights, recommendations, and download official medical reports.</p>
            </div>
          )}
        </div>
      </div>

      {/* Printable Sheet (hidden during normal view, styled specifically for A4 printing/PDF generation) */}
      {selectedRecord && (
        <div className="hidden print:block p-8 bg-white text-black min-h-screen text-left">
          <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-800">AI Medical Consultation Report</h1>
              <p className="text-xs text-gray-500">Project major B.Tech Capstone Demonstration Document</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400">Report ID: {selectedRecord.id}</span>
              <p className="text-xs font-semibold">Date: {formatDate(selectedRecord.created_at)}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Subjective (Symptom History)</h3>
              <p className="text-sm italic">"{selectedRecord.symptom_text_summary}"</p>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Assessment (Clinical Inference)</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-xs text-gray-500 block">Primary Predicted Condition</span>
                  <span className="text-lg font-bold capitalize text-red-600">{selectedRecord.disease_predicted}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-xs text-gray-500 block">Statistical Classifier Confidence</span>
                  <span className="text-lg font-bold">{(selectedRecord.confidence * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {selectedRecord.explanation && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">Diagnostic Explanation</h3>
                <p className="text-sm leading-relaxed">{selectedRecord.explanation}</p>
              </div>
            )}

            <div className="pt-8 border-t border-gray-200 mt-12 text-xs text-gray-500 space-y-2">
              <p><b>Legal Disclaimer:</b> This document is automatically generated by an experimental NLP machine learning classifier model as an educational capstone project. It is not an officially verified medical diagnosis document. Please visit a certified hospital practitioner to check these conditions.</p>
              <div className="flex justify-between pt-6">
                <span>Verification Signature: _________________________</span>
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
