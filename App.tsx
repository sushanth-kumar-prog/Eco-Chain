
import React, { useState, useEffect } from 'react';
import { Block, Category, StageData, ActorType } from './types';
import { createBlock, validateChain } from './services/blockchainService';
import ActorForm from './components/ActorForm';
import ChainVisualizer from './components/ChainVisualizer';
import EcoViz from './components/EcoViz';
import Certificate from './components/Certificate';
import LoginPage, { CATEGORIES } from './components/LoginPage';
import Chatbot from './components/Chatbot';
import { Leaf, PlusCircle, Link as LinkIcon, BarChart3, FileBadge, LogOut, ShieldAlert, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Store chains individually per category ID
  const [chains, setChains] = useState<Record<string, Block[]>>({});
  const [validity, setValidity] = useState<Record<string, boolean[]>>({});
  const [activeTab, setActiveTab] = useState<'input' | 'chain' | 'viz' | 'cert'>('input');
  
  useEffect(() => {
    const initChains = async () => {
      const initialChains: Record<string, Block[]> = {};
      const initialValidity: Record<string, boolean[]> = {};

      for (const cat of CATEGORIES) {
        const genesisData: StageData = { 
          actorType: ActorType.AUTHORITY, 
          notes: `Network Initialized for ${cat.name}.`
        };
        const genesisBlock = await createBlock([], ActorType.AUTHORITY, genesisData, 0, {
            trustScore: 100, anomalies: [], suggestions: [], isVerified: true
        });
        genesisBlock.category = cat.id;
        initialChains[cat.id] = [genesisBlock];
        initialValidity[cat.id] = [true];
      }

      setChains(initialChains);
      setValidity(initialValidity);
    };
    initChains();
  }, []);

  const handleLogin = (category: Category, role: string, adminStatus: boolean = false) => {
      setCurrentCategory(category);
      setCurrentUser(role);
      setIsAdmin(adminStatus);
      setActiveTab(adminStatus ? 'chain' : 'input');
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setCurrentCategory(null);
      setIsAdmin(false);
  };

  const handleBlockSubmit = async (actor: string, data: StageData, analysis: any, emissions: number) => {
    if (!currentCategory) return;

    const currentChain = chains[currentCategory.id] || [];
    const newBlock = await createBlock(currentChain, actor, data, emissions, analysis);
    newBlock.category = currentCategory.id;
    
    const newChain = [...currentChain, newBlock];
    const newChains = { ...chains, [currentCategory.id]: newChain };
    setChains(newChains);

    const valid = await validateChain(newChain);
    setValidity({ ...validity, [currentCategory.id]: valid });
    
    setActiveTab('chain');
  };

  const handleDeleteBlock = async (blockIndex: number) => {
    if (!currentCategory || !isAdmin || blockIndex === 0) return; // Prevent genesis deletion

    const currentChain = chains[currentCategory.id] || [];
    // Remove the block
    const newChain = currentChain.filter(b => b.index !== blockIndex);
    
    // In a real blockchain we can't delete, but for management we "rewrite" the chain indices
    const recalculatedChain = newChain.map((b, i) => ({ ...b, index: i }));
    
    const newChains = { ...chains, [currentCategory.id]: recalculatedChain };
    setChains(newChains);
    
    const valid = await validateChain(recalculatedChain);
    setValidity({ ...validity, [currentCategory.id]: valid });
  };

  if (!currentUser || !currentCategory) {
      return <LoginPage onLogin={handleLogin} />;
  }

  const activeChain = chains[currentCategory.id] || [];
  const activeValidity = validity[currentCategory.id] || [];

  return (
    <div className="min-h-screen bg-emerald-50/50 flex flex-col">
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-lg shadow-emerald-200"><Leaf size={20} /></div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">EcoChain</span>
            <div className="ml-4 flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">{currentCategory.name}</span>
                {isAdmin ? (
                    <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldAlert size={10} /> ADMIN
                    </span>
                ) : (
                    <span className="text-xs text-gray-500 font-medium tracking-tight">/ {currentUser}</span>
                )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1">
                {!isAdmin && (
                  <button onClick={() => setActiveTab('input')} className={`nav-btn ${activeTab === 'input' ? 'active' : ''}`}>
                    <PlusCircle size={18} /> <span className="hidden md:inline">Data Entry</span>
                  </button>
                )}
                {isAdmin && (
                  <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
                    {CATEGORIES.map(c => (
                      <button 
                        key={c.id}
                        onClick={() => setCurrentCategory(c)}
                        className={`px-2 py-1 text-[10px] font-bold rounded ${currentCategory.id === c.id ? 'bg-white shadow text-emerald-600' : 'text-gray-400'}`}
                      >
                        {c.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setActiveTab('chain')} className={`nav-btn ${activeTab === 'chain' ? 'active' : ''}`}>
                <LinkIcon size={18} /> <span className="hidden md:inline">Ledger</span>
                </button>
                <button onClick={() => setActiveTab('viz')} className={`nav-btn ${activeTab === 'viz' ? 'active' : ''}`}>
                <BarChart3 size={18} /> <span className="hidden md:inline">Analytics</span>
                </button>
                <button onClick={() => setActiveTab('cert')} className={`nav-btn ${activeTab === 'cert' ? 'active' : ''}`}>
                <FileBadge size={18} /> <span className="hidden md:inline">Certificate</span>
                </button>
            </nav>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-all p-2 bg-gray-50 rounded-full hover:bg-red-50"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 relative">
        {isAdmin && activeTab === 'chain' && (
          <div className="mb-6 bg-white p-4 rounded-2xl border border-red-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Settings size={20} /></div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Management Console Active</h4>
                <p className="text-xs text-gray-500">You have full override permissions for the {currentCategory.name} ledger.</p>
              </div>
            </div>
            <div className="flex gap-2">
               <div className="text-right">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">Participants</p>
                 <p className="text-xs font-bold text-emerald-600">{activeChain.map(b => b.actor).filter((v, i, a) => a.indexOf(v) === i).length} Verified Users</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'input' && !isAdmin && (
          <div className="max-w-2xl mx-auto">
             <ActorForm 
               onBlockSubmit={handleBlockSubmit} 
               chain={activeChain} 
               currentUser={currentUser} 
               currentCategory={currentCategory} 
             />
          </div>
        )}
        {activeTab === 'chain' && (
            <ChainVisualizer 
                chain={activeChain} 
                validity={activeValidity} 
                isAdmin={isAdmin}
                onDeleteBlock={handleDeleteBlock}
            />
        )}
        {activeTab === 'viz' && <EcoViz chain={activeChain} />}
        {activeTab === 'cert' && <Certificate chain={activeChain} />}
      </main>

      <Chatbot currentUser={isAdmin ? "System Admin" : currentUser} currentCategory={currentCategory.name} />

      <style>{`
        .nav-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600; color: #64748b; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .nav-btn:hover { background-color: #f1f5f9; color: #0f172a; }
        .nav-btn.active { background-color: #ecfdf5; color: #059669; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
      `}</style>
    </div>
  );
};

export default App;
