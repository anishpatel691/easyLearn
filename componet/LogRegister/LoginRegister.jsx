import React, { useState } from "react";
import axios from "axios";
import { notifySuccess, notifyError, notifyInfo } from '../notification/Notification';
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../../context/authContaxt";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./LoginRegister.css";

const LoginRegister = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState("student");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profileImage: null,
    bio: "",
    skills: "",
  });
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';


  const handleChange = (e) => {
    const { name, id, value, files } = e.target;
    setFormData({
      ...formData,
      [id || name]: files ? files[0] : value,
    });
  };
  const [flag, setFlag] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try instructor login
      const response = await axios.post(`${API_URL}/api/instructors/login`, {
        email: formData.email,
        password: formData.password,
      });


      if (response.status === 200) {
        setFlag(true);
console.log("Token",response.data.token );

        notifySuccess("Login Successful!");
        updateUser(response.data.instructor._id, response.data.LoginSataus,response.data.token,response.data.instructor._id);
        localStorage.setItem("Userid", response.data.instructor._id);
        sessionStorage.setItem("LoginStatus", response.data.LoginSataus);
        // Store auth token
        localStorage.setItem("authToken", response.data.token || response.data.LoginSataus);
        console.log("LoginStatus:", response.data.LoginSataus);
        sessionStorage.setItem("UsertypeInstru" , "instructor");

        navigate("/instructor/dashboard");
      } else {
        console.error("Unexpected Response:", response.data || "Unexpected error");
        notifyInfo("Login failed: Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Instructor Login Error:", error.response?.data || error.message);
      if (!flag) {
        try {
          const response = await axios.post(`${API_URL}/api/users/login`, {
            email: formData.email,
            password: formData.password,
          });
    
          if (response.status === 200) {
            setFlag(true);
console.log("Token",response.data.token );

            notifySuccess("Login Successful!");
            sessionStorage.setItem("UsertypeStudent","student");    
            updateUser(response.data.user._id, response.data.LoginSataus,response.data.token);
            localStorage.setItem("Userid", response.data.user._id);
            sessionStorage.setItem("LoginStatus", response.data.LoginSataus);
            // Store auth token
            
            const token =sessionStorage.setItem("authToken", response.data.token);
  console.log("login Token",sessionStorage.getItem("authToken"));
  

            navigate("/student/courses");
          } else {
            console.error("Unexpected User Login Response:", response.data || "Unexpected error");
            notifyInfo("Login failed: Unexpected response from the server.");
          }
        } catch (userError) {
          console.error("User Login Error:", userError.response?.data || userError.message);
          notifyError(`Login failed: Invalid credentials`);
        }
      }
    }
    finally {
      setLoading(false);
    }
  };

  // Function to send welcome email
  const sendWelcomeEmail = async (userData) => {
    try {
      await axios.post(`${API_URL}/api/email/send-welcome`, {
        name: userData.name,
        email: userData.email,
        userType: userType
      });
      setEmailSent(true);
      console.log("Welcome email sent successfully");
    } catch (error) {
      console.error("Error sending welcome email:", error);
      // Don't notify the user about email failure - it's a background process
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      localStorage.setItem("Usertype", userType);
      
      const url = userType === "instructor"
        ? `${API_URL}/api/instructors/register`
        : `${API_URL}/api/users/register`;

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      console.log("Form Data before sending:", Object.fromEntries(formDataToSend.entries()));
      console.log("Form Data before sending:", formData);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        // Send welcome email on successful registration
        await sendWelcomeEmail({
          name: formData.name,
          email: formData.email
        });
        
        notifySuccess("Registration Successful! A welcome email has been sent to your email address.");
        setFormData({
          name: "",
          email: "",
          password: "",
          profileImage: null,
          bio: "",
          skills: "",
        });
        
        // Switch to login form after successful registration
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      }
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "An unexpected error occurred!";
      notifyError(`Registration failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body">
      <div className="login-register-container">
        <div className="form-toggle">
          <button
            className={`toggle-btn ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`toggle-btn ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <div className="form-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm"></span> : "Login"}
              </button>
            </form>

            {/* Forgot Password & Register Links */}
            <div className="text-center mt-3">
              <Link to="/forgetpasssentotp" className="text-decoration-none">Forgot Password?</Link>
            </div>
          </div>
        ) : (
          <div className="form-container">
            <h2>Register</h2>
            <div className="user-type-toggle">
              <button
                className={`user-type-btn ${userType === "student" ? "active" : ""}`}
                onClick={() => setUserType("student")}
                disabled={loading}
              >
                Register as Student
              </button>
              <button
                className={`user-type-btn ${userType === "instructor" ? "active" : ""}`}
                onClick={() => setUserType("instructor")}
                disabled={loading}
              >
                Register as Instructor
              </button>
            </div>

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Full Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              {userType === "instructor" && (
                <>
                  <div className="mb-3">
                    <label htmlFor="bio" className="form-label">
                      Bio:
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      className="form-control"
                      rows="4"
                      placeholder="Write a short bio about yourself"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={loading}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="skills" className="form-label">
                      Skills:
                    </label>
                    <input
                      type="text"
                      name="skills"
                      id="skills"
                      className="form-control"
                      placeholder="Enter your skills (e.g., Python, JavaScript)"
                      value={formData.skills}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <small className="text-muted">
                      Separate skills with commas
                    </small>
                  </div>
                </>
              )}
              <button
                type="submit"
                className="btn btn-success w-100"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  `Register as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;