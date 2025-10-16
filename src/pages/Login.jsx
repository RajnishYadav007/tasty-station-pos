// // src/pages/Login/Login.jsx

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, User, Phone, X, Send } from 'lucide-react';
// import './Login.css';

// const Login = () => {
//   const navigate = useNavigate();
//   const { login, userRoles } = useAuth();
  
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [showForgotPassword, setShowForgotPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     name: '',
//     phone: ''
//   });
  
//   const [resetEmail, setResetEmail] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     if (isSignUp) {
//       // Sign Up Logic
//       if (!formData.name || !formData.email || !formData.password || !formData.phone) {
//         setError('Please fill in all fields');
//         setLoading(false);
//         return;
//       }

//       setTimeout(() => {
//         alert('✅ Account created successfully! Please login.');
//         setIsSignUp(false);
//         setFormData({ email: formData.email, password: formData.password, name: '', phone: '' });
//         setLoading(false);
//       }, 500);
//     } else {
//       // Login Logic
//       const result = login(formData.email, formData.password);
      
//       setTimeout(() => {
//         if (result.success) {
//           navigate(result.user.defaultRoute);
//         } else {
//           setError(result.message);
//         }
//         setLoading(false);
//       }, 500);
//     }
//   };

//   const handleQuickLogin = (user) => {
//     setFormData({
//       email: user.email,
//       password: user.password,
//       name: '',
//       phone: ''
//     });
//     setIsSignUp(false);
//   };

//   const handleForgotPassword = (e) => {
//     e.preventDefault();
//     if (!resetEmail) {
//       alert('⚠️ Please enter your email address');
//       return;
//     }
    
//     // Simulate password reset
//     setTimeout(() => {
//       alert('✅ Password reset link sent to ' + resetEmail);
//       setShowForgotPassword(false);
//       setResetEmail('');
//     }, 500);
//   };

//   return (
//     <div className="login-page">
//       <div className="login-container">
//         {/* Left Side - Branding */}
//         <div className="login-left">
//           <div className="brand-section">
//             <div className="brand-logo">🍽️</div>
//             <h1>Tasty Station</h1>
//             <p>Restaurant Management System</p>
//           </div>
          
//           <div className="features-list">
//             <div className="feature-item">
//               <span className="feature-icon">✅</span>
//               <span>Manage Orders & Tables</span>
//             </div>
//             <div className="feature-item">
//               <span className="feature-icon">✅</span>
//               <span>Track Customers & Revenue</span>
//             </div>
//             <div className="feature-item">
//               <span className="feature-icon">✅</span>
//               <span>Kitchen Management</span>
//             </div>
//             <div className="feature-item">
//               <span className="feature-icon">✅</span>
//               <span>Real-time Analytics</span>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Login/Sign Up Form */}
//         <div className="login-right">
//           <div className="login-form-container">
//             {/* Tab Switcher */}
//             <div className="auth-tabs">
//               <button 
//                 className={`auth-tab ${!isSignUp ? 'active' : ''}`}
//                 onClick={() => setIsSignUp(false)}
//               >
//                 <LogIn size={18} />
//                 Sign In
//               </button>
//               <button 
//                 className={`auth-tab ${isSignUp ? 'active' : ''}`}
//                 onClick={() => setIsSignUp(true)}
//               >
//                 <UserPlus size={18} />
//                 Sign Up
//               </button>
//             </div>

//             <div className="login-header">
//               <h2>{isSignUp ? 'Create Account' : 'Welcome Back!'}</h2>
//               <p>{isSignUp ? 'Sign up to get started' : 'Sign in to continue to Tasty Station'}</p>
//             </div>

//             {error && (
//               <div className="error-message">
//                 <span>⚠️</span>
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="login-form">
//               {/* Sign Up Additional Fields */}
//               {isSignUp && (
//                 <>
//                   <div className="form-group">
//                     <label>Full Name</label>
//                     <div className="input-wrapper">
//                       <User size={20} className="input-icon" />
//                       <input
//                         type="text"
//                         placeholder="Enter your full name"
//                         value={formData.name}
//                         onChange={(e) => setFormData({...formData, name: e.target.value})}
//                         required={isSignUp}
//                       />
//                     </div>
//                   </div>

//                   <div className="form-group">
//                     <label>Phone Number</label>
//                     <div className="input-wrapper">
//                       <Phone size={20} className="input-icon" />
//                       <input
//                         type="tel"
//                         placeholder="Enter your phone number"
//                         value={formData.phone}
//                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
//                         required={isSignUp}
//                       />
//                     </div>
//                   </div>
//                 </>
//               )}

//               {/* Common Fields */}
//               <div className="form-group">
//                 <label>Email Address</label>
//                 <div className="input-wrapper">
//                   <Mail size={20} className="input-icon" />
//                   <input
//                     type="email"
//                     placeholder="Enter your email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({...formData, email: e.target.value})}
//                     required
//                     autoComplete="email"
//                   />
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label>Password</label>
//                 <div className="input-wrapper">
//                   <Lock size={20} className="input-icon" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="Enter your password"
//                     value={formData.password}
//                     onChange={(e) => setFormData({...formData, password: e.target.value})}
//                     required
//                     autoComplete={isSignUp ? 'new-password' : 'current-password'}
//                   />
//                   <button
//                     type="button"
//                     className="toggle-password"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               {/* Forgot Password Link (Login Only) */}
//               {!isSignUp && (
//                 <div className="forgot-password">
//                   <button type="button" onClick={() => setShowForgotPassword(true)}>
//                     Forgot password?
//                   </button>
//                 </div>
//               )}

//               <button type="submit" className="login-btn" disabled={loading}>
//                 {loading ? (
//                   <>
//                     <div className="spinner"></div>
//                     {isSignUp ? 'Creating account...' : 'Signing in...'}
//                   </>
//                 ) : (
//                   <>
//                     {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
//                     {isSignUp ? 'Create Account' : 'Sign In'}
//                   </>
//                 )}
//               </button>
//             </form>

// {/* Quick Login Section (Login Only) */}
// {!isSignUp && (
//   <div className="quick-login-section">
//     <div className="divider">
//       <span>Or quick login as</span>
//     </div>

//     <div className="quick-login-grid">
//       {userRoles.map(user => (
//         <button
//           key={user.id}
//           className="quick-login-btn"
//           onClick={() => handleQuickLogin(user)}
//           style={{ borderColor: user.color }}
//         >
//           <div 
//             className="quick-avatar"
//             style={{ background: user.color }}
//           >
//             {user.icon}  {/* ✅ Changed from {user.avatar} to {user.icon} */}
//           </div>
//           <div className="quick-info">
//             <span className="quick-role" style={{ color: user.color }}>
//               {user.role}  {/* ✅ Removed icon from here */}
//             </span>
//           </div>
//         </button>
//       ))}
//     </div>
//   </div>
// )}

//             {/* Toggle Sign Up/Login Link */}
//             <div className="toggle-auth-mode">
//               <p>
//                 {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
//                 <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
//                   {isSignUp ? 'Sign In' : 'Sign Up'}
//                 </button>
//               </p>
//             </div>

//             <div className="login-footer">
//               <p>© 2025 Tasty Station. All rights reserved.</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Forgot Password Modal */}
//       {showForgotPassword && (
//         <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
//           <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <div>
//                 <h3>🔐 Forgot Password?</h3>
//                 <p>Enter your email to reset password</p>
//               </div>
//               <button 
//                 className="modal-close-btn" 
//                 onClick={() => setShowForgotPassword(false)}
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <form onSubmit={handleForgotPassword} className="forgot-form">
//               <div className="form-group">
//                 <label>Email Address</label>
//                 <div className="input-wrapper">
//                   <Mail size={20} className="input-icon" />
//                   <input
//                     type="email"
//                     placeholder="Enter your email"
//                     value={resetEmail}
//                     onChange={(e) => setResetEmail(e.target.value)}
//                     required
//                     autoFocus
//                   />
//                 </div>
//               </div>

//               <div className="modal-actions">
//                 <button 
//                   type="button" 
//                   className="btn-cancel"
//                   onClick={() => setShowForgotPassword(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn-send">
//                   <Send size={18} />
//                   Send Reset Link
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Login;
// src/pages/Login/Login.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, userRoles } = useAuth();

  const handleQuickLogin = (user) => {
    const result = login(user.email, user.password);
    
    if (result.success) {
      navigate(result.user.defaultRoute);
    } else {
      alert('❌ Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-left">
          <div className="brand-section">
            <div className="brand-logo">🍽️</div>
            <h1>Tasty Station</h1>
            <p>Restaurant Management System</p>
          </div>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Manage Orders & Tables</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Track Customers & Revenue</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Kitchen Management</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Real-time Analytics</span>
            </div>
          </div>
        </div>

        {/* Right Side - Quick Login Only */}
        <div className="login-right">
          <div className="login-form-container">
            <div className="login-header">
              <h2>Welcome Back!</h2>
              <p>Select your role to continue to Tasty Station</p>
            </div>

            {/* Quick Login Section */}
            <div className="quick-login-section">
              <div className="divider">
                <span>Or quick login as</span>
              </div>

              <div className="quick-login-grid">
                {userRoles.map(user => (
                  <button
                    key={user.id}
                    className="quick-login-btn"
                    onClick={() => handleQuickLogin(user)}
                    style={{ borderColor: user.color }}
                  >
                    <div 
                      className="quick-avatar"
                      style={{ background: user.color }}
                    >
                      {user.icon}
                    </div>
                    <div className="quick-info">
                      <span className="quick-role" style={{ color: user.color }}>
                        {user.role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="login-footer">
              <p>© 2025 Tasty Station. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

