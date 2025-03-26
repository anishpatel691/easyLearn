import React, { useState, useEffect, useRef } from "react";
import { verifyOTP, requestOTP } from "./api";
import "./AuthStyles.css";

const OTPVerification = ({ setStep, email }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

  // Timer for OTP expiration countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle input change for individual OTP digits
  const handleChange = (index, value) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle key press for backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste event for the entire OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Check if pasted content is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5].focus();
    }
  };

  // Resend OTP function
  const handleResendOTP = async () => {
    try {
      setResending(true);
      setError("");
      await requestOTP(email);
      setTimeLeft(600); // Reset timer to 10 minutes
      setResending(false);
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
      setResending(false);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const otpString = otp.join("");
    
    // Check if OTP is complete
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits of the OTP");
      return;
    }
    
    try {
      setLoading(true);
      const response = await verifyOTP(email, otpString);
      setLoading(false);
      
      // If there's a reset token in response, store it for the next step
      if (response?.resetToken) {
        localStorage.setItem("resetToken", response.resetToken);
      }
      
      setStep(3);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Verify OTP</h2>
      <p className="auth-subtitle">
        We've sent a 6-digit code to <strong>{email}</strong>
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="otp-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : null}
              ref={(el) => (inputRefs.current[index] = el)}
              className="otp-input"
              disabled={loading}
              required
            />
          ))}
        </div>
        
        {timeLeft > 0 ? (
          <p className="timer-text">
            Code expires in: <span className="timer">{formatTime(timeLeft)}</span>
          </p>
        ) : (
          <p className="expired-text">Your OTP has expired. Please request a new one.</p>
        )}
        
        <button 
          type="submit" 
          className={`submit-button ${loading ? 'loading' : ''}`}
          disabled={loading || otp.join("").length !== 6 || timeLeft <= 0}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        
        <div className="auth-links">
          <button 
            type="button" 
            className="text-button"
            onClick={handleResendOTP}
            disabled={resending || timeLeft > 540} // Disable resend for first minute
          >
            {resending ? "Resending..." : "Resend OTP"}
            {timeLeft > 540 && ` (available in ${formatTime(timeLeft - 540)})`}
          </button>
          
          <button 
            type="button" 
            className="text-button"
            onClick={() => setStep(1)}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVerification;