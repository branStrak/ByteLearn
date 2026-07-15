import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  User,
  Users,
  Star,
  Clock,
  FileText,
  HelpCircle,
  BookOpen
} from 'lucide-react';

import CourseReviews from '../../components/CourseReviews';
import { CheckCircle2, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('syllabus'); // 'syllabus', 'reviews'
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/courses/${id}`);
        let courseData = response.data.data;

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const profileRes = await axios.get('/api/auth/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const user = profileRes.data;

            const isCoInstructor = courseData.coInstructors?.some(ci =>
              ci.userId?._id === user._id || ci.userId === user._id
            );

            if (((user.role === 'educator' || user.role === 'admin') && courseData.educatorId?._id === user._id) || isCoInstructor) {
              courseData.isOwner = true;
            } else if (user.role === 'student' || !user.role) {
              const enrollmentRes = await axios.get('/api/enrollments/my-courses', {
                headers: { Authorization: `Bearer ${token}` }
              });
              const enrollments = enrollmentRes.data?.data || [];
              const isEnrolled = enrollments.some(e => {
                const eCourseId = e.courseId?._id || e.courseId;
                return eCourseId === courseData._id;
              });
              courseData.isEnrolled = isEnrolled;
            }
          } catch (err) {
            console.error('Failed to fetch user specific status', err);
          }
        }

        setCourse(courseData);
        setError(null);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError(err.response?.data?.message || 'Failed to fetch course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);



  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyCourse = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);

      if (course.isPaid) {
        const res = await loadRazorpayScript();
        if (!res) {
          alert("Razorpay SDK failed to load. Are you online?");
          return;
        }

        const orderResponse = await axios.post('/api/payment/checkout', { courseId: id }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { order } = orderResponse.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "ByteLearn LMS",
          description: `Enrollment for ${course.title}`,
          order_id: order.id,
          handler: async (response) => {
            try {
              const verifyResponse = await axios.post('/api/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (verifyResponse.data.success) {
                setEnrolling(false);
                setShowSuccessModal(true);
              }
            } catch (err) {
              console.error("Verification failed:", err);
              alert(err.response?.data?.message || "Payment verification failed. Please contact support.");
            }
          },
          theme: {
            color: "#2563EB",
          },
          modal: {
            ondismiss: function () {
              setEnrolling(false);
            }
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
        await axios.post('/api/enrollments/enroll', { courseId: id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        alert(err.response?.data?.message || 'Failed to enroll');
      }
    } finally {
      if (!course.isPaid) {
        setEnrolling(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error || 'Course not found'}</p>
          <Link to="/browse" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans mb-16">

      <main className="flex-grow max-w-[1240px] w-full mx-auto px-6 py-8">

        <Link to="/browse" className="inline-flex items-center text-slate-500 hover:text-blue-600 text-[15px] font-medium mb-6 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Browse
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">

          <div className="lg:w-[70%] flex flex-col gap-6">

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-[32px] font-bold text-slate-800 tracking-tight leading-tight pr-4">
                  {course.title}
                </h1>
                <div className="mt-1 flex-shrink-0">
                  {course.isPaid ? (
                    <span className="bg-blue-50 text-blue-700 font-semibold px-4 py-1.5 rounded-lg text-sm border border-blue-100">
                      ₹{course.price}
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 font-semibold px-4 py-1.5 rounded-lg text-sm border border-emerald-100">
                      Free
                    </span>
                  )}
                </div>
              </div>

              {/* Meta Row with Multiple Educators */}
              <div className="flex flex-wrap items-center gap-6 text-slate-500 text-[15px]">
                <div className="flex items-center">
                  <div className="flex -space-x-3 overflow-hidden">
                    {/* Primary Educator Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 z-10 transition-transform hover:z-30 hover:scale-105">
                      <img 
                        src={course.educatorId?.profilePicture || "https://ui-avatars.com/api/?name=" + (course.educatorId?.name || "E")} 
                        alt={course.educatorId?.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    {/* Co-Instructor Avatars */}
                    {course.coInstructors?.map((ci, idx) => (
                      <div 
                        key={ci.userId?._id || idx} 
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-slate-50 relative transition-all hover:z-30 hover:scale-105"
                        style={{ zIndex: (course.coInstructors.length - idx) }}
                      >
                        <img 
                          src={ci.userId?.profilePicture || "https://ui-avatars.com/api/?name=" + (ci.userId?.name || "C")} 
                          alt={ci.userId?.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col ml-1">
                    <span className="font-bold text-slate-800 leading-[1.3] mb-1">
                      {[
                        course.educatorId?.name,
                        ...(course.coInstructors?.map(ci => ci.userId?.name) || [])
                      ].filter(Boolean).join(' • ')}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      {(course.coInstructors?.length > 0) ? 'Instructors Team' : 'Lead Instructor'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-slate-400" />
                  <span>{course.enrolledStudents || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Star size={18} className="text-amber-400 fill-amber-400" />
                  <span>{(course.rating || 0).toFixed(1)}</span>
                  <span className="text-slate-400 text-sm font-normal">
                    {course.totalRatings > 0
                      ? `(${course.totalRatings} ${course.totalRatings === 1 ? 'review' : 'reviews'})`
                      : '(No reviews)'}
                  </span>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">About This Course</h2>
              <div className="text-slate-600 text-[15.5px] leading-relaxed whitespace-pre-wrap">
                {course.description}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-8 border-b border-slate-200 mt-6 mb-8">
              <button
                onClick={() => setActiveTab('syllabus')}
                className={`pb-4 text-[15px] font-bold transition-all relative ${activeTab === 'syllabus' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Course Syllabus
                {activeTab === 'syllabus' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-sm" />}
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 text-[15px] font-bold transition-all relative ${activeTab === 'reviews' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Reviews
                {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-sm" />}
              </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-300">
              {activeTab === 'syllabus' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Course Content</h2>

                  {course.modules && course.modules.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {course.modules.map((module, index) => (
                        <div key={module._id} className="border border-slate-200 rounded-xl p-5 mb-1 transition-all">
                          {/* Module Header */}
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 text-[16px]">
                              Module {index + 1}: {module.title}
                            </h3>
                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[13px] font-medium">
                              {module.lessons?.length || 0} lessons
                            </span>
                          </div>

                          {/* Sub Items (Lessons) */}
                          <div className="flex flex-col gap-0.5 mt-2">
                            {module.lessons && module.lessons.map((lesson) => (
                              <div key={lesson._id} className="flex items-center justify-between py-2 text-slate-600">
                                <div className="flex items-center gap-3 flex-grow">
                                  <Clock size={16} className="text-slate-400 flex-shrink-0" />
                                  <span className="text-[14.5px] font-medium text-slate-600">{lesson.title}</span>
                                </div>
                                <span className="text-[14px] text-slate-500 font-medium pl-4">{lesson.duration ? `${Math.floor(lesson.duration)}:00` : '15:30'}</span>
                              </div>
                            ))}

                            {module.assignments && module.assignments.length > 0 && (
                              <div className="mt-2 flex flex-col gap-2">
                                {module.assignments.map((assignment) => (
                                  <div key={assignment._id} className="flex items-center gap-3 ml-2">
                                    <span className="flex items-center gap-2.5 text-amber-600 bg-amber-50 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold border border-amber-100/50 w-max tracking-tight">
                                      <FileText size={15} /> {assignment.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {module.quizzes && module.quizzes.length > 0 && (
                              <div className="mt-2 flex flex-col gap-2">
                                {module.quizzes.map((quiz) => (
                                  <div key={quiz._id} className="flex items-center gap-3 ml-2">
                                    <span className="flex items-center gap-2.5 text-purple-600 bg-purple-50 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold border border-purple-100/50 w-max tracking-tight">
                                      <HelpCircle size={15} /> {quiz.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[15px]">No modules available for this course.</p>
                  )}
                </div>
              )}



              {activeTab === 'reviews' && (
                <CourseReviews courseId={course._id} />
              )}
            </div>
          </div>

          <div className="lg:w-[30%] relative">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                {/* Thumbnail Cover Image */}
                <div className="w-full h-[220px] bg-slate-100 relative rounded-xl overflow-hidden mb-6">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-slate-400">
                      <BookOpen size={48} className="opacity-20" />
                    </div>
                  )}
                </div>

                {/* Action Layout */}
                <div className="px-2 pb-2 mt-2">
                  {course.isOwner ? (
                    <Link
                      to={`/course/${course._id}/curriculum`}
                      className="flex items-center justify-center w-full bg-slate-900 border-2 border-slate-900 text-white hover:bg-slate-800 font-bold py-3 rounded-xl transition-all mb-8 shadow-sm text-[15px]"
                    >
                      Manage Curriculum <ArrowRight size={18} className="ml-2" />
                    </Link>
                  ) : course.isEnrolled ? (
                    <Link
                      to={`/learn/${course._id}`}
                      className="flex items-center justify-center w-full bg-white border-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50 font-bold py-3 rounded-xl transition-all mb-8 shadow-sm text-[15px]"
                    >
                      Continue Learning <ArrowRight size={18} className="ml-2" />
                    </Link>
                  ) : (
                    <button
                      onClick={handleBuyCourse}
                      disabled={enrolling}
                      className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all mb-8 text-[15px]"
                    >
                      {enrolling ? 'Processing...' : (course.isPaid ? 'Buy Now' : 'Enroll Now')}
                    </button>
                  )}

                  <div className="mb-2">
                    <h4 className="font-bold text-slate-800 text-[15px] mb-4">This course includes:</h4>

                    <div className="flex flex-col gap-3.5">
                      <div className="flex items-center gap-3 text-slate-600">
                        <BookOpen size={18} className="text-blue-500 flex-shrink-0" />
                        <span className="text-[14px] font-medium">{course.modules?.length || 0} modules with video lessons</span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600">
                        <FileText size={18} className="text-amber-500 flex-shrink-0" />
                        <span className="text-[14px] font-medium">Assignments with feedback</span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600">
                        <HelpCircle size={18} className="text-purple-500 flex-shrink-0" />
                        <span className="text-[14px] font-medium">Quizzes to test your knowledge</span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600 pb-2">
                        <div className="bg-[#118A51] text-white text-[12px] font-bold px-2 py-1 rounded w-max flex-shrink-0 tracking-wide">
                          Certificate
                        </div>
                        <span className="text-[14px] font-medium">upon completion</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
    
    <AnimatePresence>
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuccessModal(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[24px] shadow-2xl p-8 max-w-[400px] w-full text-center overflow-hidden"
          >
            {/* Top decorative element */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
            
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 className="text-emerald-500" size={32} />
            </div>
            
            <h3 className="text-[22px] font-bold text-slate-900 mb-2 tracking-tight">Enrollment Successful!</h3>
            <p className="text-slate-500 text-[15px] leading-relaxed mb-8 px-2">
              Welcome aboard! You can now access all course materials and start your learning journey.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/my-courses')}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                Go to My Courses <ArrowRight size={18} />
              </button>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-white text-slate-500 hover:text-slate-800 font-semibold py-2 rounded-xl transition-all text-sm"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </>
);
};

export default CourseDetails;
