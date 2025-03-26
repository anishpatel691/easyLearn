import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './InstructorNavbar.css';
import 'font-awesome/css/font-awesome.min.css';
import { notifySuccess } from '../../notification/Notification'; 
import { useUser } from '../../../context/authContaxt';
import axios from 'axios';

const InstructorNavbar = () => {
  const [isLogin, setIsLogin] = useState(false);
  const { loginStatus, updateUser, usertype, usertypeInstru, logout } = useUser();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

  // Sync `isLogin` state with `sessionStorage`
  useEffect(() => {
    const isUserLoggedIn = sessionStorage.getItem('LoginStatus') === 'true'; // Check sessionStorage value
    setIsLogin(isUserLoggedIn);
  }, [loginStatus]);

  const handleLogoutIn = async () => {
    const userid = localStorage.getItem('Userid'); // Default to 'guest'
    const logoutResponse = await axios.post(`${API_URL}/api/auth/logout/${userid}`);
    if (logoutResponse) {
      sessionStorage.removeItem('isLogin');
      sessionStorage.removeItem('userType');
      sessionStorage.removeItem('LoginStatus');
      localStorage.removeItem('Userid');
      sessionStorage.removeItem("instroucterId");

      navigate("/");

      logout();
      notifySuccess("Logged out successfully!");
      updateUser(null, 'false');

    }
  };

  if (!isLogin) {
    // Redirect to login page if not logged in
    navigate('/');
    return null; // Prevent the component from rendering
  }

  return (
    <Navbar fixed="top" bg="dark" expand="lg" className="instructor-navbar">
      <Container fluid>
        {/* Navbar links */}
        <Navbar.Collapse id="navbar-nav">
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/instructor/dashboard" className="nav-link">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/instructor/manage-courses" className="nav-link">
              Upload Courses
            </Nav.Link>
            <Nav.Link as={Link} to="/instructor/maneg" className="nav-link">
              Manage Students
            </Nav.Link>
            <Nav.Link as={Link} to="/instructor/managecourses" className="nav-link">
              Manage Courses
            </Nav.Link>
            <Nav.Link as={Link} to="/instructor/settings" className="nav-link">
              Settings
            </Nav.Link>
            
            <Button
              variant="primary"
              className="auth-btn d-flex align-items-center instructor-logout"
              onClick={handleLogoutIn}>
              <i className="fas fa-user-circle" style={{ fontSize: '18px' }}></i>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}; 

export default InstructorNavbar;
