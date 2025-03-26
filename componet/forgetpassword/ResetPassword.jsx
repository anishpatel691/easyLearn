import React, { useState } from "react";
import axios from "axios";
import "./AuthStyles.css"; // Assuming you want to use the same styles
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error
  const [isLoading, setIsLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

const navigate =useNavigate()
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!email || !otp) {
      setMessage("Email and verification code are required");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
      setMessage(response.data.message);
      setMessageType("success");
      setOtpVerified(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to verify code");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
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
      // Using our new endpoint to check both User and Instructor collections
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        email,
        otp,
        password: newPassword
      });
      
      setMessage(response.data.message);
      setMessageType("success");
      
      navigate("/login")
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
        <p>{!otpVerified ? "Verify your code to reset password" : "Create a new password"}</p>
      </div>

      <div className="forgot-password-form-container">
        {!otpVerified ? (
          <form className="forgot-password-form" onSubmit={handleVerifyOTP}>
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
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </form>
        ) : (
          <form className="forgot-password-form" onSubmit={handleResetPassword}>
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

          <a href="/login" className="secondary-button">
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;