import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from './api/axios';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatbotWidget from './components/ChatbotWidget';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OperationsHub from './pages/OperationsHub';
import RouteOptimization from './pages/RouteOptimization';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import LoadingSpinner from './components/LoadingSpinner';

const Layout = ({ children, hideSidebar = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  return (
    <div className="min-h-screen bg-darker text-white">
      {/* Background effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-emerald-700/10 blur-[100px] pointer-events-none z-0"></div>
      
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      {isLoggedIn && !hideSidebar && (
        <>
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </>
      )}
      
      <main className={`${isLoggedIn && !hideSidebar ? 'pl-0 lg:pl-[260px]' : 'pl-0'} pt-[72px] min-h-screen z-10 relative transition-all duration-300`}>
        <div className="p-0 md:p-0 max-w-full mx-auto">
          {children}
        </div>
      </main>
      <ChatbotWidget />
    </div>
  );
};

function App() {
  const { i18n } = useTranslation();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('token');
      // Set language from localStorage even if not logged in (for guests)
      const guestLng = localStorage.getItem('i18nextLng');
      if (guestLng && i18n.language !== guestLng) {
        await i18n.changeLanguage(guestLng);
      }
      
      const guestTheme = localStorage.getItem('theme') || 'dark';
      if (!token) {
        if (guestTheme === 'light') document.documentElement.classList.add('light');
        else document.documentElement.classList.remove('light');
      }

      if (token) {
        try {
          const response = await api.get('/users/me');
          const user = response.data.data;
          
          if (user.preferences) {
            const { language, theme } = user.preferences;
            
            // Apply language
            if (language && i18n.language !== language) {
              await i18n.changeLanguage(language);
            }
            
            // Apply theme
            if (theme === 'light') {
              document.documentElement.classList.add('light');
            } else {
              document.documentElement.classList.remove('light');
            }
          }
        } catch (err) {
          console.error('Failed to initialize app preferences:', err);
        }
      }
      setInitializing(false);
    };

    initializeApp();
  }, [i18n]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <LoadingSpinner message="Initializing CarbonTrace..." />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout hideSidebar><LandingPage /></Layout>} />
        <Route path="/login" element={<Layout hideSidebar><Login /></Layout>} />
        <Route path="/register" element={<Layout hideSidebar><Register /></Layout>} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/operations"
          element={
            <ProtectedRoute>
              <Layout>
                <OperationsHub />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/optimization"
          element={
            <ProtectedRoute>
              <Layout>
                <RouteOptimization />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
