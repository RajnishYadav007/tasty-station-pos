import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ✅ REACT-TOASTIFY IMPORTS
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ✅ ADD TOASTCONTAINER - SHOWS ALL TOASTS */}
    <ToastContainer
      position="top-right"          // Toast position
      autoClose={3000}              // Auto close in 3 seconds
      hideProgressBar={false}       // Show progress bar
      newestOnTop={true}            // New toasts on top
      closeOnClick={true}           // Click to close
      rtl={false}                   // Left-to-right
      pauseOnFocusLoss={true}       // Pause when window loses focus
      draggable={true}              // Draggable toast
      pauseOnHover={true}           // Pause auto-close on hover
      theme="light"                 // light, dark, colored
    />
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
