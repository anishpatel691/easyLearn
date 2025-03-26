import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { notifySuccess } from '../notification/Notification';
import { useUser } from '../../context/authContaxt';
import './StudentNavbar.css';

const StudentLeftSidebar = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userId, loginStatus, updateUser, usertype, usertypeInstru, logout2,authToken } = useUser();
  const navigate = useNavigate();
 const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';


  // Sync login state with sessionStorage
  useEffect(() => {
    const isUserLoggedIn = sessionStorage.getItem('LoginStatus') === 'true';
    setIsLogin(isUserLoggedIn);
  }, [loginStatus]);

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

      const logout = await axios.post(`${API_URL}/api/auth/logout/${userId}`, {}, { headers });

      if (logout.status === 200) {
        // Clear sessionStorage and localStorage
        sessionStorage.removeItem('isLogin');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('LoginStatus');
        localStorage.removeItem('Userid');
        sessionStorage.removeItem('authToken');

        logout2();
        notifySuccess('Logged out successfully!');
        updateUser(null, 'false', null, null, null);
        navigate('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile hamburger menu */}
      <div className="mobile-toggle" onClick={toggleSidebar}>
        <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </div>

      {/* Sidebar navigation */}
      <div className={`student-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/logo.jpg" alt="Learning Platform" className="logo" />
            <h3 className="site-name">Student Portal</h3>
          </div>
          {/* Close button visible only on mobile */}
          <div className="sidebar-close" onClick={toggleSidebar}>
            <i className="fas fa-times"></i>
          </div>
        </div>

        <div className="user-info">
          {isLogin && (
            <div className="avatar-container">
              <i className="fas fa-user-circle avatar-icon"></i>
              <span className="username">Student</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-links">
            <li className="nav-item">
              <Link to="/student/dashboard" className="nav-link" onClick={() => setSidebarOpen(false)}>
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/student/myCourses" className="nav-link" onClick={() => setSidebarOpen(false)}>
                <i className="fas fa-book"></i>
                <span>My Courses</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/student/courses" className="nav-link" onClick={() => setSidebarOpen(false)}>
                <i className="fas fa-chart-line"></i>
                <span>All Courses</span>
              </Link>
            </li>
            
            <li className="nav-item">
              <Link to="/student/setting" className="nav-link" onClick={() => setSidebarOpen(false)}>
                <i className="fas fa-cog"></i>
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          {isLogin ? (
            <button className="btn btn-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn-login" onClick={handleLogin}>
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </button>
              <button className="btn btn-register" onClick={handleRegister}>
                <i className="fas fa-user-plus"></i>
                <span>Register</span>
              </button>
            </div>
          )}
          
          <button className="btn btn-help">
            <i className="fas fa-question-circle"></i>
            <span>Help & Support</span>
          </button>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default StudentLeftSidebar;