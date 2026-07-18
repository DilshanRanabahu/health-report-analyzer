import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <motion.div 
      key="loading"
      className="loader-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="spinner"></div>
      <h3 style={{ color: 'var(--accent)' }}>AI is analyzing your report...</h3>
      <p style={{ color: 'var(--text-muted)' }}>Comparing with WHO guidelines. This may take 10-20 seconds.</p>
    </motion.div>
  );
}
