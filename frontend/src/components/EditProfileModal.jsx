import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  UserCheck,
  GraduationCap,
  Briefcase,
  MapPin,
  BookOpen,
  Calendar,
  School,
  Save,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';

export const PROFESSIONAL_ROLES = [
  'Student',
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'Security Professional',
  'Data Scientist / AI Engineer',
  'DevOps / Cloud Engineer',
  'Mobile App Developer',
  'Systems / Embedded Engineer',
  'Product / Engineering Manager',
  'Other',
];

export const EXPERIENCE_OPTIONS = [
  '< 1 year',
  '1 - 2 years',
  '3 - 5 years',
  '5 - 8 years',
  '8+ years',
];

export default function EditProfileModal({ open, onClose, userData, onProfileUpdated }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [professionalRole, setProfessionalRole] = useState('Student');
  const [experience, setExperience] = useState('');
  const [educationList, setEducationList] = useState([
    { institution: '', year: '', degree: '', course: '', location: '' }
  ]);

  useEffect(() => {
    if (open && userData) {
      setName(userData.name || '');
      setBio(userData.bio || '');
      setProfessionalRole(userData.professionalRole || 'Student');
      setExperience(userData.experience || '');

      if (Array.isArray(userData?.educationList) && userData.educationList.length > 0) {
        setEducationList(userData.educationList.map(item => ({
          institution: item.institution || '',
          year: item.year || '',
          degree: item.degree || '',
          course: item.course || '',
          location: item.location || '',
        })));
      } else if (userData?.education?.institution || userData?.education?.degree) {
        setEducationList([{
          institution: userData.education.institution || '',
          year: userData.education.year || '',
          degree: userData.education.degree || '',
          course: userData.education.course || '',
          location: userData.education.location || '',
        }]);
      } else {
        setEducationList([{ institution: '', year: '', degree: '', course: '', location: '' }]);
      }
    }
  }, [open, userData]);

  const handleAddEducation = () => {
    setEducationList(prev => [
      ...prev,
      { institution: '', year: '', degree: '', course: '', location: '' }
    ]);
  };

  const handleRemoveEducation = (index) => {
    if (educationList.length === 1) {
      setEducationList([{ institution: '', year: '', degree: '', course: '', location: '' }]);
      return;
    }
    setEducationList(prev => prev.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index, field, value) => {
    setEducationList(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast?.('Please enter your full name.', 'error');
      return;
    }

    setLoading(true);
    try {
      const isStudent = professionalRole === 'Student';
      const cleanedEducationList = educationList
        .map(item => ({
          institution: item.institution?.trim() || '',
          year: item.year?.trim() || '',
          degree: item.degree?.trim() || '',
          course: item.course?.trim() || '',
          location: item.location?.trim() || '',
        }))
        .filter(item => item.institution || item.degree || item.course || item.year || item.location);

      const firstEdu = cleanedEducationList[0] || { institution: '', year: '', degree: '', course: '', location: '' };

      await userService.updateMe({
        name: name.trim(),
        bio: bio.trim(),
        professionalRole,
        experience: isStudent ? '' : experience.trim(),
        educationList: cleanedEducationList.length > 0 ? cleanedEducationList : [firstEdu],
        education: firstEdu,
      });

      showToast?.('Profile details updated successfully.', 'success');
      await onProfileUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = professionalRole === 'Student';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto no-scrollbar">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-white border border-[#E5E9F0] rounded-3xl shadow-2xl max-w-3xl w-full z-10 overflow-hidden text-left flex flex-col max-h-[90vh] my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-[#F3F4F6] shrink-0 bg-white">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0 shadow-2xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight">Edit Profile & Qualifications</h2>
                  <p className="text-xs sm:text-[13px] text-[#6B7280] font-medium mt-0.5">Update your professional role, experience, and academic background</p>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={loading}
                className="p-2 rounded-xl border border-[#E5E9F0] hover:bg-[#FAFBFC] text-[#9CA3AF] hover:text-[#111827] transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-7 no-scrollbar">
              {/* 1. Identity & Role */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#F3F4F6]">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">Identity & Professional Role</h3>
                    <p className="text-xs text-[#6B7280] font-medium">Your primary details and current career status</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-[13px] font-bold text-[#374151]">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-4 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:bg-white transition-all shadow-2xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-[13px] font-bold text-[#374151]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={userData?.email || ''}
                      className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-[#E5E9F0] rounded-xl text-sm font-medium text-[#9CA3AF] cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-[13px] font-bold text-[#374151]">
                      Professional Role
                    </label>
                    <select
                      value={professionalRole}
                      onChange={(e) => setProfessionalRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-sm font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:bg-white transition-all shadow-2xs cursor-pointer"
                    >
                      {PROFESSIONAL_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!isStudent ? (
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-[13px] font-bold text-[#374151]">
                        Experience in Field
                      </label>
                      <input
                        type="text"
                        list="modal-experience-options"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 2+ years, 3-5 years"
                        className="w-full px-4 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:bg-white transition-all shadow-2xs"
                      />
                      <datalist id="modal-experience-options">
                        {EXPERIENCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} />
                        ))}
                      </datalist>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-[13px] font-bold text-gray-400">
                        Experience in Field
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder="Not applicable for students"
                        className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-[#E5E9F0] rounded-xl text-sm font-medium text-[#9CA3AF] cursor-not-allowed"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs sm:text-[13px] font-bold text-[#374151]">
                      Developer Bio / Headline
                    </label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Full-Stack Engineer & Competitive Programmer"
                      className="w-full px-4 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:bg-white transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Educational Qualifications */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#111827]">Educational Qualifications</h3>
                      <p className="text-xs text-[#6B7280] font-medium">Add all your academic degrees, colleges, or certifications</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-3 py-1.5 bg-purple-50 text-[#7C3AED] hover:bg-purple-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 border border-purple-200/60"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Education</span>
                  </button>
                </div>

                <div className="space-y-5">
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="p-4 bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl space-y-4 relative">
                      <div className="flex items-center justify-between border-b border-[#E5E9F0] pb-2">
                        <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wider">
                          Education #{idx + 1}
                        </span>
                        {educationList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(idx)}
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove this education entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="block text-xs sm:text-[13px] font-bold text-[#374151]">
                            School / College / University
                          </label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                            placeholder="e.g. Stanford University / Indian Institute of Technology"
                            className="w-full px-4 py-2.5 bg-white border border-[#E5E9F0] rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs sm:text-[13px] font-bold text-[#374151]">
                            Degree
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                            placeholder="e.g. Bachelor of Technology (B.Tech)"
                            className="w-full px-4 py-2.5 bg-white border border-[#E5E9F0] rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs sm:text-[13px] font-bold text-[#374151]">
                            Course / Major
                          </label>
                          <input
                            type="text"
                            value={edu.course}
                            onChange={(e) => handleEducationChange(idx, 'course', e.target.value)}
                            placeholder="e.g. Computer Science and Engineering"
                            className="w-full px-4 py-2.5 bg-white border border-[#E5E9F0] rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs sm:text-[13px] font-bold text-[#374151]">
                            Graduation / Passing Year
                          </label>
                          <input
                            type="text"
                            value={edu.year}
                            onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                            placeholder="e.g. 2026 or 2022 - 2026"
                            className="w-full px-4 py-2.5 bg-white border border-[#E5E9F0] rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs sm:text-[13px] font-bold text-[#374151]">
                            Location
                          </label>
                          <input
                            type="text"
                            value={edu.location}
                            onChange={(e) => handleEducationChange(idx, 'location', e.target.value)}
                            placeholder="e.g. New Delhi, India or San Francisco, CA"
                            className="w-full px-4 py-2.5 bg-white border border-[#E5E9F0] rounded-xl text-sm font-medium text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3F4F6] shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 text-xs sm:text-[13px] font-bold text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs sm:text-[13px] rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

