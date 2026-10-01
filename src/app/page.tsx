'use client';

import { useState } from 'react';
import { Database } from 'lucide-react';
import ChatPane from '@/components/ChatPane';
import ResultsPane from '@/components/ResultsPane';

export default function Home() {
  const [resultData, setResultData] = useState<any[]>([]);
  const [resultMetadata, setResultMetadata] = useState<any>(null);

  const handleResult = (data: any[], metadata: any) => {
    setResultData(data);
    setResultMetadata(metadata);
  };

  return (
    <div className="flex h-screen bg-white text-black font-sans overflow-hidden">
      {/* Results Pane – 2/3 */}
      <div className="w-2/3 h-full border-r border-gray-200 flex flex-col">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="text-purple-600" size={20} />
            <h1 className="font-bold text-base text-gray-900">SkillRAG</h1>
          </div>
          <span className="ml-3 text-xs text-gray-400">Student Intelligence Platform</span>
        </header>
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ResultsPane data={resultData} metadata={resultMetadata} />
        </div>
      </div>

      {/* Chat Pane – 1/3 */}
      <div className="w-1/3 h-full">
        <ChatPane onResult={handleResult} />
      </div>
    </div>
  );
}
