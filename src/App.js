// src/App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderLine from './pages/OrderLine';
import ManageTable from './pages/ManageTable';
import ManageDishes from './pages/ManageDishes';
import Customers from './pages/Customers';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermissions }) => {
  const { isAuthenticated, loading, currentUser, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requiredPermissions.some(permission => hasPermission(permission));
    
    if (!hasAccess) {
      // Redirect to user's default route
      return <Navigate to={currentUser?.defaultRoute || '/login'} replace />;
    }
  }

  return children;
};

// Main Layout Component
const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        {children}
      </div>
    </div>
  );
};

// Default Route Handler
const DefaultRoute = () => {
  const { currentUser } = useAuth();
  return <Navigate to={currentUser?.defaultRoute || '/dashboard'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route - Login */}
          <Route path="/login" element={<Login />} />

          {/* Default Route - Redirects based on role */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DefaultRoute />
              </ProtectedRoute>
            }
          />

          {/* Dashboard - Owner & Receptionist */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredPermissions={['all', 'tables']}>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Order Line - All except Chef */}
          <Route
            path="/order-line"
            element={
              <ProtectedRoute requiredPermissions={['all', 'orders', 'order']}>
                <MainLayout>
                  <OrderLine />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Manage Table - Owner, Waiter, Receptionist */}
          <Route
            path="/manage-table"
            element={
              <ProtectedRoute requiredPermissions={['all', 'tables']}>
                <MainLayout>
                  <ManageTable />
                </MainLayout>
              </ProtectedRoute>
            }
          />

 

          {/* Manage Dishes - Owner & Chef */}
          <Route
            path="/manage-dishes"
            element={
              <ProtectedRoute requiredPermissions={['all', 'dishes']}>
                <MainLayout>
                  <ManageDishes />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Customers - Owner & Receptionist */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute requiredPermissions={['all', 'customers']}>
                <MainLayout>
                  <Customers />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Settings & Help - All logged in users except customers */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="coming-soon-page">
                    <h1>⚙️ Settings</h1>
                    <p>Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="coming-soon-page">
                    <h1>❓ Help Center</h1>
                    <p>Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
