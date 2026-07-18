import { Plus, FileHeart, Trash2 } from 'lucide-react';

export default function Sidebar({ reportsHistory, selectedReport, loading, viewReport, startNewReport, deleteReport }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="btn-primary" onClick={startNewReport} disabled={loading}>
          <Plus size={18} /> New Report
        </button>
      </div>
      
      <div className="history-list">
        {reportsHistory.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
            No previous reports
          </div>
        ) : (
          reportsHistory.map((report) => (
            <div 
              key={report.id} 
              className={`history-item ${selectedReport?.id === report.id ? 'active' : ''}`}
              onClick={() => viewReport(report)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                <FileHeart size={16} style={{ flexShrink: 0 }} />
                <span className="history-item-title">{report.filename}</span>
              </div>
              <button 
                className="delete-report-btn"
                onClick={(e) => deleteReport(report.id, e)}
                title="Delete Report"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
