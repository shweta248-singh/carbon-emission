import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OperationsHub from './pages/OperationsHub';
import RouteOptimization from './pages/RouteOptimization';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const Layout = ({ children }) => (
  <div className="min-h-screen bg-darker text-white">
    {/* Background effects */}
    <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0"></div>
    <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-emerald-700/10 blur-[100px] pointer-events-none z-0"></div>
    
    <Navbar />
    <Sidebar />
    
    <main className="pl-[260px] pt-[72px] min-h-screen z-10 relative">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/"
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
