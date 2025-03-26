import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./StudentCorner.css"; // ✅ Import CSS file for styling
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useUser } from "../../../context/authContaxt";
import { Navigate } from "react-router-dom";
const StudentCorner = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true); // 🔄 Loading state added
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [rating, setRating] = useState("");
  const { userId, loginStatus, updateUser, usertype, usertypeInstru, logout2 } = useUser();
  const [isLogin, setIsLogin] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

const navigate =useNavigate()
    useEffect(() => {
      const isUserLoggedIn = sessionStorage.getItem('LoginStatus') === 'true';
      setIsLogin(isUserLoggedIn);
    }, [loginStatus]);
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/courses`);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false); // 🔄 Stop loading after fetching data
      }
    };
    fetchCourses();
  }, []);

  // Filter courses based on search, category, price, and rating
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? course.category === category : true;
    const matchesPrice = priceRange ? 
      (priceRange === "free" ? course.price === 0 : course.price <= parseInt(priceRange)) : true;
    const matchesRating = rating ? course.rating >= parseFloat(rating) : true;

    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  const handleViewCourse = (courseId) => {
    if (isLogin) {
      navigate(`/student/courses/${courseId}`);
    } else {
      navigate('/login'); // Redirect to login page if not logged in
    }
  };

  return (
    
    <Container className="student-corner mt-4">
      <h2 className="text-center mb-4 title">📚 Browse Courses</h2>

      {/* Search & Filter */}
      <Form className="mb-4">
        <Row className="search-filter">
          <Col lg={3} md={6}>
            <Form.Control
              type="text"
              placeholder="🔍 Search by course title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-box"
            />
          </Col>
          <Col lg={3} md={6}>
            <div className="custom-dropdown">
              <button className="dropdown-btn">{category || "Select Category"}</button>
              <ul className="dropdown-list">
                <li onClick={() => setCategory("")}>All Categories</li>
                <li onClick={() => setCategory("Programming")}>Programming</li>
                <li onClick={() => setCategory("Design")}>Design</li>
                <li onClick={() => setCategory("Marketing")}>Marketing</li>
              </ul>
            </div>
          </Col>
          <Col lg={2} md={4}>
            <div className="custom-dropdown">
              <button className="dropdown-btn">
                {priceRange || "💰 Select Price Range"}
              </button>
              <ul className="dropdown-list">
                <li onClick={() => setPriceRange("")}>💰 All Prices</li>
                <li onClick={() => setPriceRange("Free")}>🆓 Free</li>
                <li onClick={() => setPriceRange("₹500")}>Up to ₹500</li>
                <li onClick={() => setPriceRange("₹1000")}>Up to ₹1000</li>
                <li onClick={() => setPriceRange("₹2000")}>Up to ₹2000</li>
              </ul>
            </div>
          </Col>
          <Col lg={2} md={4}>
            <div className="custom-dropdown">
              <button className="dropdown-btn">
                {rating || "⭐  Select Rating"}
              </button>
              <ul className="dropdown-list">
                <li onClick={() => setRating("")}>All Ratings</li>
                <li onClick={() => setRating("4.5")}>4.5+ ⭐</li>
                <li onClick={() => setRating("4.0")}>4.0+ ⭐</li>
                <li onClick={() => setRating("3.5")}>3.5+ ⭐</li>
              </ul>
            </div>
          </Col>
          <Col lg={2} md={4}>
            <Button variant="primary" className="w-100 reset-btn" onClick={() => {
              setCategory("");
              setPriceRange("");
              setRating("");
            }}>
              Reset Filters
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Loading Animation */}
      {loading ? (
        <div className="text-center">
          <DotLottieReact
            src="https://lottie.host/6b1e66d2-ffb1-4b2d-a6b4-2f1e5ad52421/loader.lottie"
            loop
            autoplay
            style={{ width: 150, height: 150, margin: "auto" }}
          />
          <div className="loaderSpin"></div>
        </div>
      ) : (
        <Row className="course-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Col xl={3} lg={4} md={6} sm={12} key={course._id} className="mb-4">
                <Card className="course-card h-100 shadow">
                  <Card.Img
                    variant="top"
                    src={course.thumbnail}
                    alt={course.title}
                    className="course-img"
                  />
                  <Card.Body>
                    <Card.Title className="course-title">{course.title}</Card.Title>
                    <Card.Text className="instructor">👨‍🏫 {course.instructorId.name}</Card.Text>
                    <Card.Text className="price">💰 ₹{course.price}</Card.Text>
                    <Card.Text className="category">📂 {course.category}</Card.Text>
                    <Button 
                      className="btn btn-primary w-100 view-btn"
                      onClick={() => handleViewCourse(course._id)}
                    >
                      View Course
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <>
              <DotLottieReact
                src="https://lottie.host/7c707fdd-4809-454e-b866-cdfe4f82ca41/XbX38B6uA8.lottie"
                loop
                autoplay
                style={{ width: 200, height: 200, margin: "auto" }}
              />
              <p className="text-center no-courses">❌ No courses found.</p>
            </>
          )}
        </Row>
      )}
    </Container>
  );
};

export default StudentCorner;
