import React from 'react';
import type { Report, IdeaAnalysis, Persona, Simulation } from '../services/api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, ArrowDown, CheckCircle2, AlertTriangle, Lightbulb, MessageSquareQuote, MessageCircle, FileText, Wand2, Loader2, X } from 'lucide-react';
import { ChatDrawer } from './ChatDrawer';
import { generateAsset, pivotIdea } from '../services/api';
import ReactMarkdown from 'react-markdown';

interface ReportDashboardProps {
  report: Report;
  analysis: any;
  personas: Persona[];
  simulations: Simulation[];
  onRestart: () => void;
  onPivotComplete?: (result: any) => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ report, analysis, personas = [], simulations = [], onRestart, onPivotComplete }) => {
  const [activeTab, setActiveTab] = React.useState<'summary' | 'detailed'>('summary');
  const [selectedPersonaId, setSelectedPersonaId] = React.useState<string | null>(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [chatContext, setChatContext] = React.useState<{ type: 'persona' | 'general'; targetId?: string; personaName?: string }>();
  const [initialChatMessage, setInitialChatMessage] = React.useState<string>('');

  // Floating Cursor State
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [hoveredStat, setHoveredStat] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    if (hoveredStat) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [hoveredStat]);

  const openChat = (type: 'persona' | 'general', targetId?: string, personaName?: string, message?: string) => {
    setChatContext({ type, targetId, personaName });
    if (message) {
       setInitialChatMessage(`Sure! I'll help you explore: "${message}". What specifically would you like to know?`);
    } else {
       setInitialChatMessage('');
    }
    setIsChatOpen(true);
  };

  // Asset Generation State
  const [assetTarget, setAssetTarget] = React.useState<string | null>(null);
  const [assetMarkdown, setAssetMarkdown] = React.useState<string | null>(null);
  const [isGeneratingAsset, setIsGeneratingAsset] = React.useState(false);

  const handleGenerateAsset = async (targetText: string) => {
    setAssetTarget(targetText);
    setAssetMarkdown(null);
    setIsGeneratingAsset(true);
    try {
      const res = await generateAsset(report.ideaId, targetText);
      setAssetMarkdown(res.assetMarkdown);
    } catch (err) {
      setAssetMarkdown("Sorry, an error occurred while generating the asset.");
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  // Pivot State
  const [isPivotModalOpen, setIsPivotModalOpen] = React.useState(false);
  const [pivotInstruction, setPivotInstruction] = React.useState('');
  const [isPivoting, setIsPivoting] = React.useState(false);

  const handlePivot = async () => {
    if (!pivotInstruction.trim() || !onPivotComplete) return;
    setIsPivoting(true);
    try {
      const result = await pivotIdea(report.ideaId, pivotInstruction);
      setIsPivotModalOpen(false);
      onPivotComplete(result);
    } catch (err) {
      alert("Failed to pivot idea.");
    } finally {
      setIsPivoting(false);
    }
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) return;
    
    const reportContent = document.getElementById('hidden-report-content');
    
    printWindow.document.write('<html><head><title>Simulation Report</title>');
    printWindow.document.write('<style>body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; } h1, h2, h3 { color: #111; } pre { background: #f4f4f4; padding: 15px; border-radius: 5px; } blockquote { border-left: 4px solid #ccc; margin-left: 0; padding-left: 15px; color: #666; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(reportContent ? reportContent.innerHTML : 'Report content missing');
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
  };

  let interestScore = report.insights?.overallInterestScore || 0;
  // If LLM returned a scale of 1-10 instead of a percentage, convert it
  if (interestScore > 0 && interestScore <= 10) {
    interestScore *= 10;
  }

  const scoreData = [
    { name: 'Interest', value: interestScore },
    { name: 'Remaining', value: 100 - interestScore }
  ];
  const COLORS = ['#3b82f6', '#f1f5f9']; // Soft blue and very light slate

  return (
    <div className="min-h-screen p-8 bg-framer-bg dark:bg-[#050505] text-framer-text dark:text-white selection:bg-blue-100 dark:selection:bg-blue-900/50 selection:text-blue-900 dark:selection:text-blue-100 font-['Outfit'] transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-12 pt-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border border-green-100 dark:border-green-900/50 transition-colors duration-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Analysis Complete
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white transition-colors duration-500">
              Simulation Insights
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-light transition-colors duration-500">
              Market reaction based on <span className="font-medium text-gray-800 dark:text-gray-200">{analysis?.industry || 'target'}</span> synthetic segment.
            </p>
          </div>
          <div className="flex flex-col xl:flex-row gap-4 items-end xl:items-center">
            <div className="flex bg-gray-100 dark:bg-[#111] p-1 rounded-full border border-gray-200 dark:border-[#333]">
              <button 
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'summary' ? 'bg-white dark:bg-[#222] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Executive Summary
              </button>
              <button 
                onClick={() => setActiveTab('detailed')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${activeTab === 'detailed' ? 'bg-white dark:bg-[#222] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Detailed Insights
              </button>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsPivotModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-full shadow-md font-medium text-sm transition-all transform hover:scale-105"
              >
                <Wand2 className="w-4 h-4" /> Pivot Idea
              </button>
              <button 
                onClick={onRestart}
                className="px-8 py-3 bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#222] text-gray-900 dark:text-white border border-gray-200 dark:border-[#333] shadow-sm hover:shadow-md transition-all duration-300 rounded-full text-base font-medium flex items-center justify-center gap-2"
              >
                New <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'summary' ? (
          <>
            {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Interest Score Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            onMouseEnter={() => setHoveredStat(`Interest Score of ${interestScore}%`)}
            onMouseLeave={() => setHoveredStat(null)}
            onClick={() => openChat('general', undefined, undefined, `Explain the Interest Score of ${interestScore}%`)}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-framer dark:shadow-none hover:shadow-framer-hover transition-all rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative cursor-pointer"
          >
            <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest font-semibold mb-6 w-full text-left transition-colors duration-500">Interest Score</h3>
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-5xl font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-500">{interestScore}%</span>
              </div>
            </div>
          </motion.div>

          {/* Most Interested Group */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            onMouseEnter={() => setHoveredStat(`Key Segment: ${report.insights?.mostInterestedSegment}`)}
            onMouseLeave={() => setHoveredStat(null)}
            onClick={() => openChat('general', undefined, undefined, `Tell me more about why the Key Segment is ${report.insights?.mostInterestedSegment}`)}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-framer dark:shadow-none hover:shadow-framer-hover transition-all rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden cursor-pointer"
          >
             <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500">
                <CheckCircle2 className="w-6 h-6" />
             </div>
             <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest font-semibold mb-auto transition-colors duration-500">Key Segment</h3>
             <p className="text-3xl font-medium text-gray-900 dark:text-white mt-8 leading-tight transition-colors duration-500">
               {report.insights?.mostInterestedSegment || 'N/A'}
             </p>
          </motion.div>

          {/* Top Concerns Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            onMouseEnter={() => setHoveredStat(`Primary Friction: ${report.insights?.topConcerns?.[0]}`)}
            onMouseLeave={() => setHoveredStat(null)}
            onClick={() => openChat('general', undefined, undefined, `Tell me more about the Primary Friction: ${report.insights?.topConcerns?.[0]}`)}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-framer dark:shadow-none hover:shadow-framer-hover transition-all rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden cursor-pointer"
          >
             <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500">
                <AlertTriangle className="w-6 h-6" />
             </div>
             <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-widest font-semibold mb-auto transition-colors duration-500">Primary Friction</h3>
             <p className="text-2xl font-medium text-gray-900 dark:text-white mt-8 leading-tight line-clamp-3 transition-colors duration-500">
               {report.insights?.topConcerns?.[0] || 'None identified'}
             </p>
          </motion.div>

        </div>

        {/* Detailed Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Common Concerns */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-sm dark:shadow-none hover:shadow-md transition-all rounded-[2.5rem] p-12"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl text-rose-500 dark:text-rose-400 transition-colors duration-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-500">Key Objections</h3>
            </div>
            <ul className="space-y-6">
              {(report.insights?.topConcerns || []).map((concern, idx) => (
                <li key={idx} className="flex gap-5 text-gray-600 dark:text-gray-300 transition-colors duration-500 relative group pr-32">
                  <span className="text-rose-400 dark:text-rose-500 font-medium mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                  <span className="leading-relaxed text-lg font-light">{concern}</span>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                    <button 
                      onClick={() => openChat('general', undefined, undefined, concern)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-[#222] dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Know Why
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Suggested Improvements */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-sm dark:shadow-none hover:shadow-md transition-all rounded-[2.5rem] p-12"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-500 dark:text-blue-400 transition-colors duration-500">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-500">Recommendations</h3>
            </div>
            <ul className="space-y-6">
              {(report.insights?.improvementRecommendations || []).map((improvement, idx) => (
                <li key={idx} className="flex gap-5 text-gray-600 dark:text-gray-300 transition-colors duration-500 relative group pr-32">
                  <span className="text-blue-500 dark:text-blue-400 mt-1">→</span>
                  <span className="leading-relaxed text-lg font-light">{improvement}</span>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                    <button 
                      onClick={() => openChat('general', undefined, undefined, improvement)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-[#222] dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Learn More
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* FAQs */}
        {report.insights?.frequentlyAskedQuestions && report.insights.frequentlyAskedQuestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-framer dark:shadow-none rounded-[3rem] p-12 transition-all duration-500"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-500 dark:text-indigo-400 transition-colors duration-500">
                <MessageSquareQuote className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-500">Top Unanswered Questions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {(report.insights?.frequentlyAskedQuestions || []).map((faq, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors duration-300 p-8 rounded-[2rem] relative group">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium transition-colors duration-500">{faq}</p>
                  <button 
                    onClick={() => openChat('general', undefined, undefined, faq)}
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 text-xs font-semibold bg-white hover:bg-gray-50 dark:bg-[#222] dark:hover:bg-[#333] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Ask How
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actionable Roadmap */}
        {report.insights?.actionableRoadmap && report.insights.actionableRoadmap.length > 0 && (() => {
          const roadmap = report.insights.actionableRoadmap;
          const chunkSize = 3;
          const rows = [];
          for (let i = 0; i < roadmap.length; i += chunkSize) {
            rows.push(roadmap.slice(i, i + chunkSize).map((step, idx) => ({ step, originalIndex: i + idx })));
          }

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-[#222] shadow-framer dark:shadow-none rounded-[3rem] p-12 transition-all duration-500"
            >
              <div className="flex items-center gap-4 mb-12">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-500 dark:text-amber-400 transition-colors duration-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-500">Actionable Roadmap</h3>
              </div>
              
              <div className="flex flex-col items-center w-full gap-8">
                {rows.map((row, rowIndex) => {
                  const isEven = rowIndex % 2 === 0;
                  const isLastRow = rowIndex === rows.length - 1;
                  
                  return (
                    <React.Fragment key={rowIndex}>
                      <div className={`flex w-full items-stretch justify-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                        {row.map((item, colIndex) => {
                          const isLastInRow = colIndex === row.length - 1;
                          const isLastOverall = item.originalIndex === roadmap.length - 1;
                          
                          return (
                            <React.Fragment key={item.originalIndex}>
                              <div className="flex-1 bg-white dark:bg-[#050505] border border-gray-100 dark:border-[#222] shadow-sm hover:shadow-md transition-colors duration-300 p-8 rounded-[2rem] relative overflow-hidden group min-h-[160px]">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <span className="text-5xl font-black text-gray-100 dark:text-[#111] absolute top-4 right-4 z-0 pointer-events-none transition-colors duration-500">{item.originalIndex + 1}</span>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium relative z-10 transition-colors duration-500 mt-4">{item.step}</p>
                              </div>
                              
                              {!isLastInRow && !isLastOverall && (
                                <div className="flex items-center justify-center">
                                  {isEven ? <ArrowRight className="w-8 h-8 text-amber-500" /> : <ArrowLeft className="w-8 h-8 text-amber-500" />}
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                        
                        {/* Pad with empty divs so columns are equal width if row is incomplete */}
                        {Array.from({ length: 3 - row.length }).map((_, i) => (
                           <React.Fragment key={`empty-${i}`}>
                             <div className="w-8 h-8 opacity-0 pointer-events-none" />
                             <div className="flex-1 opacity-0 pointer-events-none" />
                           </React.Fragment>
                        ))}
                      </div>
                      
                      {!isLastRow && (
                         <div className="flex w-full gap-8">
                           {isEven ? (
                              <>
                                <div className="flex-1" />
                                <div className="w-8 h-8" />
                                <div className="flex-1" />
                                <div className="w-8 h-8" />
                                <div className="flex-1 flex justify-center"><ArrowDown className="w-8 h-8 text-amber-500" /></div>
                              </>
                           ) : (
                              <>
                                <div className="flex-1 flex justify-center"><ArrowDown className="w-8 h-8 text-amber-500" /></div>
                                <div className="w-8 h-8" />
                                <div className="flex-1" />
                                <div className="w-8 h-8" />
                                <div className="flex-1" />
                              </>
                           )}
                         </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

        <div className="flex justify-center mt-12 mb-8">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-900 dark:from-white dark:to-gray-200 dark:hover:from-gray-100 dark:hover:to-gray-300 text-white dark:text-black px-8 py-4 rounded-full shadow-lg font-semibold text-lg transition-all transform hover:scale-105"
          >
            <ArrowDown className="w-5 h-5" /> Download Report as PDF
          </button>
        </div>

        </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Array.isArray(personas) ? personas : []).map((persona, idx) => {
                const sim = (Array.isArray(simulations) ? simulations : []).find(s => s?.personaId === persona?.id);
                const pName = persona?.name || 'Unknown Persona';
                const pRole = persona?.role || 'User';
                const hue = (pName.length * 40) % 360;
                const isSelected = selectedPersonaId === persona?.id;

                return (
                  <div key={persona?.id || idx} className={`flex flex-col gap-4 transition-all duration-500 ${isSelected ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                    <div 
                      onClick={() => setSelectedPersonaId(isSelected ? null : persona?.id)}
                      className={`cursor-pointer bg-white dark:bg-[#0a0a0a] border ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-100 dark:border-[#222]'} shadow-sm hover:shadow-md transition-all rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden`}
                    >
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-xl font-bold border-2 border-white dark:border-[#111] shadow-sm" style={{ backgroundColor: `hsl(${hue}, 70%, 90%)`, color: `hsl(${hue}, 60%, 30%)` }}>
                        {pName.charAt(0)}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{pName}</h4>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-[#222] px-3 py-1 rounded-full uppercase tracking-wider mt-2 mb-4">{pRole}</span>
                      {sim?.result?.excitementScore !== undefined && (
                        <div className="flex items-center gap-2">
                           <span className="text-sm text-gray-500">Excitement:</span>
                           <span className={`text-sm font-bold ${sim.result.excitementScore >= 7 ? 'text-green-500' : sim.result.excitementScore >= 4 ? 'text-amber-500' : 'text-rose-500'}`}>{sim.result.excitementScore}/10</span>
                        </div>
                      )}
                    
                      {/* Expanded Section inside the card */}
                      <AnimatePresence>
                        {isSelected && sim && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 pt-6 border-t border-gray-100 dark:border-[#222] text-sm overflow-hidden text-left w-full"
                          >
                          <div className="space-y-6">
                            <div>
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><MessageSquareQuote className="w-4 h-4 text-blue-500"/> First Reaction</h5>
                              <p className="text-gray-700 dark:text-gray-300 italic">"{sim?.result?.reaction || 'No reaction available.'}"</p>
                            </div>
                            
                            {sim.result?.concerns && sim.result.concerns.length > 0 && (
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-500"/> Core Concerns</h5>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                                  {sim.result.concerns.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                              </div>
                            )}

                            {sim.result?.objections && sim.result.objections.length > 0 && (
                              <div className="relative group/section">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500"/> Objections to buying</h5>
                                </div>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                                  {sim.result.objections.map((o, i) => <li key={i}>{o}</li>)}
                                </ul>
                              </div>
                            )}
                            
                            {sim.result?.suggestions && sim.result.suggestions.length > 0 && (
                              <div className="relative group/section">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500"/> Suggestions</h5>
                                </div>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                                  {sim.result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                              </div>
                            )}

                            {/* Global Persona Chat Button */}
                            <div className="mt-8 flex justify-end border-t border-gray-100 dark:border-[#222] pt-6">
                              <button 
                                onClick={(e) => { e.stopPropagation(); openChat('persona', persona?.id, pName); }} 
                                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" /> Talk to {pName}
                              </button>
                            </div>
                          </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>

      {/* Floating Global Chat Button */}
      <button 
        onClick={() => openChat('general')}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center gap-2 z-30"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-semibold hidden md:inline">Chat with Report</span>
      </button>

      <ChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        ideaId={report.ideaId}
        context={chatContext}
        initialMessage={initialChatMessage}
      />

      {/* Floating Mouse Cursor Button for Stats Grid */}
      <AnimatePresence>
        {hoveredStat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed pointer-events-none z-50 flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl"
            style={{ 
              left: mousePos.x + 15, 
              top: mousePos.y + 15 
            }}
          >
            <MessageCircle className="w-3.5 h-3.5" /> Know More
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Generation Modal */}
      <AnimatePresence>
        {assetTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setAssetTarget(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-[#222] flex justify-between items-center bg-gray-50 dark:bg-[#0a0a0a]">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Generated Asset
                </h3>
                <button onClick={() => setAssetTarget(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {isGeneratingAsset ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                    <p>Generating asset based on audience feedback...</p>
                  </div>
                ) : (
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                    <ReactMarkdown>{assetMarkdown || ''}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pivot Modal */}
      <AnimatePresence>
        {isPivotModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsPivotModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl w-full max-w-xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-indigo-500" />
                Pivot Your Idea
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                How would you like to change your product based on this feedback? We will rewrite your idea and automatically run a brand new simulation.
              </p>
              <textarea
                value={pivotInstruction}
                onChange={(e) => setPivotInstruction(e.target.value)}
                placeholder="e.g., Change the pricing model to be entirely free but ad-supported, and target younger demographics instead."
                className="w-full h-32 p-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-gray-900 dark:text-white mb-6 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsPivotModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePivot}
                  disabled={!pivotInstruction.trim() || isPivoting}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPivoting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Simulating Pivot...</>
                  ) : (
                    <><Wand2 className="w-4 h-4" /> Run Pivot Simulation</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden div to render raw markdown report for PDF export */}
      <div id="hidden-report-content" className="hidden">
        <ReactMarkdown>{report.fullReportMarkdown || '# Report Missing'}</ReactMarkdown>
      </div>

    </div>
  );
};
