import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Spinner, ProgressBar, Image, Alert } from "react-bootstrap";
import { CloudUpload, CheckCircle, ExclamationCircle } from "react-bootstrap-icons";
import axios from "axios";
import { useUser } from "../../../context/authContaxt";
import "./UploadCourse.css";
import { notifySuccess, notifyError } from "../../notification/Notification";

const UploadCourse = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';
  
  const [course, setCourse] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    thumbnail: null,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [newCourseId, setNewCourseId] = useState(null);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  // Handle thumbnail upload
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourse({ ...course, thumbnail: file });
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      notifyError("Instructor ID not found! Please log in.");
      return;
    }

    const formData = new FormData();
    formData.append("title", course.title);
    formData.append("description", course.description);
    formData.append("category", course.category);
    formData.append("price", course.price);
    formData.append("thumbnail", course.thumbnail);
    formData.append("instructorId", userId);

    setUploading(true);
    setUploadSuccess(null);
    setUploadProgress(0);

    try {
      const response = await axios.post(`${API_URL}/api/courses`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      setUploadSuccess(true);
      setNewCourseId(response.data._id);
      notifySuccess("Course uploaded successfully!");

      // Reset Form
      setCourse({ title: "", description: "", category: "", price: "", thumbnail: null });
      setThumbnailPreview(null);
    } catch (error) {
      setUploadSuccess(false);
      notifyError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <Container>
        <Card className="upload-card shadow-lg p-4 rounded">
          <Card.Body>
            <h2 className="upload-title text-center">
              <CloudUpload className="upload-icon text-primary me-2" /> Upload a New Course
            </h2>

            <Form onSubmit={handleSubmit} className="mt-3">
              <Form.Group controlId="title" className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" name="title" value={course.title} onChange={handleChange} required />
              </Form.Group>

              <Form.Group controlId="description" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} name="description" value={course.description} onChange={handleChange} required />
              </Form.Group>

              <Form.Group controlId="category" className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Control type="text" name="category" value={course.category} onChange={handleChange} required />
              </Form.Group>

              <Form.Group controlId="price" className="mb-3">
                <Form.Label>Price (₹)</Form.Label>
                <Form.Control type="number" name="price" value={course.price} onChange={handleChange} required />
              </Form.Group>

              <Form.Group controlId="thumbnail" className="mb-3">
                <Form.Label>Course Thumbnail</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleThumbnailChange} required />
              </Form.Group>

              {thumbnailPreview && (
                <div className="text-center mb-3">
                  <Image src={thumbnailPreview} alt="Thumbnail Preview" fluid className="rounded shadow-sm" style={{ maxWidth: "200px" }} />
                </div>
              )}

              {uploading && (
                <div className="upload-progress-container mb-3">
                  <ProgressBar animated now={uploadProgress} label={`${uploadProgress}%`} className="progress-bar-custom" />
                </div>
              )}

              <Button type="submit" className="upload-btn btn-primary w-100" disabled={uploading}>
                {uploading ? (
                  <>
                    <Spinner animation="border" size="sm" className="upload-spinner" /> Uploading...
                  </>
                ) : (
                  "Upload Course"
                )}
              </Button>

              {uploadSuccess !== null && (
                <Alert variant={uploadSuccess ? "success" : "danger"} className="mt-3 text-center">
                  {uploadSuccess ? (
                    <>
                      <CheckCircle className="me-2 text-success" /> Course uploaded successfully! 🎉
                    </>
                  ) : (
                    <>
                      <ExclamationCircle className="me-2 text-danger" /> Upload failed! Try again.
                    </>
                  )}
                </Alert>
              )}

              {uploadSuccess && newCourseId && (
                <Button className="mt-3 w-100 btn-success" onClick={() => navigate(`/instructor/add_lecture/${newCourseId}`)}>
                  Add Lecture to Course
                </Button>
              )}

              {/* Updated button with orange color */}
              <Button className="mt-3 w-100 btn-orange" onClick={() => navigate("/instructor/add_lecture")}>
                Go to Add Lecture
              </Button>

            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default UploadCourse;
