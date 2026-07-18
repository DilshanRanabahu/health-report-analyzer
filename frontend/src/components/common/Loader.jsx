import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingSteps = [
  { text: "AI මගින් ඔබගේ වෛද්‍ය වාර්තාව කියවමින් පවතී...", icon: "🔍", time: 0 },
  { text: "ඔබගේ දත්ත සෞඛ්‍ය මාර්ගෝපදේශ සමග සසඳමින් සිටී...", icon: "📊", time: 4000 },
  { text: "ඔබට තේරෙන භාෂාවට පරිවර්තනය කරමින් පවතී...", icon: "✍️", time: 10000 },
  { text: "ඔබගේ වාර්තාව සූදානම් කරමින් පවතී, කරුණාකර රැඳී සිටින්න...", icon: "⏳", time: 18000 }
];

export default function Loader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers = loadingSteps.map((step, index) => {
      if (index === 0) return null;
      return setTimeout(() => setCurrentStep(index), step.time);
    });

    return () => timers.forEach(timer => timer && clearTimeout(timer));
  }, []);

  return (
    <motion.div 
      key="loading"
      className="loader-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="spinner"></div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginTop: '1.5rem' }}
        >
          <h3 style={{ color: 'var(--accent)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            {loadingSteps[currentStep].icon} {loadingSteps[currentStep].text}
          </h3>
        </motion.div>
      </AnimatePresence>
      
      <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem' }}>
        Comparing with WHO guidelines. This may take a few seconds.
      </p>
    </motion.div>
  );
}
