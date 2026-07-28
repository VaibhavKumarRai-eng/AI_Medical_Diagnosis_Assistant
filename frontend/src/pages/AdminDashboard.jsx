import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Shield, Activity, Users, Database, Clock, RefreshCw, BarChart, Server, ActivitySquare } from 'lucide-react';
import { 
  ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Cell, 
  PieChart as RechartsPieChart, Pie, Legend 
} from 'recharts';

const AdminDashboard = () => {
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
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-left space-y-8 relative">
      <div className="border-b border-white/[0.06] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            Administration Console
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">
            System load, model telemetry indicators, SQLite/PostgreSQL health diagnostics, and classifier metrics.
          </p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Metrics
        </button>
      </div>

      {error ? (
        <div className="bg-red-500/[0.03] border border-red-500/20 text-red-200 p-6 rounded-2xl flex items-start gap-4 shadow-xl">
          <Shield className="h-8 w-8 text-red-500 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-400">Access Restricted</h4>
            <p className="text-xs text-gray-500 leading-normal">{error}</p>
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
            <div className="glass-panel p-5 rounded-2xl border border-white/[0.06] flex items-center gap-4 shadow-lg">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Total Patients</span>
                <span className="text-2xl font-extrabold text-white">{metrics.total_users}</span>
              </div>
            </div>

            {/* Total Predictions */}
            <div className="glass-panel p-5 rounded-2xl border border-white/[0.06] flex items-center gap-4 shadow-lg">
              <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center border border-secondary/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Total Diagnoses</span>
                <span className="text-2xl font-extrabold text-white">{metrics.total_predictions}</span>
              </div>
            </div>

            {/* Database Status */}
            <div className="glass-panel p-5 rounded-2xl border border-white/[0.06] flex items-center gap-4 shadow-lg">
              <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                <Database className="h-6 w-6 text-accent" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">DB Health Status</span>
                <span className="text-sm font-extrabold text-accent capitalize">{metrics.system_health?.database_status}</span>
              </div>
            </div>

            {/* Server Uptime */}
            <div className="glass-panel p-5 rounded-2xl border border-white/[0.06] flex items-center gap-4 shadow-lg">
              <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Server Uptime</span>
                <span className="text-xs font-bold text-white whitespace-nowrap block truncate">{formatUptime(metrics.system_health?.uptime_seconds)}</span>
              </div>
            </div>
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* PieChart: Most Predicted */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/[0.06] flex flex-col justify-between min-h-[360px] shadow-xl text-left">
              <h3 className="text-sm font-bold text-white mb-4">Disease Case Distribution</h3>
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
                        contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                        itemStyle={{ color: '#F8FAFC' }}
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
            <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/[0.06] flex flex-col justify-between min-h-[360px] shadow-xl text-left">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
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
                      <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                      <YAxis stroke="#475569" fontSize={9} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                        labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
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
          <div className="glass-panel p-6 rounded-3xl border border-white/[0.06] space-y-4 shadow-xl text-left">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="h-4.5 w-4.5 text-primary" />
              Infrastructure Specs & Model Metadata
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1.5 bg-white/[0.01] p-4.5 rounded-2xl border border-white/[0.05]">
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-bold">Classifier Target Spec</span>
                <span className="font-bold text-white block">{metrics.model_version || 'v1.0-Stratified (XGBoost/NB)'}</span>
              </div>
              <div className="space-y-1.5 bg-white/[0.01] p-4.5 rounded-2xl border border-white/[0.05]">
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-bold">Sandbox Python Engine</span>
                <span className="font-bold text-white block">{metrics.system_health?.python_version || 'Python 3.14+'}</span>
              </div>
              <div className="space-y-1.5 bg-white/[0.01] p-4.5 rounded-2xl border border-white/[0.05]">
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-bold">Platform Server Host</span>
                <span className="font-bold text-white block truncate">{metrics.system_health?.platform || 'Windows Host Server'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
