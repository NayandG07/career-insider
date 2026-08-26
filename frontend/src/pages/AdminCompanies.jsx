import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  MapPin, 
  Briefcase,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([
    { id: 1, name: 'Stripe', logo: '💳', location: 'San Francisco, CA', rolesCount: 3, compatibilityAvg: 92 },
    { id: 2, name: 'Google', logo: '🔍', location: 'Mountain View, CA', rolesCount: 5, compatibilityAvg: 88 },
    { id: 3, name: 'Meta', logo: '♾️', location: 'Menlo Park, CA', rolesCount: 2, compatibilityAvg: 85 },
    { id: 4, name: 'Netflix', logo: '🍿', location: 'Los Gatos, CA', rolesCount: 4, compatibilityAvg: 81 },
  ]);

  const [roles, setRoles] = useState([
    { id: 1, title: 'Senior Backend Engineer', company: 'Stripe', dept: 'Engineering', exp: '5+ years', tech: ['Node.js', 'Go', 'Distributed Systems'] },
    { id: 2, title: 'Staff Machine Learning Engineer', company: 'Google', dept: 'AI/ML', exp: '7+ years', tech: ['Python', 'TensorFlow', 'PyTorch'] },
    { id: 3, title: 'Frontend Developer', company: 'Meta', dept: 'Product', exp: '3+ years', tech: ['React', 'TypeScript', 'GraphQL'] },
  ]);

  const [companyName, setCompanyName] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyLogo, setCompanyLogo] = useState('🏢');
  
  const [roleTitle, setRoleTitle] = useState('');
  const [roleCompany, setRoleCompany] = useState('Stripe');
  const [roleTech, setRoleTech] = useState('');

  const handleAddCompany = (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    const newCompany = {
      id: Date.now(),
      name: companyName,
      logo: companyLogo,
      location: companyLocation || 'Remote',
      rolesCount: 0,
      compatibilityAvg: 75
    };
    setCompanies([...companies, newCompany]);
    setCompanyName('');
    setCompanyLocation('');
    setCompanyLogo('🏢');
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    if (!roleTitle.trim()) return;
    const newRole = {
      id: Date.now(),
      title: roleTitle,
      company: roleCompany,
      dept: 'Engineering',
      exp: '2+ years',
      tech: roleTech ? roleTech.split(',').map(s => s.trim()) : ['React', 'Express']
    };
    setRoles([...roles, newRole]);
    
    // Increment rolesCount in matching company
    setCompanies(companies.map(c => 
      c.name === roleCompany ? { ...c, rolesCount: c.rolesCount + 1 } : c
    ));
    
    setRoleTitle('');
    setRoleTech('');
  };

  const handleDeleteCompany = (id) => {
    setCompanies(companies.filter(c => c.id !== id));
  };

  const handleDeleteRole = (id) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-8 pb-12 text-left animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
          Target Companies & Roles
        </h1>
        <p className="text-sm text-[#4B5563] mt-1 font-semibold">
          Configure matched corporations and position requirements for talent assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Companies Management */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-[#7C3AED]" />
              Manage Companies
            </h3>

            {/* Add Company Form */}
            <form onSubmit={handleAddCompany} className="grid grid-cols-2 gap-3 pb-4 border-b border-[#F3F4F6]">
              <input 
                type="text" 
                placeholder="Company Name" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="col-span-2 px-3.5 py-2 border border-[#E5E9F0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
              />
              <input 
                type="text" 
                placeholder="Location (e.g. Remote)" 
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                className="px-3.5 py-2 border border-[#E5E9F0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Company
              </button>
            </form>

            {/* List Companies */}
            <div className="space-y-3">
              {companies.map((c) => (
                <div key={c.id} className="p-3 bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{c.logo}</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#111827]">{c.name}</h4>
                      <p className="text-[10px] text-[#6B7280] font-semibold flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {c.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-md">
                        {c.rolesCount} Active Roles
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteCompany(c.id)}
                      className="p-1 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Roles Management */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-[#6366F1]" />
              Manage Job Roles
            </h3>

            {/* Add Role Form */}
            <form onSubmit={handleAddRole} className="grid grid-cols-2 gap-3 pb-4 border-b border-[#F3F4F6]">
              <input 
                type="text" 
                placeholder="Role Title (e.g. Devops)" 
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="px-3.5 py-2 border border-[#E5E9F0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
              />
              <select 
                value={roleCompany}
                onChange={(e) => setRoleCompany(e.target.value)}
                className="px-3.5 py-2 border border-[#E5E9F0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Technologies (comma separated)" 
                value={roleTech}
                onChange={(e) => setRoleTech(e.target.value)}
                className="col-span-2 px-3.5 py-2 border border-[#E5E9F0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
              />
              <button 
                type="submit" 
                className="col-span-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Position
              </button>
            </form>

            {/* List Roles */}
            <div className="space-y-3">
              {roles.map((r) => (
                <div key={r.id} className="p-3.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-[#111827]">{r.title}</h4>
                      <p className="text-[10px] font-bold text-[#6B7280] mt-0.5">{r.company} • {r.dept}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteRole(r.id)}
                      className="p-1 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.tech.map((t, idx) => (
                      <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
