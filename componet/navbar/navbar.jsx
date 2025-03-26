import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { notifySuccess } from '../notification/Notification';
import { useUser } from '../../context/authContaxt';
import './Navbar.css';
import 'font-awesome/css/font-awesome.min.css';

const LeftSidebarNavbar = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { userId, loginStatus, updateUser, usertype, usertypeInstru, logout2, authToken } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

  
  // Sync login state with sessionStorage
  useEffect(() => {
    const isUserLoggedIn = sessionStorage.getItem('LoginStatus') === 'true';
    setIsLogin(isUserLoggedIn);
  }, [loginStatus]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      const userid = localStorage.getItem('Userid');
      sessionStorage.getItem("authToken")
      sessionStorage.getItem("authToken")
      sessionStorage.getItem("authToken")
      console.log("navtoken",sessionStorage.getItem("authToken") );
      if (!sessionStorage.getItem("authToken") ){
        console.error('No authentication token found');
        return;
      }

      const headers = {
        Authorization: `Bearer ${authToken}`,
      };

      const logout = await axios.post(`${API_URL}/api/auth/logout/${userid}`, {}, { headers });

      if (logout.status === 200) {
        // Clear sessionStorage and localStorage
        sessionStorage.removeItem('isLogin');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('LoginStatus');
        localStorage.removeItem('Userid');
        localStorage.removeItem('authToken');

        logout2();
        notifySuccess('Logged out successfully!');
        updateUser(null, 'false', null, null, null);
        navigate('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Left sidebar navigation */}
      <aside className={`main-sidebar ${menuOpen ? 'menu-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-wrapper">
            <img src="/logo.jpg" alt="Course Selling" className="logo" />
            <h1 className="site-title">Course Hub</h1>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${isActive('/')}`}>
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/courses" className={`nav-link ${isActive('/courses')}`}>
                <i className="fas fa-book"></i>
                <span>Courses</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/aboutus" className={`nav-link ${isActive('/aboutus')}`}>
                <i className="fas fa-info-circle"></i>
                <span>About</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>
                <i className="fas fa-envelope"></i>
                <span>Contact</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          {isLogin ? (
            <button
              className="btn btn-logout"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          ) : (
            <div className="auth-buttons">
              <button
                className="btn btn-login"
                onClick={handleLogin}
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </button>
              <button
                className="btn btn-register"
                onClick={handleRegister}
              >
                <i className="fas fa-user-plus"></i>
                <span>Register</span>
              </button>
            </div>
          )}

          <button className="btn btn-help">
            <i className="fas fa-question-circle"></i>
            <span>Help Center</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {menuOpen && (
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}></div>
      )}
    </>
  );
};

export default LeftSidebarNavbar;
