/**
 * Memory Interface Page
 * Fixed imports - now uses API hooks instead of direct data imports
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, History, Sparkles, Cpu, AlertCircle, ChevronRight } from 'lucide-react';
import { MemoryStat } from '@/components/ui/MemoryStat';
import { AuditBubble } from '@/components/ui/AuditBubble';
import { AuditItemModal } from '@/components/modals/AuditItemModal';
import { useAuditItems, useMemoryStats } from '@/hooks';

interface ChatMessage {
  type: 'bot' | 'user';
  text: string;
}

export const MemoryInterface: React.FC = () => {
  const [logContent, setLogContent] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { type: 'bot', text: 'Welcome to the Institutional Memory Layer. Your input prevents technical debt from becoming permanent. What did you work on today?' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedAuditItem, setSelectedAuditItem] = useState<any>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Use API hooks to fetch data
  const { data: auditItems, isLoading } = useAuditItems();
  const { data: memoryStats, isLoading: statsLoading } = useMemoryStats();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory]);

  const handleSend = () => {
    if (!logContent.trim()) return;
    const newMsg: ChatMessage = { type: 'user', text: logContent };
    setChatHistory([...chatHistory, newMsg]);
    setLogContent('');

    // Bot response - in production this would come from an API
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        type: 'bot',
        text: 'Knowledge captured. I am cross-referencing this with PR #421. I noticed a low-confidence mapping in our DB schema for the new module. Would you like to verify the ownership now?'
      }]);
    }, 1000);
  };

  const handleOpenAudit = (item: any) => {
    setSelectedAuditItem(item);
    setIsAuditModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Memory Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {statsLoading ? (
            <>
              <div className="h-16 bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-16 bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-16 bg-slate-800 rounded-xl animate-pulse" />
            </>
          ) : (
            <>
              <MemoryStat 
                icon={<User className="text-blue-400" />} 
                label="Persona Depth" 
                value={memoryStats ? `Lvl ${memoryStats.personaDepth.level} (${memoryStats.personaDepth.label})` : 'Loading...'} 
              />
              <MemoryStat 
                icon={<History className="text-purple-400" />} 
                label="Knowledge Saved" 
                value={memoryStats?.knowledgeSaved.label || 'Loading...'} 
              />
              <MemoryStat 
                icon={<Sparkles className="text-emerald-400" />} 
                label="System Confidence" 
                value={memoryStats ? `${memoryStats.systemConfidence.percentage}%` : 'Loading...'} 
              />
            </>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 p-6 overflow-auto space-y-6 custom-scrollbar">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${msg.type === 'bot' ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-700 border-slate-600'}`}>
                  {msg.type === 'bot' ? <Cpu size={14} className="text-blue-400" /> : <User size={14} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.type === 'bot' ? 'bg-slate-800 border border-slate-700 text-slate-300' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Proactive Question Bubbles - The "Audit" Section */}
          <div className="px-6 pb-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-3 flex items-center gap-2">
              <AlertCircle size={12} className="text-amber-500" /> Substrate Verification Queue
            </p>
            <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
              {isLoading ? (
                <div className="text-sm text-slate-500">Loading audit items...</div>
              ) : (
                auditItems?.map((item: any) => (
                  <AuditBubble
                    key={item.id}
                    title={item.title}
                    desc={item.desc}
                    highlight={item.highlight}
                    onClick={() => handleOpenAudit(item)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="relative flex items-center gap-3">
              <textarea
                value={logContent}
                onChange={(e) => setLogContent(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Log work done, pending blocks, or domain facts..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all min-h-[50px] max-h-[150px] resize-none text-slate-200 placeholder:text-slate-600"
              />
              <button
                onClick={handleSend}
                className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-900/40 text-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <p className="text-[9px] text-slate-600 mt-2 text-center font-mono">ENCRYPTED AT REST • TEAM ANONYMIZED MODE ACTIVE</p>
          </div>
        </div>
      </div>

      <AuditItemModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditItem={selectedAuditItem}
      />
    </div>
  );
};

export default MemoryInterface;
