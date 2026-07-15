import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import {
  PlayCircle,
  CheckCircle,
  Circle,
  FileText,
  HelpCircle,
  Download,
  Upload,
  Clock,
  ChevronLeft,
  ChevronRight,
  Lock,
  Trophy,
  Award,
  PartyPopper,
  MessageSquare,
  Loader2,
  Star,
  Menu
} from 'lucide-react';
import AssignmentViewer from '../../components/common/AssignmentViewer';
import CustomVideoPlayer from '../../components/common/CustomVideoPlayer';
import QuizViewer from '../../components/common/QuizViewer';
import LessonViewer from '../../components/common/LessonViewer';
import { AnimatePresence, motion } from 'framer-motion';
import CourseFeedbackForm from '../../components/CourseFeedbackForm';
import SupportQuery from '../../components/common/SupportQuery';


const isImage = (url) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

const enrichCourseWithLocks = (modules, completions) => {
  let globalLockActive = false;

  return modules.map((mod) => {
    const sortedItems = [...mod.items].sort((a, b) => (a.order || 0) - (b.order || 0));

    const enrichedItems = sortedItems.map((item) => {
      const isUnlocked = !globalLockActive;

      const isCompleted = !!completions[item.id];


      if (!isCompleted) {
        globalLockActive = true;
      }

      return { ...item, isUnlocked, isCompleted };
    });

    return {
      ...mod,
      items: enrichedItems,
      isUnlocked: enrichedItems.length > 0 ? enrichedItems[0].isUnlocked : !globalLockActive
    };
  });
};

const ContinueLearning = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [completions, setCompletions] = useState({});
  const [activeItemId, setActiveItemId] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [certificate, setCertificate] = useState(null);
  const [isFetchingCert, setIsFetchingCert] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('overview'); // 'overview' or 'qa'
  const [courseQueries, setCourseQueries] = useState([]);
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get(`/api/courses/learn/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const courseData = res.data.data.course;
        const progressData = res.data.data.progress;
        const subData = res.data.data.submissions || [];
        const quizAttemptData = res.data.data.quizAttempts || [];

        const formattedModules = (courseData.modules || []).map((mod) => {
          const items = [];
          if (mod.lessons) {
            mod.lessons.forEach(l => items.push({ ...l, type: l.videoUrl ? 'video' : 'text', id: l._id }));
          }
          if (mod.assignments) {
            mod.assignments.forEach(a => items.push({ ...a, type: 'assignment', id: a._id }));
          }
          if (mod.quizzes) {
            mod.quizzes.forEach(q => items.push({ ...q, type: 'quiz', id: q._id }));
          }
          items.sort((a, b) => (a.order || 0) - (b.order || 0));
          return {
            id: mod._id,
            title: mod.title,
            items
          };
        });

        courseData.modules = formattedModules;
        setSubmissions(subData);
        setQuizAttempts(quizAttemptData);
        setCourse(courseData);

        const newCompletions = {};
        if (progressData) {
          if (progressData.completedLessons) {
            progressData.completedLessons.forEach(cId => newCompletions[cId] = true);
          }
          if (progressData.completedAssignments) {
            progressData.completedAssignments.forEach(cId => newCompletions[cId] = true);
          }
          if (progressData.completedQuizzes) {
            progressData.completedQuizzes.forEach(cId => newCompletions[cId] = true);
          }
        }
        setCompletions(newCompletions);

        // Apply Unlocking Algorithm
        courseData.modules = enrichCourseWithLocks(formattedModules, newCompletions);
        setCourse(courseData);

        let firstItemId = null;
        for (const mod of formattedModules) {
          if (mod.items && mod.items.length > 0) {
            firstItemId = mod.items[0].id;
            break;
          }
        }
        if (firstItemId) {
          setActiveItemId(firstItemId);
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err.response?.data?.message || 'Failed to fetch course content.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id, navigate, location.state]);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      const { currentItem } = getActiveItemDetails();
      if (!currentItem || currentItem.type !== 'quiz') {
        setQuizHistory([]);
        return;
      }

      try {
        setIsHistoryLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/quiz-attempts/history/${currentItem.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuizHistory(res.data);
      } catch (err) {
        console.error("Error fetching quiz history:", err);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchQuizHistory();
  }, [activeItemId]);

  useEffect(() => {
    const fetchCourseQueries = async () => {
      const token = localStorage.getItem('token');
      if (!token || !id) return;

      try {
        setIsLoadingQueries(true);
        const res = await axios.get(`/api/queries?courseId=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourseQueries(res.data.data);
      } catch (err) {
        console.error('Error fetching course queries:', err);
      } finally {
        setIsLoadingQueries(false);
      }
    };

    if (activeBottomTab === 'qa') {
      fetchCourseQueries();
    }
  }, [id, activeBottomTab]);

  useEffect(() => {
    if (!course) return;

    let totalItems = 0;
    let completedItems = 0;

    course.modules.forEach(mod => {
      mod.items.forEach(item => {
        totalItems++;
        if (completions[item.id]) {
          completedItems++;
        }
      });
    });

    const calculatedProgress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    setProgressPercentage(calculatedProgress);

    // Fetch Certificate if 100% and enabled
    if (calculatedProgress === 100 && course.gradingConfiguration?.isCertificationEnabled && !certificate && !isFetchingCert) {
      const fetchCert = async () => {
        try {
          setIsFetchingCert(true);
          const token = localStorage.getItem('token');
          const res = await axios.get(`/api/certificates/course/${course._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCertificate(res.data.data);
        } catch (err) {
          console.error("Certificate not ready or not found:", err);
        } finally {
          setIsFetchingCert(false);
        }
      };
      fetchCert();
    }

  }, [completions, course, certificate, isFetchingCert]);

  const toggleCompletion = async (itemId, extraData = null) => {
    try {
      const { currentItem } = getActiveItemDetails();
      if (!currentItem) return;

      const token = localStorage.getItem('token');

      if (currentItem.type === 'text' || currentItem.type === 'video') {
        const res = await axios.patch(`/api/courses/learn/${id}/complete-lesson`,
          { lessonId: itemId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          const progressData = res.data.progress;
          const newCompletions = {};
          if (progressData.completedLessons) progressData.completedLessons.forEach(cId => newCompletions[cId] = true);
          if (progressData.completedAssignments) progressData.completedAssignments.forEach(cId => newCompletions[cId] = true);
          if (progressData.completedQuizzes) progressData.completedQuizzes.forEach(cId => newCompletions[cId] = true);

          setCompletions(newCompletions);
          setCourse(prev => ({
            ...prev,
            modules: enrichCourseWithLocks(prev.modules, newCompletions)
          }));
        }
      } else {
        if (extraData?.progress) {
          const progressData = extraData.progress;
          const newCompletions = {};
          if (progressData.completedLessons) progressData.completedLessons.forEach(cId => newCompletions[cId] = true);
          if (progressData.completedAssignments) progressData.completedAssignments.forEach(cId => newCompletions[cId] = true);
          if (progressData.completedQuizzes) progressData.completedQuizzes.forEach(cId => newCompletions[cId] = true);

          setCompletions(newCompletions);
          if (extraData.submission) {
            setSubmissions(prev => [...prev, extraData.submission]);
          }
          if (extraData.quizAttempt) {
            setQuizAttempts(prev => [...prev, extraData.quizAttempt]);
          }

          setCourse(prev => ({
            ...prev,
            modules: enrichCourseWithLocks(prev.modules, newCompletions)
          }));
        } else {
          const newCompletions = { ...completions, [itemId]: true };
          setCompletions(newCompletions);
          setCourse(prev => ({
            ...prev,
            modules: enrichCourseWithLocks(prev.modules, newCompletions)
          }));
        }
      }
    } catch (err) {
      console.error("Error updating completion status:", err);
      alert("Failed to update progress. Please try again.");
    }
  };

  const getActiveItemDetails = () => {
    if (!course) return null;
    let currentModule = null;
    let currentItem = null;
    let itemIndex = -1;
    let moduleIndex = -1;

    for (let i = 0; i < course.modules.length; i++) {
      const mod = course.modules[i];
      const idx = mod.items.findIndex(it => it.id === activeItemId);
      if (idx !== -1) {
        currentModule = mod;
        currentItem = mod.items[idx];
        itemIndex = idx;
        moduleIndex = i;
        break;
      }
    }

    return { currentModule, currentItem, moduleIndex, itemIndex };
  };

  const handleDownloadPDF = async (url, title) => {
    if (!url) {
      alert('No PDF available for this assignment.');
      return;
    }

    try {
      setIsDownloading(true);

      let downloadUrl = url;
      if (url.includes('cloudinary.com')) {
        const token = localStorage.getItem('token');
        const res = await axios.post('/api/courses/download-url',
          { fileUrl: url },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data && res.data.downloadUrl) {
          downloadUrl = res.data.downloadUrl;
        }
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${title?.replace(/\s+/g, '_')}_Assignment.pdf` || 'Assignment.pdf');
      link.target = '_blank';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Error initiating download:', err);
      alert('Failed to authorize PDF download. Please try again or contact support.');
    } finally {
      setIsDownloading(false);
    }
  };

  const flattenedItems = course?.modules.reduce((acc, mod) => {
    return [...acc, ...mod.items];
  }, []) || [];

  const currentIndex = flattenedItems.findIndex(it => it.id === activeItemId);

  const handleNext = () => {
    if (currentIndex < flattenedItems.length - 1) {
      const nextItem = flattenedItems[currentIndex + 1];
      if (nextItem.isUnlocked) {
        setActiveItemId(nextItem.id);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevItem = flattenedItems[currentIndex - 1];
      setActiveItemId(prevItem.id);
    }
  };

  if (isLoading || (!course && !error)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  const { currentModule, currentItem } = getActiveItemDetails();

  const getIconForType = (type, isCompleted, isActive) => {
    if (isCompleted) {
      return <CheckCircle size={18} className={`${isActive ? 'text-white' : 'text-emerald-500'}`} />;
    }
    if (type === 'text' || type === 'video') {
      return type === 'video' ? <PlayCircle size={18} className={`${isActive ? 'text-white' : 'text-slate-400'}`} /> : <FileText size={18} className={`${isActive ? 'text-white' : 'text-slate-400'}`} />;
    }
    if (type === 'assignment') {
      return <FileText size={18} className={`${isActive ? 'text-white' : 'text-amber-500'}`} />;
    }
    if (type === 'quiz') {
      return <HelpCircle size={18} className={`${isActive ? 'text-white' : 'text-purple-500'}`} />;
    }
    return <Circle size={18} className="text-slate-400" />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowFeedbackModal(false); }}
        >
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition-colors z-10"
              aria-label="Close feedback"
            >
              ✕
            </button>
            <CourseFeedbackForm courseId={course?._id} />
          </div>
        </div>
      )}

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-6 py-8">

        {/* Course Title and Progress Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex-shrink-0">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 flex-grow min-w-[160px] max-w-sm">
              <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {progressPercentage}% Complete
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start">

          {/* Collapsible Sidebar */}
          <div className={`flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-full lg:w-[32%]' : 'w-[64px]'}`}>
            <div className="bg-white border text-base border-slate-200 rounded-2xl shadow-sm overflow-hidden sticky top-6">
              
              {/* Sidebar Header with Toggle */}
              <div className={`p-5 border-b border-slate-100 bg-slate-50/50 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center !px-2 !py-4'}`}>
                {sidebarOpen && (
                  <h2 className="font-bold text-slate-800 text-lg">Course Content</h2>
                )}
                <button
                  onClick={() => setSidebarOpen(prev => !prev)}
                  className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
                  title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                </button>
              </div>

              {sidebarOpen && (
                <div className="max-h-[calc(100vh-250px)] overflow-y-auto hidden-scrollbar pb-4 p-2">
                  {course.modules.map((mod, index) => (
                    <div key={mod.id} className="mb-4 last:mb-0">
                      <h3 className="font-semibold text-slate-800 text-[15px] px-3 py-2 mb-1">
                        Module {index + 1}: {mod.title}
                      </h3>
                      <div className="flex flex-col gap-1">
                        {mod.items.map((item) => {
                          const isActive = activeItemId === item.id;
                          const isCompleted = completions[item.id];
                          const isUnlocked = item.isUnlocked;

                          return (
                            <button
                              key={item.id}
                              onClick={() => isUnlocked && setActiveItemId(item.id)}
                              disabled={!isUnlocked}
                              className={`w-full text-left flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${isActive
                                ? 'bg-blue-600 text-white shadow-md'
                                : isUnlocked
                                  ? 'hover:bg-slate-50 text-slate-700'
                                  : 'opacity-50 cursor-not-allowed text-slate-400 bg-slate-50/50'
                                } ${!isUnlocked ? 'pointer-events-none' : ''}`}
                            >
                              <div className="flex items-center gap-3 pr-2 overflow-hidden">
                                <div className="flex-shrink-0">
                                  {!isUnlocked ? (
                                    <Lock size={16} className="text-slate-400" />
                                  ) : (
                                    getIconForType(item.type, isCompleted, isActive)
                                  )}
                                </div>
                                <span className={`text-[14.5px] font-medium truncate ${isActive ? 'text-white' : isUnlocked ? 'text-slate-700' : 'text-slate-400'}`}>
                                  {item.title}
                                </span>
                              </div>

                              {isUnlocked && (item.type === 'text' || item.type === 'video') && item.duration && (
                                <span className={`text-[12px] font-medium flex-shrink-0 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                                  {item.duration}
                                </span>
                              )}

                              {!isUnlocked && (
                                <div className="flex-shrink-0">
                                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {progressPercentage === 100 && (
                    <div className="mt-6 px-3 mb-2">
                      <button
                        onClick={() => setShowFeedbackModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold rounded-xl text-[14.5px] transition-all shadow-sm flex-shrink-0"
                      >
                        <Star size={16} className="fill-amber-400 text-amber-400" />
                        Rate this Course
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content — fills remaining space */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              {!currentItem ? (
                <div className="flex-grow flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                    <HelpCircle size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Select a Lesson</h2>
                  <p className="text-slate-500 max-w-xs">Please select a lesson, assignment, or quiz from the sidebar to begin.</p>
                </div>
              ) : (
                <>
                  {(currentItem.type === 'text' || currentItem.type === 'video') && (
                    <LessonViewer
                      currentItem={currentItem}
                      handleNext={handleNext}
                      handlePrev={handlePrev}
                      toggleCompletion={toggleCompletion}
                      isCompleted={completions[currentItem.id]}
                      isDownloading={isDownloading}
                      handleDownloadPDF={handleDownloadPDF}
                      hasPrev={currentIndex > 0}
                      hasNext={currentIndex < flattenedItems.length - 1}
                      nextUnlocked={flattenedItems[currentIndex + 1]?.isUnlocked}
                    />
                  )}

                  {currentItem.type === 'assignment' && (
                    <AssignmentViewer
                      assignment={currentItem}
                      courseId={course?._id}
                      courseName={course?.title}
                      existingSubmission={submissions.find(sub => sub.assignmentId === currentItem.id)}
                      onComplete={(data) => toggleCompletion(currentItem.id, data)}
                    />
                  )}

                  {currentItem.type === 'quiz' && (
                    <div className="flex-grow flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
                      <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center text-purple-600 mb-8 shadow-sm">
                        <HelpCircle size={40} />
                      </div>

                      <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{currentItem.title}</h2>
                      <p className="text-slate-500 font-medium mb-10 max-w-md">
                        Test your knowledge and earn your progress. Ensure you have a stable connection before starting.
                      </p>

                      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-12">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                          <Clock size={20} className="text-slate-400 mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Duration</p>
                          <p className="text-lg font-bold text-slate-800">{currentItem.duration || 15} Mins</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                          <Trophy size={20} className="text-slate-400 mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Passing Score</p>
                          <p className="text-lg font-bold text-slate-800">{(currentItem.passingMarks || 50)}%</p>
                        </div>
                      </div>

                      {quizAttempts.find(att => att.quizId === currentItem.id) ? (
                        <div className="w-full max-w-md bg-white border-2 border-emerald-100 rounded-3xl p-8 shadow-xl shadow-emerald-500/5 relative overflow-hidden group">
                          {quizAttempts.find(att => att.quizId === currentItem.id).status === 'completed' ? (
                            <>
                              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <CheckCircle size={80} className="text-emerald-600" />
                              </div>
                              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-4">Quiz Completed</p>
                              <div className="flex flex-col items-center gap-2">
                                <p className="text-5xl font-black text-slate-900">
                                  {Math.round((quizAttempts.find(att => att.quizId === currentItem.id).score / quizAttempts.find(att => att.quizId === currentItem.id).totalMarksPossible) * 100)}%
                                </p>
                                <p className="text-sm font-bold text-slate-400">Your Final Score</p>
                              </div>
                              <div className="mt-8 py-3 px-6 bg-slate-50 rounded-xl text-slate-500 font-bold text-xs uppercase tracking-widest border border-slate-100">
                                Single Attempt Finalized
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Attempt In Progress</p>
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                  <Clock size={32} />
                                </div>
                                <p className="text-slate-600 font-medium">You have an unfinished attempt.</p>
                              </div>
                              <button
                                onClick={() => navigate(`/quiz/${currentItem.id}/attempt`, { state: { courseId: course?._id } })}
                                className="mt-8 w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
                              >
                                Resume Quiz
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate(`/quiz/${currentItem.id}/attempt`, { state: { courseId: course?._id } })}
                          className="px-12 py-5 bg-purple-600 text-white font-black rounded-2xl shadow-2xl shadow-purple-500/30 hover:bg-purple-700 transition-all flex items-center gap-3 active:scale-95 uppercase tracking-widest text-sm"
                        >
                          Start Quiz <ChevronRight size={20} />
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Tabs Selection — only visible for lessons */}
            {(currentItem?.type === 'text' || currentItem?.type === 'video') && (
              <div className="flex gap-8 border-b border-slate-200 mt-4 mb-2">
                <button
                  onClick={() => setActiveBottomTab('overview')}
                  className={`pb-3 text-sm font-bold transition-all relative ${activeBottomTab === 'overview' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Lesson Overview
                  {activeBottomTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-sm" />}
                </button>
                <button
                  onClick={() => setActiveBottomTab('qa')}
                  className={`pb-3 text-sm font-bold transition-all relative ${activeBottomTab === 'qa' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Questions & Answers
                  {activeBottomTab === 'qa' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-sm" />}
                </button>
              </div>
            )}

            {(currentItem?.type === 'text' || currentItem?.type === 'video') && (
              <div className="mt-2">
                {activeBottomTab === 'overview' ? (
                  <div className="bg-white border text-base border-slate-200 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">About this lesson</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {currentItem?.content || "This lesson covers fundamental concepts for the current module. Review the video or reading material above to proceed."}
                    </p>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <SupportQuery
                      courseId={course?._id}
                      lessonId={currentItem?.id}
                      onQuerySubmitted={() => {
                        setActiveBottomTab('overview');
                        setTimeout(() => setActiveBottomTab('qa'), 10);
                      }}
                    />

                    <div className="space-y-6 mt-8">
                      <h3 className="text-lg font-bold text-slate-800 px-2 tracking-tight">Your Previous Questions</h3>

                      {isLoadingQueries ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
                      ) : courseQueries.filter(q => (q.lessonId?._id || q.lessonId) === currentItem?.id).length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {courseQueries.filter(q => (q.lessonId?._id || q.lessonId) === currentItem?.id).map((q) => (
                            <div key={q._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${q.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                  {q.status}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                  {new Date(q.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-slate-800 font-bold text-sm mb-4 leading-relaxed">{q.question}</p>
                              {q.answer && (
                                <div className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                                  <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <MessageSquare size={12} /> Instructor Response
                                  </p>
                                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{q.answer}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                          <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                          <h4 className="text-slate-500 font-bold mb-1">No questions yet</h4>
                          <p className="text-slate-400 text-sm">Ask your first question to get started.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}


          </div>
        </div>
      </main>
    </div>
  );
};

export default ContinueLearning;
