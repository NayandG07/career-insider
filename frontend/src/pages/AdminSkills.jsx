import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Search,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminSkills() {
  const [skills, setSkills] = useState([
    { id: 1, name: 'Python', category: 'Languages', popularity: 'High', pointWeight: 45 },
    { id: 2, name: 'JavaScript / TypeScript', category: 'Languages', popularity: 'High', pointWeight: 40 },
    { id: 3, name: 'Go', category: 'Languages', popularity: 'Medium', pointWeight: 50 },
    { id: 4, name: 'React', category: 'Frameworks', popularity: 'High', pointWeight: 35 },
    { id: 5, name: 'Node.js / Express', category: 'Frameworks', popularity: 'High', pointWeight: 40 },
    { id: 6, name: 'Docker', category: 'Tools/DevOps', popularity: 'Medium', pointWeight: 45 },
    { id: 7, name: 'PostgreSQL / MongoDB', category: 'Databases', popularity: 'High', pointWeight: 40 },
  ]);

  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Languages');
  const [skillWeight, setSkillWeight] = useState(40);
  const [search, setSearch] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    const newSkill = {
      id: Date.now(),
      name: skillName,
      category: skillCategory,
      popularity: 'Medium',
      pointWeight: parseInt(skillWeight) || 40
    };
    setSkills([newSkill, ...skills]);
    setSkillName('');
    setSkillWeight(40);
  };

  const handleDeleteSkill = (id) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 text-left animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
          System Skill Registry
        </h1>
        <p className="text-sm text-[#4B5563] mt-1 font-semibold">
          Configure index weighting, mapping labels, and core technology stacks for the parsing engines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Add Skill */}
        <div className="lg:col-span-4 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4.5 h-4.5 text-[#7C3AED]" />
            Register New Skill
          </h3>

          <form onSubmit={handleAddSkill} className="space-y-4 text-xs font-semibold text-[#4B5563]">
            <div className="space-y-1.5">
              <label className="ml-1">Skill Name</label>
              <input 
                type="text" 
                placeholder="e.g. Kubernetes, PyTorch" 
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="ml-1">Category</label>
              <select 
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
              >
                <option value="Languages">Languages</option>
                <option value="Frameworks">Frameworks & Libraries</option>
                <option value="Tools/DevOps">Tools & DevOps</option>
                <option value="Databases">Databases</option>
                <option value="ML/AI">ML / AI</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="ml-1">Readiness Score Weight (0-100 Pts)</label>
              <input 
                type="number" 
                min="10" 
                max="100" 
                value={skillWeight}
                onChange={(e) => setSkillWeight(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              Register Skill
            </button>
          </form>
        </div>

        {/* Right Side: Skill List */}
        <div className="lg:col-span-8 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-[#6366F1]" />
              Registered Skills ({filteredSkills.length})
            </h3>
            
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#9CA3AF]">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input 
                type="text" 
                placeholder="Search skills..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-[#E5E9F0] rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  <th className="pb-3 font-bold text-[#6B7280]">Skill Name</th>
                  <th className="pb-3 font-bold text-[#6B7280]">Category</th>
                  <th className="pb-3 font-bold text-[#6B7280]">Weight Weight</th>
                  <th className="pb-3 font-bold text-[#6B7280]">Popularity</th>
                  <th className="pb-3 font-bold text-[#6B7280] text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] font-semibold text-[#374151]">
                {filteredSkills.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FAFBFC] transition-colors">
                    <td className="py-3 font-bold text-[#111827]">{s.name}</td>
                    <td className="py-3">
                      <span className="bg-purple-50 text-[#7C3AED] px-2 py-0.5 rounded text-[10px] font-bold">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3">{s.pointWeight} Pts</td>
                    <td className="py-3 text-[#10B981]">{s.popularity}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleDeleteSkill(s.id)}
                        className="p-1 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
