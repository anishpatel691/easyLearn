import React, { useState, useEffect } from "react";
import { Form, Button, Container, Card, Spinner, Alert, ProgressBar, Toast } from "react-bootstrap";
import axios from "axios";
import { useUser } from "../../../context/authContaxt";
import "./UploadLecture.css";
import { notifySuccess, notifyInfo } from "../../notification/Notification";

const UploadLecture = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lecture, setLecture] = useState({ title: "", description: "", video: null });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [message, setMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const { userId } = useUser();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

  useEffect(() => {
    if (!userId) {
      setError("Instructor ID not found! Please log in.");
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/courses/instructor/${userId}`);
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load courses.");
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  const handleChange = (e) => {
    setLecture({ ...lecture, [e.target.name]: e.target.value });
  };

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLecture({ ...lecture, video: e.target.files[0] });
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setLecture({ ...lecture, video: e.dataTransfer.files[0] });
      setSelectedFileName(e.dataTransfer.files[0].name);
    }
  };

  // Handle message timeout
  useEffect(() => {
    let timer;
    if (message) {
      timer = setTimeout(() => {
        setMessage(null);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [message]);

  // File size validation
  const validateFileSize = (file) => {
    const maxSize = 500 * 1024 * 1024; // 500MB
    return file.size <= maxSize;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!userId || !selectedCourse) {
      setError("Please select a course!");
      notifyInfo("Please select a course!");
      return;
    }
    
    if (!lecture.title.trim()) {
      setError("Please enter a lecture title!");
      notifyInfo("Please enter a lecture title!");
      return;
    }
    
    if (!lecture.description.trim()) {
      setError("Please enter a lecture description!");
      notifyInfo("Please enter a lecture description!");
      return;
    }
    
    if (!lecture.video) {
      setError("Please select a video file!");
      notifyInfo("Please select a video file!");
      return;
    }

    // File size validation
    if (!validateFileSize(lecture.video)) {
      setError("Video file size exceeds limit (max 500MB)!");
      notifyInfo("Video file size exceeds limit (max 500MB)!");
      return;
    }

    const formData = new FormData();
    formData.append("title", lecture.title);
    formData.append("description", lecture.description);
    formData.append("file", lecture.video);
    formData.append("courseId", selectedCourse);

    setLoading(true);
    setMessage(null);
    setError(null);
    setProgress(0);
    setUploadMessage("Uploading video... Please wait.");

    try {
      await axios.post(`${API_URL}/api/lectures/addlecture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
          
          // Update message based on progress
          if (percentCompleted < 25) {
            setUploadMessage("Starting upload... Please don't close this page.");
          } else if (percentCompleted < 50) {
            setUploadMessage("Uploading video... This may take a while.");
          } else if (percentCompleted < 75) {
            setUploadMessage("More than halfway there!");
          } else if (percentCompleted < 99) {
            setUploadMessage("Almost done! Finalizing upload...");
          } else {
            setUploadMessage("Processing video... Just a moment.");
          }
        },
      });
      
      notifySuccess("Lecture uploaded successfully!");
      setMessage("Lecture uploaded successfully!");
      setShowToast(true);
      setLecture({ title: "", description: "", video: null });
      setSelectedFileName("");
      setProgress(0);
      
    } catch (error) {
      setError(`Failed to upload lecture: ${error.response?.data?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4 upload-container">
      <h2 className="text-center mb-4">🎥 Upload a Lecture</h2>

      <Toast show={showToast} onClose={() => setShowToast(false)} delay={4000} autohide className="toast-custom">
        <Toast.Body>✅ Lecture uploaded successfully!</Toast.Body>
      </Toast>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {message && (
        <div className="success-message">
          ✅ {message}
        </div>
      )}
      
      <Card className="upload-card">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4" controlId="courseSelect">
              <Form.Label>📚 Select Course</Form.Label>
              <Form.Control 
                as="select" 
                value={selectedCourse} 
                onChange={handleCourseChange} 
                disabled={loading || courses.length === 0}
                required
              >
                <option value="">Choose a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </Form.Control>
              {courses.length === 0 && !loading && (
                <div className="text-muted mt-2">No courses found. Please create a course first.</div>
              )}
            </Form.Group>

            <Form.Group className="mb-4" controlId="title">
              <Form.Label>📌 Lecture Title</Form.Label>
              <Form.Control 
                type="text" 
                name="title" 
                value={lecture.title} 
                onChange={handleChange} 
                placeholder="Enter a descriptive title"
                disabled={loading}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="description">
              <Form.Label>📝 Lecture Description</Form.Label>
              <Form.Control 
                as="textarea" 
                name="description" 
                value={lecture.description} 
                onChange={handleChange} 
                placeholder="Describe what students will learn"
                disabled={loading}
                rows={4}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="video">
              <Form.Label>🎬 Upload Video</Form.Label>
              <div 
                className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Form.Control 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideoChange} 
                  disabled={loading}
                  required 
                />
                <div className="file-upload-text">
                  {selectedFileName ? (
                    <span className="file-name">Selected: {selectedFileName}</span>
                  ) : (
                    <span>Drag and drop video here or click to browse</span>
                  )}
                </div>
              </div>
              <small className="text-muted">Maximum file size: 500MB</small>
            </Form.Group>

            {loading && (
              <div className="upload-status">
                <ProgressBar 
                  animated 
                  now={progress} 
                  label={`${progress}%`} 
                  className="mb-3" 
                />
                
                <Alert variant="info">
                  {uploadMessage}
                  <div className="upload-animation">
                    <div className="upload-loader">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </Alert>
              </div>
            )}

            <Button 
              variant="primary" 
              type="submit" 
              className="upload-btn" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> 
                  Uploading...
                </>
              ) : (
                "Upload Lecture"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UploadLecture;