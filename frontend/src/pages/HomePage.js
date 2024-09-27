// src/pages/HomePage.js
import React, { useState, useRef, useCallback } from 'react';
import { Box, Button, Typography, Paper, TextField, Modal } from '@mui/material';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ReactMediaRecorder } from 'react-media-recorder';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFile(null);
    setInputValue('');
    setShowModal(false);
    setCapturedImage(null);
    setAudioBlob(null);
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }
    setFile(uploadedFile);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCapturedImage(null);
    setAudioBlob(null);
  };

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const retakeImage = () => {
    setCapturedImage(null);
  };

  const confirmImage = async () => {
    try {
      const blob = await fetch(capturedImage).then(res => res.blob());
      const formData = new FormData();
      formData.append('file', blob, 'captured_image.jpg');

      const response = await axios.post('http://127.0.0.1:8000/api/facial_emotion/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API Response:', response.data);
      alert('Image captured and processed successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload the image. Please try again.');
    }
    handleModalClose();
  };

  const handleTextSubmit = async () => {
    if (!inputValue.trim()) {
      alert("Please enter some text.");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/text_emotion/', { text: inputValue.trim() }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response:', response.data);
      alert('Text processed successfully!');

      // Redirect to Results page with recommendations data
      navigate('/results', { state: { emotion: response.data.emotion, recommendations: response.data.recommendations } });
    } catch (error) {
      console.error('Error processing text:', error);
      alert('Failed to process the text. Please try again.');
    }

    setInputValue('');
    handleModalClose();
  };

  const handleAudioUpload = async () => {
    if (!audioBlob) {
      alert('No audio recorded.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recorded_audio.wav');

      const response = await axios.post('http://127.0.0.1:8000/api/speech_emotion/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API Response:', response.data);
      alert('Audio processed successfully!');
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Failed to upload the audio. Please try again.');
    }

    handleModalClose();
  };

  return (
      <div style={styles.container}>
        <Paper elevation={4} style={styles.formContainer}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
                onClick={() => handleTabChange('text')}
                sx={{ ...styles.tabButton, borderRadius: '12px 0 0 12px', backgroundColor: activeTab === 'text' ? '#ff4d4d' : 'white', color: activeTab === 'text' ? 'white' : 'black' }}
            >
              Text
            </Button>
            <Button
                onClick={() => handleTabChange('face')}
                sx={{ ...styles.tabButton, borderRadius: '0', backgroundColor: activeTab === 'face' ? '#ff4d4d' : 'white', color: activeTab === 'face' ? 'white' : 'black' }}
            >
              Face
            </Button>
            <Button
                onClick={() => handleTabChange('speech')}
                sx={{ ...styles.tabButton, borderRadius: '0 12px 12px 0', backgroundColor: activeTab === 'speech' ? '#ff4d4d' : 'white', color: activeTab === 'speech' ? 'white' : 'black' }}
            >
              Speech
            </Button>
          </Box>
          <Typography variant="h6" align="center" style={{ marginBottom: '20px', fontFamily: 'Poppins', fontSize: '16px' }}>
            Choose an input mode ({activeTab})
          </Typography>

          <Button
              onClick={() => setShowModal(true)}
              style={styles.captureButton}
          >
            {activeTab === 'text' ? 'Add Text' : activeTab === 'face' ? 'Capture Image' : 'Record Audio'}
          </Button>

          <Typography variant="h6" align="center" style={{ marginTop: '20px', fontFamily: 'Poppins', fontSize: '16px' }}>
            OR
          </Typography>

          <input
              accept={activeTab === 'text' ? '.txt' : activeTab === 'speech' ? '.wav, .mp4' : 'image/*'}
              style={{ display: 'none' }}
              id="upload-file"
              type="file"
              onChange={handleFileUpload}
          />
          <label htmlFor="upload-file">
            <Button variant="contained" color="secondary" component="span" style={styles.uploadButton}>
              Upload {activeTab === 'text' ? 'Text File' : activeTab === 'speech' ? 'Audio File' : 'Image'}
            </Button>
          </label>

          {/* Modal for Speech Input */}
          {activeTab === 'speech' && (
              <Modal open={showModal} onClose={handleModalClose}>
                <Box sx={styles.modal}>
                  <Typography variant="h6" style={{ marginBottom: '10px' }}>Record Your Audio</Typography>
                  <ReactMediaRecorder
                      audio
                      render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                          <>
                            <Typography variant="body1" style={{ marginBottom: '10px' }}>Status: {status}</Typography>
                            <Box style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                              <Button onClick={startRecording} variant="contained" color="primary">Start Recording</Button>
                              <Button onClick={() => {
                                stopRecording();
                                setAudioBlob(new Blob([mediaBlobUrl], { type: 'audio/wav' }));
                              }} variant="contained" color="secondary">Stop Recording</Button>
                            </Box>
                            {mediaBlobUrl && (
                                <audio controls src={mediaBlobUrl} style={{ marginTop: '10px', width: '100%' }} />
                            )}
                            <Box style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                              <Button onClick={handleAudioUpload} variant="contained" color="success">Upload Audio</Button>
                              <Button onClick={handleModalClose} variant="contained" color="error">Close</Button>
                            </Box>
                          </>
                      )}
                  />
                </Box>
              </Modal>
          )}

          {/* Existing Text and Face Modals */}
          {activeTab === 'text' && (
              <Modal open={showModal} onClose={handleModalClose}>
                <Box sx={styles.modal}>
                  <Typography variant="h6" style={{ marginBottom: '10px' }}>Enter Your Text</Typography>
                  <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Enter your text..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Box mt={2}>
                    <Button onClick={handleTextSubmit} variant="contained" color="primary" style={{ marginRight: '10px' }}>Send Text</Button>
                    <Button onClick={handleModalClose} variant="contained" color="error">Close</Button>
                  </Box>
                </Box>
              </Modal>
          )}

          {activeTab === 'face' && (
              <Modal open={showModal} onClose={handleModalClose}>
                <Box sx={styles.modal}>
                  {!capturedImage ? (
                      <>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            style={styles.webcam}
                        />
                        <Button onClick={captureImage} variant="contained" color="error" style={{ marginTop: '20px' }}>Capture</Button>
                      </>
                  ) : (
                      <>
                        <img src={capturedImage} alt="Captured" style={styles.capturedImage} />
                        <Box mt={2}>
                          <Button onClick={confirmImage} variant="contained" color="primary" style={{ marginRight: '10px' }}>Confirm</Button>
                          <Button onClick={retakeImage} variant="contained" color="secondary">Retake</Button>
                        </Box>
                      </>
                  )}
                  <Button onClick={handleModalClose} variant="contained" color="error" style={{ marginTop: '20px' }}>Close</Button>
                </Box>
              </Modal>
          )}
        </Paper>
      </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Poppins',
  },
  formContainer: {
    padding: '20px',
    borderRadius: '12px',
    width: '500px',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
  },
  tabButton: {
    flex: 1,
    padding: '10px 15px',
    textTransform: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'Poppins',
    '&:hover': {
      backgroundColor: '#ff4d4d',
      color: 'white',
    },
  },
  captureButton: {
    margin: '20px auto',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'red',
    color: 'white',
    fontSize: '14px',
    padding: '10px',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    boxShadow: '0px 4px 15px rgba(255, 0, 0, 0.4)',
    fontFamily: 'Poppins',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#ff1a1a',
    },
  },
  uploadButton: {
    textAlign: 'center',
    display: 'block',
    margin: '10px auto',
    padding: '8px 20px',
    backgroundColor: '#ff4d4d',
    color: 'white',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    borderRadius: '20px',
    boxShadow: '0px 4px 10px rgba(255, 0, 0, 0.4)',
    fontFamily: 'Poppins',
    '&:hover': {
      backgroundColor: '#ff1a1a',
    },
  },
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'white',
    boxShadow: 24,
    p: 4,
    borderRadius: '12px',
    textAlign: 'center',
  },
  webcam: {
    width: '100%',
    height: 'auto',
    borderRadius: '10px',
  },
  capturedImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '10px',
  }
};

export default HomePage;
