import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import Sidebar from './components/layout/Sidebar';
import UploadZone from './components/upload/UploadZone';
import ReportView from './components/report/ReportView';
import Loader from './components/common/Loader';
import { useToast } from './context/ToastContext';
import { useReports } from './hooks/useReports';

import { authApi } from './services/api';

function App() {
  const { addToast } = useToast();
  
  const [currentView, setCurrentView] = useState('upload');
  const [selectedReport, setSelectedReport] = useState(null);
  const [file, setFile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const { reportsHistory, loading, fetchHistory, uploadReport, deleteReport } = useReports(addToast);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authApi.checkAuth();
        setIsAuthenticated(true);
        fetchHistory();
      } catch (err) {
        console.error("Auth failed, redirecting to login");
        window.location.href = "http://localhost:8000/login";
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
  }, [fetchHistory]);

  if (authLoading) {
    return <Loader />;
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    const newReport = await uploadReport(file);
    if (newReport) {
      setSelectedReport(newReport);
      setCurrentView('report');
      setFile(null);
    }
  };

  const startNewReport = () => {
    setCurrentView('upload');
    setSelectedReport(null);
    setFile(null);
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setCurrentView('report');
  };

  const handleDeleteReport = async (reportId, e) => {
    if (e) e.stopPropagation();
    
    const success = await deleteReport(reportId);
    if (success && selectedReport && selectedReport.id === reportId) {
      startNewReport();
    }
  };

  return (
    <div className="app-container">
      
      <Sidebar 
        reportsHistory={reportsHistory}
        selectedReport={selectedReport}
        startNewReport={startNewReport}
        viewReport={handleReportSelect}
        deleteReport={handleDeleteReport}
      />

      <main className="main-content">

        <div className="content-wrapper">
          <AnimatePresence mode="wait">
            {loading ? (
              <Loader key="loader" />
            ) : currentView === 'upload' ? (
              <UploadZone 
                key="upload"
                file={file}
                handleFileChange={handleFileChange}
                handleDrop={handleDrop}
                handleUpload={handleUpload}
              />
            ) : (
              <ReportView 
                key="report"
                selectedReport={selectedReport}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
