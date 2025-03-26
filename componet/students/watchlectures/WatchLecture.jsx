import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, ListGroup, Form, Button, Modal, Badge, ProgressBar } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./WatchLecture.css";

const WatchLecture = () => {
  const { lectureId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { videoUrl, courseId } = location.state || {};
  const [lecture, setLecture] = useState(null);
  const [upcomingLectures, setUpcomingLectures] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  // Notepad State
  const [showNotepad, setShowNotepad] = useState(false);
  const [notes, setNotes] = useState(localStorage.getItem(`notes-${lectureId}`) || "");

  // Student Progress State
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [lastWatchedPosition, setLastWatchedPosition] = useState(0);
  const [learningHours, setLearningHours] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  
  // Bookmark State
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState("");
  const [newBookmarkTime, setNewBookmarkTime] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

  // Extract the actual courseId value, handling both object and string formats
  const actualCourseId = typeof courseId === 'object' ? courseId.courseid : courseId;

  useEffect(() => {
    const fetchLectureDetails = async () => {
      try {
        if (!actualCourseId) {
          console.error("No course ID available");
          setLoading(false);
          return;
        }

        console.log("Fetching course with ID:", actualCourseId);
        const { data } = await axios.get(`${API_URL}/api/courses/${actualCourseId}`);
        
        if (!data || !data.lectures || data.lectures.length === 0) {
          console.error("No lectures found in course data");
          setLoading(false);
          return;
        }

        const foundLecture = data.lectures.find((lec) => lec._id === lectureId);
        if (!foundLecture) {
          console.error("Lecture not found in course data");
          setLecture(null);
          setLoading(false);
          return;
        }

        setLecture(foundLecture);
        setUpcomingLectures(data.lectures.filter((lec) => lec._id !== lectureId));
        setNewVideoUrl(foundLecture.videoUrl);
        setComments(data.comments || []);
      } catch (error) {
        console.error("Error fetching lecture details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLectureDetails();
    
    // Load progress data from localStorage only
    loadProgressData();
    
    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem(`bookmarks-${lectureId}`);
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    
    // Start tracking time when component mounts
    setStartTime(Date.now());
    
    // Cleanup function to save learning time when component unmounts
    return () => {
      if (startTime) {
        const watchTime = calculateWatchTime();
        saveLearningHours(watchTime);
      }
    };
  }, [lectureId, actualCourseId]);

  // Calculate watch time in hours
  const calculateWatchTime = () => {
    if (!startTime) return 0;
    
    const endTime = Date.now();
    const sessionTimeMs = endTime - startTime;
    const sessionTimeHours = sessionTimeMs / (1000 * 60 * 60); // Convert ms to hours
    
    return sessionTimeHours;
  };

  // Load progress data from localStorage only
  const loadProgressData = () => {
    const savedProgress = localStorage.getItem(`progress-${lectureId}`);
    if (savedProgress) {
      const progressData = JSON.parse(savedProgress);
      setProgress(progressData.progress || 0);
      setCompleted(progressData.completed || false);
      setLastWatchedPosition(progressData.lastPosition || 0);
      setLearningHours(progressData.learningHours || 0);
    }
  };

  // Save learning hours
  const saveLearningHours = (additionalHours) => {
    const updatedHours = learningHours + additionalHours;
    setLearningHours(updatedHours);
    
    // Save to localStorage
    const savedProgress = localStorage.getItem(`progress-${lectureId}`);
    if (savedProgress) {
      const progressData = JSON.parse(savedProgress);
      progressData.learningHours = updatedHours;
      localStorage.setItem(`progress-${lectureId}`, JSON.stringify(progressData));
    } else {
      localStorage.setItem(`progress-${lectureId}`, JSON.stringify({
        progress: progress,
        completed: completed,
        lastPosition: lastWatchedPosition,
        learningHours: updatedHours
      }));
    }
    
    console.log(`Learning hours updated: ${updatedHours.toFixed(2)} hours`);
  };

  // Save progress data to localStorage only
  const saveProgressData = (progressValue, completedValue, positionValue) => {
    localStorage.setItem(`progress-${lectureId}`, JSON.stringify({
      progress: progressValue,
      completed: completedValue,
      lastPosition: positionValue,
      learningHours
    }));
  };

  // Handle video play event
  const handlePlay = () => {
    setIsWatching(true);
    setStartTime(Date.now());
  };

  // Handle video pause event
  const handlePause = () => {
    if (isWatching && startTime) {
      const watchTime = calculateWatchTime();
      saveLearningHours(watchTime);
      setIsWatching(false);
      setStartTime(null);
    }
  };

  // Update progress as video plays
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    if (duration > 0) {
      const progressPercent = Math.floor((currentTime / duration) * 100);
      
      // Only update if progress has changed significantly (every 5%)
      if (Math.abs(progressPercent - progress) >= 5) {
        setProgress(progressPercent);
        saveProgressData(progressPercent, progressPercent >= 90, currentTime);
      }
      
      // Save position every 10 seconds
      if (Math.floor(currentTime) % 10 === 0) {
        setLastWatchedPosition(currentTime);
        saveProgressData(progressPercent, progressPercent >= 90, currentTime);
      }
      
      // Mark as completed if watched 90% or more
      if (progressPercent >= 90 && !completed) {
        setCompleted(true);
        saveProgressData(progressPercent, true, currentTime);
      }
    }
  };

  // Jump to last watched position when video loads
  const handleVideoLoaded = () => {
    if (videoRef.current && lastWatchedPosition > 0) {
      videoRef.current.currentTime = lastWatchedPosition;
    }
  };

  // Bookmark functions
  const addBookmark = () => {
    if (!videoRef.current || !newBookmarkTitle.trim()) return;
    
    const currentTime = videoRef.current.currentTime;
    const newBookmark = {
      id: Date.now(),
      title: newBookmarkTitle,
      time: currentTime,
      formattedTime: formatTime(currentTime)
    };
    
    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`bookmarks-${lectureId}`, JSON.stringify(updatedBookmarks));
    
    // Reset and close modal
    setNewBookmarkTitle("");
    setShowBookmarkModal(false);
  };

  const removeBookmark = (bookmarkId) => {
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`bookmarks-${lectureId}`, JSON.stringify(updatedBookmarks));
  };

  const jumpToBookmark = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data } = await axios.post(`${API_URL}/api/comments/add`, { lectureId, text: newComment });
      setComments((prev) => [...prev, data]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`notes-${lectureId}`, notes);
    setShowNotepad(false); // Close the modal after saving
  };

  // Show notepad toggle
  const toggleNotepad = () => {
    setShowNotepad(!showNotepad);
  };

  // Handle click on "Add Bookmark" button
  const handleBookmarkClick = () => {
    if (videoRef.current) {
      setNewBookmarkTime(videoRef.current.currentTime);
      setShowBookmarkModal(true);
    }
  };

  if (!lecture && !loading) return <h2 className="text-center text-danger mt-5">Lecture not found!</h2>;

  return (
    <Container fluid key={key} className="watch-lecture-container">
      <div className="back_btn_container">
        <Button size="md" onClick={() => navigate(`/student/courses/${actualCourseId}`)}>
          ← Back
        </Button>
      </div>
      
      <Row>
        {/* Main Content Section - Video Player */}
        <Col lg={8} md={8} className="video-section">
          <Card className="video-card">
            <Card.Body>
              <div className="video-wrapper">
                {loading ? (
                  <Skeleton className="skeleton-thumbnail skeleton-shimmer" />  
                ) : (
                  <>
                    <video 
                      ref={videoRef}
                      controls 
                      className="video-player"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleVideoLoaded}
                      onPlay={handlePlay}
                      onPause={handlePause}
                      onEnded={handlePause}
                    >
                      <source src={newVideoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="progress-container mt-2">
                      <div className="progress" style={{ height: '4px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${progress}%` }} 
                          aria-valuenow={progress} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        >
                        </div>
                        {progress > 0 && (
                          <span className="progress-bar-label">{progress}%</span>
                        )}
                      </div>
                      {completed && <Badge bg="success" className="ms-2">Completed</Badge>}
                    </div>
                  </>
                )}
              </div>
              <hr className="hr" />
              <h4 className="video-title">
                {loading ? <Skeleton className="skeleton-title skeleton-shimmer" /> : `Title: ${lecture?.title}`}
              </h4>
              <p className="video-description">
                {loading ? <Skeleton className="skeleton-description skeleton-shimmer" count={2} /> : lecture?.description}
              </p>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="fw-bold">Learning Time:</span> {learningHours.toFixed(2)} hours
                </div>
                {completed && (
                  <Badge bg="success" pill>
                    ✓ Completed
                  </Badge>
                )}
              </div>
              <div className="button-group">
                <Button variant="outline-primary" onClick={toggleNotepad} className="me-2">
                  📝 Take Notes
                </Button>
                <Button variant="outline-warning" onClick={handleBookmarkClick}>
                  🔖 Add Bookmark
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Bookmarks Section */}
          {bookmarks.length > 0 && (
            <Card className="mt-2 bookmarks-card">
              <Card.Body>
                <h5>🔖 My Bookmarks</h5>
                <ListGroup className="mb-3">
                  {bookmarks.map((bookmark) => (
                    <ListGroup.Item key={bookmark.id} className="d-flex justify-content-between align-items-center">
                      <span>{bookmark.title} ({bookmark.formattedTime})</span>
                      <div>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => jumpToBookmark(bookmark.time)}
                          className="me-2"
                        >
                          Jump to
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => removeBookmark(bookmark.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {/* Comments Section */}
          <Card className="mt-2 comments-card">
            <Card.Body>
              <h5>Comments</h5>
              <ListGroup className="mb-3">
                {loading ? (
                  <>
                    <div className="d-flex align-items-center mb-2">
                      <Skeleton className="skeleton-profile skeleton-shimmer" />
                      <Skeleton className="skeleton-comment skeleton-shimmer" />
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <Skeleton className="skeleton-profile skeleton-shimmer" />
                      <Skeleton className="skeleton-comment skeleton-shimmer" />
                    </div>
                  </>
                ) : comments.length === 0 ? (
                  <p>No comments yet.</p>
                ) : (
                  comments.map((c, i) => <ListGroup.Item key={i}>{c.text}</ListGroup.Item>)
                )}
              </ListGroup>
              <Form onSubmit={handleCommentSubmit}>
                <Form.Group className="comment-form">
                  <Form.Control type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." />
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-2 comment-btn">
                  Post Comment
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar for Upcoming Lectures - Now positioned to the right of the video player */}
        <Col lg={4} md={4} className="upcoming-lectures-sidebar">
          <Card className="upcoming-lectures-card">
            <Card.Header>
              <h5 className="mb-0">Next Lectures</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush" className="upcoming-lectures-list">
                {loading ? (
                  <>
                    <ListGroup.Item className="lecture-item lecture-item-loading">
                      <Skeleton className="skeleton-title skeleton-shimmer" />
                      <Skeleton className="skeleton-description skeleton-shimmer" />
                    </ListGroup.Item>
                    <ListGroup.Item className="lecture-item lecture-item-loading">
                      <Skeleton className="skeleton-title skeleton-shimmer" />
                      <Skeleton className="skeleton-description skeleton-shimmer" />
                    </ListGroup.Item>
                  </>
                ) : upcomingLectures.length > 0 ? (
                  upcomingLectures.map((lec, index) => {
                    // Check if this lecture has progress stored
                    const lectureProgress = JSON.parse(localStorage.getItem(`progress-${lec._id}`)) || { progress: 0, completed: false };
                    
                    return (
                      <ListGroup.Item key={lec._id} className="lecture-item">
                        <div className="lecture-item-header">
                          <div className="lecture-item-title">
                            <span className="lecture-number">{index + 1}.</span>
                            <span className="lecture-title">{lec.title}</span>
                            {lectureProgress.completed && <Badge bg="success" className="completed-badge">✓</Badge>}
                          </div>
                        </div>
                        
                        {lectureProgress.progress > 0 && !lectureProgress.completed && (
                          <div className="lecture-progress-container">
                            <ProgressBar 
                              now={lectureProgress.progress} 
                              className="lecture-progress" 
                            />
                            <span className="lecture-progress-text">{lectureProgress.progress}% completed</span>
                          </div>
                        )}
                        
                        <Button
                          variant="primary"
                          className="lecture-button"
                          onClick={() => {
                            // Save current learning hours before navigating
                            if (isWatching && startTime) {
                              const watchTime = calculateWatchTime();
                              saveLearningHours(watchTime);
                              setIsWatching(false);
                              setStartTime(null);
                            }
                            
                            setKey((prevKey) => prevKey + 1);
                            navigate(`/student/lectures/${actualCourseId}/${lec._id}`, { 
                              state: { 
                                videoUrl: lec.videoUrl, 
                                courseId: actualCourseId
                              }
                            });
                          }}
                        >
                          {lectureProgress.progress > 0 ? 'Continue Lecture' : 'Start Lecture'}
                        </Button>
                      </ListGroup.Item>
                    );
                  })
                ) : (
                  <ListGroup.Item className="no-lectures">No upcoming lectures.</ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notepad Modal */}
      <Modal show={showNotepad} onHide={() => setShowNotepad(false)} className="notes-modal">
        <Modal.Header closeButton>
          <Modal.Title>📒 My Notes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control        
            as="textarea" 
            rows={6} 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Write your notes here..."
            className="notes-textarea"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotepad(false)}>Close</Button>
          <Button variant="primary" onClick={handleSaveNotes}>Save Notes</Button>
        </Modal.Footer>
      </Modal>

      {/* Bookmark Modal */}
      <Modal show={showBookmarkModal} onHide={() => setShowBookmarkModal(false)} className="bookmark-modal">
        <Modal.Header closeButton>
          <Modal.Title>Add Bookmark</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Bookmark Title</Form.Label>
            <Form.Control
              type="text"
              value={newBookmarkTitle}
              onChange={(e) => setNewBookmarkTitle(e.target.value)}
              placeholder="Enter a title for this bookmark"
              className="bookmark-title-input"
            />
          </Form.Group>
          <p className="bookmark-time mt-2">Time: {formatTime(newBookmarkTime)}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookmarkModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={addBookmark}>Save Bookmark</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WatchLecture;