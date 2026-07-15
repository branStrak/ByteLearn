import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Trophy, 
  Percent, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw,
  Save,
  Loader2
} from 'lucide-react';
import axios from 'axios';

const GradingConfiguration = ({ courseId, initialConfig, onSaved }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { success: boolean, message: string }
  
  const [config, setConfig] = useState({
    quizWeight: 50,
    assignmentWeight: 50,
    minGradeToPass: 70,
    isCertificationEnabled: false,
    gradingScale: [
      { label: 'Distinction', minScore: 90 },
      { label: 'Merit', minScore: 80 },
      { label: 'Pass', minScore: 70 }
    ]
  });

  useEffect(() => {
    if (initialConfig) {
      setConfig({
        ...config,
        ...initialConfig,
        gradingScale: initialConfig.gradingScale?.length > 0 
          ? initialConfig.gradingScale 
          : config.gradingScale
      });
    }
  }, [initialConfig]);

  const totalWeight = Number(config.quizWeight) + Number(config.assignmentWeight);
  const isWeightValid = totalWeight === 100;

  const handleLevelChange = (index, field, value) => {
    const newScale = [...config.gradingScale];
    newScale[index] = { ...newScale[index], [field]: field === 'minScore' ? Number(value) : value };
    setConfig({ ...config, gradingScale: newScale });
  };

  const addGradeLevel = () => {
    setConfig({
      ...config,
      gradingScale: [...config.gradingScale, { label: '', minScore: 0 }]
    });
  };

  const removeGradeLevel = (index) => {
    setConfig({
      ...config,
      gradingScale: config.gradingScale.filter((_, i) => i !== index)
    });
  };

  const loadStandardScale = () => {
    setConfig({
      ...config,
      gradingScale: [
        { label: 'A', minScore: 90 },
        { label: 'B', minScore: 80 },
        { label: 'C', minScore: 70 },
        { label: 'D', minScore: 60 }
      ]
    });
  };

  const handleSave = async () => {
    if (!isWeightValid) {
      setSaveStatus({ success: false, message: 'Total weight must be exactly 100%' });
      return;
    }

    // Validation: Check for empty labels or scores
    const invalidGrades = config.gradingScale.some(g => !g.label.trim() || g.minScore === null || g.minScore === undefined);
    if (invalidGrades) {
        setSaveStatus({ 
          success: false, 
          message: 'All grade levels must have a label and a minimum score.' 
        });
        return;
    }

    // Validation: Scale must be descending
    const scale = config.gradingScale;
    for (let i = 0; i < scale.length - 1; i++) {
      if (Number(scale[i].minScore) <= Number(scale[i+1].minScore)) {
        setSaveStatus({ 
          success: false, 
          message: `Grading scale error: "${scale[i].label}" (${scale[i].minScore}%) must have a higher score than "${scale[i+1].label}" (${scale[i+1].minScore}%)` 
        });
        return;
      }
    }

    // Validation: Threshold coverage
    if (config.isCertificationEnabled) {
        const coversThreshold = scale.some(grade => Number(grade.minScore) <= Number(config.minGradeToPass));
        if (!coversThreshold) {
            setSaveStatus({
                success: false,
                message: `Certification is enabled, but no grade level covers the "Minimum Grade to Pass" (${config.minGradeToPass}%).`
            });
            return;
        }
    }

    setIsSaving(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/courses/${courseId}`, {
        gradingConfiguration: config
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSaveStatus({ success: true, message: 'Grading configuration saved successfully!' });
      if (onSaved) onSaved(res.data.data);
    } catch (err) {
      console.error('Grading save error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save configuration';
      setSaveStatus({ 
        success: false, 
        message: `Error: ${errorMsg}` 
      });
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* status notification */}
      {saveStatus && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${saveStatus.success ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
          {saveStatus.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-semibold">{saveStatus.message}</p>
        </div>
      )}

      {/* 1. Master Toggle */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl transition-colors ${config.isCertificationEnabled ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Master Certification</h3>
            <p className="text-sm text-slate-500 font-medium">Enable certificates of completion for students who pass.</p>
          </div>
        </div>
        <button 
          onClick={() => setConfig({ ...config, isCertificationEnabled: !config.isCertificationEnabled })}
          className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${config.isCertificationEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
        >
          <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${config.isCertificationEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 2. Weighting Strategy */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Percent size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Category Weighting</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">
                  <span>Quiz Weight</span>
                  <span className="text-blue-600">{config.quizWeight}%</span>
                </label>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={config.quizWeight} 
                  onChange={(e) => setConfig({ ...config, quizWeight: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">
                  <span>Assignment Weight</span>
                  <span className="text-blue-600">{config.assignmentWeight}%</span>
                </label>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={config.assignmentWeight} 
                  onChange={(e) => setConfig({ ...config, assignmentWeight: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${isWeightValid ? 'bg-blue-50/50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
              <span className="text-sm font-bold text-slate-600">Total Calculation</span>
              <span className={`text-lg font-black ${isWeightValid ? 'text-blue-600' : 'text-red-600'}`}>
                {totalWeight}%
              </span>
            </div>
          </div>
        </div>

        {/* 3. Passing Threshold */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Trophy size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Criteria for Success</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider italic">Minimum Grade to Pass</label>
              <div className="relative">
                <input 
                   type="number" min="0" max="100"
                   value={config.minGradeToPass}
                   onChange={(e) => setConfig({ ...config, minGradeToPass: Number(e.target.value) })}
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-800"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-bold">%</span>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                Students must achieve an overall weighted average above this score to earn a "Pass" status or certificate.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Grading Scale Table */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Settings size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Advanced Grading Scale</h3>
          </div>
          <button 
            type="button" 
            onClick={loadStandardScale}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg transition-colors"
          >
            <RotateCcw size={14} /> Load Standard Scale (90/80/70/60)
          </button>
        </div>

        <div className="overflow-hidden border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Grade Label</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Minimum Score (%)</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 transition-all">
              {config.gradingScale.map((grade, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="text" value={grade.label} placeholder="e.g. Distinction"
                      onChange={(e) => handleLevelChange(idx, 'label', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-slate-800 font-bold placeholder:text-slate-300 placeholder:font-normal"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number" value={grade.minScore} min="0" max="100"
                      onChange={(e) => handleLevelChange(idx, 'minScore', e.target.value)}
                      className="w-24 bg-transparent border-none focus:ring-0 text-blue-600 font-black"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => removeGradeLevel(idx)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {config.gradingScale.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-slate-400 italic text-sm">No grade levels defined. Click "Add Grade Level" to start.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button 
          onClick={addGradeLevel}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add New Grade Level
        </button>
      </div>

      {/* 5. Final Actions */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={isSaving || !isWeightValid}
          className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <><Loader2 size={20} className="animate-spin" /> Saving Config...</> : <><Save size={20} /> Save Performance Rules</>}
        </button>
      </div>

    </div>
  );
};

export default GradingConfiguration;
