import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Download, PlayCircle } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';
import Playground from './Playground';

const LessonViewer = ({ 
  currentItem, 
  handleNext, 
  handlePrev, 
  toggleCompletion, 
  isCompleted, 
  isDownloading, 
  handleDownloadPDF,
  hasPrev,
  hasNext,
  nextUnlocked
}) => {
  if (!currentItem) return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
      <p className="text-slate-500">Lesson data is unavailable.</p>
    </div>
  );

  const isImage = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPlaygroundOpen(false);
      }
    };
    if (isPlaygroundOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isPlaygroundOpen]);

  return (
    <div className={isPlaygroundOpen ? "fixed inset-0 z-[100] bg-slate-900 flex flex-col lg:flex-row w-screen h-screen" : "flex flex-col h-full w-full"}>
      <div className={isPlaygroundOpen ? "w-full lg:w-1/2 flex flex-col h-full overflow-y-auto bg-white" : "w-full flex flex-col"}>
      
      {currentItem.type === 'video' && (
        currentItem.videoUrl ? (
          <CustomVideoPlayer videoUrl={currentItem.videoUrl} title={currentItem.title} />
        ) : (
          <div className="bg-slate-900 aspect-video flex flex-col items-center justify-center text-slate-400 p-8 text-center border-b border-slate-800">
            <PlayCircle size={48} className="mb-4 opacity-20" />
            <p className="font-semibold text-slate-300">Video content is currently unavailable.</p>
            <p className="text-sm max-w-xs mt-2">The educator hasn't uploaded a video for this lesson yet.</p>
          </div>
        )
      )}

      {!isPlaygroundOpen && (
        <div className="flex justify-end p-3 bg-slate-50 border-b border-slate-200">
          <button 
            onClick={() => setIsPlaygroundOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors shadow-sm"
          >
            🧑‍💻 Open Code Editor
          </button>
        </div>
      )}

      <div className="p-8 flex-grow flex flex-col">
        <h2 className="text-[32px] font-bold text-slate-800 mb-6 tracking-tight leading-tight">
          {currentItem.title || "Untitled Lesson"}
        </h2>
        
        {currentItem.content ? (
          <div 
            className="text-slate-600 leading-relaxed text-[17px] space-y-4 prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: currentItem.content }}
          />
        ) : (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 italic">
            No text content provided for this lesson.
          </div>
        )}

        {currentItem.notesUrl && (
          <div className="mt-10 pt-8 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">
              {currentItem.type === 'video' ? 'Lecture Notes' : 'Lesson Visuals'}
            </h3>
            {isImage(currentItem.notesUrl) ? (
              <div className="flex justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <img 
                  src={currentItem.notesUrl} 
                  alt={currentItem.title} 
                  className="max-w-full h-auto rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                />
              </div>
            ) : (
              <button 
                onClick={() => handleDownloadPDF(currentItem.notesUrl, currentItem.title)}
                disabled={isDownloading}
                className="flex items-center gap-3 px-6 py-3.5 bg-slate-50 hover:bg-white hover:text-blue-600 hover:border-blue-200 border border-slate-200 text-slate-700 rounded-xl transition-all font-semibold shadow-sm group disabled:opacity-50"
              >
                <Download size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span>{isDownloading ? 'Downloading...' : `Download ${currentItem.type === 'video' ? 'Notes' : 'Resources'}`}</span>
              </button>
            )}
          </div>
        )}

        <div className="mt-auto pt-10 flex border-t border-slate-100 items-center justify-between">
          <button 
            onClick={handlePrev}
            disabled={!hasPrev}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          
          <button
            onClick={() => toggleCompletion(currentItem.id)}
            className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              }`}
          >
            {isCompleted ? <><CheckCircle size={18} /> Completed</> : 'Mark as Complete'}
          </button>

          <button 
            onClick={handleNext}
            disabled={!hasNext || !nextUnlocked}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
      </div>
      {isPlaygroundOpen && (
        <div className="w-full lg:w-1/2 h-full overflow-hidden bg-slate-900 border-l border-slate-700 relative">
          <Playground onClose={() => setIsPlaygroundOpen(false)} />
        </div>
      )}
    </div>
  );
};


export default LessonViewer;
