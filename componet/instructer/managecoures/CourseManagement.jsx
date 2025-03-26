import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CourseManagement.css';
import { useUser } from "../../../context/authContaxt";
import { toast } from 'react-toastify';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    thumbnail: '',
    category: ''
  });
  const { instructorId, authToken } = useUser();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/enrollments/${instructorId}`);
        setCourses(response.data);
      } catch (error) {
        toast.error('Failed to fetch courses');
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [instructorId]);

  // Handle input changes in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  // Handle course update
  const handleUpdateCourse = async () => {
    try {
      // Validate inputs
      if (!formData.title || !formData.description) {
        toast.error('Title and description are required');
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/courses/${selectedCourse._id}`, 
        formData, 
        {
          headers: {
            'Content-Type': 'application/json',
            // Add auth token if needed
            // 'Authorization': `Bearer ${authToken}`
          }
        }
      );

      // Update courses list
      setCourses(courses.map(course => 
        course._id === selectedCourse._id ? response.data.course : course
      ));

      // Reset edit mode
      setEditMode(false);
      setSelectedCourse(null);
      
      // Show success toast
      toast.success('Course updated successfully');

    } catch (error) {
      // Handle different error scenarios
      if (error.response) {
        const errorMessage = error.response.data.message || 'Failed to update course';
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
      console.error('Update Error:', error);
    }
  };

  // Open edit mode for a course
  const openEditMode = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnail: course.thumbnail,
      category: course.category
    });
    setEditMode(true);
  };

  // Format price in Indian Rupees
  const formatIndianRupees = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Render edit form
  const renderEditForm = () => {
    return (
      <div className="edit-course-modal">
        <div className="edit-course-content">
          <h3>Edit Course</h3>
          
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Course Title"
            required
          />
          
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Course Description"
            required
          />
          
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Course Price (₹)"
            min="0"
            step="1"
          />
          
          <input
            type="text"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleInputChange}
            placeholder="Thumbnail URL"
          />
          
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            placeholder="Course Category"
          />
          
          <div className="form-actions">
            <button 
              onClick={handleUpdateCourse}
              className="save-btn"
            >
              Save Changes
            </button>
            <button 
              onClick={() => {
                setEditMode(false);
                setSelectedCourse(null);
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render course list
  return (
    <div className="course-management-container">
      <h2>My Courses</h2>
      
      {editMode && renderEditForm()}
      
      <div className="course-list">
        {courses.map(course => (
          <div key={course._id} className="course-card">
            {course.thumbnail && (
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="course-thumbnail"
              />
            )}
            
            <div className="course-details">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span className="course-price">{formatIndianRupees(course.price)}</span>
                <span className="course-category">{course.category}</span>
              </div>
              
              <div className="course-actions">
                <button 
                  onClick={() => openEditMode(course)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button 
                  onClick={() => alert('Deletion temporarily disabled')}
                  className="delete-btn"
                  disabled
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseManagement;