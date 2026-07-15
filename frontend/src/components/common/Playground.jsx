import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import axios from 'axios';

const Playground = ({ onClose }) => {
  const [code, setCode] = useState('// Write your code here...');
  const [languageId, setLanguageId] = useState(54); // Default to C++
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleRun = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/code/run', {
        source_code: code,
        language_id: languageId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOutput(response.data.output || '');
      setIsError(false);
    } catch (err) {
      setOutput(err.response?.data?.error || err.message);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    { id: 54, name: 'C++ (GCC 9.2.0)', value: 'cpp' },
    { id: 62, name: 'Java (OpenJDK 13.0.1)', value: 'java' },
    { id: 50, name: 'C (GCC 9.2.0)', value: 'c' }
  ];

  const currentLang = languages.find(l => l.id === Number(languageId))?.value || 'cpp';

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
        <select 
          className="bg-slate-700 text-white rounded px-3 py-1.5 text-sm outline-none border border-slate-600 focus:border-blue-500"
          value={languageId}
          onChange={(e) => setLanguageId(Number(e.target.value))}
        >
          {languages.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <button 
          onClick={handleRun}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-6 rounded-md text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running...
            </>
          ) : 'Run Code'}
        </button>
      </div>
      
      <div className="flex-grow min-h-[300px]">
        <Editor
          height="100%"
          theme="vs-dark"
          language={currentLang}
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
          }}
        />
      </div>

      <div className="h-[250px] bg-[#0d1117] p-4 overflow-y-auto border-t border-slate-700 flex flex-col relative">
        <p className="text-slate-500 text-xs mb-3 uppercase tracking-widest font-bold flex-shrink-0">Terminal Output</p>
        <div className="flex-grow">
          {isLoading ? (
            <p className="text-blue-400 font-mono text-sm animate-pulse">Executing...</p>
          ) : (
            <pre className={`font-mono text-sm whitespace-pre-wrap ${isError ? 'text-red-400' : 'text-emerald-400'}`}>
              {output || (
                <span className="text-slate-600 italic">No output yet. Run your code to see results here.</span>
              )}
            </pre>
          )}
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded text-[11px] font-bold uppercase tracking-widest transition-colors shadow-lg z-10"
          >
            Exit Split View
          </button>
        )}
      </div>
    </div>
  );
};

export default Playground;
