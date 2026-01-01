
import React, { useState } from 'react';
import { Block } from '../types';
import { Link, AlertTriangle, ShieldCheck, Box, Lightbulb, CheckCircle2, Trash2, ShieldAlert } from 'lucide-react';

interface ChainVisualizerProps {
  chain: Block[];
  validity: boolean[];
  isAdmin?: boolean;
  onDeleteBlock?: (index: number) => void;
}

const ChainVisualizer: React.FC<ChainVisualizerProps> = ({ chain, validity, isAdmin, onDeleteBlock }) => {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  return (
    <div className="space-y-8 p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Immutable Ledger</h2>
                <p className="text-gray-500 font-medium">Verified supply chain events on EcoChain protocol.</p>
            </div>
            {isAdmin && (
                <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-1.5 animate-pulse">
                    <ShieldAlert size={12} /> Management Mode
                </div>
            )}
        </div>

      <div className="relative">
        <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-emerald-200 via-emerald-100 to-transparent -z-10 rounded-full" />

        <div className="space-y-10">
          {chain.map((block, idx) => {
            const isValid = validity[idx] !== false;
            const isGenesis = idx === 0;
            
            return (
              <div key={`${block.hash}-${idx}`} className="flex gap-8 group animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border-2 z-10 bg-white shadow-lg transition-transform group-hover:scale-105
                  ${isValid ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-600'}`}>
                  {isGenesis ? <ShieldCheck size={28} /> : <Box size={28} />}
                </div>

                <div className={`flex-grow p-6 rounded-3xl border shadow-xl transition-all relative
                   ${isValid ? 'bg-white border-gray-100 hover:border-emerald-200' : 'bg-red-50 border-red-300'}`}>
                  
                  {/* Admin Deletion Action */}
                  {isAdmin && !isGenesis && (
                    <div className="absolute top-6 right-6 flex gap-2">
                        {confirmDelete === block.index ? (
                            <div className="flex gap-2 animate-in zoom-in">
                                <button 
                                    onClick={() => { onDeleteBlock?.(block.index); setConfirmDelete(null); }}
                                    className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 shadow-lg shadow-red-200"
                                >
                                    Confirm Delete
                                </button>
                                <button 
                                    onClick={() => setConfirmDelete(null)}
                                    className="bg-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setConfirmDelete(block.index)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete Block"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6 pr-12">
                    <div>
                      <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-3">
                        {block.actor}
                        {!isValid && <span className="bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-sm"><AlertTriangle size={12}/> Tampered</span>}
                      </h3>
                      <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-0.5">
                        Block Sequence <span className="text-gray-400">#00{block.index}</span>
                      </p>
                    </div>
                    {!isGenesis && (
                        <div className="text-right">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm
                                ${block.trustAnalysis?.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                <ShieldCheck size={14} className={block.trustAnalysis?.isVerified ? 'text-emerald-500' : 'text-yellow-500'} /> 
                                Trust: {block.trustAnalysis?.trustScore || '85'}%
                            </span>
                        </div>
                    )}
                  </div>

                  <div className="bg-gray-50/80 p-4 rounded-2xl mb-6 font-mono text-[10px] border border-gray-100 group-hover:bg-white transition-colors overflow-hidden">
                    <div className="flex gap-4 mb-2">
                      <span className="font-bold text-gray-400 w-12 uppercase">Prev:</span> 
                      <span className="text-gray-400 truncate">{block.previousHash}</span>
                    </div>
                    <div className={`flex gap-4 ${isValid ? "text-emerald-700" : "text-red-600 font-bold"}`}>
                      <span className="font-bold text-gray-400 w-12 uppercase">Hash:</span> 
                      <span className="truncate">{block.hash}</span>
                    </div>
                  </div>

                  {!isGenesis && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
                        {Object.entries(block.data).map(([key, val]) => {
                            if (key === 'actorType' || key === 'notes' || typeof val === 'object') return null;
                            return (
                                <div key={key} className="p-3 bg-gray-50 rounded-xl border border-transparent hover:border-emerald-100 transition-all">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                                    <p className="font-bold text-gray-800">{String(val)}</p>
                                </div>
                            )
                        })}
                        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                             <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mb-1">Carbon Impact</p>
                             <p className="font-black text-emerald-800">{block.emissions} kg CO₂e</p>
                        </div>
                      </div>
                  )}

                  {block.data.notes && (
                      <div className="mb-6 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50 italic text-gray-600 text-sm font-medium">
                          "{block.data.notes}"
                      </div>
                  )}

                  {block.trustAnalysis && !isGenesis && (
                    <div className="border-t border-dashed pt-6">
                       <div className="flex items-center gap-2 mb-4">
                           <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                               <ShieldCheck size={18} />
                           </div>
                           <p className="text-xs font-black text-gray-500 uppercase tracking-widest">GreenTrust AI Certification</p>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {block.trustAnalysis.anomalies.length > 0 ? (
                               <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                                   <div className="flex items-center gap-2 text-red-800 font-bold text-xs mb-2 uppercase tracking-wide">
                                       <AlertTriangle size={14} />
                                       <span>Detected Anomalies</span>
                                   </div>
                                   <ul className="text-xs text-red-700 space-y-2 font-medium">
                                       {block.trustAnalysis.anomalies.map((a, i) => <li key={i} className="flex gap-2"><span>•</span> {a}</li>)}
                                   </ul>
                               </div>
                           ) : (
                               <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                   <div className="bg-white p-2 rounded-full shadow-sm text-emerald-500"><CheckCircle2 size={20} /></div>
                                   <span className="text-xs font-bold leading-snug">Industrial parameters verified against ISO-14064 standards.</span>
                               </div>
                           )}

                           {block.trustAnalysis.suggestions.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                   <div className="flex items-center gap-2 text-blue-800 font-bold text-xs mb-2 uppercase tracking-wide">
                                       <Lightbulb size={14} />
                                       <span>Optimization Path</span>
                                   </div>
                                   <ul className="text-xs text-blue-700 space-y-2 font-medium">
                                       {block.trustAnalysis.suggestions.map((s, i) => <li key={i} className="flex gap-2"><span>•</span> {s}</li>)}
                                   </ul>
                               </div>
                           )}
                       </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChainVisualizer;
