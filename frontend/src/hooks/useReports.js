import { useState, useCallback } from 'react';
import { reportApi } from '../services/api';

export function useReports(addToast) {
  const [reportsHistory, setReportsHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await reportApi.fetchReports();
      setReportsHistory(response.data);
    } catch (err) {
      addToast('Failed to load reports history.', 'error');
    }
  }, [addToast]);

  const uploadReport = async (file) => {
    if (!file) return null;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await reportApi.analyzeReport(formData);

      if (response.data && response.data.result) {
        const newReport = {
          id: response.data.id,
          filename: response.data.filename,
          date: response.data.date,
          result: response.data.result
        };
        
        setReportsHistory(prev => [newReport, ...prev]);
        addToast('Report analyzed and saved successfully!', 'success');
        return newReport;
      } else {
        addToast('Received an empty response from the AI.', 'error');
        return null;
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        addToast(err.response.data.error, 'error');
      } else {
        addToast('An error occurred while analyzing the report. Please ensure the backend server is running.', 'error');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId) => {
    try {
      await reportApi.deleteReport(reportId);
      setReportsHistory(prev => prev.filter(r => r.id !== reportId));
      addToast('Report deleted successfully.', 'success');
      return true;
    } catch (err) {
      addToast('Failed to delete report.', 'error');
      return false;
    }
  };

  return {
    reportsHistory,
    loading,
    fetchHistory,
    uploadReport,
    deleteReport
  };
}
