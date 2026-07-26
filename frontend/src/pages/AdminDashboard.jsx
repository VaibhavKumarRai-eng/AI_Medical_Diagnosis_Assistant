import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Shield, Activity, Users, Database, Clock, RefreshCw, BarChart, Server } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS plugins
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

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

  const getDoughnutData = () => {
    if (!metrics?.most_predicted_diseases) return null;
    
    const labels = metrics.most_predicted_diseases.map(d => d.disease.toUpperCase());
    const dataValues = metrics.most_predicted_diseases.map(d => d.count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Prediction Count',
          data: dataValues,
          backgroundColor: [
            'rgba(20, 184, 166, 0.6)',   // Teal
            'rgba(59, 130, 246, 0.6)',   // Blue
            'rgba(99, 102, 241, 0.6)',   // Indigo
            'rgba(168, 85, 247, 0.6)',   // Purple
            'rgba(236, 72, 153, 0.6)',   // Pink
            'rgba(245, 158, 11, 0.6)'    // Amber
          ],
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getBarData = () => {
    if (!metrics?.recent_predictions) return null;
    
    // Sort recent list to draw chart
    const recent = [...metrics.recent_predictions].reverse();
    const labels = recent.map((r, i) => `Case #${recent.length - i}`);
    const dataValues = recent.map(r => r.confidence * 100);

    return {
      labels,
      datasets: [
        {
          label: 'Confidence Level (%)',
          data: dataValues,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1.5,
          borderRadius: 4
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9ca3af',
          font: { size: 10 }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: '#9ca3af', size: 10 },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      x: {
        ticks: { color: '#9ca3af', size: 10 },
        grid: { display: false }
      }
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-left space-y-8">
      <div className="border-b border-white/5 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Shield className="h-8 w-8 text-brand-500" />
            Administration Console
          </h1>
          <p className="text-sm text-gray-400">
            System performance, model accuracy telemetry, database health reports, and analytics.
          </p>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Metrics
        </button>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-2xl flex items-start gap-4">
          <Shield className="h-10 w-10 text-red-400 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-300">Access Restricted</h4>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 space-y-2">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading admin metrics...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="h-12 w-12 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20">
                <Users className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Total Patients</span>
                <span className="text-2xl font-bold text-white">{metrics.total_users}</span>
              </div>
            </div>

            {/* Total Predictions */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Total Diagnoses</span>
                <span className="text-2xl font-bold text-white">{metrics.total_predictions}</span>
              </div>
            </div>

            {/* Database Status */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <Database className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">DB Health Status</span>
                <span className="text-base font-bold text-emerald-400 capitalize">{metrics.system_health?.database_status}</span>
              </div>
            </div>

            {/* Server Uptime */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Server Uptime</span>
                <span className="text-sm font-bold text-white whitespace-nowrap">{formatUptime(metrics.system_health?.uptime_seconds)}</span>
              </div>
            </div>
          </div>

          {/* Charts area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Doughnut: Most Predicted */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[350px]">
              <h3 className="text-lg font-bold text-white mb-4">Disease Case Distribution</h3>
              <div className="relative flex-1 h-[220px]">
                {getDoughnutData() ? (
                  <Doughnut data={getDoughnutData()} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">No disease distribution metrics logged.</div>
                )}
              </div>
            </div>

            {/* Bar: Recent logs */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[350px]">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart className="h-5 w-5 text-brand-500" />
                Diagnostic Confidence Logs
              </h3>
              <div className="relative flex-1 h-[220px]">
                {getBarData() ? (
                  <Bar data={getBarData()} options={barOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">No predictions recorded yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* System details */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-brand-500" />
              Environment Specs & ML Performance
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">ML Model Version</span>
                <span className="font-semibold text-white">{metrics.model_version || 'N/A'}</span>
              </div>
              <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Python Sandbox Version</span>
                <span className="font-semibold text-white">{metrics.system_health?.python_version || 'N/A'}</span>
              </div>
              <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Host Platform OS</span>
                <span className="font-semibold text-white">{metrics.system_health?.platform || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
