<<<<<<< HEAD
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
=======
import logo from './logo.svg';
import './App.css';

function App() {
  
  return (
    <div className="App">
    console.log("hello");
    
    </div>
>>>>>>> 8f6508cadc04efe2a2b170d954900a05af84d693
  );
}

export default App;
