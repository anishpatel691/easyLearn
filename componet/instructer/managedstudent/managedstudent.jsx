import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { useUser } from '../../../context/authContaxt'; 
import './StudentManagement.css';  

const StudentManagement = () => {   
  // State for students data and form inputs   
  const [students, setStudents] = useState([]);   
  const [loading, setLoading] = useState(true);   
  const [error, setError] = useState(null);    
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

  // Get Instructor ID from context   
  const { instructorId } = useUser();   
  console.log("Instructor ID for API:", instructorId);    

  // Fetch students data for specific instructor   
  useEffect(() => {     
    const fetchStudents = async () => {       
      if (!instructorId) {         
        setError('User ID not found.');         
        setLoading(false);         
        return;       
      }        

      try {         
        const response = await axios.get(`/${API_URL}/api/enrollment/${instructorId}`);         
        console.log("Full API Response:", response);         
        console.log("Response Data Type:", typeof response.data);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));

        // Additional debugging checks
        if (!response.data) {
          throw new Error('No data received from the API');
        }

        if (!Array.isArray(response.data)) {
          console.error('Response is not an array:', response.data);
          throw new Error('Invalid data format received');
        }

        // Filter out any potentially invalid entries         
        const validStudents = response.data.filter(enrollment => {
          const isValid = enrollment?.userId?.name && enrollment?.courseId?.title;
          if (!isValid) {
            console.warn('Invalid enrollment entry:', enrollment);
          }
          return isValid;
        });          

        console.log("Valid Students:", validStudents);
        console.log("Number of Valid Students:", validStudents.length);

        setStudents(validStudents);         
        setLoading(false);       
      } catch (err) {         
        console.error('Complete Error Object:', err);         
        setError(`Failed to fetch students data: ${err.response?.data?.message || err.message}`);         
        setLoading(false);       
      }     };      

    if (instructorId) {       
      fetchStudents();     
    }   
  }, [instructorId]);    

  // Render loading state
  if (loading) return <div className="loading">Loading students...</div>;

  // Render error state
  if (error) {
    return (
      <div className="student-management-container">
        <h1 className="page-title">Student Enrollments</h1>
        <div className="error">{error}</div>
      </div>
    );
  }

  // Render when no valid students found   
  if (students.length === 0) {     
    return (       
      <div className="student-management-container">         
        <h1 className="page-title">Student Enrollments</h1>         
        <div className="no-students">           
          No students found for this instructor.         
        </div>       
      </div>     
    );   
  }    

  return (     
    <div className="student-management-container">       
      <h1 className="page-title">Student Enrollments</h1>        
      <table className="student-table">         
        <thead>           
          <tr>             
            <th>Name</th>             
            <th>Email</th>             
            <th>Course Title</th>             
            <th>Status</th>             
            <th>Enrollment Date</th>           
          </tr>         
        </thead>         
        <tbody>           
          {students.map((enrollment) => {             
            // Safe access with optional chaining and fallback values             
            const name = enrollment?.userId?.name || 'Unknown';             
            const email = enrollment?.userId?.email || 'N/A';             
            const courseTitle = enrollment?.courseId?.title || 'Untitled Course';             
            const status = enrollment?.status || 'unknown';             
            const enrollmentDate = enrollment?.enrollmentDate                
              ? new Date(enrollment.enrollmentDate).toLocaleDateString()               
              : 'N/A';              

            return (               
              <tr key={enrollment?._id || Math.random()}>                 
                <td>{name}</td>                 
                <td>{email}</td>                 
                <td>{courseTitle}</td>                 
                <td>                   
                  <span                     
                    className={`status-badge ${                       
                      status === 'active'                        
                        ? 'status-active'                        
                        : 'status-inactive'                     
                    }`}                   
                  >                     
                    {status}                   
                  </span>                 
                </td>                 
                <td>{enrollmentDate}</td>               
              </tr>             
            );           
          })}         
        </tbody>       
      </table>     
    </div>   
  ); 
};  

export default StudentManagement;