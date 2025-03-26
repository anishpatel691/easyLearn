// AboutUs.jsx
import React, { useState, useEffect } from 'react';
import './AboutUs.css';

const AboutUs = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real application, this would be an API call to your MongoDB backend
    // Example: fetch('/api/team-members')
    // For demonstration, using mock data
    const fetchTeamMembers = async () => {
      try {
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // This would normally come from your MongoDB
        const mockTeamData = [
          {
            id: 1,
            name: "Dr. Sarah Johnson",
            role: "Lead Counselor",
            specialty: "Family Therapy",
            bio: "With over 15 years of experience, Dr. Johnson specializes in helping families navigate difficult transitions.",
            imageUrl: "/api/placeholder/150/150"
          },
          {
            id: 2,
            name: "Michael Chen, LMFT",
            role: "Senior Therapist",
            specialty: "Cognitive Behavioral Therapy",
            bio: "Michael is dedicated to evidence-based approaches that help clients overcome anxiety and depression.",
            imageUrl: "/api/placeholder/150/150"
          },
          {
            id: 3,
            name: "Aisha Patel, Ph.D.",
            role: "Clinical Psychologist",
            specialty: "Trauma Recovery",
            bio: "Dr. Patel combines traditional and innovative techniques to create personalized healing journeys.",
            imageUrl: "/api/placeholder/150/150"
          }
        ];
        
        setTeamMembers(mockTeamData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load team information. Please try again later.');
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <div className="about-us-container">
      <section className="about-us-hero">
        <h1>About Our Counseling Center</h1>
        <p className="tagline">Compassionate Care for Every Journey</p>
      </section>

      <section className="about-us-mission">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            At Healing Horizons, we believe everyone deserves access to quality mental health care. 
            Our mission is to provide a safe, supportive environment where individuals and families 
            can find the guidance they need to overcome challenges and thrive.
          </p>
        </div>
        <div className="mission-image">
          <img src="/api/placeholder/400/300" alt="Counseling session" />
        </div>
      </section>

      <section className="about-us-values">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <h3>Compassion</h3>
            <p>We approach each client with genuine care and understanding.</p>
          </div>
          <div className="value-card">
            <h3>Respect</h3>
            <p>We honor the unique experiences and perspectives of every individual.</p>
          </div>
          <div className="value-card">
            <h3>Excellence</h3>
            <p>We are committed to the highest standards of professional practice.</p>
          </div>
          <div className="value-card">
            <h3>Growth</h3>
            <p>We believe in the capacity for positive change at any stage of life.</p>
          </div>
        </div>
      </section>

      <section className="about-us-team">
        <h2>Meet Our Team</h2>
        {loading ? (
          <p className="loading-message">Loading our team information...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="team-grid">
            {teamMembers.map(member => (
              <div className="team-member-card" key={member.id}>
                <div className="team-member-image">
                  <img src={member.imageUrl} alt="image" />
                </div>
                <h3>{member.name}</h3>
                <p className="team-member-role">{member.role}</p>
                <p className="team-member-specialty">{member.specialty}</p>
                <p className="team-member-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="about-us-history">
        <h2>Our Journey</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-year">2010</div>
            <div className="timeline-content">
              <h3>Our Founding</h3>
              <p>Healing Horizons was established with just two counselors and a vision.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2015</div>
            <div className="timeline-content">
              <h3>Expanding Services</h3>
              <p>We introduced specialized programs for teens and families.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2020</div>
            <div className="timeline-content">
              <h3>Virtual Care</h3>
              <p>We launched our telehealth platform to ensure continuous care.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2024</div>
            <div className="timeline-content">
              <h3>Community Focus</h3>
              <p>We began offering free monthly workshops for our community.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-us-testimonials">
        <h2>What Our Clients Say</h2>
        <div className="testimonials-carousel">
          <div className="testimonial">
            <p>"Working with the counselors at Healing Horizons changed my life. I finally feel equipped to face challenges with confidence."</p>
            <p className="testimonial-author">- Jamie T.</p>
          </div>
        </div>
      </section>

      <section className="about-us-contact">
        <h2>Connect With Us</h2>
        <p>Ready to start your journey toward wellbeing? Reach out today.</p>
        <button className="contact-button">Contact Us</button>
      </section>
    </div>
  );
};

export default AboutUs;