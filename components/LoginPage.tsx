
import React, { useState } from 'react';
import { Category } from '../types';
import { 
  Tractor, Factory, Truck, Coffee, Store, ShieldCheck, ArrowLeft, 
  Mail, Lock, User, UserPlus, LogIn, Flame, Beaker, Biohazard, 
  FlaskConical, Boxes, ChevronRight, Settings, ShieldAlert, Leaf
} from 'lucide-react';

export const CATEGORIES: Category[] = [
  {
    id: 'thermal',
    name: 'Roasting & Thermal Processing',
    icon: 'Flame',
    description: 'Heat-based transformation and preservation.',
    roles: ['Raw Material Sourcer', 'Quality Grader', 'Roast Master', 'Cooling Operator', 'Degassing Supervisor', 'Packaging Specialist', 'Storage Manager']
  },
  {
    id: 'mixing',
    name: 'Mixing & Blending',
    icon: 'Beaker',
    description: 'Formulation and composite ingredient batching.',
    roles: ['Ingredient Procurement Manager', 'Formulation Scientist', 'Weighing & Batching Technician', 'Mix Operator', 'Dough/Batter Technician', 'Quality Control Analyst', 'Process Engineer']
  },
  {
    id: 'fermentation',
    name: 'Fermentation & Culturing',
    icon: 'Biohazard',
    description: 'Biological and microbial processing.',
    roles: ['Substrate Preparer', 'Culture Master', 'Fermentation Technician', 'Maturation Supervisor', 'Microbial Quality Controller', 'Stabilization Specialist', 'Blending Master']
  },
  {
    id: 'extraction',
    name: 'Extraction & Refining',
    icon: 'FlaskConical',
    description: 'Purity-focused substance isolation.',
    roles: ['Raw Material Prepper', 'Extraction Operator', 'Refinement Technician', 'Purity Analyst', 'Solvent Recovery Specialist', 'Byproduct Manager', 'Concentration Controller']
  },
  {
    id: 'assembly',
    name: 'Assembly & Packaging',
    icon: 'Boxes',
    description: 'Multi-component product finishing.',
    roles: ['Component Sourcing Manager', 'Assembly Line Supervisor', 'Quality Inspector', 'Packaging Designer', 'Labeling Specialist', 'Final Testing Technician', 'Packing & Shipping Coordinator']
  }
];

interface LoginPageProps {
  onLogin: (category: Category, role: string, isAdmin?: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getIcon = (iconName: string, size = 24) => {
    const icons: Record<string, any> = { Flame, Beaker, Biohazard, FlaskConical, Boxes, ShieldCheck, Settings };
    const IconComp = icons[iconName] || ShieldCheck;
    return <IconComp size={size} />;
  };

  const resetAuthForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError('');
    setIsSignUp(false);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isAdminPortal) {
        if (email === 'admin@ecochain.com' && password === 'admin123') {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                onLogin(CATEGORIES[0], 'System Administrator', true);
            }, 1000);
        } else {
            setError('Invalid administrative credentials.');
        }
        return;
    }

    if (!email || !password) { setError('Missing fields'); return; }
    if (isSignUp && password !== confirmPassword) { setError('Passwords match failed'); return; }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (selectedCategory && selectedRole) onLogin(selectedCategory, selectedRole, false);
    }, 1000);
  };

  // Admin Portal View
  if (isAdminPortal) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-red-500">
            <div className="bg-slate-800 p-8 text-center relative">
              <button onClick={() => { setIsAdminPortal(false); resetAuthForm(); }} className="absolute left-6 top-6 text-white/70 hover:text-white transition-colors">
                <ArrowLeft size={24} />
              </button>
              <div className="mx-auto bg-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/30">
                <Settings size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">Admin Portal</h2>
              <p className="text-red-400 text-xs font-black uppercase tracking-widest">Authorized Access Only</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" placeholder="Admin Email" className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500 text-gray-900 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="password" placeholder="Admin Password" className="w-full pl-10 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500 text-gray-900" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-red-600 text-[10px] font-black uppercase text-center">{error}</p>}
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-[10px] text-amber-700 font-bold mb-4">
                  NOTE: Use admin@ecochain.com / admin123
                </div>
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                  {loading ? 'Authenticating...' : 'Access Console'}
                </button>
              </form>
            </div>
          </div>
        </div>
      );
  }

  // View 1: Category Selection
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6 relative">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12">
            {/* Added missing Leaf icon import from lucide-react */}
            <div className="inline-block bg-emerald-600 text-white p-3 rounded-2xl mb-6 shadow-xl shadow-emerald-200"><Leaf size={40} /></div>
            <h1 className="text-5xl font-black text-emerald-900 mb-4 tracking-tighter">EcoChain Protocol</h1>
            <p className="text-emerald-700/70 text-lg font-medium">Select a manufacturing domain to begin transparent tracking</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat)}
                className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 hover:shadow-2xl hover:-translate-y-2 transition-all text-left group overflow-hidden relative"
              >
                <div className="absolute -right-4 -top-4 text-emerald-50/50 group-hover:text-emerald-50 transition-colors">
                    {getIcon(cat.icon, 120)}
                </div>
                <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm relative z-10">
                  {getIcon(cat.icon, 32)}
                </div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{cat.name}</h3>
                    <p className="text-gray-500 text-sm mb-6 font-medium leading-relaxed">{cat.description}</p>
                    <div className="flex items-center text-emerald-600 font-black text-xs uppercase tracking-widest">
                    Role Directory <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button 
                onClick={() => { setIsAdminPortal(true); resetAuthForm(); }}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 font-black text-xs uppercase tracking-widest transition-colors"
            >
                <ShieldAlert size={16} /> Administrative Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View 2: Role Selection
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-emerald-700 mb-10 hover:underline font-black uppercase text-xs tracking-widest transition-all">
            <ArrowLeft size={18} /> Global Hub
          </button>
          <div className="mb-10">
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{selectedCategory.name}</h2>
            <p className="text-gray-500 font-bold">Assign functional node identity</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedCategory.roles.map((role) => (
              <button 
                key={role} 
                onClick={() => { setSelectedRole(role); resetAuthForm(); }}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-500 hover:text-emerald-600 hover:shadow-lg transition-all font-black text-xs text-gray-600 text-left flex justify-between items-center group uppercase tracking-tight"
              >
                {role}
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View 3: Auth Form
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
        <div className="bg-emerald-600 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 text-white rotate-12">
            {getIcon(selectedCategory.icon, 140)}
          </div>
          <button onClick={() => setSelectedRole(null)} className="absolute left-6 top-6 text-white/70 hover:text-white transition-colors z-20">
            <ArrowLeft size={24} />
          </button>
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/30 relative z-20 shadow-xl">
            {getIcon(selectedCategory.icon, 32)}
          </div>
          <h2 className="text-3xl font-black text-white mb-1 tracking-tight relative z-20">{selectedRole}</h2>
          <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] relative z-20">{selectedCategory.name}</p>
        </div>
        <div className="p-10">
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            {isSignUp && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="text" placeholder="Full Name" className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-900 font-medium transition-all" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input type="email" placeholder="Email Address" className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-900 font-medium transition-all" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input type="password" placeholder="Password" className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-900 transition-all" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {isSignUp && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="password" placeholder="Confirm Password" className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-900 transition-all" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
            )}
            {error && <p className="text-red-500 text-xs font-black text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm active:translate-y-0.5">
              {loading ? 'Processing...' : (isSignUp ? 'Genesis Account' : 'Initialize Node')}
            </button>
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-emerald-600 text-xs font-black hover:underline uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
              {isSignUp ? 'Already registered? Sign In' : "New node? Request Registration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
