import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

// Components
import Sidebar from './components/layout/Sidebar';
import UploadZone from './components/upload/UploadZone';
import ReportView from './components/report/ReportView';
import Loader from './components/common/Loader';

function App() {
  // Application State
  const [currentView, setCurrentView] = useState('upload'); // 'upload' or 'report'
  const [reportsHistory, setReportsHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Upload State
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load history from API on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/reports');
      setReportsHistory(response.data);
    } catch (err) {
      console.error("Failed to load history from database:", err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/analyze-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.result) {
        // API returns the newly created DB record details
        const newReport = {
          id: response.data.id,
          filename: response.data.filename,
          date: response.data.date,
          result: response.data.result
        };
        
        // Add to history state immediately
        setReportsHistory([newReport, ...reportsHistory]);
        setSelectedReport(newReport);
        setCurrentView('report');
        
        // Reset upload state
        setFile(null);
      } else {
        setError('Received an empty response from the AI.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while analyzing the report. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.delete(`http://127.0.0.1:8000/api/reports/${reportId}`);
      
      // Update UI
      setReportsHistory(reportsHistory.filter(r => r.id !== reportId));
      if (selectedReport && selectedReport.id === reportId) {
        startNewReport();
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  const viewReport = (report) => {
    setSelectedReport(report);
    setCurrentView('report');
  };

  const startNewReport = () => {
    setFile(null);
    setError(null);
    setSelectedReport(null);
    setCurrentView('upload');
  };

  return (
    <div className="app-container">
      <Sidebar 
        reportsHistory={reportsHistory} 
        selectedReport={selectedReport}
        loading={loading}
        viewReport={viewReport}
        startNewReport={startNewReport}
        deleteReport={handleDeleteReport}
      />

      <main className="main-content">
        <div className="main-scroll-area">
          <div className="content-wrapper">
            <AnimatePresence mode="wait">
              {currentView === 'upload' && !loading && (
                <UploadZone 
                  file={file}
                  error={error}
                  handleFileChange={handleFileChange}
                  handleDrop={handleDrop}
                  handleUpload={handleUpload}
                />
              )}

              {currentView === 'upload' && loading && <Loader />}

              {currentView === 'report' && selectedReport && (
                <ReportView selectedReport={selectedReport} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
