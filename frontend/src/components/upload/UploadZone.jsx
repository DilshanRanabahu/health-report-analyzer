import { useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

export default function UploadZone({ file, handleFileChange, handleDrop, handleUpload }) {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <motion.div 
      key="upload"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="welcome-header">
        <h2>AI Medical Translator</h2>
        <p className="subtitle">Upload your medical report for a simple, instant Sinhala explanation.</p>
      </div>

      <div 
        className="upload-zone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept="image/*,application/pdf"
        />
        
        {file ? (
          <>
            <FileText size={48} className="upload-icon" />
            <h3>{file.name}</h3>
            <p style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> Ready to analyze
            </p>
          </>
        ) : (
          <>
            <UploadCloud size={64} className="upload-icon" />
            <h3>Click or Drag to Upload</h3>
            <p style={{ color: 'var(--text-muted)' }}>Supports JPG, PNG, and PDF</p>
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
        <button 
          className="btn-primary btn-analyze" 
          onClick={handleUpload} 
          disabled={!file}
        >
          Analyze Report
        </button>
      </div>
    </motion.div>
  );
}
