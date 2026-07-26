import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

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

          {/* Simple footer for disclaimer & info */}
          <footer className="border-t border-white/5 py-6 bg-dark-surface/50 text-center text-xs text-gray-500 print:hidden mt-12">
            <div className="max-w-6xl mx-auto px-4 space-y-1">
              <p>&copy; {new Date().getFullYear()} AI Medical Diagnosis Assistant. Built as a Capstone project.</p>
              <p className="text-gray-600">Educational Demonstration Only. Not intended to replace official clinical consults.</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
