import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, 
    XCircle, 
    Trophy, 
    Target, 
    Clock, 
    ArrowLeft,
    RotateCcw
} from 'lucide-react';

const QuizResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { resultData, courseId } = location.state || {};

    if (!resultData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <p className="text-slate-600 mb-4">No result data found.</p>
                <button 
                    onClick={() => navigate('/my-courses')}
                    className="flex items-center gap-2 text-blue-600 font-bold"
                >
                    <ArrowLeft size={20} /> Go to My Courses
                </button>
            </div>
        );
    }

    const { score, totalMarksPossible, passed, totalQuestions, answers, timeTaken } = resultData;
    const correctAnswersCount = answers.filter(a => a.isCorrect).length;
    const percentage = Math.round((score / totalMarksPossible) * 100);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    {/* Header Section */}
                    <div className={`p-10 text-center bg-indigo-50`}>
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-indigo-100 rounded-full animate-bounce">
                                <Trophy size={64} className="text-indigo-600" />
                            </div>
                        </div>
                        
                        <h1 className={`text-4xl font-extrabold mb-2 text-indigo-900`}>
                            Quiz Completed!
                        </h1>
                        <p className={`text-lg font-medium text-indigo-700/80`}>
                            You've successfully finished your assessment.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center transition-transform hover:scale-105">
                                <div className="flex justify-center mb-3 text-blue-600">
                                    <Target size={24} />
                                </div>
                                <div className="text-3xl font-black text-slate-800">{percentage}%</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Final Score</div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center transition-transform hover:scale-105">
                                <div className="flex justify-center mb-3 text-purple-600">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="text-3xl font-black text-slate-800">{correctAnswersCount}/{totalQuestions}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Accuracy</div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center transition-transform hover:scale-105">
                                <div className="flex justify-center mb-3 text-amber-600">
                                    <Clock size={24} />
                                </div>
                                <div className="text-3xl font-black text-slate-800">{formatTime(timeTaken)}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Time Spent</div>
                            </div>
                        </div>

                        {/* Summary breakdown */}
                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                <span className="text-slate-600 font-medium">Total Marks Earned</span>
                                <span className="text-slate-900 font-bold">{score} / {totalMarksPossible}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                <span className="text-slate-600 font-medium">Attempt Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700`}>
                                    Submitted
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate(`/learn/${courseId}`)}
                                className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={20} /> Back to Course
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={20} /> Retake Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizResultPage;
