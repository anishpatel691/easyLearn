import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from '../componet/homepage/Home';
import LeftSidebarNavbar from '../componet/navbar/navbar';
import LoginRegister from '../componet/LogRegister/LoginRegister';
import Loginstatus from './Loginstatus';
import Notification from '../componet/notification/Notification';
import SomeOtherComponent from './Log';
import CourseVideoPage from '../componet/CourseVideoPage/CourseVideoPage';
import { useUser } from '../context/authContaxt';
import StudentDashboard from '../componet/students/dasbord/Dashboard';
import InstructorDashboard from '../componet/instructer/instructDeshbord/Deshbord';
import UploadCourse from '../componet/instructer/courseuploaded/Courseupload';
import UploadLecture from '../componet/instructer/AddLecture/AddLecture';
import StudentCorner from '../componet/students/Studentcourner/StudentCorner';
import ViewCourse from '../componet/students/viewcourse/ViewCourse';
import WatchLecture from '../componet/students/watchlectures/WatchLecture';
import ForgotPassword from '../componet/forgetpassword/ForgotPassword';
import PaymentIntegration from '../componet/instructer/PaymentDemo';
import PaymentInterface from '../componet/instructer/PaymentInterface';
import StudentLeftSidebar from '../componet/students/StudentNavbar';
import UserProfile from '../componet/students/StudentSettings';
import AboutUs from '../componet/aboutUs/AboutUs';
import InstructorNavbar from '../componet/instructer/instructnavbar/InstroNavbar';
import MyCourses from '../componet/students/myCourses/myCoures';
import StudentManagement from '../componet/instructer/managedstudent/managedstudent';
import CourseManagement from '../componet/instructer/managecoures/CourseManagement';
const Contact = () => <div>Contact Us</div>;

const App = () => {
  const { usertype, usertypeInstru } = useUser(); // Access the userId and loginStatus from context
  
  let Instructer = usertypeInstru; // Trim any extra spaces
  let Student = usertype; // Trim any extra spaces

  return (
    <Router>
      {/* Conditional Navbar rendering */}
      <MainNavbar />
      
      <Notification />
      <div className="content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />

          <Route path="/courses" element={<StudentCorner />} />
          <Route path="/student/courses" element={<StudentCorner />} />
          <Route path="/student/courses/:courseId" element={<ViewCourse />} />
          <Route path="/student/lectures/:courseId/:lectureId" element={<WatchLecture />} />
          <Route path="/student/myCourses" element={<MyCourses/>} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/logins" element={<Loginstatus />} />
          <Route path="/l" element={<SomeOtherComponent />} />
          <Route path="/coursevi" element={<CourseVideoPage />} />
          <Route path="/forgetpasssentotp" element={<ForgotPassword />} />
          <Route path="/py" element={<PaymentIntegration/>} />
          <Route path="/payment-interface" element={<PaymentInterface />} />
          <Route path="/instructor/managecourses" element={<CourseManagement />} />
          <Route path="/instructor/manage-courses" element={<UploadCourse />} />
          <Route path='/instructor/add_lecture' element={<UploadLecture/>}/>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/setting" element={<UserProfile />} />
          <Route path="/instructor/maneg" element={<StudentManagement />} />
         
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />  
          {/* Student Routes */}
          {Student === 'student' && (
            <>
            </> 
          )}

          {/* Instructor Routes */}
          {Instructer === 'instructor' && (
            <>  
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

// This component renders the appropriate Navbar based on the current route
const MainNavbar = () => {
  const location = useLocation(); // Get current location to determine the route

  // Check which route we're on
  const isInstructorRoute = location.pathname.includes('/instructor');
  const isStudentRoute = location.pathname.includes('/student');

  // Return the appropriate navbar
  if (isInstructorRoute) {
    return <InstructorNavbar />;
  } else if (isStudentRoute) {
    return <StudentLeftSidebar />;
  } else {
    return <LeftSidebarNavbar />;
  }
};

export default App;
