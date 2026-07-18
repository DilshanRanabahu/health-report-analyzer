import { motion } from 'framer-motion';
import { FileHeart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ReportView({ selectedReport }) {
  if (!selectedReport) return null;

  return (
    <motion.div 
      key="report"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="result-container">
        <div className="result-header">
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileHeart size={28} style={{ color: 'var(--accent)' }} /> 
            {selectedReport.filename}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Analyzed on {selectedReport.date}
          </p>
        </div>
        
        <div className="result-content">
          <ReactMarkdown>{selectedReport.result}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
