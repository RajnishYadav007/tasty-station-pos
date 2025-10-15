import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import OrderLine from './pages/OrderLine';
import ManageTable from './pages/ManageTable';
import ManageDishes from './pages/ManageDishes';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/order-line" element={<OrderLine />} />
            <Route path="/manage-table" element={<ManageTable />} />
            <Route path="/manage-dishes" element={<ManageDishes />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
