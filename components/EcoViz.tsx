import React from 'react';
import { Block } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Line
} from 'recharts';

interface EcoVizProps {
  chain: Block[];
}

const EcoViz: React.FC<EcoVizProps> = ({ chain }) => {
  const data = chain.map(b => ({
    name: b.actor,
    emissions: b.emissions,
    cumulative: b.cumulativeEmissions,
    trust: b.trustAnalysis?.trustScore || 0,
  }));

  const totalEmissions = chain.reduce((acc, curr) => acc + curr.emissions, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border border-emerald-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Carbon Footprint</h3>
          <p className="text-3xl font-bold text-emerald-800 mt-2">{totalEmissions.toFixed(2)} <span className="text-base font-normal text-gray-500">kg CO₂e</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-emerald-100">
          <h3 className="text-gray-500 text-sm font-medium">Average Trust Score</h3>
          <p className="text-3xl font-bold text-emerald-800 mt-2">
            {(chain.reduce((acc, b) => acc + (b.trustAnalysis?.trustScore || 0), 0) / (chain.length || 1)).toFixed(0)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-emerald-100">
          <h3 className="text-gray-500 text-sm font-medium">Active Nodes</h3>
          <p className="text-3xl font-bold text-emerald-800 mt-2">{chain.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emissions Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Emission Impact by Stage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#ecfdf5'}}
                />
                <Legend />
                <Bar dataKey="emissions" fill="#059669" name="CO₂e (kg)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cumulative Trend */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Cumulative Carbon Lifecycle</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="cumulative" stroke="#059669" fillOpacity={1} fill="url(#colorCum)" name="Total CO₂e" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trust vs Impact */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Trust & Integrity Analysis</h3>
             <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" scale="band" />
                <YAxis yAxisId="left" orientation="left" stroke="#059669" />
                <YAxis yAxisId="right" orientation="right" stroke="#d97706" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="emissions" barSize={20} fill="#059669" name="Emissions" />
                <Line yAxisId="right" type="monotone" dataKey="trust" stroke="#d97706" strokeWidth={3} name="Trust Score" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoViz;
