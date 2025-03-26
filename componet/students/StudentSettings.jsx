import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../context/authContaxt';
import styles from './UserProfile.module.css';

const UserProfile = () => {
  const { userId } = useUser(); // Get userId from context
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';
  
  // State for password update
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('User ID not found.');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch user data using userId from database
        const response = await axios.get(`${API_URL}/api/getuser/${userId}`);
        setUserData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching user data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // Basic validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/updatepassword/${userId}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess("Password updated successfully");
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide the form after successful update
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(null);
      }, 3000);
      
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.heading}>User Profile</h2>
      <div className={styles.info}>
        <p><strong>Name:</strong> {userData?.name || 'N/A'}</p>
        <p><strong>Email:</strong> {userData?.email || 'N/A'}</p>
        <p><strong>Phone:</strong> {userData?.phone || 'N/A'}</p>
      </div>
      
      <div className={styles.passwordSection}>
        <button 
          className={styles.passwordButton}
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        >
          {showPasswordForm ? 'Cancel' : 'Update Password'}
        </button>
        
        {showPasswordForm && (
          <form className={styles.passwordForm} onSubmit={handlePasswordSubmit}>
            {passwordError && <div className={styles.error}>{passwordError}</div>}
            {passwordSuccess && <div className={styles.success}>{passwordSuccess}</div>}
            
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <button type="submit" className={styles.submitButton}>
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;