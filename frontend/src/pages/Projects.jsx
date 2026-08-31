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
  ChevronUp,
  Loader2,
  AlertCircle,
  Calendar,
  Lock,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectService } from '../services/projectService';
import { githubService } from '../services/githubService';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import GithubRepoPickerModal from '../components/GithubRepoPickerModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const TECH_OPTIONS = [
  'React', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte', 'SvelteKit',
  'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Sass', 'Material UI', 'Shadcn UI',
  'Node.js', 'Express.js', 'NestJS', 'FastAPI', 'Django', 'Flask', 'Python',
  'Java', 'Spring Boot', 'Go', 'Golang', 'Rust', 'C++', 'C', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails',
  'SQL', 'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Mongoose', 'Redis', 'GraphQL', 'Prisma', 'Supabase', 'Firebase',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Vercel', 'Netlify', 'Cloudflare',
  'REST API', 'gRPC', 'WebSocket', 'Socket.io', 'Kafka', 'RabbitMQ',
  'Git', 'GitHub', 'GitLab', 'CI/CD', 'Linux', 'Bash', 'Terraform',
  'Swift', 'Kotlin', 'Flutter', 'React Native', 'Android', 'iOS',
  'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas', 'NumPy', 'OpenCV',
  'Jest', 'Cypress', 'Playwright', 'Vitest', 'Selenium',
  'Figma', 'Webpack', 'Vite', 'Turborepo', 'Microservices',
  'Google OAuth', 'JWT', 'bcrypt', 'Auth0', 'Stripe',
];

const URL_REGEX = /^https?:\/\/.+\..+/i;

const EMPTY_FORM = {
  title: '',
  problem: '',
  solution: '',
  technologies: [],
  repositoryUrl: '',
  liveDemoUrl: '',
  source: 'custom',
  githubRepositoryId: null,
  isPrivate: false,
};

// ─── Flexible Tech Multi-Select ───────────────────────────────────────────────

function TechSelect({ value, onChange, error }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const filtered = TECH_OPTIONS.filter(
    (t) => t.toLowerCase().includes(search.toLowerCase()) && !value.includes(t)
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const add = (tech) => {
    const clean = tech.trim();
    if (!clean || value.includes(clean)) return;
    onChange([...value, clean]);
    setSearch('');
  };

  const remove = (tech) => onChange(value.filter((t) => t !== tech));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (search.trim()) {
        add(search);
      }
    }
  };

  const handleContainerClick = (e) => {
    // If clicking a remove button, do not toggle dropdown
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    
    // Toggle open state on container click
    setOpen((prev) => {
      const next = !prev;
      if (next && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 10);
      }
      return next;
    });
  };

  return (
    <div ref={ref} className="relative">
      <div
        className={`min-h-[46px] w-full bg-[#FAFBFC] border rounded-2xl px-3.5 py-2.5 flex flex-wrap items-center gap-1.5 cursor-pointer focus-within:ring-2 focus-within:ring-[#7C3AED]/15 focus-within:border-[#7C3AED] transition-all ${
          error ? 'border-red-400' : 'border-[#E5E9F0]'
        }`}
        onClick={handleContainerClick}
      >
        {value.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1.5 bg-purple-50 text-[#7C3AED] border border-purple-100 text-xs font-bold px-2.5 py-1 rounded-lg cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {t}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(t);
              }}
              className="hover:text-red-500 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={search}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? 'Select or type technologies (press Enter to add)…' : 'Add more…'}
          className="flex-1 min-w-[140px] bg-transparent text-xs font-semibold text-[#111827] outline-none placeholder-[#9CA3AF] cursor-pointer"
        />
        <ChevronDown
          className={`w-4 h-4 text-[#9CA3AF] self-center shrink-0 transition-transform cursor-pointer ${
            open ? 'rotate-180 text-[#7C3AED]' : ''
          }`}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-[60] bottom-full left-0 right-0 mb-1.5 max-h-56 overflow-y-auto bg-[#F3F4F6] border border-[#CBD5E1] rounded-2xl shadow-xl p-1.5 space-y-0.5 text-left animate-fadeIn"
          >
            {filtered.length === 0 && search.trim() ? (
              <li
                onClick={() => add(search)}
                className="px-3.5 py-2.5 text-xs font-bold text-[#7C3AED] hover:bg-purple-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
              >
                <span>Add custom "{search.trim()}"</span>
                <Plus className="w-4 h-4" />
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-3.5 py-2 text-xs font-semibold text-gray-400">
                All matching technologies selected
              </li>
            ) : (
              filtered.map((tech) => (
                <li
                  key={tech}
                  onClick={(e) => {
                    e.stopPropagation();
                    add(tech);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-[#374151] hover:bg-purple-50 hover:text-[#7C3AED] rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                >
                  <span>{tech}</span>
                  <Plus className="w-3.5 h-3.5 opacity-40" />
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Field Layout Helper ──────────────────────────────────────────────────────

function Field({ label, required, optional, hint, children }) {
  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#374151] flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
          {optional && <span className="text-[10px] font-semibold text-[#9CA3AF]">(optional)</span>}
        </label>
        {hint && <span className="text-[10px] text-[#9CA3AF] font-medium">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Add / Edit / Customize Modal (Fixed Box Sizing & No Duplicate Badge) ─────

function ProjectModal({ open, onClose, onSave, initialData }) {
  const isEdit = !!initialData?._id;
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
          solution: initialData.solution || '',
          technologies: initialData.technologies?.length > 0
            ? initialData.technologies
            : (initialData.primaryLanguage ? [initialData.primaryLanguage] : []),
          source: initialData.source || (initialData.githubRepositoryId ? 'github' : 'custom'),
          githubRepositoryId: initialData.githubRepositoryId || null,
          isPrivate: Boolean(initialData.isPrivate),
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setApiError('');
    }
  }, [open, initialData]);

  if (!open) return null;

  const set = (key) => (val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = 'Project title is required.';
    if (!form.problem?.trim() && !form.description?.trim()) {
      errs.problem = 'Project description or problem statement is required.';
    }
    if (!form.technologies || form.technologies.length === 0) {
      errs.technologies = 'Please add at least 1 technology tag.';
    }
    if (form.repositoryUrl && !URL_REGEX.test(form.repositoryUrl.trim())) {
      errs.repositoryUrl = 'Enter a valid URL (e.g. https://github.com/user/repo).';
    }
    if (form.liveDemoUrl && !URL_REGEX.test(form.liveDemoUrl.trim())) {
      errs.liveDemoUrl = 'Enter a valid URL (e.g. https://my-app.vercel.app).';
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
        title: form.title.trim(),
        description: (form.problem || form.description || '').trim(),
        problem: (form.problem || form.description || '').trim(),
        solution: (form.solution || '').trim(),
        repositoryUrl: form.repositoryUrl?.trim() || '',
        liveDemoUrl: form.liveDemoUrl?.trim() || '',
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.error || 'An error occurred while saving the project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl bg-white border border-[#E5E9F0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 text-left"
        >
          {/* Modal Header without duplicate badge */}
          <div className="p-6 border-b border-[#E5E9F0] flex items-center justify-between bg-[#FAFBFC]">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs ${
                  isGithub ? 'bg-[#111827]' : 'bg-[#7C3AED]'
                }`}>
                  {isGithub ? <Github className="w-4 h-4" /> : <FolderGit2 className="w-4 h-4" />}
                </div>
                <h2 className="text-base sm:text-lg font-black text-[#111827] tracking-tight">
                  {isEdit
                    ? (isGithub ? 'Edit GitHub Project Specifications' : 'Edit Custom Project')
                    : (isGithub ? 'Review & Customize GitHub Project' : 'Add Custom Project')}
                </h2>
              </div>
              <p className="text-xs text-[#6B7280] font-semibold">
                {isGithub
                  ? 'Review pre-filled repository details, add architecture notes, and customize tech tags before saving.'
                  : (isEdit ? 'Update your deliverable information and links.' : 'Document your project, problem solved, architecture, and tech stack.')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-[#E5E9F0] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:bg-white transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {apiError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-semibold">{apiError}</p>
              </div>
            )}

            {/* Project Title */}
            <Field label="Project Name / Title" required>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title')(e.target.value)}
                placeholder="e.g. Distributed Real-Time Telemetry Pipeline"
                className={`w-full bg-[#FAFBFC] border rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED] transition-all placeholder-[#9CA3AF] ${
                  errors.title ? 'border-red-400' : 'border-[#E5E9F0]'
                }`}
              />
              {errors.title && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.title}</p>}
            </Field>

            {/* Description / Problem Statement (Fixed size, resize-none) */}
            <Field
              label={isGithub ? "Project Overview & Context" : "Problem Statement & Description"}
              required
              hint="Describe the challenge or core functionality"
            >
              <textarea
                value={form.problem}
                onChange={(e) => set('problem')(e.target.value)}
                placeholder={
                  isGithub
                    ? "Explain what this project accomplishes, key features, and core purpose..."
                    : "What real-world problem does this project solve? Who is it built for?"
                }
                rows={6}
                className={`w-full bg-[#FAFBFC] border rounded-2xl p-4 text-xs font-semibold text-[#111827] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED] transition-all placeholder-[#9CA3AF] min-h-[160px] resize-none ${
                  errors.problem ? 'border-red-400' : 'border-[#E5E9F0]'
                }`}
              />
              {errors.problem && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.problem}</p>}
            </Field>

            {/* Solution & Architecture (Fixed size, resize-none) */}
            <Field
              label="Solution, Architecture & Technical Approach"
              optional
              hint="Design decisions, key components, data flow"
            >
              <textarea
                value={form.solution}
                onChange={(e) => set('solution')(e.target.value)}
                placeholder="Describe the architectural design, database modeling, APIs, algorithms, or unique technical implementation details..."
                rows={6}
                className="w-full bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-4 text-xs font-semibold text-[#111827] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED] transition-all placeholder-[#9CA3AF] min-h-[160px] resize-none"
              />
            </Field>

            {/* Technology Stack */}
            <Field label="Technologies & Frameworks" required hint="Select or type custom technologies">
              <TechSelect
                value={form.technologies}
                onChange={set('technologies')}
                error={errors.technologies}
              />
              {errors.technologies && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.technologies}</p>}
            </Field>

            {/* URLs Column (separate lines) */}
            <div className="space-y-4">
              <Field label="GitHub Repository URL" optional>
                <input
                  type="url"
                  value={form.repositoryUrl}
                  onChange={(e) => set('repositoryUrl')(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className={`w-full bg-[#FAFBFC] border rounded-2xl px-4 py-3 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED] transition-all placeholder-[#9CA3AF] ${
                    errors.repositoryUrl ? 'border-red-400' : 'border-[#E5E9F0]'
                  }`}
                />
                {errors.repositoryUrl && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.repositoryUrl}</p>}
              </Field>

              <Field label="Live Demo / Deployment URL" optional>
                <input
                  type="url"
                  value={form.liveDemoUrl}
                  onChange={(e) => set('liveDemoUrl')(e.target.value)}
                  placeholder="https://my-app.vercel.app"
                  className={`w-full bg-[#FAFBFC] border rounded-2xl px-4 py-3 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED] transition-all placeholder-[#9CA3AF] ${
                    errors.liveDemoUrl ? 'border-red-400' : 'border-[#E5E9F0]'
                  }`}
                />
                {errors.liveDemoUrl && <p className="text-[11px] text-red-500 font-semibold mt-1">{errors.liveDemoUrl}</p>}
              </Field>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-[#E5E9F0] text-[#4B5563] font-bold text-xs rounded-xl hover:bg-[#FAFBFC] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{isEdit ? 'Save Changes' : (isGithub ? 'Add to Projects' : 'Create Project')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Redesigned Project Card ──────────────────────────────────────────────────

function ProjectCard({ project, onEdit, onRequestDelete, deleting }) {
  const isGithub = project.source === 'github';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSolutionExpanded, setIsSolutionExpanded] = useState(false);

  const mainText = project.description || project.problem || 'Showcase deliverable.';
  const isTextLong = mainText.length > 280;
  const displayedText = !isExpanded && isTextLong ? `${mainText.slice(0, 260)}…` : mainText;

  const hasSolution = project.solution && project.solution.trim() !== '' && project.solution !== project.problem;
  const solutionText = project.solution || '';
  const isSolutionLong = solutionText.length > 300;
  const displayedSolution = !isSolutionExpanded && isSolutionLong ? `${solutionText.slice(0, 280)}…` : solutionText;

  const formatDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const isDeletingThis = Boolean(
    deleting && (deleting === project._id || (project.githubRepositoryId && deleting === project.githubRepositoryId))
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="h-full bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-left space-y-4 relative"
    >
      <div className="space-y-3.5 flex-1 flex flex-col">
        {/* Header: Icon, Title, Source Badges, and Action Buttons */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                isGithub ? 'bg-[#111827] text-white' : 'bg-purple-50 text-[#7C3AED] border border-purple-100'
              }`}
            >
              {isGithub ? <Github className="w-5 h-5" /> : <FolderGit2 className="w-5 h-5" />}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-base font-black text-[#111827] leading-snug break-words tracking-tight">
                {project.title}
              </h3>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                {isGithub ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200">
                    <Github className="w-2.5 h-2.5" />
                    GitHub Import
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider bg-purple-50 text-[#7C3AED] px-2 py-0.5 rounded-md border border-purple-200">
                    Custom Project
                  </span>
                )}

                {project.isPrivate && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                    <Lock className="w-2.5 h-2.5" />
                    Private
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit & Delete Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onEdit(project)}
              className="p-2 text-[#6B7280] hover:text-[#111827] border border-[#E5E9F0] hover:bg-[#FAFBFC] rounded-xl transition-colors cursor-pointer"
              title="Edit Project"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onRequestDelete(project)}
              disabled={isDeletingThis}
              className="p-2 text-red-500 hover:text-red-600 border border-red-100 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              title={isGithub ? 'Remove from CareerOS' : 'Delete Project'}
            >
              {isDeletingThis ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Problem / Description Content */}
        <div className="space-y-1.5 pt-1">
          <p className="text-xs text-[#374151] font-semibold leading-relaxed break-words whitespace-pre-line">
            {displayedText}
          </p>

          {isTextLong && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] font-bold text-[#7C3AED] hover:underline cursor-pointer inline-flex items-center gap-0.5 pt-0.5"
            >
              <span>{isExpanded ? 'Show less' : 'Read full description'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Architecture & Solution Subsection (if available) */}
        {hasSolution && (
          <div className="p-3.5 bg-[#FAFBFC] border border-[#F3F4F6] rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider block flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Architecture & Solution
            </span>
            <p className="text-xs text-[#4B5563] font-semibold leading-relaxed break-words whitespace-pre-line">
              {displayedSolution}
            </p>
            {isSolutionLong && (
              <button
                type="button"
                onClick={() => setIsSolutionExpanded(!isSolutionExpanded)}
                className="text-[10px] font-bold text-[#7C3AED] hover:underline cursor-pointer inline-flex items-center gap-0.5 pt-0.5"
              >
                <span>{isSolutionExpanded ? 'Show less' : 'Read full solution'}</span>
                {isSolutionExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        )}

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(project.technologies?.length > 0
            ? project.technologies
            : (project.primaryLanguage ? [project.primaryLanguage] : ['General'])
          ).map((t) => (
            <span
              key={t}
              className="text-[10px] font-bold px-2.5 py-1 bg-[#FAFBFC] border border-[#E5E9F0] text-[#374151] rounded-lg shadow-2xs"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Links & Date */}
      <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-[#F3F4F6] mt-auto flex-wrap">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-[11px] font-bold text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer shadow-2xs"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Repository</span>
              <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
            </a>
          )}

          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px] font-bold text-[#7C3AED] hover:bg-purple-100 transition-colors cursor-pointer shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Demo</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>

        {formatDate && (
          <span className="text-[10px] font-semibold text-[#9CA3AF] ml-auto flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate}
          </span>
        )}
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
      <h3 className="text-base font-bold text-[#111827] mb-1">No projects showcase added yet</h3>
      <p className="text-xs text-[#6B7280] font-semibold max-w-sm leading-relaxed">
        Import your repositories directly from GitHub or add custom technical deliverables to highlight your engineering capabilities.
      </p>
    </div>
  );
}

// ─── Main Projects Page ───────────────────────────────────────────────────────

export default function Projects({ setActivePage }) {
  const { userData, refreshProjects } = useApp();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [prefillProject, setPrefillProject] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(null);

  const handleOpenGithubImport = () => {
    const isConnected = !!(userData?.connectedSources?.github || userData?.auth?.github?.username || userData?.auth?.github?.id);
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
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError('Could not load projects. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filtered = projects.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      (p.title || '').toLowerCase().includes(q) ||
      (p.problem || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.solution || '').toLowerCase().includes(q) ||
      (p.technologies || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const openAdd = () => {
    setEditingProject(null);
    setPrefillProject(null);
    setModalOpen(true);
  };

  const openEdit = (proj) => {
    setEditingProject(proj);
    setPrefillProject(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProject(null);
    setPrefillProject(null);
  };

  const handleSelectRepoFromGithub = (repoData) => {
    setEditingProject(null);
    setPrefillProject(repoData);
    setGithubModalOpen(false);
    setModalOpen(true);
  };

  const handleBatchImportFromGithub = async (repoIds) => {
    try {
      const data = await githubService.importRepositories(repoIds);
      if (data.imported && Array.isArray(data.imported)) {
        setProjects((prev) => {
          const importedMap = new Map(data.imported.map((p) => [p.githubRepositoryId, p]));
          const remaining = prev.filter((p) => !p.githubRepositoryId || !importedMap.has(p.githubRepositoryId));
          return [...data.imported, ...remaining];
        });
      } else {
        await loadProjects();
      }
      refreshProjects?.();
      showToast?.(`Successfully imported ${repoIds.length} project${repoIds.length === 1 ? '' : 's'} directly from GitHub!`, 'success');
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to import selected repositories.';
      showToast?.(errMsg, 'error');
      throw err;
    }
  };

  const handleSave = async (form) => {
    if (editingProject?._id) {
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
      console.error('Delete project error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleRemoveGithub = async (githubRepositoryId) => {
    setDeleting(githubRepositoryId);
    try {
      if (typeof githubRepositoryId === 'number') {
        await githubService.removeImportedRepository(githubRepositoryId);
        setProjects((prev) => prev.filter((p) => p.githubRepositoryId !== githubRepositoryId));
      } else {
        await projectService.remove(githubRepositoryId);
        setProjects((prev) => prev.filter((p) => p._id !== githubRepositoryId));
      }
    } catch (err) {
      console.error('Remove github repo error:', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="space-y-6 pb-16 text-left animate-fadeIn max-w-7xl mx-auto">
        {/* Header with Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Your Projects</h1>
            <p className="text-sm text-[#4B5563] mt-1 font-semibold">
              {projects.length > 0
                ? `${projects.length} showcase project${projects.length === 1 ? '' : 's'}`
                : 'Highlight technical architecture and deliverables'}
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
              <span>Import from GitHub</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openAdd}
              className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Project</span>
            </motion.button>
          </div>
        </div>

        {/* Filter Search Bar */}
        {projects.length > 0 && (
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 sm:p-5 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by title, technology, architecture, or keywords…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED] transition-all"
              />
            </div>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 animate-pulse">
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gray-200 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-5 w-44 bg-gray-200 rounded-lg" />
                      <div className="h-4 w-24 bg-gray-100 rounded-md" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3.5 w-full bg-gray-100 rounded" />
                    <div className="h-3.5 w-4/5 bg-gray-100 rounded" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    <div className="h-5 w-16 bg-gray-200 rounded-md" />
                    <div className="h-5 w-20 bg-gray-200 rounded-md" />
                    <div className="h-5 w-14 bg-gray-200 rounded-md" />
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {!loading && fetchError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-3xl p-5">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-semibold">{fetchError}</p>
          </div>
        )}

        {/* 2-Column Grid of Project Cards (at most 2 per row) */}
        {!loading && !fetchError && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p className="text-sm font-semibold text-[#6B7280]">No projects match your search query.</p>
                </motion.div>
              )}
              {filtered.map((proj) => (
                <ProjectCard
                  key={proj._id}
                  project={proj}
                  onEdit={openEdit}
                  onRequestDelete={(p) => setConfirmDeleteProject(p)}
                  deleting={deleting}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add / Edit / Customize Modal */}
      <ProjectModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initialData={editingProject || prefillProject}
      />

      {/* GitHub Repository Picker Modal */}
      <GithubRepoPickerModal
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        onSelectRepo={handleSelectRepoFromGithub}
        onBatchImport={handleBatchImportFromGithub}
      />

      {/* Delete Confirmation Modal */}
      {confirmDeleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setConfirmDeleteProject(null)}
          />
          
          <div className="relative bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-2xl max-w-sm w-full z-10 text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#111827]">
                {confirmDeleteProject.source === 'github' ? 'Remove GitHub Project?' : 'Delete Project?'}
              </h3>
              <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
                Are you sure you want to delete <span className="text-[#111827] font-bold">"{confirmDeleteProject.title}"</span>? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteProject(null)}
                className="flex-1 py-2.5 bg-white border border-[#E5E9F0] hover:bg-gray-50 text-[#374151] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const proj = confirmDeleteProject;
                  setConfirmDeleteProject(null);
                  if (proj.source === 'github' && proj.githubRepositoryId) {
                    await handleRemoveGithub(proj.githubRepositoryId);
                  } else {
                    await handleDelete(proj._id);
                  }
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
