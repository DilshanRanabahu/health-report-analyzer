import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileHeart, Download, MessageSquare, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';

import { useChat } from '../../hooks/useChat';
import PrintTemplate from './PrintTemplate';

export default function ReportView({ selectedReport }) {
  const [activeTab, setActiveTab] = useState('report');
  const [chatMessage, setChatMessage] = useState("");
  const chatEndRef = useRef(null);
  const printTemplateRef = useRef(null);

  const { chatHistory, isChatLoading, fetchHistory, sendMessage } = useChat(selectedReport);

  useEffect(() => {
    setActiveTab('report');
    fetchHistory();
  }, [selectedReport, fetchHistory]);

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  if (!selectedReport) return null;

  const handleDownloadPDF = () => {
    const element = printTemplateRef.current;
    if (!element) return;
    
    const opt = {
      margin:       0,
      filename:     `Medical_Report_${selectedReport.id || 'export'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes(',')) return dateString; 
    try {
      const d = new Date(dateString);
      return d.toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch(e) {
      return dateString;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage("");
    await sendMessage(userMessage);
  };

  const reportText = selectedReport.result || "";
  let medicalPart = reportText;
  let dietPart = "";

  const splitIndex = reportText.indexOf("## 🥗");
  if (splitIndex !== -1) {
    medicalPart = reportText.substring(0, splitIndex).trim();
    dietPart = reportText.substring(splitIndex).trim();
  }

  return (
    <motion.div 
      key="report"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
    >
      <div className="result-container">
        <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
          <div style={{ maxWidth: '70%', minWidth: 0 }}>
            <h2 style={{ marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedReport.filename}
            </h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {formatDate(selectedReport.date)}
            </span>
          </div>
          {activeTab === 'report' && (
            <button 
              onClick={handleDownloadPDF} 
              className="btn-primary" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                width: 'fit-content', 
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Download size={18} /> Download PDF
            </button>
          )}
        </div>
        
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            වෛද්‍ය වාර්තාව
          </button>
          {dietPart && (
            <button 
              className={`tab-btn ${activeTab === 'diet' ? 'active' : ''}`}
              onClick={() => setActiveTab('diet')}
            >
              ආහාර සහ ජීවන රටාව
            </button>
          )}
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <MessageSquare size={16} /> වෛද්‍යවරයාගෙන් අසන්න
          </button>
        </div>

        <div className="result-content" id="pdf-content" style={{ display: activeTab === 'chat' ? 'none' : 'block' }}>
          <ReactMarkdown>
            {activeTab === 'report' ? medicalPart : dietPart}
          </ReactMarkdown>
        </div>

        {activeTab === 'chat' && (
          <div className="chat-interface">
            <div className="chat-messages">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-bubble assistant typing">
                  <div className="dot-typing"></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="chat-input-area">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="ඔබේ ප්‍රශ්නය මෙහි ලියන්න..."
                className="chat-input"
                disabled={isChatLoading}
              />
              <button type="submit" className="chat-send-btn" disabled={isChatLoading || !chatMessage.trim()}>
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
      <PrintTemplate ref={printTemplateRef} report={selectedReport} medicalPart={medicalPart} />
    </motion.div>
  );
}
