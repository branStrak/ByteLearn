import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Plus, Trash2, GripVertical, ChevronDown, Save, ArrowLeft,
  Loader2, BookOpen, CheckCircle2, Video, FileText, Paperclip,
  X, UploadCloud, FileUp, Check, ClipboardList, HelpCircle,
  AlertCircle, Layers, PlusCircle, Eye
} from 'lucide-react';
import EducatorHeader from '../../components/layout/EducatorHeader';
import Footer from '../../components/layout/Footer';
import GradingConfiguration from './GradingConfiguration';
import CollaborationManager from './CollaborationManager';
import { User as UserIconAlt } from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Label
const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-slate-600 mb-2">{children}</label>
);

// Reusable Input
const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-400 ${className}`}
    {...props}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Builder Sub-Component
const QuizBuilder = ({ moduleId, courseId, onSave, onCancel }) => {
  const [quizTitle, setQuizTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [attemptsAllowed, setAttemptsAllowed] = useState(1);
  const [questions, setQuestions] = useState([
    { question: '', options: ['', ''], correctAnswer: 0, marks: 1 }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => {
    setQuestions(prev => [...prev, { question: '', options: ['', ''], correctAnswer: 0, marks: 1 }]);
  };

  const removeQuestion = (qIdx) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== qIdx));
  };

  const updateQuestion = (qIdx, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, [field]: value } : q));
  };

  const addOption = (qIdx) => {
    if (questions[qIdx].options.length >= 6) return;
    setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, options: [...q.options, ''] } : q));
  };

  const removeOption = (qIdx, oIdx) => {
    if (questions[qIdx].options.length <= 2) return;
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const newOpts = q.options.filter((_, oi) => oi !== oIdx);
      const newCorrect = q.correctAnswer >= newOpts.length ? 0 : q.correctAnswer;
      return { ...q, options: newOpts, correctAnswer: newCorrect };
    }));
  };

  const updateOption = (qIdx, oIdx, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const newOpts = [...q.options];
      newOpts[oIdx] = value;
      return { ...q, options: newOpts };
    }));
  };

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: quizTitle.trim(),
        duration: duration ? Number(duration) : undefined,
        attemptsAllowed: Number(attemptsAllowed) || 1,
        questions: questions.map(q => ({
          question: q.question.trim(),
          options: q.options.map(o => o.trim()),
          correctAnswer: Number(q.correctAnswer),
          marks: Number(q.marks),
        }))
      };

      const res = await axios.post(
        `/api/courses/${courseId}/modules/${moduleId}/quizzes`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      onSave(res.data?.data?.quiz || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz. Please check your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-4 relative overflow-hidden">
      {/* Accent Header Line */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-indigo-400"></div>
        <div className="flex-1 bg-purple-400"></div>
      </div>

      <div className="flex justify-between items-center mb-6 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <HelpCircle size={20} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-800 tracking-tight">Create Quiz</h4>
            <p className="text-xs text-slate-500 font-medium">Add questions, options, and set time limits</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20} /></button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium border border-red-100">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Meta */}
        <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 space-y-5">
          <div>
            <Label>Quiz Title *</Label>
            <Input required placeholder="e.g. JavaScript Fundamentals Quiz" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Total Marks</Label>
              <div className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 font-bold text-indigo-600 text-center shadow-sm">{totalMarks}</div>
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" min="1" placeholder="e.g. 30" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5 relative">

              <div className="absolute -left-3 top-6 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 ring-4 ring-white shadow-sm">
                {qIdx + 1}
              </div>

              <div className="flex items-center justify-between pl-4">
                <span className="font-semibold text-slate-700">Question Details</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Marks:</span>
                    <input
                      type="number" min="0.5" step="0.5"
                      className="w-16 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center text-sm font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={q.marks}
                      onChange={e => updateQuestion(qIdx, 'marks', e.target.value)}
                    />
                  </div>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qIdx)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="pl-4">
                <Input
                  required
                  placeholder="e.g. What does 'var' keyword do in JavaScript?"
                  value={q.question}
                  onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                />
              </div>

              <div className="space-y-3 pl-4 pt-2">
                <Label>Options (Select the correct answer using the checkmark)</Label>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                      className={`mt-2 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${q.correctAnswer === oIdx ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'bg-white border-slate-300 hover:border-emerald-400'}`}
                    >
                      {q.correctAnswer === oIdx && <Check size={14} strokeWidth={3} />}
                    </button>
                    <div className="flex-1 relative">
                      <Input
                        required
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                        className={q.correctAnswer === oIdx ? 'border-emerald-200 bg-emerald-50/30 font-semibold' : ''}
                      />
                    </div>
                    {q.options.length > 2 && (
                      <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="mt-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {q.options.length < 6 && (
                  <button type="button" onClick={() => addOption(qIdx)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 mt-3 pl-9 transition-colors">
                    <Plus size={16} /> Add Option
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 font-semibold hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} /> Add Another Question
        </button>

        <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Discard</button>
          <button
            type="submit"
            disabled={isSaving || !quizTitle.trim()}
            className="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Quiz</>}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Content Item Row
const ContentItem = ({ item, isLocked, onDelete }) => {
  const typeConfig = {
    lesson: {
      icon: item.videoUrl ? <Video size={18} /> : <FileText size={18} />,
      bg: 'bg-white hover:border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600',
      label: item.videoUrl ? 'Video Lesson' : 'Text Lesson',
      badgeColor: 'text-blue-600 bg-blue-50'
    },
    quiz: {
      icon: <HelpCircle size={18} />,
      bg: 'bg-white hover:border-indigo-200',
      iconBg: 'bg-indigo-50 text-indigo-600',
      label: 'Quiz Assessment',
      badgeColor: 'text-indigo-600 bg-indigo-50'
    },
    assignment: {
      icon: <ClipboardList size={18} />,
      bg: 'bg-white hover:border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600',
      label: item.totalMarks ? `${item.totalMarks} Marks` : 'Ungraded Task',
      badgeColor: 'text-amber-600 bg-amber-50'
    },
  };
  const cfg = typeConfig[item._type] || typeConfig.lesson;

  return (
    <div className={`flex items-center justify-between p-4 ${cfg.bg} rounded-xl border border-slate-200 shadow-sm transition-all group`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
          {cfg.icon}
        </div>
        <div>
          <h4 className="text-[15px] font-bold text-slate-800">{item.title}</h4>
          <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 ${cfg.badgeColor}`}>
            {cfg.label}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isLocked && (
          <button 
            onClick={() => onDelete(item._id, item._type)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
const CurriculumBuilder = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [educatorName, setEducatorName] = useState('Educator');
  const [userProfile, setUserProfile] = useState(null);


  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [moduleContent, setModuleContent] = useState({});


  const [loadingContent, setLoadingContent] = useState(false);

  const [activeModuleId, setActiveModuleId] = useState(null);

  // Tab State
  const [activeTab, setActiveTab] = useState('curriculum');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isSavingModule, setIsSavingModule] = useState(false);

  // Active form state: null | 'lesson' | 'quiz' | 'assignment'
  const [activeForm, setActiveForm] = useState(null);

  // Lesson form state
  const [newLessonData, setNewLessonData] = useState({ 
    title: '', 
    lessonType: 'video', 
    videoDescription: '', 
    articleBody: '', 
    video: null, 
    videoNotes: null,
    articleImage: null 
  });
  const [isSavingLesson, setIsSavingLesson] = useState(false);

  // Assignment form state
  const [newAssignmentData, setNewAssignmentData] = useState({ title: '', instructions: '', questionPdf: null, totalMarks: '' });
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [profileRes, courseRes, modulesRes] = await Promise.all([
          axios.get('/api/auth/profile', config),
          axios.get(`/api/courses/${courseId}`, config),
          axios.get(`/api/courses/${courseId}/modules`, config)
        ]);
        setUserProfile(profileRes.data);
        setEducatorName(profileRes.data?.name || 'Educator');
        setCourse(courseRes.data?.data || courseRes.data);
        const modulesData = modulesRes.data?.data || modulesRes.data || [];
        setModules(Array.isArray(modulesData) ? modulesData : []);
      } catch (err) {
        console.error('Error fetching curriculum data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, navigate]);

  const toggleModule = async (moduleId) => {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
      setActiveForm(null);
      setActiveModuleId(null);
      return;
    }
    setExpandedModuleId(moduleId);

    if (!moduleContent[moduleId]) {
      try {
        setLoadingContent(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [lessonsRes, assignmentsRes, quizzesRes] = await Promise.all([
          axios.get(`/api/courses/${courseId}/modules/${moduleId}/lessons`, config),
          axios.get(`/api/courses/${courseId}/modules/${moduleId}/assignments`, config),
          axios.get(`/api/courses/${courseId}/modules/${moduleId}/quizzes`, config).catch(() => ({ data: [] }))
        ]);
        const lessons = (lessonsRes.data?.data || lessonsRes.data || []).map(l => ({ ...l, _type: 'lesson' }));
        const assignments = (assignmentsRes.data?.data || assignmentsRes.data || []).map(a => ({ ...a, _type: 'assignment' }));
        const quizzes = (quizzesRes.data?.data || quizzesRes.data || []).map(q => ({ ...q, _type: 'quiz' }));
        const unified = [...lessons, ...assignments, ...quizzes].sort((a, b) => (a.order || 0) - (b.order || 0));
        setModuleContent(prev => ({ ...prev, [moduleId]: unified }));
      } catch (err) {
        console.error('Error fetching module content:', err);
      } finally {
        setLoadingContent(false);
      }
    }
  };

  const openForm = (type, moduleId) => {
    setActiveForm(type);
    setActiveModuleId(moduleId);
  };

  const closeForm = () => {
    setActiveForm(null);
    setActiveModuleId(null);
    setNewLessonData({ 
      title: '', 
      lessonType: 'video', 
      videoDescription: '', 
      articleBody: '', 
      video: null, 
      videoNotes: null,
      articleImage: null 
    });
    setNewAssignmentData({ title: '', instructions: '', questionPdf: null, totalMarks: '' });
  };

  const pushItem = (moduleId, item) => {
    setModuleContent(prev => ({
      ...prev,
      [moduleId]: [...(prev[moduleId] || []), item]
    }));
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    try {
      setIsSavingModule(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/courses/${courseId}/modules`,
        { title: newModuleTitle.trim(), order: modules.length + 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModules(prev => [...prev, res.data?.data || res.data]);
      setNewModuleTitle('');
      setIsAddingModule(false);
    } catch (err) {
      console.error('Error adding module:', err);
      alert('Failed to add module. Please try again.');
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure? This will delete all lessons and assignments inside this module!')) return;
    const loadingToast = toast.loading('Deleting module...');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/courses/${courseId}/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModules(prev => prev.filter(m => m._id !== moduleId));
      const newContent = { ...moduleContent };
      delete newContent[moduleId];
      setModuleContent(newContent);
      toast.success('Module deleted', { id: loadingToast });
    } catch (err) {
      console.error('Error deleting module:', err);
      toast.error('Failed to delete module', { id: loadingToast });
    }
  };

  const handleDeleteContent = async (itemId, type, moduleId) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    const loadingToast = toast.loading(`Deleting ${type}...`);
    try {
      const token = localStorage.getItem('token');
      const plural = type === 'quiz' ? 'quizzes' : type + 's';
      await axios.delete(`/api/courses/${courseId}/modules/${moduleId}/${plural}/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModuleContent(prev => ({
        ...prev,
        [moduleId]: prev[moduleId].filter(i => i._id !== itemId)
      }));
      toast.success(`${type} deleted`, { id: loadingToast });
    } catch (err) {
      console.error('Error deleting content:', err);
      toast.error(`Failed to delete ${type}`, { id: loadingToast });
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (!newLessonData.title.trim()) return;
    try {
      setIsSavingLesson(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newLessonData.title.trim());
      formData.append('lessonType', newLessonData.lessonType);
      
      // Map mode-specific content to the generic 'content' field for the backend
      const content = newLessonData.lessonType === 'video' 
        ? newLessonData.videoDescription 
        : newLessonData.articleBody;
      formData.append('content', content.trim());

      if (newLessonData.lessonType === 'video') {
        if (newLessonData.video) formData.append('video', newLessonData.video);
        if (newLessonData.videoNotes) formData.append('notes', newLessonData.videoNotes);
      } else {
        if (newLessonData.articleImage) formData.append('notes', newLessonData.articleImage);
      }

      const res = await axios.post(`/api/courses/${courseId}/modules/${activeModuleId}/lessons`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      pushItem(activeModuleId, { ...(res.data?.data || res.data), _type: 'lesson' });
      closeForm();
    } catch (err) {
      alert('Failed to save lesson.');
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!newAssignmentData.title.trim()) return;
    try {
      setIsSavingAssignment(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newAssignmentData.title.trim());
      formData.append('instructions', newAssignmentData.instructions.trim());
      formData.append('totalMarks', newAssignmentData.totalMarks);
      if (newAssignmentData.questionPdf) formData.append('questionPdf', newAssignmentData.questionPdf);
      const res = await axios.post(`/api/courses/${courseId}/modules/${activeModuleId}/assignments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      pushItem(activeModuleId, { ...(res.data?.data || res.data), _type: 'assignment' });
      closeForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save assignment.');
    } finally {
      setIsSavingAssignment(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!window.confirm("Submit this course for admin review? You won't be able to edit it until it's reviewed.")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/courses/${courseId}/submit-review`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Course submitted successfully!');
      navigate('/educator/courses');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit course for review. Ensure you have at least one module.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Loading Course Environment...</p>
      </div>
    );
  }

  const courseTitle = course?.title || 'Course Builder';
  const totalItems = Object.values(moduleContent).reduce((sum, items) => sum + items.length, 0);
  const isOwner = userProfile?._id === course?.educatorId?._id || userProfile?._id === course?.educatorId;
  const isLocked = course?.status === 'approved';

  return (
    <div className="min-h-screen bg-slate-50">
      <EducatorHeader educatorName={educatorName} activePage="/educator/courses" />

      {/* Sticky Top Bar - Clean and Professional */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-[64px] z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link to="/educator/courses" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="h-5 w-[1px] bg-slate-300" />
            <div className="hidden md:block">
              <h1 className="text-sm font-bold text-slate-800">{courseTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
              <Layers size={14} className="text-indigo-500" />
              {modules.length} Modules · {totalItems} Contents
            </div>
            
            {/* Status Badge */}
            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${
              course?.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              course?.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
              'bg-slate-50 text-slate-600 border-slate-100'
            }`}>
              {course?.status || 'draft'}
            </div>

            {course?.status === 'draft' && (
              <button
                onClick={handleSubmitReview}
                className="px-5 py-2 bg-slate-900 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 size={16} />
                Submit for Review
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-10 pb-32">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                {isLocked ? 'Course Curriculum Hub' : activeTab === 'curriculum' ? 'Curriculum Builder' : 'Grading & Certification'}
              </h2>
              <p className="text-slate-500 text-lg">
                {isLocked 
                  ? 'Overview of the course structure and live content modules.' 
                  : activeTab === 'curriculum'
                  ? 'Structure your course by creating modules and learning materials.'
                  : 'Define the rules of success, weighting, and certification criteria.'}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 mb-8">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`pb-4 px-6 text-sm font-bold transition-all relative ${activeTab === 'curriculum' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Curriculum Modules
              {activeTab === 'curriculum' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.2)]" />}
            </button>
            <button
              onClick={() => setActiveTab('grading')}
              className={`pb-4 px-6 text-sm font-bold transition-all relative ${activeTab === 'grading' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Grading & Success Rules
              {activeTab === 'grading' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.2)]" />}
            </button>

            {isOwner && (
              <button
                onClick={() => setActiveTab('collaborators')}
                className={`pb-4 px-6 text-sm font-bold transition-all relative ${activeTab === 'collaborators' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Collaborators
                {activeTab === 'collaborators' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.2)]" />}
              </button>
            )}
          </div>
        </div>

        {activeTab === 'grading' ? (
          <GradingConfiguration
            courseId={courseId}
            initialConfig={course?.gradingConfiguration}
            onSaved={(updatedCourse) => setCourse(updatedCourse)}
          />
        ) : activeTab === 'collaborators' ? (
          <CollaborationManager courseId={courseId} isOwner={isOwner} />
        ) : (
          <>
            <div className="space-y-5">
              {modules.map((module, index) => {
                const isExpanded = expandedModuleId === module._id;
                const items = moduleContent[module._id] || [];

                return (
                  <div key={module._id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-200 shadow-md shadow-indigo-500/5' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}>

                    {/* Module Header Bar */}
                    <div
                      onClick={() => toggleModule(module._id)}
                      className={`p-5 flex items-center justify-between cursor-pointer group transition-colors ${isExpanded ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className="text-slate-300 group-hover:text-slate-500 transition-colors hidden sm:block">
                          <GripVertical size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Module {index + 1}</p>
                          <h3 className="text-lg font-bold text-slate-800">{module.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex gap-2">
                          {items.length > 0 ? (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-md">{items.length} Items</span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">Empty Layout</span>
                          )}
                        </div>
                        <div className={`p-1.5 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-indigo-100 text-indigo-600' : 'text-slate-400 bg-slate-100 group-hover:bg-slate-200'}`}>
                          <ChevronDown size={18} />
                        </div>
                        {!isLocked && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteModule(module._id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Content Area */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/30 p-5 sm:p-7 space-y-5">

                        {/* Content Items List */}
                        {loadingContent && !moduleContent[module._id] ? (
                          <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-indigo-400" size={28} /></div>
                        ) : items.length === 0 && !activeForm ? (
                          <div className="py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                            <Layers className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                            <p className="text-sm font-semibold text-slate-500">Module is empty</p>
                            <p className="text-xs text-slate-400 mt-1">Add your first lesson, quiz, or assignment below.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {items.map((item) => (
                              <ContentItem 
                                key={item._id} 
                                item={item} 
                                isLocked={isLocked} 
                                onDelete={(itemId, type) => handleDeleteContent(itemId, type, module._id)}
                              />
                            ))}
                          </div>
                        )}

                        {/* Forms */}
                        {activeForm === 'lesson' && activeModuleId === module._id ? (
                          <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-lg shadow-blue-500/5 mt-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                            <div className="flex justify-between items-center mb-5 pt-1">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                  {newLessonData.lessonType === 'video' ? <Video size={20} /> : <FileText size={20} />}
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-slate-800 tracking-tight">Add Lesson</h4>
                                  <p className="text-xs text-slate-500 font-medium">Choose the lesson format below</p>
                                </div>
                              </div>
                              <button onClick={closeForm} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button>
                            </div>

                            {/* Lesson Type Toggle */}
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
                              <button
                                type="button"
                                onClick={() => setNewLessonData({ ...newLessonData, lessonType: 'video', notes: null })}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${newLessonData.lessonType === 'video' ? 'bg-white text-blue-600 shadow-md shadow-blue-100' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                <Video size={16} /> 📺 Video Lesson
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewLessonData({ ...newLessonData, lessonType: 'article', video: null })}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${newLessonData.lessonType === 'article' ? 'bg-white text-emerald-600 shadow-md shadow-emerald-100' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                <FileText size={16} /> 📝 Article Lesson
                              </button>
                            </div>

                            <form onSubmit={handleLessonSubmit} className="space-y-5">
                              <div>
                                <Label>Lesson Title *</Label>
                                <Input autoFocus required placeholder="e.g. Introduction to React Components" value={newLessonData.title} onChange={e => setNewLessonData({ ...newLessonData, title: e.target.value })} />
                              </div>

                              {/* Video Mode */}
                              {newLessonData.lessonType === 'video' && (
                                <div>
                                  <Label>Video File *</Label>
                                  <label className="flex flex-col items-center justify-center w-full min-h-[150px] bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-blue-50/50 hover:border-blue-300 transition-colors group">
                                    {newLessonData.video ? (
                                      <div className="text-center p-4">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2"><Check size={20} strokeWidth={3} /></div>
                                        <p className="text-sm font-semibold text-slate-700 truncate max-w-[220px]">{newLessonData.video.name}</p>
                                        <button type="button" onClick={e => { e.preventDefault(); setNewLessonData({ ...newLessonData, video: null }); }} className="text-xs text-red-500 font-bold mt-1 hover:underline">Remove</button>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center py-6">
                                        <UploadCloud className="w-9 h-9 mb-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                        <p className="text-sm font-semibold text-slate-600">Click to upload video</p>
                                        <p className="text-xs text-slate-500 mt-1">MP4, WebM — Max 500MB</p>
                                      </div>
                                    )}
                                    <input type="file" className="hidden" accept="video/*" onChange={e => setNewLessonData({ ...newLessonData, video: e.target.files[0] })} />
                                  </label>
                                  <div className="mt-4">
                                    <Label>Short Description (optional)</Label>
                                    <textarea rows="3" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-700 placeholder:text-slate-400" placeholder="Brief summary of what this video covers..." value={newLessonData.videoDescription} onChange={e => setNewLessonData({ ...newLessonData, videoDescription: e.target.value })}></textarea>
                                  </div>

                                  <div className="mt-6 pt-6 border-t border-slate-100">
                                    <Label>Lecture Notes <span className="text-slate-400 font-normal">(optional PDF/Image)</span></Label>
                                    <label className="flex items-center gap-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition-all group">
                                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform shadow-sm">
                                        <FileUp size={20} />
                                      </div>
                                      <div className="flex-1 overflow-hidden">
                                        {newLessonData.videoNotes ? (
                                          <p className="text-sm font-bold text-slate-700 truncate">{newLessonData.videoNotes.name}</p>
                                        ) : (
                                          <p className="text-sm font-semibold text-slate-500">Upload notes for this video lesson...</p>
                                        )}
                                      </div>
                                      {newLessonData.videoNotes && (
                                        <button type="button" onClick={e => { e.preventDefault(); setNewLessonData({ ...newLessonData, videoNotes: null }); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                                      )}
                                      <input type="file" className="hidden" accept=".pdf,image/*" onChange={e => setNewLessonData({ ...newLessonData, videoNotes: e.target.files[0] })} />
                                    </label>
                                  </div>
                                </div>
                              )}

                              {/* Article Mode */}
                              {newLessonData.lessonType === 'article' && (
                                <div className="space-y-4">
                                  <div>
                                    <Label>Reading Content *</Label>
                                    <textarea rows="8" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-700 placeholder:text-slate-400 leading-relaxed" placeholder="Write the full reading material here. Explain concepts clearly for students..." value={newLessonData.articleBody} onChange={e => setNewLessonData({ ...newLessonData, articleBody: e.target.value })}></textarea>
                                  </div>
                                  <div>
                                    <Label>Visual Aid — Image <span className="text-slate-400 font-normal">(optional)</span></Label>
                                    <label className="flex flex-col items-center justify-center w-full min-h-[130px] bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-300 transition-colors group">
                                      {newLessonData.articleImage ? (
                                        <div className="text-center p-4">
                                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2"><Check size={20} strokeWidth={3} /></div>
                                          <p className="text-sm font-semibold text-slate-700 truncate max-w-[220px]">{newLessonData.articleImage.name}</p>
                                          <button type="button" onClick={e => { e.preventDefault(); setNewLessonData({ ...newLessonData, articleImage: null }); }} className="text-xs text-red-500 font-bold mt-1 hover:underline">Remove</button>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center py-5">
                                          <FileUp className="w-8 h-8 mb-2 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                          <p className="text-sm font-semibold text-slate-600">Upload visual aid image</p>
                                          <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP</p>
                                        </div>
                                      )}
                                      <input type="file" className="hidden" accept="image/*" onChange={e => setNewLessonData({ ...newLessonData, articleImage: e.target.files[0] })} />
                                    </label>
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={closeForm} className="px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                                <button type="submit" disabled={isSavingLesson || !newLessonData.title.trim()} className={`px-8 py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 ${newLessonData.lessonType === 'video' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}>
                                  {isSavingLesson ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : <><Save size={18} /> Save Lesson</>}
                                </button>
                              </div>
                            </form>
                          </div>

                        ) : activeForm === 'quiz' && activeModuleId === module._id ? (
                          <QuizBuilder
                            moduleId={module._id}
                            courseId={courseId}
                            onSave={(quiz) => {
                              pushItem(module._id, { ...quiz, _type: 'quiz' });
                              closeForm();
                            }}
                            onCancel={closeForm}
                          />

                        ) : activeForm === 'assignment' && activeModuleId === module._id ? (
                          <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-lg shadow-amber-500/5 mt-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                            <div className="flex justify-between items-center mb-6 pt-1">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><ClipboardList size={20} /></div>
                                <div>
                                  <h4 className="text-lg font-bold text-slate-800 tracking-tight">Add Assignment</h4>
                                  <p className="text-xs text-slate-500 font-medium">Create a task for students to complete and submit</p>
                                </div>
                              </div>
                              <button onClick={closeForm} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAssignmentSubmit} className="space-y-5">
                              <div>
                                <Label>Assignment Title *</Label>
                                <Input required placeholder="e.g. Build a Functional React Component" value={newAssignmentData.title} onChange={e => setNewAssignmentData({ ...newAssignmentData, title: e.target.value })} className="focus:ring-amber-500/20 focus:border-amber-500" />
                              </div>
                              <div>
                                <Label>Total Marks (Optional)</Label>
                                <Input type="number" placeholder="e.g. 100" value={newAssignmentData.totalMarks} onChange={e => setNewAssignmentData({ ...newAssignmentData, totalMarks: e.target.value })} className="focus:ring-amber-500/20 focus:border-amber-500 max-w-xs" />
                              </div>
                              <div>
                                <Label>Instructions</Label>
                                <textarea rows="4" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700 placeholder:text-slate-400 text-sm" placeholder="Provide detailed instructions for the task..." value={newAssignmentData.instructions} onChange={e => setNewAssignmentData({ ...newAssignmentData, instructions: e.target.value })}></textarea>
                              </div>
                              <div>
                                <Label>Question Paper / Assets (.pdf)</Label>
                                <input type="file" accept=".pdf" onChange={e => setNewAssignmentData({ ...newAssignmentData, questionPdf: e.target.files[0] })} className="w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-amber-50 file:text-amber-700 file:font-semibold hover:file:bg-amber-100 transition-all cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-1.5" />
                              </div>
                              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={closeForm} className="px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                                <button type="submit" disabled={isSavingAssignment || !newAssignmentData.title.trim()} className="px-8 py-2.5 bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:hover:scale-100">
                                  {isSavingAssignment ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Assignment</>}
                                </button>
                              </div>
                            </form>
                          </div>

                        ) : !isLocked && (
                          /* 3-Button Premium Action Strip */
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            <button
                              onClick={() => openForm('lesson', module._id)}
                              className="py-4 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 transition-all flex items-center justify-center gap-3 group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors"><Video size={16} /></div>
                              Add Lesson
                            </button>
                            <button
                              onClick={() => openForm('quiz', module._id)}
                              className="py-4 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 transition-all flex items-center justify-center gap-3 group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors"><HelpCircle size={16} /></div>
                              Add Quiz
                            </button>
                            <button
                              onClick={() => openForm('assignment', module._id)}
                              className="py-4 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/5 transition-all flex items-center justify-center gap-3 group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors"><ClipboardList size={16} /></div>
                              Add Assignment
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!isLocked && (
              /* Add Module Container */
              <div className="mt-8">
                {isAddingModule ? (
                  <div className="bg-white rounded-2xl border border-blue-200 p-8 shadow-xl shadow-blue-500/10 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><BookOpen size={24} /></div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">New Module</h3>
                        <p className="text-sm text-slate-500 font-medium">Create a new section for your course</p>
                      </div>
                    </div>
                    <form onSubmit={handleAddModule}>
                      <Input autoFocus placeholder="e.g. Chapter 1: Getting Started" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} className="text-lg font-bold mb-6 py-4 px-5" />
                      <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAddingModule(false)} className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                        <button type="submit" disabled={isSavingModule || !newModuleTitle.trim()} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:hover:scale-100">
                          {isSavingModule ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                          Create Module
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingModule(true)}
                    className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-semibold hover:border-slate-400 hover:text-slate-700 hover:bg-slate-100/50 transition-all flex items-center justify-center gap-3 group"
                  >
                    <PlusCircle size={24} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                    Add New Module
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CurriculumBuilder;
