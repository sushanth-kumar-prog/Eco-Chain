
import React, { useState, useEffect } from 'react';
import { Category, StageData, Block } from '../types';
import { calculateEmissions } from '../services/carbonService';
import { analyzeStageWithGemini } from '../services/geminiService';
import { 
  Loader2, CheckCircle, Lock, Clock, ShieldCheck, Sparkles, Zap, Gauge, 
  Thermometer, FlaskConical, Settings, Search, Droplets, Scale, 
  Box, Truck, Microscope, ClipboardCheck, Timer, Percent
} from 'lucide-react';

interface ActorFormProps {
  onBlockSubmit: (actor: string, data: StageData, analysis: any, emissions: number) => void;
  chain: Block[];
  currentUser: string;
  currentCategory: Category;
}

interface FieldConfig {
  name: string;
  label: string;
  type: 'number' | 'text' | 'select';
  placeholder: string;
  unit?: string;
  options?: string[];
  icon?: any;
}

// Comprehensive technical schema for all 35 roles
const ROLE_FIELDS: Record<string, FieldConfig[]> = {
  // Thermal Processing
  'Raw Material Sourcer': [
    { name: 'moistureContent', label: 'Moisture Content', type: 'number', placeholder: 'e.g. 11.5', unit: '%', icon: Droplets },
    { name: 'qualityGrade', label: 'Raw Quality Grade', type: 'text', placeholder: 'e.g. AA / Grade 1', icon: Search },
  ],
  'Quality Grader': [
    { name: 'cuppingScore', label: 'Sensory Cupping Score', type: 'number', placeholder: '0-100', icon: ClipboardCheck },
    { name: 'defectCount', label: 'Primary Defects', type: 'number', placeholder: '0', icon: Search },
    { name: 'aromaIntensity', label: 'Aroma Intensity', type: 'number', placeholder: '1-10', icon: Droplets },
  ],
  'Roast Master': [
    { name: 'targetTemp', label: 'Target Temperature', type: 'number', placeholder: '210', unit: '°C', icon: Thermometer },
    { name: 'roastDuration', label: 'Roast Duration', type: 'number', placeholder: '12', unit: 'min', icon: Clock },
    { name: 'drumSpeed', label: 'Drum Speed', type: 'number', placeholder: '55', unit: 'RPM', icon: Settings },
  ],
  'Cooling Operator': [
    { name: 'coolingRate', label: 'Cooling Rate', type: 'number', placeholder: '15', unit: '°C/min', icon: Thermometer },
    { name: 'airflowVolume', label: 'Airflow Volume', type: 'number', placeholder: '450', unit: 'm³/h', icon: Gauge },
  ],
  'Degassing Supervisor': [
    { name: 'tankPressure', label: 'Tank Pressure', type: 'number', placeholder: '1.2', unit: 'bar', icon: Gauge },
    { name: 'co2Level', label: 'CO2 Concentration', type: 'number', placeholder: '98', unit: '%', icon: FlaskConical },
  ],
  'Packaging Specialist': [
    { name: 'residualOxygen', label: 'Residual Oxygen', type: 'number', placeholder: '0.5', unit: '%', icon: Gauge },
    { name: 'sealStrength', label: 'Seal Strength', type: 'number', placeholder: '25', unit: 'N', icon: ShieldCheck },
  ],
  'Storage Manager': [
    { name: 'humidityLevel', label: 'Storage Humidity', type: 'number', placeholder: '45', unit: '%', icon: Droplets },
    { name: 'ambientTemp', label: 'Ambient Temperature', type: 'number', placeholder: '18', unit: '°C', icon: Thermometer },
  ],

  // Mixing & Blending
  'Ingredient Procurement Manager': [
    { name: 'purityPercentage', label: 'Ingredient Purity', type: 'number', placeholder: '99.9', unit: '%', icon: Percent },
    { name: 'supplierCompliance', label: 'Compliance ID', type: 'text', placeholder: 'ISO-XXXXX', icon: ShieldCheck },
  ],
  'Formulation Scientist': [
    { name: 'phTarget', label: 'Target pH Level', type: 'number', placeholder: '5.5', icon: FlaskConical },
    { name: 'viscosityTarget', label: 'Target Viscosity', type: 'number', placeholder: '2500', unit: 'cP', icon: Gauge },
  ],
  'Weighing & Batching Technician': [
    { name: 'scaleCalibrationId', label: 'Scale ID', type: 'text', placeholder: 'SC-102', icon: Scale },
    { name: 'weightVariance', label: 'Weight Variance', type: 'number', placeholder: '0.01', unit: 'g', icon: Scale },
  ],
  'Mix Operator': [
    { name: 'agitatorSpeed', label: 'Agitator Speed', type: 'number', placeholder: '120', unit: 'RPM', icon: Settings },
    { name: 'blendDuration', label: 'Blend Duration', type: 'number', placeholder: '45', unit: 'min', icon: Timer },
  ],
  'Dough/Batter Technician': [
    { name: 'hydrationLevel', label: 'Hydration Level', type: 'number', placeholder: '65', unit: '%', icon: Droplets },
    { name: 'elasticityIndex', label: 'Elasticity Index', type: 'number', placeholder: '8.5', icon: Gauge },
  ],
  'Quality Control Analyst': [
    { name: 'colorDelta', label: 'Color Variance (ΔE)', type: 'number', placeholder: '0.4', icon: Search },
    { name: 'textureScore', label: 'Texture Score', type: 'number', placeholder: '92', unit: '/100', icon: ClipboardCheck },
  ],
  'Process Engineer': [
    { name: 'throughputRate', label: 'Process Throughput', type: 'number', placeholder: '1200', unit: 'kg/h', icon: Gauge },
    { name: 'uptimeEfficiency', label: 'Line Uptime', type: 'number', placeholder: '98.5', unit: '%', icon: Percent },
  ],

  // Fermentation & Culturing
  'Substrate Preparer': [
    { name: 'sugarContent', label: 'Sugar Content (Brix)', type: 'number', placeholder: '18', unit: '°Bx', icon: Droplets },
    { name: 'sterilizationTemp', label: 'Sterilization Temp', type: 'number', placeholder: '121', unit: '°C', icon: Thermometer },
  ],
  'Culture Master': [
    { name: 'inoculationDensity', label: 'Inoculation Density', type: 'number', placeholder: '10^6', unit: 'cells/ml', icon: Microscope },
    { name: 'strainId', label: 'Microbial Strain ID', type: 'text', placeholder: 'SACCH-G1', icon: FlaskConical },
  ],
  'Fermentation Technician': [
    { name: 'ethanolLevel', label: 'ABV / Ethanol', type: 'number', placeholder: '5.4', unit: '%', icon: Droplets },
    { name: 'dissolvedOxygen', label: 'Dissolved Oxygen', type: 'number', placeholder: '2.5', unit: 'mg/L', icon: Gauge },
  ],
  'Maturation Supervisor': [
    { name: 'clarityTurbidity', label: 'Clarity (NTU)', type: 'number', placeholder: '1.2', icon: Search },
    { name: 'maturationDays', label: 'Maturation Time', type: 'number', placeholder: '21', unit: 'days', icon: Clock },
  ],
  'Microbial Quality Controller': [
    { name: 'colonyCount', label: 'Colony Forming Units', type: 'number', placeholder: '0', unit: 'CFU', icon: Microscope },
    { name: 'pathogenTest', label: 'Pathogen Status', type: 'text', placeholder: 'Negative', icon: ShieldCheck },
  ],
  'Stabilization Specialist': [
    { name: 'filterPoreSize', label: 'Filter Pore Size', type: 'number', placeholder: '0.45', unit: 'μm', icon: Settings },
    { name: 'preservativeLevel', label: 'Stabilizer PPM', type: 'number', placeholder: '50', unit: 'ppm', icon: FlaskConical },
  ],
  'Blending Master': [
    { name: 'blendRatio', label: 'Main Component %', type: 'number', placeholder: '75', unit: '%', icon: Percent },
    { name: 'sensoryConsistency', label: 'Profile Accuracy', type: 'number', placeholder: '9.8', unit: '/10', icon: ClipboardCheck },
  ],

  // Extraction & Refining
  'Raw Material Prepper': [
    { name: 'particleSize', label: 'Median Particle Size', type: 'number', placeholder: '350', unit: 'μm', icon: Search },
    { name: 'feedRate', label: 'Feed Rate', type: 'number', placeholder: '50', unit: 'kg/h', icon: Gauge },
  ],
  'Extraction Operator': [
    { name: 'extractionPressure', label: 'System Pressure', type: 'number', placeholder: '75', unit: 'bar', icon: Gauge },
    { name: 'extractionTemp', label: 'Solvent Temperature', type: 'number', placeholder: '45', unit: '°C', icon: Thermometer },
  ],
  'Refinement Technician': [
    { name: 'vacuumLevel', label: 'Vacuum Level', type: 'number', placeholder: '15', unit: 'mbar', icon: Gauge },
    { name: 'distillationTemp', label: 'Distillation Temp', type: 'number', placeholder: '82', unit: '°C', icon: Thermometer },
  ],
  'Purity Analyst': [
    { name: 'hplcPurity', label: 'HPLC Purity', type: 'number', placeholder: '99.8', unit: '%', icon: Microscope },
    { name: 'residualSolvent', label: 'Residual Solvent', type: 'number', placeholder: '5', unit: 'ppm', icon: FlaskConical },
  ],
  'Solvent Recovery Specialist': [
    { name: 'recoveryRate', label: 'Solvent Recovery', type: 'number', placeholder: '96.5', unit: '%', icon: Percent },
    { name: 'chillerTemp', label: 'Chiller Temp', type: 'number', placeholder: '-5', unit: '°C', icon: Thermometer },
  ],
  'Byproduct Manager': [
    { name: 'wasteWeight', label: 'Byproduct Weight', type: 'number', placeholder: '45', unit: 'kg', icon: Scale },
    { name: 'reusePotential', label: 'Circular Economy %', type: 'number', placeholder: '85', unit: '%', icon: Sparkles },
  ],
  'Concentration Controller': [
    { name: 'brixLevel', label: 'Concentration (Brix)', type: 'number', placeholder: '65', unit: '°Bx', icon: Droplets },
    { name: 'evaporationRate', label: 'Evaporation Rate', type: 'number', placeholder: '150', unit: 'L/h', icon: Gauge },
  ],

  // Assembly & Packaging
  'Component Sourcing Manager': [
    { name: 'componentCount', label: 'Total Components', type: 'number', placeholder: '12', icon: Box },
    { name: 'sustainabilityScore', label: 'Tier 2 Green Score', type: 'number', placeholder: '88', unit: '/100', icon: Sparkles },
  ],
  'Assembly Line Supervisor': [
    { name: 'lineSpeed', label: 'Assembly Speed', type: 'number', placeholder: '120', unit: 'units/min', icon: Settings },
    { name: 'rejectionCount', label: 'Rejection Count', type: 'number', placeholder: '2', icon: ShieldCheck },
  ],
  'Quality Inspector': [
    { name: 'toleranceVariance', label: 'Dimensional Variance', type: 'number', placeholder: '0.05', unit: 'mm', icon: Search },
    { name: 'passRate', label: 'Final Pass Rate', type: 'number', placeholder: '99.4', unit: '%', icon: ClipboardCheck },
  ],
  'Packaging Designer': [
    { name: 'materialRecyclability', label: 'Recyclability %', type: 'number', placeholder: '100', icon: Sparkles },
    { name: 'packagingVolume', label: 'Storage Volume', type: 'number', placeholder: '0.02', unit: 'm³', icon: Box },
  ],
  'Labeling Specialist': [
    { name: 'printDpi', label: 'Print Resolution', type: 'number', placeholder: '600', unit: 'dpi', icon: Settings },
    { name: 'alignmentOffset', label: 'Alignment Offset', type: 'number', placeholder: '0.2', unit: 'mm', icon: Search },
  ],
  'Final Testing Technician': [
    { name: 'stressTestCycles', label: 'Stress Cycles', type: 'number', placeholder: '500', icon: Timer },
    { name: 'failurePoint', label: 'Failure Threshold', type: 'number', placeholder: '250', unit: 'N', icon: Gauge },
  ],
  'Packing & Shipping Coordinator': [
    { name: 'palletWeight', label: 'Total Pallet Weight', type: 'number', placeholder: '450', unit: 'kg', icon: Scale },
    { name: 'transitTempTarget', label: 'Transit Temp', type: 'number', placeholder: '4', unit: '°C', icon: Truck },
  ],
};

const SAMPLE_VALUES_LIBRARY: Record<string, any> = {
  'Quality Grader': { cuppingScore: 88, defectCount: 0, aromaIntensity: 9, energyKwh: 5, batchId: 'G-102', notes: 'Superior berry notes detected in this lot.', envScore: 98, verifyMethod: 'manual' },
  'Roast Master': { targetTemp: 212, roastDuration: 12.5, drumSpeed: 55, energyKwh: 145, batchId: 'R-450', notes: 'First crack at 9:30. Even development.', envScore: 92, verifyMethod: 'sensor' },
  'Culture Master': { inoculationDensity: 1200000, strainId: 'YEAST-X1', energyKwh: 65, batchId: 'FERM-01', notes: 'Rapid inoculation observed.', envScore: 95, verifyMethod: 'lab' },
  'Extraction Operator': { extractionPressure: 74, extractionTemp: 44, energyKwh: 320, batchId: 'EXT-V9', notes: 'Optimal pressure maintained.', envScore: 88, verifyMethod: 'sensor' },
  'Quality Inspector': { toleranceVariance: 0.04, passRate: 99.8, energyKwh: 12, batchId: 'QA-009', notes: 'Within mechanical tolerances.', envScore: 94, verifyMethod: 'manual' },
};

const ActorForm: React.FC<ActorFormProps> = ({ onBlockSubmit, chain, currentUser, currentCategory }) => {
  const [formData, setFormData] = useState<any>({ batchId: '', energyKwh: '', notes: '', verifyMethod: '', envScore: '' });
  const [loading, setLoading] = useState(false);

  const fields = ROLE_FIELDS[currentUser] || [
    { name: 'batchVolume', label: 'Batch Volume', type: 'number', placeholder: '100', unit: 'kg', icon: Gauge },
    { name: 'operationalTime', label: 'Work Time', type: 'number', placeholder: '8', unit: 'hrs', icon: Clock },
  ];

  useEffect(() => {
    const initial: any = { batchId: '', energyKwh: '', notes: '', verifyMethod: '', envScore: '' };
    fields.forEach(f => initial[f.name] = '');
    setFormData(initial);
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleFillSample = () => {
    const roleSample = SAMPLE_VALUES_LIBRARY[currentUser];
    if (roleSample) {
        setFormData({ ...formData, ...roleSample });
    } else {
        const genSample: any = {
            batchId: `LOT-${Math.floor(Math.random() * 8000) + 1000}`,
            energyKwh: Math.floor(Math.random() * 100) + 10,
            notes: `Process completed for ${currentUser}. Parameters verified against SOP.`,
            verifyMethod: 'manual',
            envScore: 90
        };
        fields.forEach(f => {
            if (f.type === 'number') genSample[f.name] = Math.floor(Math.random() * 50) + 5;
            else genSample[f.name] = 'Verified';
        });
        setFormData(genSample);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullData: StageData = {
      actorType: currentUser,
      timestamp: Date.now(),
      category: currentCategory.id,
      ...formData
    };

    const emissions = calculateEmissions(fullData);
    const analysis = await analyzeStageWithGemini(currentUser, fullData);

    onBlockSubmit(currentUser, fullData, analysis, emissions);
    setLoading(false);
  };

  // Turn calculation: chain length minus the genesis block gives us the index in the roles array
  const currentStepInWorkflow = chain.length - 1; 
  const actorSequence = currentCategory.roles;
  const nextActorInSequence = actorSequence[currentStepInWorkflow];
  
  const isMyTurn = currentUser === nextActorInSequence;
  const hasAlreadyActed = chain.some(b => b.actor === currentUser);
  const isWorkflowFinished = currentStepInWorkflow >= actorSequence.length;

  if (hasAlreadyActed) return (
    <div className="bg-white p-12 rounded-3xl shadow-xl border border-emerald-100 text-center animate-in zoom-in duration-300">
      <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6"><CheckCircle size={40} /></div>
      <h2 className="text-2xl font-bold text-gray-900">Stage Securely Anchored</h2>
      <p className="text-gray-500 mt-2 font-medium">Data is now immutable on the EcoChain ledger for {currentCategory.name}.</p>
    </div>
  );

  if (isWorkflowFinished) return (
    <div className="bg-white p-12 rounded-3xl shadow-xl border border-emerald-100 text-center">
      <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6"><ShieldCheck size={40} /></div>
      <h2 className="text-2xl font-bold text-gray-900">Workflow Complete</h2>
      <p className="text-gray-500 mt-2 font-medium">This supply chain has been fully documented.</p>
    </div>
  );

  if (!isMyTurn) return (
    <div className="bg-white p-12 rounded-3xl shadow-xl border border-amber-100 text-center animate-in fade-in duration-300">
      <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6"><Clock size={40} /></div>
      <h2 className="text-2xl font-bold text-gray-900">Awaiting Workflow Turn</h2>
      <p className="text-gray-600 mt-2 font-medium">In the <b>{currentCategory.name}</b> workflow, we are currently waiting for: <span className="text-amber-700 underline underline-offset-4 decoration-2">{nextActorInSequence || 'End of Chain'}</span></p>
    </div>
  );

  return (
    <div className="bg-white p-10 rounded-3xl shadow-2xl border border-emerald-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{currentUser}</h2>
          <p className="text-gray-500 font-medium">{currentCategory.name} Workflow Stage</p>
        </div>
        <button onClick={handleFillSample} className="text-[10px] font-bold text-emerald-600 bg-emerald-50/50 border border-emerald-200 px-4 py-2 rounded-full hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm active:scale-95 group">
          <Sparkles size={14} className="group-hover:rotate-12 transition-transform" /> Fill Technical Data
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Box size={10}/> Batch Identification</label>
            <input name="batchId" value={formData.batchId} required placeholder="Lot # / Batch ID" className="input-field" onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Zap size={10}/> Power Consumption (kWh)</label>
            <input name="energyKwh" value={formData.energyKwh} required type="number" placeholder="Station energy use" className="input-field" onChange={handleChange} />
          </div>

          {fields.map(field => (
            <div key={field.name} className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                {field.icon && <field.icon size={10} />}
                {field.label} {field.unit && <span className="text-emerald-500">[{field.unit}]</span>}
              </label>
              <input 
                name={field.name} 
                type={field.type} 
                value={formData[field.name] || ''} 
                placeholder={field.placeholder} 
                required 
                className="input-field" 
                onChange={handleChange} 
              />
            </div>
          ))}

          <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><ShieldCheck size={10}/> Verification Method</label>
             <select name="verifyMethod" value={formData.verifyMethod} required className="input-field appearance-none cursor-pointer" onChange={handleChange}>
                <option value="">Select Method</option>
                <option value="sensor">Automated IoT Sensors</option>
                <option value="manual">Manual Batch Inspection</option>
                <option value="lab">External Lab Analysis</option>
             </select>
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Sparkles size={10}/> Environment Score (0-100)</label>
             <input name="envScore" value={formData.envScore} type="number" placeholder="Efficiency Rating" className="input-field" onChange={handleChange} />
           </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Process Narrative & Technical Findings</label>
            <textarea name="notes" value={formData.notes} required rows={3} placeholder="Describe specific process observations, quality nuances, or anomalies..." className="input-field resize-none" onChange={handleChange} />
          </div>
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-200 active:translate-y-0.5">
          {loading ? <><Loader2 className="animate-spin" size={24} /> Securing Block & Auditing...</> : <><CheckCircle size={24} /> Commit Verified Stage</>}
        </button>
      </form>

      <style>{`
        .input-field { width: 100%; padding: 1.25rem 1rem; background: #fdfdfd; border: 1.5px solid #f1f5f9; border-radius: 1.25rem; outline: none; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); font-size: 0.95rem; color: #111827; font-weight: 500; }
        .input-field:hover { border-color: #e2e8f0; background: #fff; }
        .input-field:focus { background: white; border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.08); }
        .input-field::placeholder { color: #94a3b8; font-weight: 400; }
      `}</style>
    </div>
  );
};

export default ActorForm;
