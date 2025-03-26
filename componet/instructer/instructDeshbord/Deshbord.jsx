import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBook, FaShoppingCart, FaUsers, FaRupeeSign, FaChalkboardTeacher, FaClipboardList } from "react-icons/fa";
import "./InstructorDashboard.css";
import { useUser } from "../../../context/authContaxt";
import axios from "axios";
const InstructorDashboard = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();
  const[Totalenrolled,setTotalenrolled]=useState()
  const[TotaCourses,setTotalCourses]=useState()
  const[TotalAmount,setTotalAmount]=useState()

  const{instructorId}=useUser();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';


  console.log("Instr",instructorId);
  

  // Fetch students data for specific instructor
  useEffect(() => {
    const fetchStudents = async () => {
      if (!instructorId) {
        console.error('No Instructor ID provided');
        return;
      }
  
      try {
        const response = await axios.get(`${API_URL}/api/enrollment/${instructorId}`);
        console.log("lenght",response.data.length);
        
        // Count total unique enrolled students
        const totalEnrollments = response.data.length;
  
        // Count total number of enrollments
  
        // Update state with enrollment counts
        setTotalenrolled(totalEnrollments);
  console.log("Totalenrolled",Totalenrolled);
  
      } catch (err) {
        console.error('Error fetching enrollment data:', err);
      }
    };
  
    fetchStudents();
  }, [instructorId]);
    
  //couresperchesed
  useEffect(() => {
    const fetchCourses = async () => {
      if (!instructorId) {
        console.error('No Instructor ID provided');
        return;
      }
  
      try {
        const response = await axios.get(`${API_URL}/api/instructor/${instructorId}`);
        console.log("lenght",response.data.length);
        
        // Count total unique enrolled students
        const totalCourses = response.data.length;
  
        // Count total number of enrollments
  
        // Update state with enrollment counts
        setTotalCourses(totalCourses);
  console.log("totalCourses",totalCourses);
  
      } catch (err) {
        console.error('Error fetching enrollment data:', err);
      }
    };
  
    fetchCourses();
  }, [instructorId]);
    

  
//couresperchesed
useEffect(() => {
  const fetchCourses = async () => {
    if (!instructorId) {
      console.error('No Instructor ID provided');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/instructor/amount/${instructorId}`);
      console.log("Totalamoundsdt",response.data);
      
      // Count total number of enrollments
      const amounts = response.data.map((payment) => payment.paymentId.amount);
    
      // Calculate total revenue
      const totalRevenue = amounts.reduce((sum, amount) => sum + amount, 0);
      setTotalAmount(totalRevenue);
      // Log for debugging
      console.log('Payment Amounts:', amounts);
      console.log('Total Revenue:', totalRevenue);
      console.log('Number of Payments:', response.data.length);
  
      // Update state with enrollment counts

    } catch (err) {
      console.error('Error fetching enrollment data:', err);
    }
  };

  fetchCourses();
}, [instructorId]);
  

  useEffect(() => {
    const isUserLoggedIn = sessionStorage.getItem("LoginStatus") === "true";
    if (!isUserLoggedIn) {
      navigate("/login"); // Redirect to login if not logged in
    } else {
      setIsLogin(true);
      fetchDashboardData(); // Fetch dashboard data when logged in
    }
  }, [navigate, isLogin]);

  const fetchDashboardData = () => {
    const fetchedData = {
      totalCourses: 8,
      coursesPurchased: 45,
      totalRevenue: 12500, // in INR
      totalStudents: 120,
      topSellingCourses: [
        { id: 1, title: "React for Beginners", sales: 20 },
        { id: 2, title: "Full Stack Development", sales: 15 },
        { id: 3, title: "Python Masterclass", sales: 10 },
      ],
      recentEnrollments: [
        { id: 1, student: "Amit Kumar", course: "React for Beginners" },
        { id: 2, student: "Pooja Sharma", course: "Python Masterclass" },
        { id: 3, student: "Rahul Verma", course: "Full Stack Development" },
      ],
    };
    setDashboardData(fetchedData);
  };

  if (!isLogin || !dashboardData) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Instructor Dashboard</h1>
      <p className="dashboard-subtitle">Welcome back! Here’s a quick summary of your course stats.</p>

      {/* Summary Cards */}
      <div className="dashboard-summary">
        <div className="summary-card">
          <FaBook className="summary-icon" />
          <h3>{TotaCourses}</h3>
          <p>Total Courses Uploaded</p>
        </div>
        <div className="summary-card">
          <FaShoppingCart className="summary-icon" />
          <h3>{Totalenrolled}</h3>
          <p>Courses Purchased</p>
        </div>
        <div className="summary-card">
          <FaUsers className="summary-icon" />
          <h3>{Totalenrolled}</h3>
          <p>Total Students Enrolled</p>
        </div>
        <div className="summary-card">
          <FaRupeeSign className="summary-icon" />
          <h3>₹{TotalAmount}</h3>
          <p>Total Revenue Earned</p>
        </div>
      </div>

      {/* Top Selling Courses */}
      <section className="dashboard-section">
        <h2>Top Selling Courses</h2>
        <ul>
          {dashboardData.topSellingCourses.map((course) => (
            <li key={course.id}>
              {course.title} - <strong>{course.sales} Sales</strong>
            </li>
          ))}
        </ul>
      </section>

      {/* Recent Student Enrollments */}
      <section className="dashboard-section">
        <h2>Recent Student Enrollments</h2>
        <ul>
          {dashboardData.recentEnrollments.map((enrollment) => (
            <li key={enrollment.id}>
              {enrollment.student} enrolled in <strong>{enrollment.course}</strong>
            </li>
          ))}
        </ul>
      </section>

      {/* Course Management */}
      <div className="dashboard-actions">
        <Link to="/instructor/manage-courses" className="action-btn">
          <FaClipboardList className="btn-icon" /> Manage Courses
        </Link>
        <Link to="/instructor/maneg" className="action-btn">
          <FaChalkboardTeacher className="btn-icon" /> Manage Students
        </Link>
      </div>
    </div>
  );
};

export default InstructorDashboard;
