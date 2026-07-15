import React, { useState } from 'react';
import axios from 'axios';
import { 
  Clock, 
  Download, 
  Upload, 
  CheckCircle, 
  Loader2, 
  ChevronRight, 
  FileText,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';

const AssignmentViewer = ({ assignment, courseId, courseName, onComplete, existingSubmission }) => {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(existingSubmission ? "success" : "idle");

  if (!assignment) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-full text-center">
        <p className="text-slate-500 font-medium font-sans">Assignment details are unavailable.</p>
      </div>
    );
  }

  const handleDownloadPDF = (url) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Assignment_File');
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    if (e.target?.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsSubmitting(true);
    setSubmissionStatus("idle");

    const formData = new FormData();
    formData.append('assignmentId', assignment?._id || assignment?.id);
    formData.append('courseId', courseId);
    formData.append('file', file);

    if (!courseId || !(assignment?._id || assignment?.id)) {
      setSubmissionStatus("System error: Missing ID info.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/submissions', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSubmissionStatus("success");
      if (onComplete) onComplete({ submission: res.data?.data, progress: res.data?.progress });
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setSubmissionStatus(error.response?.data?.message || "Failed to submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGraded = existingSubmission?.status === 'graded';
  const isSubmitted = existingSubmission?.status === 'submitted' || existingSubmission?.status === 'pending';

  return (
    <div className="p-8 flex flex-col h-full bg-white font-sans">
      
      {/* Label and Header */}
      <div className="mb-6">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          ASSIGNMENT DETAILS
        </p>
        <h2 className="text-[36px] font-bold text-[#1e293b] leading-tight mb-4">
          {assignment?.title || 'Loading...'}
        </h2>
        
        <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-slate-400" />
            <span>Due: {assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No Due Date'}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <span>Marks: {assignment?.totalMarks || 100}</span>
        </div>
      </div>

      {/* Instructions Box */}
      <div className="border border-slate-100 rounded-3xl p-8 mb-8 shadow-sm bg-white">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Instructions</h3>
        <p className="text-slate-500 leading-relaxed mb-8 whitespace-pre-wrap">
          {assignment?.instructions || "fill up and submit pdf"}
        </p>
        
        {assignment?.questionPdfUrl && (
          <button 
            onClick={() => handleDownloadPDF(assignment.questionPdfUrl)}
            className="w-full flex items-center justify-center gap-3 py-6 px-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold transition-all hover:bg-slate-50"
          >
            <Download size={20} className="text-slate-400" />
            Download Assignment PDF
          </button>
        )}
      </div>

      {/* Submission Status or Upload */}
      {isSubmitted || isGraded ? (
        <div className="rounded-3xl p-10 flex flex-col items-start gap-4 shadow-sm animate-in fade-in duration-500 border bg-blue-50 border-blue-200">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center border border-blue-200">
                 {isGraded ? (
                   <CheckCircle2 size={18} className="text-blue-500" />
                 ) : (
                   <Clock size={18} className="text-blue-500" />
                 )}
              </div>
              <h3 className="text-xl font-bold text-blue-900">
                {isGraded ? 'Assignment Evaluated' : 'Assignment Submitted'}
              </h3>
           </div>
           
           <div className="pl-11">
              <p className="font-medium mb-4 text-blue-700">
                {isGraded ? "Your assignment has been graded and reviewed." : "Successfully submitted. Pending evaluation by educator."}
              </p>
              
              <button 
                onClick={() => handleDownloadPDF(existingSubmission?.fileUrl)}
                className="flex items-center gap-2 font-bold hover:underline text-blue-800"
              >
                <Download size={18} />
                View Your Uploaded File
              </button>
           </div>
        </div>
      ) : (
        <div className="mt-2">
          <form onSubmit={handleSubmit} className="border-2 border-dashed border-[#bfdbfe] rounded-3xl bg-[#eff6ff]/20 p-12 flex flex-col items-center justify-center group overflow-hidden">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-[#bfdbfe] mb-6">
              <div className="h-14 w-14 bg-[#eff6ff] rounded-full flex items-center justify-center text-[#3b82f6]">
                <UploadCloud size={30} />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-[#1e293b] mb-2">Upload Completed File</h3>
            <p className="text-slate-400 text-sm font-medium mb-8">
              Choose your PDF or Word document to submit.
            </p>
            
            <div className="flex flex-col items-center gap-8 w-full">
              <div className="flex items-center gap-4">
                <label className="bg-[#bfdbfe] hover:bg-[#93c5fd] text-[#1e40af] px-6 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-colors">
                  Choose File
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-slate-500 font-medium">
                  {file ? file.name : "No file chosen"}
                </span>
              </div>

              <button
                type="submit"
                disabled={!file || isSubmitting}
                className="w-full max-w-sm py-4 bg-[#32456a] hover:bg-[#1e293b] text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Assignment'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback Section (if graded) - Special Emerald Theme for Marks Card */}
      {isGraded && (
        <div className="mt-8 pt-8 border-t border-slate-100">
           <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">EDUCATOR FEEDBACK</h3>
           <div className="bg-emerald-50/50 border border-emerald-100 rounded-[28px] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                 <span className="text-emerald-900 font-bold text-lg">Grade Decision</span>
                 <span className="text-3xl font-black text-emerald-600">
                    {existingSubmission?.marksObtained}
                    <span className="text-emerald-200 text-sm ml-1 font-bold">/ {assignment?.totalMarks || 100}</span>
                 </span>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100/50">
                <p className="text-emerald-800 italic font-medium leading-relaxed text-lg">
                  "{existingSubmission?.feedback || "Great work on this task!"}"
                </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentViewer;
