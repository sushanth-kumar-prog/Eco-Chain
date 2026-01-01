import React from 'react';
import { Block } from '../types';
import { QrCode, ShieldCheck, Leaf, Download, Share2 } from 'lucide-react';

interface CertificateProps {
  chain: Block[];
}

const Certificate: React.FC<CertificateProps> = ({ chain }) => {
  const totalEmissions = chain.reduce((acc, b) => acc + b.emissions, 0);
  const avgTrust = Math.round(chain.reduce((acc, b) => acc + (b.trustAnalysis?.trustScore || 0), 0) / (chain.length || 1));
  const finalHash = chain.length > 0 ? chain[chain.length - 1].hash : "N/A";

  const handleDownload = () => {
    window.print();
  };

  const QrCodePlaceholder = () => (
    <div className="w-24 h-24 bg-white border-2 border-gray-800 p-1 flex items-center justify-center">
        <div className="grid grid-cols-6 gap-0.5 w-full h-full">
            {[...Array(36)].map((_, i) => (
                <div key={i} className={`bg-gray-800 ${Math.random() > 0.4 ? 'opacity-100' : 'opacity-0'}`}></div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-8">
        
        {/* Certificate Container */}
        <div id="certificate-print-area" className="w-full max-w-3xl bg-white p-12 shadow-2xl border-t-8 border-emerald-600 rounded-sm relative overflow-hidden print:shadow-none print:border-t-0 print:p-0">
          
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
              <Leaf size={400} />
          </div>

          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-serif text-gray-900 mb-2">Carbon Integrity Certificate</h1>
              <p className="text-gray-500 uppercase tracking-widest text-sm">EcoChain Verified • Immutable Ledger</p>
            </div>
            <div className="text-emerald-600">
                <ShieldCheck size={48} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="p-4 bg-emerald-50 rounded border border-emerald-100 print:bg-white print:border-gray-200">
                <h3 className="text-emerald-800 text-sm font-bold uppercase mb-2 print:text-black">Total Carbon Footprint</h3>
                <p className="text-4xl font-bold text-emerald-900 print:text-black">{totalEmissions.toFixed(2)} <span className="text-lg">kg CO₂e</span></p>
            </div>
            <div className="p-4 bg-blue-50 rounded border border-blue-100 print:bg-white print:border-gray-200">
                <h3 className="text-blue-800 text-sm font-bold uppercase mb-2 print:text-black">Chain Trust Score</h3>
                <p className="text-4xl font-bold text-blue-900 print:text-black">{avgTrust}% <span className="text-lg">Verified</span></p>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-gray-800 font-bold uppercase text-sm border-b pb-2 mb-4">Provenance Journey</h3>
            <div className="space-y-4">
                {chain.map((b) => (
                    <div key={b.index} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                        <div className="flex items-center gap-3">
                             <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                                 {b.index + 1}
                             </div>
                             <span className="text-gray-800 font-semibold text-lg">{b.actor}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded hidden print:inline-block">Verfied</span>
                            <span className="text-emerald-700 font-bold text-base">{b.emissions} kg CO₂e</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <div className="flex justify-between items-end border-t pt-8">
            <div>
                <p className="text-xs text-gray-400 mb-1">DIGITAL SIGNATURE</p>
                <p className="font-mono text-[10px] text-gray-500 w-64 break-all leading-tight">{finalHash}</p>
                <div className="mt-4 pt-4">
                    <p className="text-xs text-gray-500 font-bold">Authorized by GreenTrust AI</p>
                    <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
                </div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <QrCodePlaceholder />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scan to Verify</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 print:hidden">
            <button 
                onClick={handleDownload}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 shadow-lg transition-all font-medium"
            >
                <Download size={20} />
                Download Certificate
            </button>
        </div>
    </div>
  );
};

export default Certificate;