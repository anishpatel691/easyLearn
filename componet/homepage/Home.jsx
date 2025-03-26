import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome to LearnEasy!</h1>
        <p className="welcome-text">
          Your one-stop platform to learn and teach. Explore courses from top instructors or share your expertise with the world.
        </p>
        <button className="cta-btn">Explore Courses</button>
        <button className="cta-btn-secondary">Become an Instructor</button>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Why Choose LearnEasy?</h2>
        <div className="features">
          <div className="feature-card">
            <i className="fa fa-laptop feature-icon"></i>
            <h3>Top-Quality Content</h3>
            <p>Access courses designed by experienced professionals.</p>
          </div>
          <div className="feature-card">
            <i className="fa fa-users feature-icon"></i>
            <h3>Community of Learners</h3>
            <p>Join thousands of students and learn together.</p>
          </div>
          <div className="feature-card">
            <i className="fa fa-upload feature-icon"></i>
            <h3>Upload Your Courses</h3>
            <p>Instructors can easily create and manage their courses.</p>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section">
        <h2 className="cta-title">Ready to Start?</h2>
        <p className="cta-text">
          Whether you’re a student eager to learn or an instructor ready to share your knowledge, LearnEasy is here for you!
        </p>
        <button className="cta-btn">Start Learning</button>
        <button className="cta-btn-secondary">Upload a Course</button>
      </div>
    </div>
  );
};

export default Home;
