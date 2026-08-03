import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Activity } from 'lucide-react';
import AegisLogo from './components/AegisLogo';

const socialLinks = [
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com',
    svg: (
      <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    )
  },
  {
    name: 'GitHub',
    url: 'https://github.com',
    svg: (
      <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    )
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com',
    svg: (
      <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
      </svg>
    )
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com',
    svg: (
      <svg className="h-4.5 w-4.5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    )
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com',
    svg: (
      <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    )
  }
];

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

// New Pages
import AboutProject from './pages/AboutProject';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DoctorConsultation from './pages/DoctorConsultation';
import DietPlanner from './pages/DietPlanner';

// Protected Route wrapper component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'light' ? 'bg-white text-gray-800' : 'bg-dark-bg text-gray-300'}`}>
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

// Sub-component to allow access to useLocation()
const AppContent = () => {
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${
      theme === 'light' ? 'bg-white text-med-text font-inter' : 'bg-dark-bg text-gray-300 font-sans'
    } flex flex-col justify-between transition-colors duration-300`}>
      <div className="flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about-project" element={<AboutProject />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

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
            <Route
              path="/doctor-consultation"
              element={
                <ProtectedRoute>
                  <DoctorConsultation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diet-planner"
              element={
                <ProtectedRoute>
                  <DietPlanner />
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

      {theme === 'light' ? (
        /* Premium Light-Themed Footer */
        <footer id="footer" className="border-t border-med-secondary bg-[#F9FAFB] py-16 print:hidden text-sm font-inter text-med-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 text-left">
              {/* Brand Col */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-med-text font-extrabold text-lg tracking-tight font-poppins">
                  <AegisLogo className="h-9 w-9 shrink-0" theme="light" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold leading-tight">Aegis AI</span>
                    <span className="text-[8px] font-medium tracking-normal text-med-gray leading-none mt-0.5 font-sans">
                      by STVS by Vaibhav Kumar Rai
                    </span>
                  </div>
                </div>
                <p className="text-sm text-med-gray leading-relaxed max-w-xs font-inter">
                  Leading the digital transformation of healthcare. We combine professional doctors with advanced AI technologies to deliver trusted, instant diagnosis options.
                </p>
              </div>

              {/* Project Col */}
              <div>
                <h4 className="text-sm font-bold text-med-text uppercase tracking-wider mb-4 font-poppins">Project</h4>
                <ul className="space-y-3 text-sm font-inter">
                  <li><Link to="/about-project" className="hover:text-med-primary transition-colors">About Project</Link></li>
                  <li><Link to="/privacy-policy" className="hover:text-med-primary transition-colors">Privacy & Security</Link></li>
                </ul>
              </div>

              {/* Services Col */}
              <div>
                <h4 className="text-sm font-bold text-med-text uppercase tracking-wider mb-4 font-poppins">Services</h4>
                <ul className="space-y-3 text-sm font-inter">
                  <li><Link to="/doctor-consultation" className="hover:text-med-primary transition-colors">Appointments</Link></li>
                  <li><Link to="/checker" className="hover:text-med-primary transition-colors">AI Diagnosis</Link></li>
                  <li><Link to="/chatbot" className="hover:text-med-primary transition-colors">AI Chatbot</Link></li>
                </ul>
              </div>

              {/* Support Col */}
              <div>
                <h4 className="text-sm font-bold text-med-text uppercase tracking-wider mb-4 font-poppins">Support</h4>
                <ul className="space-y-3 text-sm font-inter">
                  <li><a href="#" className="hover:text-med-primary transition-colors">FAQ</a></li>
                  <li><a href="#footer" className="hover:text-med-primary transition-colors">Contact</a></li>
                  <li><span className="text-xs text-yellow-600/80 font-medium block">College Project Demonstration</span></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-med-secondary pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Blog and Health Tips */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 text-left">
                <span className="font-semibold text-med-text font-poppins">Health Tips & Blog:</span>
                <a href="#" className="hover:text-med-primary hover:underline transition-colors font-inter text-xs bg-med-secondary px-3 py-1 rounded-full text-med-primary font-medium">Daily Fitness Guide</a>
                <a href="#" className="hover:text-med-primary hover:underline transition-colors font-inter text-xs bg-med-secondary px-3 py-1 rounded-full text-med-primary font-medium">Understanding Clinical AI</a>
              </div>

              {/* Social Icons */}
              <div className="flex items-center space-x-4">
                {socialLinks.map((social, sIdx) => {
                  return (
                    <a
                      key={sIdx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white hover:bg-med-primary hover:text-white text-med-gray border border-med-secondary transition-all shadow-premium-sm"
                      title={social.name}
                    >
                      {social.svg}
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-med-gray border-t border-med-secondary/50 pt-6">
              <span>&copy; {new Date().getFullYear()} Aegis AI. All rights reserved.</span>
            </div>
          </div>
        </footer>
      ) : (
        /* Modern Informative SaaS Footer for Interior Pages / Dark Mode */
        <footer className="border-t border-white/[0.06] bg-[#090d16]/80 backdrop-blur-md py-10 print:hidden mt-20 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-white font-bold">
                  <AegisLogo className="h-9 w-9 shrink-0" theme="dark" />
                  <div className="flex flex-col text-left">
                    <span className="leading-tight">Aegis AI</span>
                    <span className="text-[8px] font-medium tracking-normal text-gray-400 leading-none mt-0.5 font-sans">
                      by STVS by Vaibhav Kumar Rai
                    </span>
                  </div>
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
                  <li><Link to="/doctor-consultation" className="hover:text-white transition-colors">Consult Doctors</Link></li>
                  <li><Link to="/about-project" className="hover:text-white transition-colors">About Project</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Legal & Disclaimer</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy & Security</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><span className="text-[10px] text-yellow-500/80 leading-normal block">Demo Only. College Project.</span></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Connect</h4>
                <ul className="space-y-2 text-xs text-gray-400">
                  <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
                  <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn Profile</a></li>
                  <li><span className="text-xs text-gray-500 block">Aegis AI Medical Diagnoser</span></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
              <span>&copy; {new Date().getFullYear()} Aegis AI. All rights reserved.</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
