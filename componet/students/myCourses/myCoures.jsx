import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/authContaxt';

const MyCourses = () => {
  const [activeTab, setActiveTab] = useState('enrolled');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userId, loginStatus } = useUser();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const token = sessionStorage.getItem('authToken');// Get auth token from storage
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        setLoading(true);
        // Make the request with auth headers
        const enrolledResponse = await axios.get(`${API_URL}/api/payments/enrollments/${userId}`, config);
        setEnrolledCourses(enrolledResponse.data);
        console.log("DATA", enrolledResponse.data);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchEnrolledCourses();
    }
  }, [userId]);

  // Calculate progress percentage for a course
  const calculateProgress = (course) => {
    // This is a placeholder function - implement based on your data structure
    // For example, if you have completedLessons and totalLessons
    if (course.progress && course.courseId.totalLessons) {
      return Math.round((course.progress.completedLessons / course.courseId.totalLessons) * 100);
    }
    // Return 0 if no progress data is available
    return course.progress?.percentage || 0;
  };

  return (
    <div className="my-courses-page">
      <div className="tabs">
        <button 
          className={activeTab === 'enrolled' ? 'active' : ''} 
          onClick={() => setActiveTab('enrolled')}
        >
          My Enrolled Courses
        </button>
      </div>

      <section className="courses-container">
        {activeTab === 'enrolled' && (
          <>
            <h2>My Courses</h2>
            {loading ? (
              <div className="loading-state">
                <p>Loading your courses...</p>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="empty-state">
                <p>You haven't enrolled in any courses yet.</p>
                <button onClick={() => navigate('/courses')}>Browse Courses</button>
              </div>
            ) : (
              <div className="course-grid">
                {enrolledCourses.map(course => (
                  <div className="course-card" key={course.courseId._id}>
                    <div 
                      className="course-image" 
                      style={{backgroundImage: `url(${course.courseId.thumbnail})`}}
                    >
                      <div className="course-progress-overlay">
                        <div className="progress-circle">
                          <svg viewBox="0 0 36 36">
                            <path
                              className="circle-bg"
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="circle"
                              strokeDasharray={`${calculateProgress(course)}, 100`}
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <text x="18" y="20.35" className="percentage">{calculateProgress(course)}%</text>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="course-details">
                      <h3>{course.courseId.title}</h3>
                      <p className="instructor">Instructor: {course.courseId.instructorId.name}</p>
                      <div className="course-meta">
                        <span>Enrolled: {new Date(course.enrollmentDate).toLocaleDateString()}</span>
                        <span>{course.courseId.duration || '8h'} total</span>
                      </div>
                      <button
                        className="continue-button"
                        onClick={() => navigate(`/student/courses/${course.courseId._id}`)}
                      >
                        {calculateProgress(course) === 0 ? 'Start Learning' : 'Continue Learning'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default MyCourses;