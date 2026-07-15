import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Clock, BookOpen, CheckCircle2, Circle, Loader2, Flag, Check } from 'lucide-react';

const ActiveQuiz = () => {
    const { id: quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const courseId = location.state?.courseId;

    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [resolvedCourseId, setResolvedCourseId] = useState(courseId);
    const [answers, setAnswers] = useState({});
    const [attemptId, setAttemptId] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);

    useEffect(() => {
        const initializeQuiz = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const startRes = await axios.post('/api/quiz-attempts/start', {
                    quizId,
                    courseId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const { quiz, questions, attempt, courseId: backendCourseId } = startRes.data;
                
                setQuizData({ ...quiz, questions });
                setAttemptId(attempt._id);
                setResolvedCourseId(backendCourseId || courseId);
                
                // Initialize answers from existing attempt (Resume feature)
                if (attempt.answers && attempt.answers.length > 0) {
                    const savedAnswers = {};
                    attempt.answers.forEach(ans => {
                        savedAnswers[ans.questionId] = ans.selectedOption;
                    });
                    setAnswers(savedAnswers);
                }

                setTimeLeft((quiz.duration || 15) * 60);
                setStartTime(Date.now());
                setIsLoading(false);
            } catch (err) {
                console.error("Quiz Initialization Error:", err);
                setIsLoading(false);
            }
        };

        if (quizId) initializeQuiz();
    }, [quizId, courseId, navigate]);

    // Auto-Save Effect
    const saveProgress = async (newAnswers) => {
        try {
            const token = localStorage.getItem('token');
            const formattedAnswers = Object.entries(newAnswers).map(([qId, sOpt]) => ({
                questionId: qId,
                selectedOption: sOpt
            }));

            await axios.patch('/api/quiz-attempts/save-progress', {
                attemptId,
                answers: formattedAnswers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Auto-save failed:", err);
        }
    };

    const handleOptionSelect = (index) => {
        const questionId = quizData.questions[currentQuestionIndex]._id;
        const newAnswers = {
            ...answers,
            [questionId]: index
        };
        setAnswers(newAnswers);
        
        // Background Auto-Save
        saveProgress(newAnswers);
    };

    const handleToggleFlag = (index) => {
        setFlaggedQuestions(prev => 
            prev.includes(index) 
                ? prev.filter(id => id !== index) 
                : [...prev, index]
        );
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            // Final time taken calculation
            const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

            await axios.post('/api/quiz-attempts/submit', {
                attemptId,
                timeTaken
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // On success, navigate back to the course viewer
            navigate(`/learn/${resolvedCourseId}`, { state: { refresh: true } });
        } catch (err) {
            console.error("Submission Error:", err);
            setIsSubmitting(false);
            alert("Failed to submit quiz. Please check your connection.");
        }
    };

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || isSubmitting) {
            if (timeLeft === 0 && !isSubmitting) {
                handleSubmit();
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isSubmitting]);

    const formatTime = (seconds) => {
        if (seconds === null) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const goToPrevious = () => {
        if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
    };

    const goToNext = () => {
        if (currentQuestionIndex < quizData.questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-slate-600 font-medium">Preparing your quiz environment...</p>
                </div>
            </div>
        );
    }

    if (!quizData || !quizData.questions.length) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-600">No questions found for this quiz.</p>
            </div>
        );
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const selectedOption = answers[currentQuestion._id];

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Left Sidebar: Question Tracker (25%) */}
            <aside className="w-full md:w-1/4 bg-slate-50 border-r border-slate-200 flex flex-col h-screen overflow-y-auto">
                <div className="p-8 border-b border-slate-200 bg-white">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Quiz Mode</h2>
                    <h1 className="text-xl font-bold text-slate-900 leading-tight mb-6">{quizData.title}</h1>
                    
                    <div className="flex items-center gap-3 p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
                        <Clock size={20} className="flex-shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">Time Remaining</p>
                            <p className="text-2xl font-mono font-black">{formatTime(timeLeft)}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 flex-grow">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Question Tracker</h3>
                        <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {Object.values(answers).filter(v => v !== undefined && v !== null).length} / {quizData.questions.length}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2">
                        {quizData.questions.map((q, idx) => {
                            const isAnswered = answers[q._id] !== undefined && answers[q._id] !== null;
                            const isActive = currentQuestionIndex === idx;
                            const isFlagged = flaggedQuestions.includes(idx);
                            
                            return (
                                <button
                                    key={q._id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`
                                        relative aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 border
                                        ${isAnswered 
                                            ? 'bg-blue-100/50 border-blue-500 text-blue-700 shadow-sm' 
                                            : 'bg-slate-50/50 border-slate-200 border-dashed text-slate-400 hover:border-slate-400'}
                                        ${isActive ? 'ring-2 ring-blue-600 ring-offset-2 border-blue-600 shadow-none' : ''}
                                        ${isFlagged ? 'border-orange-400' : ''}
                                    `}
                                >
                                    {isAnswered && !isActive && <Check size={10} className="absolute top-1 left-1 text-blue-600" />}
                                    {isFlagged && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white shadow-sm" />
                                    )}
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-sm bg-blue-100/50 border border-blue-500"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Answered</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-sm bg-slate-50/50 border border-slate-200 border-dashed"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unanswered</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Flagged</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-sm ring-1 ring-blue-600 ring-offset-1"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-200 mt-auto">
                    <button 
                        onClick={() => { if(window.confirm('Are you sure you want to finish and submit?')) handleSubmit() }}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finish Attempt'}
                    </button>
                </div>
            </aside>

            {/* Right Main Content (75%) */}
            <main className="flex-1 h-screen overflow-y-auto flex flex-col bg-white">
                <div className="flex-grow flex items-center justify-center p-6 md:p-12">
                    <div className="w-full max-w-3xl">
                        {/* Compact Header */}
                        <div className="mb-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                                    Question {currentQuestionIndex + 1} of {quizData.questions.length}
                                </span>
                                <button 
                                    onClick={() => handleToggleFlag(currentQuestionIndex)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
                                        ${flaggedQuestions.includes(currentQuestionIndex)
                                            ? 'bg-yellow-50 text-yellow-600 border border-yellow-200 shadow-sm shadow-yellow-100'
                                            : 'bg-slate-50 text-slate-400 border border-slate-100 hover:text-slate-600'
                                        }`}
                                >
                                    <Flag size={12} className={flaggedQuestions.includes(currentQuestionIndex) ? 'fill-yellow-600' : ''} />
                                    {flaggedQuestions.includes(currentQuestionIndex) ? 'Flagged for Review' : 'Flag for Review'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={goToPrevious}
                                    disabled={currentQuestionIndex === 0}
                                    className="p-3 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all border border-slate-100"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button 
                                    onClick={goToNext}
                                    disabled={currentQuestionIndex === quizData.questions.length - 1}
                                    className="p-3 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all border border-slate-100"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="mb-12">
                            <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                                {currentQuestion.question}
                            </h3>
                        </div>

                        {/* Options Grid */}
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, idx) => {
                                const isSelected = selectedOption === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`
                                            w-full flex items-center justify-between px-6 py-5 rounded-2xl border-2 text-left transition-all duration-200 group
                                            ${isSelected 
                                                ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-50' 
                                                : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all font-black text-sm
                                                ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-400 group-hover:border-slate-400'}
                                            `}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`text-lg font-bold tracking-tight ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                                                {option}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center sm:px-12">
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Progress auto-saved</p>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        {currentQuestionIndex === quizData.questions.length - 1 ? (
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Quiz'}
                            </button>
                        ) : (
                            <button 
                                onClick={goToNext}
                                className="flex-1 sm:flex-none px-12 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                Next Question <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ActiveQuiz;
