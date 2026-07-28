import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Activity } from 'lucide-react';

// Components & Layout
import Navbar from './components/Navbar';

// Page Views
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SymptomChecker from './pages/SymptomChecker';
import Chatbot from './pages/Chatbot';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';

// Protected Route wrapper component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400 text-sm">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-dark-bg flex flex-col justify-between">
          <div className="flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Patient Protected Routes */}
                <Route
                  path="/checker"
                  element={
                    <ProtectedRoute>
                      <SymptomChecker />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chatbot"
                  element={
                    <ProtectedRoute>
                      <Chatbot />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Administrative Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Catchall */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Modern Informative SaaS Footer */}
          <footer className="border-t border-white/[0.06] bg-[#090d16]/80 backdrop-blur-md py-10 print:hidden mt-20 text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Activity className="h-5 w-5 text-primary" />
                    <span>Aegis AI</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Futuristic machine learning and natural language inference platform for clinical prediction and patient symptom checks.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Resources</h4>
                  <ul className="space-y-2 text-xs text-gray-400">
                    <li><Link to="/checker" className="hover:text-white transition-colors">Symptom Checker</Link></li>
                    <li><Link to="/chatbot" className="hover:text-white transition-colors">AI Assistant</Link></li>
                    <li><Link to="/history" className="hover:text-white transition-colors">Consultation Timeline</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Legal & Disclaimer</h4>
                  <ul className="space-y-2 text-xs text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                    <li><span className="text-[10px] text-yellow-500/80 leading-normal block">Demo Only. Not a clinic replacement.</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Connect</h4>
                  <ul className="space-y-2 text-xs text-gray-400">
                    <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
                    <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn Profile</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Portfolio Showcase</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                <span>&copy; {new Date().getFullYear()} Aegis AI. All rights reserved.</span>
                <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] rounded-full px-3.5 py-1 text-gray-400 text-[10px]">
                  <span>Made with React + FastAPI + Gemini AI</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
