import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Button, ListGroup, Alert } from "react-bootstrap";
import './ViewCourse.css';
import { useUser } from '../../../context/authContaxt'; // Fixed spelling here

const ViewCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const { userId, loginStatus, usertype } = useUser(); // Access context values
 const [instructorId,setinstroucterId] =useState();
 const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // Fetch course details
        const { data } = await axios.get(`${API_URL}/api/courses/${courseId}`);
        setCourse(data);
        console.log("coursedata",data.instructorId._id);
        setinstroucterId(data.instructorId._id)
        
        setLectures(data.lectures || []);
console.log(loginStatus);
console.log("pay",sessionStorage.getItem("authToken"));

        // Only check enrollment if logged in
        if (loginStatus) {
          try {
            const enrolledRes = await axios.get(`${API_URL}/api/payments/status/${courseId}/${userId}`);
            setIsEnrolled(enrolledRes.data.enrolled);
          } catch (enrollError) {
            console.warn("Error checking enrollment status:", enrollError);
            setIsEnrolled(false);
          }
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        
        if (error.response && error.response.status === 401) {
          setError("Authentication required. Please login.");
        } else {
          setError("Failed to load course. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, userId, loginStatus]);

  const handleEnroll = async () => {
    if (!loginStatus) {
      // Redirect to login page with return URL
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }

    try {
      if (course.price === 0) {
        // Free course - enroll directly
        const response = await axios.post(`${API_URL}/api/payments/enroll-free`, { 
          courseId,
          userId 
        });
        
        setIsEnrolled(true);
        setPaymentStatus({ 
          success: true, 
          message: "Successfully enrolled in free course" 
        });
      } else {
        // Paid course - initiate payment
        const { data } = await axios.post(
          `${API_URL}/api/payments/create-order`, 
          { courseId, amount: course.price * 100, userId,instructorId },
          { 
            headers: {
              'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` // Change 'LoginStatus' to 'authToken'
            }
          }
        );
        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          await loadRazorpayScript();
        }

        const options = {
          key: import.meta.env.REACT_APP_RAZORPAY_KEY, 
          amount: data.amount,
          currency: "INR",
          name: "Course Platform",
          description: `Payment for ${course.title}`,
          order_id: data.id,
          handler: async function (response) {
            try {
              // Send verification request to our server
              const verifyResponse = await axios.post(
                `${API_URL}/api/payments/verify`, 
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  courseId,
                  userId,
                  instructorId
                },  // <-- This comma was missing
                {
                  headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                  }
                }
              );
              
              if (verifyResponse.data.success) {
                setIsEnrolled(true);
                setPaymentStatus({
                  success: true,
                  message: "Payment successful! You are now enrolled."
                });
              }
            } catch (error) {
              console.error("Payment verification failed:", error);
              setPaymentStatus({
                success: false,
                message: "Payment verification failed! Please contact support."
              });
            }
          },
          prefill: {
            name: "Student Name",
            email: "student@example.com"
          },
          theme: {
            color: "#007bff"
          },
          modal: {
            ondismiss: function() {
              console.log("Payment dismissed");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      
      if (error.response && error.response.status === 401) {
        navigate('/login', { state: { from: `/courses/${courseId}` } });
      } else {
        setPaymentStatus({
          success: false,
          message: "Error initiating payment. Please try again."
        });
      }
    }
  };

  // Function to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
        console.error("Razorpay SDK failed to load");
      };
      document.body.appendChild(script);
    });
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        {!loginStatus && (
          <div className="text-center mt-3">
            <Button 
              variant="primary" 
              onClick={() => navigate('/login', { state: { from: `/courses/${courseId}` } })}
            >
              Go to Login
            </Button>
          </div>
        )}
      </Container>
    );
  }

  if (!course) {
    return <h2 className="text-center text-danger mt-5">Course not found!</h2>;
  }
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/courses");
    }
  };
  return (
    <Container className="mt-4">
      <div className="back_btn_container2">
      <Button size="md" onClick={handleBack}>← Back</Button>
      </div>
      
      {paymentStatus && (
        <Alert 
          variant={paymentStatus.success ? "success" : "danger"}
          onClose={() => setPaymentStatus(null)} 
          dismissible
        >
          {paymentStatus.message}
        </Alert>
      )}
      
      <Row>
        <Col md={8}>
          <Card>
            <Card.Img variant="top" src={course.thumbnail} className="course-img course_img" />
            <Card.Body>
              <Card.Title>{course.title}</Card.Title>
              <Card.Text>{course.description}</Card.Text>
              <p><strong>Instructor:</strong> {course.instructor}</p>
              <p><strong>Category:</strong> {course.category}</p>
              <p><strong>Price:</strong> {course.price === 0 ? "Free" : `₹${course.price}`}</p>
              
              {!isEnrolled && (
                <Button variant="success" onClick={handleEnroll} className="w-100">
                  {!loginStatus ? "Login to Enroll" : course.price === 0 ? "Enroll Now" : "Pay & Enroll"}
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <h4>Lectures ({lectures.length})</h4>
          {lectures.length === 0 ? (
            <p>No lectures available for this course.</p>
          ) : !isEnrolled ? (
            <p className="text-danger text-center">
              {!loginStatus ? "Login and enroll to access lectures." : "Enroll to access lectures."}
            </p>
          ) : (
            <ListGroup>
              {lectures.map((lecture, index) => (
                <ListGroup.Item key={lecture._id || index}>
                  <strong>{index + 1}. {lecture.title}</strong>
                  <p>{lecture.description}</p>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/student/lectures/${courseId}/${lecture._id}`, {
                      state: { videoUrl: lecture.videoUrl, courseId }
                    })}
                    className="w-100"
                  >
                    Watch Lecture
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ViewCourse;