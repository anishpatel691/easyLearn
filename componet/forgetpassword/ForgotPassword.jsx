import React, { useState } from "react";
import axios from "axios";
import "./AuthStyles.css"; // Import the CSS file
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email address");
      setMessageType("error");
      return;
    }
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/send-otp`, { email });
      setMessage(response.data.message);
      setMessageType("success");
      setOtpSent(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send verification code");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp) {
      setMessage("Please enter the verification code");
      setMessageType("error");
      return;
    }
    
    if (!newPassword) {
      setMessage("Please enter a new password");
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      const requestData = {
        email,
        otp,
        password: newPassword,
      };
      console.log("Sending data:", requestData);  // Add this line to debug
      
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, requestData);
      // Updated to match our new backend parameter name (newPassword -> password)
      
      setMessage(response.data.message);
      setMessageType("success");
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-header">
        <h2>Reset your password</h2>
        <p>We'll send you a verification code to reset your password</p>
      </div>

      <div className="forgot-password-form-container">
        {!otpSent ? (
          <form className="forgot-password-form" onSubmit={handleSendOTP}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {message && (
              <div className={`message ${messageType}`}>
                <p>{message}</p>
              </div>
            )}

            <div className="form-group">
              <button
                type="submit"
                disabled={isLoading}
                className="primary-button"
              >
                {isLoading ? "Sending..." : "Send verification code"}
              </button>
            </div>
          </form>
        ) : (
          <form className="forgot-password-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                placeholder="Enter the 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {message && (
              <div className={`message ${messageType}`}>
                <p>{message}</p>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setOtpSent(false);
                  setMessage("");
                }}
              >
                Back to email
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => handleSendOTP({ preventDefault: () => {} })}
              >
                Resend code
              </button>
            </div>

            <div className="form-group">
              <button
                type="submit"
                disabled={isLoading}
                className="primary-button"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        <div className="form-footer">
          <div className="divider">
            <span>Remember your password?</span>
          </div>

          <Link to="/login" className="secondary-button">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;