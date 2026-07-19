import { useState, useCallback } from 'react';
import { chatApi } from '../services/api';

const DEFAULT_GREETING = { 
  role: 'assistant', 
  content: "ආයුබෝවන්! මම ඔබේ වෛද්‍ය සහායක. මේ රිපෝට් එක ගැන හරි, කෑම බීම ගැන හරි මොනවා හරි අහන්න තියෙනවද?" 
};

export function useChat(selectedReport) {
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!selectedReport) return;
    
    try {
      const res = await chatApi.fetchHistory(selectedReport.id);
      if (res.data && res.data.length > 0) {
        setChatHistory(res.data);
      } else {
        setChatHistory([DEFAULT_GREETING]);
      }
    } catch(e) {
      setChatHistory([DEFAULT_GREETING]);
    }
  }, [selectedReport]);

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim() || !selectedReport) return;

    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await chatApi.sendMessage({
        report_id: selectedReport.id,
        message: userMessage,
        report_context: selectedReport.result,
        history: chatHistory.length > 0 && chatHistory[0].content === DEFAULT_GREETING.content
                  ? chatHistory.slice(1) 
                  : chatHistory
      });
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "සමාවෙන්න, මට ඒ ප්‍රශ්නයට පිළිතුරු දීමට අපහසුයි. නැවත උත්සාහ කරන්න." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return {
    chatHistory,
    isChatLoading,
    fetchHistory,
    sendMessage
  };
}
