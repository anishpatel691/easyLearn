import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';

function LoginStatus() {
  const [isLogin, setIsLogin] = useState(false); // Tracks login status
  const [userType, setUserType] = useState(''); // Tracks user type
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Retrieve userType from localStorage
        const storedUserType = localStorage.getItem('Usertype') || 'guest'; // Default to 'guest'
        setUserType(storedUserType);
        const LoginStatus = sessionStorage.getItem("LoginStatus");
        console.log("User Token",LoginStatus);
        
        if (LoginStatus) {
          // User is logged in, set session and state
          sessionStorage.setItem('isLogin', 'true');
          sessionStorage.setItem('userType', storedUserType);
          setIsLogin(true);
        } else {
          // User is not logged in, clear session
          sessionStorage.removeItem('isLogin');
          sessionStorage.removeItem('userType');
          setIsLogin(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        // Clear session on error
        sessionStorage.removeItem('isLogin');
        sessionStorage.removeItem('userType');
        setIsLogin(false);
      }
    };
  

    // Cleanup the listener when the component unmounts
    return () => {
      checkLoginStatus()
    };

 
  }, [isLogin, userType]); // Run only once when the component mounts

  const handleLogout = async() => {
    // Clear session storage and reset state
    const userid= localStorage.getItem('Userid'); // Default to 'guest'
      const logout = await axios.post(`${API_URL}/api/auth/logout/${userid}`);
      if(logout){
        sessionStorage.removeItem('isLogin');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('LoginStatus');
        localStorage.removeItem('Userid');
        localStorage.removeItem('Usertype');

        setIsLogin(false);
        setUserType('guest');
        alert('You have been logged out.');
        window.location.reload();
      }
    
  };

  return (
    <div>
    

  </div>  
  );
}

export default LoginStatus;
