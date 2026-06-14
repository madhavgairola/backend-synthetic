import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';

interface ClarificationViewProps {
  questions: string[];
  onSubmit: (answers: string) => void;
}

export const ClarificationView: React.FC<ClarificationViewProps> = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.trim()) {
      onSubmit(answers);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-framer-bg dark:bg-[#050505] text-framer-text dark:text-white justify-center p-6 relative transition-colors duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vh] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[120px] opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full mx-auto relative z-10"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">We need a bit more detail.</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">To ensure a highly accurate simulation, please clarify the following:</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] rounded-[2rem] p-8 shadow-sm">
          <ul className="space-y-4 mb-8">
            {questions.map((q, idx) => (
              <li key={idx} className="flex gap-4 items-start text-lg font-light">
                <span className="text-blue-500 dark:text-blue-400 font-medium">{idx + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              value={answers}
              onChange={(e) => setAnswers(e.target.value)}
              placeholder="Type your answers or provide more context here..."
              className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] text-framer-text dark:text-white placeholder-gray-400 dark:placeholder-gray-600 p-6 rounded-2xl text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[150px]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!answers.trim()}
                className="px-8 py-4 rounded-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-[#222] dark:disabled:text-[#555] transition-all flex items-center gap-2 font-medium"
              >
                Continue Simulation <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
