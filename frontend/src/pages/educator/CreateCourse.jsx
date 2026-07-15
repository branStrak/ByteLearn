import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Image as ImageIcon, 
  Type, 
  AlignLeft, 
  Tag, 
  Layers, 
  Globe, 
  IndianRupee, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import EducatorHeader from '../../components/layout/EducatorHeader';
import Footer from '../../components/layout/Footer';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [educatorName, setEducatorName] = useState('Educator');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    language: 'English',
    price: 0,
    isPaid: false
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/auth/profile', config);
        setEducatorName(res.data.name);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (thumbnail) {
      data.append('thumbnail', thumbnail);
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.post('/api/courses', data, config);
      if (res.data.success) {
        const courseId = res.data.data._id;
        // Proceed to Phase 2: Curriculum Builder
        // For now, let's just go back to dashboard or stay on edit page
        navigate(`/educator-dashboard`); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <EducatorHeader educatorName={educatorName} activePage="/course/create" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Create New Course</h1>
          <p className="text-slate-500 text-lg">Phase 1: The Blueprint — Define your course essentials.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in zoom-in-95 duration-300">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Type size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Course Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Master the Art of Web Development"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Course Summary</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  placeholder="Tell your students exactly what they will learn..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Catalog Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Tag size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Taxonomy</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Category</label>
                  <select 
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                  >
                    <option value="">Select a category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Difficulty Level</label>
                  <select 
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <IndianRupee size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Pricing & Language</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                    />
                  </div>
                  <div className="pt-9 flex items-center gap-2">
                     <input 
                       type="checkbox" 
                       id="isPaid" 
                       name="isPaid"
                       checked={formData.isPaid}
                       onChange={handleChange}
                       className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                     />
                     <label htmlFor="isPaid" className="text-sm font-bold text-slate-600">Paid Course</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Instructional Language</label>
                  <input
                    type="text"
                    name="language"
                    placeholder="e.g. English"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Visuals */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <ImageIcon size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Course Thumbnail</h2>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                {preview ? (
                  <>
                    <img src={preview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <label htmlFor="thumbnail-upload" className="cursor-pointer bg-white px-4 py-2 rounded-lg text-sm font-bold text-slate-800 shadow-xl border border-slate-100 active:scale-95 transition-transform">Change Media</label>
                    </div>
                  </>
                ) : (
                  <label htmlFor="thumbnail-upload" className="flex flex-col items-center gap-3 cursor-pointer p-10 hover:bg-slate-100/50 transition-colors rounded-2xl w-full">
                     <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg text-slate-400">
                        <ImageIcon size={32} />
                     </div>
                     <div className="text-center">
                        <p className="text-sm font-bold text-slate-800">Upload Course Artwork</p>
                        <p className="text-xs text-slate-400 mt-1">16:9 Aspect Ratio (e.g. 1280x720)</p>
                     </div>
                  </label>
                )}
                <input 
                  type="file" 
                  id="thumbnail-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="w-full md:w-1/2 text-slate-500 space-y-3">
                 <p className="text-sm leading-relaxed italic border-l-4 border-blue-500 pl-4 bg-blue-50/30 py-4 rounded-r-lg">
                   A high-quality thumbnail makes your course stand out in the catalog. Choose a clean, vibrant image that represents the core topic clearly.
                 </p>
                 <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Supported: JPG, PNG, WEBP
                 </div>
              </div>
            </div>
          </div>

          {/* Submission */}
          <div className="flex justify-end gap-4 pt-4 mb-20">
             <button 
               type="button" 
               onClick={() => navigate('/educator-dashboard')}
               className="px-8 py-3.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
             >
               Discard
             </button>
             <button 
               type="submit" 
               disabled={loading}
               className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70"
             >
               {loading ? (
                 <>
                   <Loader2 size={20} className="animate-spin" />
                   Saving Draft...
                 </>
               ) : (
                 <>
                   <Save size={20} />
                   Save Draft & Continue
                 </>
               )}
             </button>
          </div>

        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CreateCourse;
