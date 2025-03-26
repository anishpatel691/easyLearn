import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../context/authContaxt';
import './SD.css';

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [stats, setStats] = useState({
    completedCourses: 0,
    inProgressCourses: 0,
    totalHoursLearned: 0
  });
  const { userId, loginStatus } = useUser();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!loginStatus) {
        navigate('/login');
        return;
      }

      try {
        const token = sessionStorage.getItem('authToken'); // or from your auth context
  
  // Add headers to the request
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  // Make the request with auth headers
  const enrolledResponse = await axios.get(`${API_URL}/api/payments/enrollments/${userId}`, config);
  setEnrolledCourses(enrolledResponse.data);
        setEnrolledCourses(enrolledResponse.data);
      console.log("DATA",enrolledResponse.data);
      
        

        // Calculate stats
        const completed = enrolledResponse.data.filter(course => course.progress === 100).length;
        const inProgress = enrolledResponse.data.filter(course => course.progress > 0 && course.progress < 100).length;
        const totalHours = enrolledResponse.data.reduce((sum, course) => sum + (course.hoursCompleted || 0), 0);
        setStats({
          completedCourses: completed,
          inProgressCourses: inProgress,
          totalHoursLearned: totalHours
        });

        // Fetch recommended courses
        const recommendedResponse = await axios.get(`${API_URL}/api/courses/recommended/${userId}`);
        setRecommendedCourses(recommendedResponse.data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [userId, loginStatus, navigate]);

  const calculateProgress = (course) => {
    return course.progress || 0;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="search-bar">
          <input type="text" placeholder="Search for courses..." />
          <button>Search</button>
        </div>
      </header>

      <section className="stats-container">
        <div className="stat-card">
          <h3>{enrolledCourses.length}</h3>
          <p>Enrolled Courses</p>
        </div>
        <div className="stat-card">
          <h3>{stats.completedCourses}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{stats.inProgressCourses}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalHoursLearned}h</h3>
          <p>Hours Learned</p>
        </div>
      </section>

      <nav className="dashboard-tabs">
        <button 
          className={activeTab === 'enrolled' ? 'active' : ''} 
          onClick={() => setActiveTab('enrolled')}
        >
          My Courses
        </button>
        <button 
          className={activeTab === 'recommended' ? 'active' : ''} 
          onClick={() => setActiveTab('recommended')}
        >
          Recommended
        </button>
        <button 
          className={activeTab === 'achievements' ? 'active' : ''} 
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
      </nav>

      <section className="courses-container">
        {activeTab === 'enrolled' && (
          <>
            <h2>My Courses</h2>
            {enrolledCourses.length === 0 ? (
              <div className="empty-state">
                <p>You haven't enrolled in any courses yet.</p>
                <button onClick={() => navigate('/courses')}>Browse Courses</button>
              </div>
            ) : (
              <div className="course-grid">
                {enrolledCourses.map(course => (
                  <div className="course-card" key={course.courseId._id}>
                    <div className="course-image" style={{backgroundImage: `url(${course.courseId.thumbnail})`}}>
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
                        <span>{course.duration || '8h'} total</span>
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

        {activeTab === 'recommended' && (
          <>
            <h2>Recommended for You</h2>
            <div className="course-grid">
              {recommendedCourses.map(course => (
                <div className="course-card" key={course._id}>
                  <div className="course-image" style={{backgroundImage: `url(${course.thumbnail})`}}>
                    <div className="course-badge">Recommended</div>
                  </div>
                  <div className="course-details">
                    <h3>{course.title}</h3>
                    <p className="instructor">Instructor: {course.instructor}</p>
                    <div className="course-meta">
                      <span>{course.studentsEnrolled || 120} students</span>
                      <span>{course.duration || '10h'} total</span>
                    </div>
                    <div className="price">{course.price === 0 ? 'Free' : `₹${course.price}`}</div>
                    <button 
                      className="enroll-button"
                      onClick={() => navigate(`/courses/${course._id}`)}
                    >
                      View Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-container">
            <h2>Your Achievements</h2>
            <div className="achievements-grid">
              <div className="achievement-card">
                <div className="achievement-icon learner">
                  <span>🔥</span>
                </div>
                <h3>Quick Learner</h3>
                <p>Completed a course in less than a week</p>
              </div>
              <div className="achievement-card locked">
                <div className="achievement-icon perfectionist">
                  <span>🏆</span>
                </div>
                <h3>Perfectionist</h3>
                <p>Scored 100% on all quizzes in a course</p>
              </div>
              <div className="achievement-card locked">
                <div className="achievement-icon dedicated">
                  <span>⭐</span>
                </div>
                <h3>Dedicated Student</h3>
                <p>Logged in for 7 consecutive days</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="upcoming-events">
        <h2>Upcoming Events</h2>
        <div className="event-card">
          <div className="event-date">
            <span className="day">25</span>
            <span className="month">Mar</span>
          </div>
          <div className="event-details">
            <h3>Web Development Workshop</h3>
            <p>Learn the latest trends in web development</p>
            <button>Add to Calendar</button>
          </div>
        </div>
        <div className="event-card">
          <div className="event-date">
            <span className="day">02</span>
            <span className="month">Apr</span>
          </div>
          <div className="event-details">
            <h3>Career Counseling Session</h3>
            <p>One-on-one session with industry experts</p>
            <button>Add to Calendar</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;