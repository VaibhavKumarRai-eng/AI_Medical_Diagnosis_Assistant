import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Shield, Activity, Users, Database, Clock, RefreshCw, BarChart, Server } from 'lucide-react';
import { 
  ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Cell, 
  PieChart as RechartsPieChart, Pie, Legend 
} from 'recharts';

const AdminDashboard = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchMetrics();
  }, [refreshTrigger]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.getDashboard();
      setMetrics(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Failed to retrieve system metrics. Access restricted to administrator credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPieChartData = () => {
    if (!metrics?.most_predicted_diseases) return [];
    return metrics.most_predicted_diseases.map(d => ({
      name: d.disease.toUpperCase(),
      value: d.count
    }));
  };

  const getBarChartData = () => {
    if (!metrics?.recent_predictions) return [];
    const recent = [...metrics.recent_predictions].reverse();
    return recent.map((r, i) => ({
      name: `Case #${recent.length - i}`,
      confidence: Math.round(r.confidence * 100)
    }));
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const colors = ['#2563EB', '#14B8A6', '#6366F1', '#A855F7', '#EC4899', '#F59E0B'];

  return (
    <div className={`max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-left space-y-8 relative transition-colors duration-300 ${
      isLight ? 'text-med-text' : 'text-gray-300'
    }`}>
      {/* Background Glowing Orbs */}
      <div className={`absolute top-20 left-[10%] w-80 h-80 rounded-full blur-[100px] pointer-events-none -z-10 opacity-70 ${
        isLight ? 'bg-med-secondary' : 'bg-primary/10'
      }`} />
      <div className={`absolute bottom-20 right-[10%] w-80 h-80 rounded-full blur-[100px] pointer-events-none -z-10 opacity-70 ${
        isLight ? 'bg-[#EEF0FF]' : 'bg-secondary/10'
      }`} />

      <div className={`border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        isLight ? 'border-med-secondary' : 'border-white/[0.06]'
      }`}>
        <div>
          <h1 className={`text-3xl font-extrabold flex items-center gap-3 transition-colors duration-300 ${
            isLight ? 'text-med-text' : 'text-white'
          }`}>
            <div className={`p-2 rounded-xl border shadow-[0_0_15px_rgba(37,99,235,0.15)] ${
              isLight ? 'bg-med-secondary border-med-primary/10 text-med-primary' : 'bg-primary/10 border-primary/20 text-primary'
            }`}>
              <Shield className="h-6 w-6 text-current" />
            </div>
            Administration Console
          </h1>
          <p className={`text-xs mt-1.5 ${isLight ? 'text-med-gray' : 'text-gray-400'}`}>
            System load, model telemetry indicators, SQLite/PostgreSQL health diagnostics, and classifier metrics.
          </p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            isLight 
              ? 'bg-med-secondary border-med-primary/10 text-med-primary hover:bg-med-primary hover:text-white' 
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Metrics
        </button>
      </div>

      {error ? (
        <div className={`border p-6 rounded-2xl flex items-start gap-4 shadow-xl ${
          isLight ? 'bg-red-50 border-red-200 text-red-950' : 'bg-red-500/[0.03] border-red-500/20 text-red-200'
        }`}>
          <Shield className="h-8 w-8 text-red-500 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-650 dark:text-red-400">Access Restricted</h4>
            <p className={`text-xs leading-normal ${isLight ? 'text-red-800' : 'text-gray-500'}`}>{error}</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Loading analytics panel...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-lg transition-all duration-300 ${
              isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/[0.06]'
            }`}>
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-[0_0_10px_rgba(37,99,235,0.1)] shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className={`text-[9px] font-bold uppercase tracking-wider block ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>Total Patients</span>
                <span className={`text-2xl font-extrabold ${isLight ? 'text-med-text' : 'text-white'}`}>{metrics.total_users}</span>
              </div>
            </div>

            {/* Total Predictions */}
            <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-lg transition-all duration-300 ${
              isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/[0.06]'
            }`}>
              <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center border border-secondary/20 shadow-[0_0_10px_rgba(20,184,166,0.1)] shrink-0">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <span className={`text-[9px] font-bold uppercase tracking-wider block ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>Total Diagnoses</span>
                <span className={`text-2xl font-extrabold ${isLight ? 'text-med-text' : 'text-white'}`}>{metrics.total_predictions}</span>
              </div>
            </div>

            {/* Database Status */}
            <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-lg transition-all duration-300 ${
              isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/[0.06]'
            }`}>
              <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20 shadow-[0_0_10px_rgba(34,197,94,0.1)] shrink-0">
                <Database className="h-6 w-6 text-accent" />
              </div>
              <div>
                <span className={`text-[9px] font-bold uppercase tracking-wider block ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>DB Health Status</span>
                <span className="text-sm font-extrabold text-accent capitalize">{metrics.system_health?.database_status}</span>
              </div>
            </div>

            {/* Server Uptime */}
            <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-lg transition-all duration-300 ${
              isLight ? 'glass-panel-light border-med-secondary' : 'glass-panel border-white/[0.06]'
            }`}>
              <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)] shrink-0">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <div className="overflow-hidden">
                <span className={`text-[9px] font-bold uppercase tracking-wider block ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>Server Uptime</span>
                <span className={`text-xs font-bold whitespace-nowrap block truncate ${isLight ? 'text-med-text' : 'text-white'}`}>{formatUptime(metrics.system_health?.uptime_seconds)}</span>
              </div>
            </div>
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* PieChart: Most Predicted */}
            <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col justify-between min-h-[360px] shadow-xl text-left transition-all duration-300 ${
              isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
            }`}>
              <h3 className={`text-sm font-bold ${isLight ? 'text-med-text' : 'text-white'} mb-4`}>Disease Case Distribution</h3>
              <div className="relative flex-1 h-[240px] text-xs">
                {getPieChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={getPieChartData()}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isLight ? '#FFFFFF' : '#111827', 
                          borderColor: isLight ? 'rgba(91, 76, 245, 0.08)' : 'rgba(255,255,255,0.08)', 
                          borderRadius: '12px',
                          color: isLight ? '#1A1A1A' : '#F8FAFC'
                        }}
                        itemStyle={{ color: isLight ? '#1A1A1A' : '#F8FAFC' }}
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center" 
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500">No telemetry log entries.</div>
                )}
              </div>
            </div>

            {/* BarChart: Recent Predictions */}
            <div className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between min-h-[360px] shadow-xl text-left transition-all duration-300 ${
              isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
            }`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 mb-4 ${isLight ? 'text-med-text' : 'text-white'}`}>
                <BarChart className="h-4.5 w-4.5 text-primary" />
                Confidence Telemetry Logs
              </h3>
              <div className="relative flex-1 h-[240px] text-xs">
                {getBarChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={getBarChartData()}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" stroke={isLight ? '#666666' : '#9ca3af'} fontSize={9} />
                      <YAxis stroke={isLight ? '#666666' : '#9ca3af'} fontSize={9} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: isLight ? '#FFFFFF' : '#111827', 
                          borderColor: isLight ? 'rgba(91, 76, 245, 0.08)' : 'rgba(255,255,255,0.08)', 
                          borderRadius: '12px',
                          color: isLight ? '#1A1A1A' : '#F8FAFC'
                        }}
                        labelStyle={{ color: isLight ? '#1A1A1A' : '#F8FAFC', fontWeight: 'bold' }}
                        formatter={(value) => [`${value}%`, 'Match Rate']}
                      />
                      <Bar dataKey="confidence" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={35}>
                        {getBarChartData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.confidence >= 75 ? '#ef4444' : entry.confidence >= 40 ? '#f59e0b' : '#14b8a6'} 
                          />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500">No predictions recorded yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Environment Specs & Model Meta */}
          <div className={`p-6 rounded-3xl border space-y-4 shadow-xl text-left transition-all duration-300 ${
            isLight ? 'glass-panel-light border-med-secondary bg-white/70' : 'glass-panel border-white/[0.06] bg-dark-surface/50'
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-med-text' : 'text-white'}`}>
              <Server className="h-4.5 w-4.5 text-primary" />
              Infrastructure Specs & Model Metadata
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className={`space-y-1.5 p-4.5 rounded-2xl border transition-colors ${
                isLight ? 'bg-med-secondary/30 border-med-primary/5' : 'bg-white/[0.01] border-white/[0.05]'
              }`}>
                <span className={`text-[9px] uppercase tracking-wider block font-bold ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>Classifier Target Spec</span>
                <span className={`font-bold block ${isLight ? 'text-med-text' : 'text-white'}`}>{metrics.model_version || 'v1.0-Stratified (XGBoost/NB)'}</span>
              </div>
              <div className={`space-y-1.5 p-4.5 rounded-2xl border transition-colors ${
                isLight ? 'bg-med-secondary/30 border-med-primary/5' : 'bg-white/[0.01] border-white/[0.05]'
              }`}>
                <span className={`text-[9px] uppercase tracking-wider block font-bold ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>Sandbox Python Engine</span>
                <span className={`font-bold block ${isLight ? 'text-med-text' : 'text-white'}`}>{metrics.system_health?.python_version || 'Python 3.14+'}</span>
              </div>
              <div className={`space-y-1.5 p-4.5 rounded-2xl border transition-colors ${
                isLight ? 'bg-med-secondary/30 border-med-primary/5' : 'bg-white/[0.01] border-white/[0.05]'
              }`}>
                <span className={`text-[9px] uppercase tracking-wider block font-bold ${isLight ? 'text-med-gray' : 'text-gray-500'}`}>Platform Server Host</span>
                <span className={`font-bold block truncate ${isLight ? 'text-med-text' : 'text-white'}`}>{metrics.system_health?.platform || 'Windows Host Server'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
