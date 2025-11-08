// src/App.js - ✅ UPDATED WITH NotificationProvider

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext'; // ✅ ADD THIS
import { OrderProvider } from './context/OrderContext';
import { MenuProvider } from './context/MenuContext';  
import { BillProvider } from './context/BillContext';
import { PaymentProvider } from './context/PaymentContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderLine from './pages/OrderLine';
import ManageTable from './pages/ManageTable';
import Menu from './pages/Menu';
import Customers from './pages/Customers';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermissions }) => {
  const { isAuthenticated, loading, currentUser, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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

  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requiredPermissions.some(permission => hasPermission(permission));
    
    if (!hasAccess) {
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
      {/* ✅ NotificationProvider must be inside AuthProvider but outside Router */}
      <NotificationProvider>
        <OrderProvider>
          <BillProvider>
            <PaymentProvider>
              <MenuProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <DefaultRoute />
                        </ProtectedRoute>
                      }
                    />

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

                    <Route
                      path="/orderline"
                      element={
                        <ProtectedRoute requiredPermissions={['all', 'orderline', 'orders', 'order']}>
                          <MainLayout>
                            <OrderLine />
                          </MainLayout>
                          </ProtectedRoute>
                      }
                    />

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

                    <Route
                      path="/menu"
                      element={
                        <ProtectedRoute requiredPermissions={['all', 'menu']}>
                          <MainLayout>
                            <Menu />
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />

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

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Router>
              </MenuProvider>
            </PaymentProvider>
          </BillProvider>
        </OrderProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
