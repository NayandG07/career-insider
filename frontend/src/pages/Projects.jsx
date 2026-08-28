import React, { useState, useEffect, useRef } from 'react';
import {
  FolderGit2,
  Github,
  Globe,
  Plus,
  ExternalLink,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projectService } from '../services/projectService';
import { githubService } from '../services/githubService';
import { useApp } from '../context/AppContext';
import GithubRepoPickerModal from '../components/GithubRepoPickerModal';

// ─── Constants ────────────────────────────────────────────────────────────────


const TECH_OPTIONS = [
  'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS',
  'Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'REST API', 'WebSocket',
  'Google OAuth', 'JWT', 'bcrypt', 'Python', 'Java', 'C++', 'C', 'SQL',
  'PostgreSQL', 'Docker', 'Git', 'GitHub', 'Figma', 'Vite',
];

const URL_REGEX = /^https?:\/\/.+\..+/i;

const EMPTY_FORM = {
  title: '',
  problem: '',
  solution: '',
  technologies: [],
  repositoryUrl: '',
  liveDemoUrl: '',
};

// ─── Tech Multi-Select ────────────────────────────────────────────────────────

function TechSelect({ value, onChange, error }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = TECH_OPTIONS.filter(
    (t) => t.toLowerCase().includes(search.toLowerCase()) && !value.includes(t)
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const add = (tech) => {
    if (value.length >= 10) return;
    onChange([...value, tech]);
    setSearch('');
  };

  const remove = (tech) => onChange(value.filter((t) => t !== tech));

  return (
    <div ref={ref} className="relative">
      <div
        className={`min-h-[42px] w-full bg-[#FAFBFC] border rounded-xl px-3 py-2 flex flex-wrap gap-1.5 cursor-text focus-within:ring-2 focus-within:ring-[#7C3AED]/10 focus-within:border-[#7C3AED] transition-all ${
          error ? 'border-red-400' : 'border-[#E5E9F0]'
        }`}
        onClick={() => setOpen(true)}
      >
        {value.map((t) => (
          <span key={t} className="flex items-center gap-1 bg-purple-50 text-[#7C3AED] border border-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
            {t}
            <button type="button" onClick={(e) => { e.stopPropagation(); remove(t); }} className="hover:text-red-500 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={value.length === 0 ? 'Search and select technologies…' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-xs font-semibold text-[#111827] outline-none placeholder-[#9CA3AF]"
        />
        <ChevronDown className="w-4 h-4 text-[#9CA3AF] self-center shrink-0" />
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-[#E5E9F0] rounded-xl shadow-lg p-1 space-y-0.5"
          >
            {filtered.map((tech) => (
              <li
                key={tech}
                onClick={() => add(tech)}
                className="px-3 py-2 text-xs font-semibold text-[#374151] hover:bg-purple-50 hover:text-[#7C3AED] rounded-lg cursor-pointer transition-colors"
              >
                {tech}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Field Layout Helper ──────────────────────────────────────────────────────

function Field({ label, required, optional, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-[#374151] flex items-center gap-1">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-[10px] font-semibold text-[#9CA3AF]">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Counted Textarea ─────────────────────────────────────────────────────────

function CountedTextarea({ id, value, onChange, max, placeholder, rows, error }) {
  return (
    <div>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-[#FAFBFC] border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all placeholder-[#9CA3AF] resize-none ${
          error ? 'border-red-400' : 'border-[#E5E9F0]'
        }`}
      />
      <div className="flex justify-between mt-1">
        {error ? <p className="text-[10px] text-red-500 font-semibold">{error}</p> : <span />}
        <span className={`text-[10px] font-semibold ${value.length >= max ? 'text-amber-500' : 'text-[#9CA3AF]'}`}>
          {value.length} / {max}
        </span>
      </div>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function ProjectModal({ open, onClose, onSave, initialData }) {
  const isEdit = !!initialData;
  const isGithub = initialData?.source === 'github' || !!initialData?.githubRepositoryId;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          ...EMPTY_FORM,
          ...initialData,
          problem: initialData.problem || initialData.description || '',
          solution: initialData.solution || (isGithub ? 'Production architectural implementation & deployment' : ''),
          technologies: initialData.technologies?.length > 0 
            ? initialData.technologies 
            : (initialData.primaryLanguage ? [initialData.primaryLanguage] : []),
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setApiError('');
    }
  }, [open, initialData, isGithub]);

  if (!open) return null;

  const set = (key) => (val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = 'Title is required.';
    if (!form.problem?.trim() && !form.description?.trim()) {
      errs.problem = 'Description / Problem statement is required.';
    }
    if (!isGithub && !form.solution?.trim()) {
      errs.solution = 'Solution is required.';
    }
    if (!form.technologies || form.technologies.length === 0) {
      errs.technologies = 'Select at least 1 technology.';
    }
    if (form.repositoryUrl && !URL_REGEX.test(form.repositoryUrl)) {
      errs.repositoryUrl = 'Enter a valid URL (http:// or https://).';
    }
    if (form.liveDemoUrl && !URL_REGEX.test(form.liveDemoUrl)) {
      errs.liveDemoUrl = 'Enter a valid URL (http:// or https://).';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setApiError('');
    try {
      const payload = {
        ...form,
        description: form.problem || form.description,
        solution: form.solution || (isGithub ? 'Production architectural implementation & deployment' : ''),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg bg-white border border-[#E5E9F0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 text-left"
        >
          <div className="p-6 border-b border-[#E5E9F0] flex items-center justify-between bg-[#FAFBFC]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111827]">
                  {isEdit ? (isGithub ? 'Edit GitHub Project Specifications' : 'Edit Custom Project') : 'Add Custom Project'}
                </h2>
                {isGithub && (
                  <span className="px-2 py-0.5 bg-[#111827] text-white rounded text-[9px] font-extrabold flex items-center gap-1">
                    <Github className="w-2.5 h-2.5" />
                    GitHub
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6B7280] font-semibold mt-0.5">
                {isGithub 
                  ? 'Customize specifications, technology tags, and live demo link.' 
                  : (isEdit ? 'Update your project details.' : "Tell us about something you've built.")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-[#E5E9F0] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:bg-[#FAFBFC] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {apiError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-semibold">{apiError}</p>
              </div>
            )}

            <Field label="Project Title" required>
              <div>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title')(e.target.value.slice(0, 120))}
                  placeholder="e.g. Full-Stack Cloud Application"
                  className={`w-full bg-[#FAFBFC] border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all placeholder-[#9CA3AF] ${
                    errors.title ? 'border-red-400' : 'border-[#E5E9F0]'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.title ? <p className="text-[10px] text-red-500 font-semibold">{errors.title}</p> : <span />}
                  <span className={`text-[10px] font-semibold ${form.title?.length >= 120 ? 'text-amber-500' : 'text-[#9CA3AF]'}`}>
                    {form.title?.length || 0} / 120
                  </span>
                </div>
              </div>
            </Field>

            <Field label={isGithub ? "Project Description / Overview" : "Problem / Description"} required>
              <CountedTextarea
                id="problem"
                value={form.problem}
                onChange={set('problem')}
                max={500}
                placeholder={isGithub ? "Brief description or overview of this repository..." : "What problem does this project solve?"}
                rows={3}
                error={errors.problem}
              />
            </Field>

            {!isGithub && (
              <Field label="Solution & Architecture" required>
                <CountedTextarea
                  id="solution"
                  value={form.solution}
                  onChange={set('solution')}
                  max={500}
                  placeholder="What did you build and how does it solve the problem?"
                  rows={3}
                  error={errors.solution}
                />
              </Field>
            )}

            <Field label="Technology Stack" required>
              <TechSelect
                value={form.technologies}
                onChange={set('technologies')}
                error={errors.technologies}
              />
            </Field>

            <Field label="GitHub Repository" optional>
              <div className="space-y-1">
                <input
                  type="url"
                  value={form.repositoryUrl}
                  readOnly={isGithub}
                  onChange={(e) => set('repositoryUrl')(e.target.value.slice(0, 300))}
                  placeholder="https://github.com/user/project"
                  className={`w-full ${isGithub ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-[#FAFBFC] text-[#111827]'} border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all placeholder-[#9CA3AF] ${
                    errors.repositoryUrl ? 'border-red-400' : 'border-[#E5E9F0]'
                  }`}
                />
                {isGithub && (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Auto-linked from GitHub
                  </p>
                )}
                {errors.repositoryUrl && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.repositoryUrl}</p>}
              </div>
            </Field>

            <Field label="Live Demo URL" optional>
              <div>
                <input
                  type="url"
                  value={form.liveDemoUrl}
                  onChange={(e) => set('liveDemoUrl')(e.target.value.slice(0, 300))}
                  placeholder="https://my-app.vercel.app"
                  className={`w-full bg-[#FAFBFC] border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all placeholder-[#9CA3AF] ${
                    errors.liveDemoUrl ? 'border-red-400' : 'border-[#E5E9F0]'
                  }`}
                />
                {errors.liveDemoUrl && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.liveDemoUrl}</p>}
              </div>
            </Field>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-[#E5E9F0] text-[#4B5563] font-bold text-xs rounded-xl hover:bg-[#FAFBFC] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{isEdit ? 'Save Changes' : 'Create Project'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, onEdit, onDelete, deleting, onRemoveGithub }) {
  const isGithub = project.source === 'github';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col gap-4 text-left"
    >
      {/* Header with Title & Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            isGithub ? 'bg-[#111827] text-white' : 'bg-purple-50 text-[#7C3AED]'
          }`}>
            {isGithub ? <Github className="w-5 h-5" /> : <FolderGit2 className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <h3
              className="text-sm font-bold text-[#111827] leading-snug break-words overflow-wrap-anywhere"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {project.title}
            </h3>
            {isGithub && project.isPrivate && (
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold">
                  Private
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 10-12 Word Concise Description Line */}
      <div className="space-y-1">
        <p
          className="text-xs text-[#4B5563] font-semibold leading-relaxed break-words"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description || project.problem || 'Imported repository from GitHub.'}
        </p>
      </div>

      {/* Prominent Technology Stack Badge Pills */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {(project.technologies?.length > 0
          ? project.technologies
          : (project.primaryLanguage ? [project.primaryLanguage] : ['General'])
        ).map((t) => (
          <span key={t} className="text-[10px] px-2.5 py-0.5 rounded-lg border border-purple-100 bg-purple-50/70 font-bold text-[#7C3AED]">
            {t}
          </span>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F3F4F6] mt-auto flex-wrap">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-bold text-[#6B7280] hover:text-[#111827] flex items-center gap-1 min-w-0 cursor-pointer"
            >
              <Github className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[120px]">Repository</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            </a>
          )}
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-bold text-[#6366F1] hover:underline flex items-center gap-1 min-w-0 cursor-pointer"
            >
              <Globe className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[120px]">Live Demo</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onEdit(project)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-[#6B7280] border border-[#E5E9F0] rounded-lg hover:bg-[#FAFBFC] hover:text-[#111827] transition-colors cursor-pointer"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => isGithub ? onRemoveGithub(project.githubRepositoryId) : onDelete(project._id)}
            disabled={deleting === project._id || deleting === project.githubRepositoryId}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting === project._id || deleting === project.githubRepositoryId ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            {isGithub ? 'Remove' : 'Delete'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mb-4">
        <FolderGit2 className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-bold text-[#111827] mb-1">No projects added yet</h3>
      <p className="text-xs text-[#6B7280] font-semibold max-w-sm leading-relaxed">
        Use the buttons at the top right to import repositories from your connected GitHub account or showcase custom deliverables.
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Projects({ setActivePage }) {
  const { userData } = useApp();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleOpenGithubImport = () => {
    const isConnected = !!(userData?.connectedSources?.github || userData?.auth?.github?.id);
    if (!isConnected) {
      sessionStorage.setItem('settings_notice', 'Please connect your GitHub account in Settings to import repositories into CareerOS.');
      if (setActivePage) {
        setActivePage('settings');
      } else {
        window.location.hash = '#settings';
      }
      return;
    }
    setGithubModalOpen(true);
  };

  const loadProjects = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      setFetchError('Could not load projects. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const filtered = projects.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.problem || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.technologies || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const openAdd = () => { setEditingProject(null); setModalOpen(true); };
  const openEdit = (proj) => { setEditingProject(proj); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingProject(null); };

  const handleSave = async (form) => {
    if (editingProject) {
      const updated = await projectService.update(editingProject._id, form);
      setProjects((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    } else {
      const created = await projectService.create(form);
      setProjects((prev) => [created, ...prev]);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await projectService.remove(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      // silently keep card
    } finally {
      setDeleting(null);
    }
  };

  const handleRemoveGithub = async (githubRepositoryId) => {
    setDeleting(githubRepositoryId);
    try {
      await githubService.removeImportedRepository(githubRepositoryId);
      setProjects((prev) => prev.filter((p) => p.githubRepositoryId !== githubRepositoryId));
    } catch (err) {
      console.error('Remove github repo error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleImportSuccess = (importedProjects) => {
    loadProjects();
  };

  return (
    <>
      <div className="space-y-6 pb-12 text-left animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Your Projects</h1>
            <p className="text-sm text-[#4B5563] mt-1 font-semibold">
              {projects.length > 0
                ? `${projects.length} showcase project${projects.length === 1 ? '' : 's'}`
                : 'What have you built?'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenGithubImport}
              className="px-4 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-2 transition-colors shrink-0"
            >
              <Github className="w-4 h-4" />
              Import from GitHub
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openAdd}
              className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Custom Project
            </motion.button>
          </div>
        </div>

        {projects.length > 0 && (
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by title, technology, or keyword…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all"
              />
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
          </div>
        )}

        {!loading && fetchError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-3xl p-5">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-semibold">{fetchError}</p>
          </div>
        )}

        {!loading && !fetchError && (
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 && projects.length === 0 && (
                <EmptyState key="empty" />
              )}
              {filtered.length === 0 && projects.length > 0 && (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-16"
                >
                  <p className="text-sm font-semibold text-[#6B7280]">No projects match your search.</p>
                </motion.div>
              )}
              {filtered.map((proj) => (
                <ProjectCard
                  key={proj._id}
                  project={proj}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onRemoveGithub={handleRemoveGithub}
                  deleting={deleting}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Add / Edit Modal */}
      <ProjectModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initialData={editingProject
          ? {
              title: editingProject.title,
              problem: editingProject.problem,
              solution: editingProject.solution,
              technologies: editingProject.technologies,
              repositoryUrl: editingProject.repositoryUrl || '',
              liveDemoUrl: editingProject.liveDemoUrl || '',
            }
          : null
        }
      />

      {/* GitHub Repository Picker Modal */}
      <GithubRepoPickerModal
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
}
