import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileHeart, Download, MessageSquare, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

export default function ReportView({ selectedReport }) {
  const [activeTab, setActiveTab] = useState('report');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setActiveTab('report');
    setChatHistory([{ role: 'assistant', content: "ආයුබෝවන්! මම ඔබේ වෛද්‍ය සහායක. මේ රිපෝට් එක ගැන හරි, කෑම බීම ගැන හරි මොනවා හරි අහන්න තියෙනවද?" }]);
  }, [selectedReport]);

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  if (!selectedReport) return null;

  const handleDownloadPDF = () => {
    const element = document.getElementById('pdf-content');
    
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
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/chat", {
        message: userMessage,
        report_context: selectedReport.result,
        history: chatHistory.slice(1) // skip the initial greeting
      });
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "සමාවෙන්න, මට ඒ ප්‍රශ්නයට පිළිතුරු දීමට අපහසුයි. නැවත උත්සාහ කරන්න." }]);
    } finally {
      setIsChatLoading(false);
    }
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
        <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileHeart size={28} style={{ color: 'var(--accent)' }} /> 
              {selectedReport.filename}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Analyzed on {formatDate(selectedReport.date)}
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
    </motion.div>
  );
}
