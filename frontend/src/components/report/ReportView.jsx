import { motion } from 'framer-motion';
import { FileHeart, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';

export default function ReportView({ selectedReport }) {
  if (!selectedReport) return null;

  const handleDownloadPDF = () => {
    const element = document.getElementById('pdf-content');
    
    // Add a temporary class for PDF generation to handle text colors/backgrounds specifically for print if needed
    element.classList.add('pdf-export-mode');

    const opt = {
      margin:       [15, 15, 15, 15],
      filename:     `${selectedReport.filename.split('.')[0]}_AI_Analysis.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.classList.remove('pdf-export-mode');
    });
  };

  return (
    <motion.div 
      key="report"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="result-container">
        <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileHeart size={28} style={{ color: 'var(--accent)' }} /> 
              {selectedReport.filename}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Analyzed on {selectedReport.date}
            </p>
          </div>
          <button 
            className="download-pdf-btn" 
            onClick={handleDownloadPDF}
            title="Download as PDF"
          >
            <Download size={20} />
            <span>Export PDF</span>
          </button>
        </div>
        
        {/* We assign an ID here for html2pdf to target just the content, not the header/buttons */}
        <div className="result-content" id="pdf-content">
          <ReactMarkdown>{selectedReport.result}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
