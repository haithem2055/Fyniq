import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export interface BudgetComparisonData {
  name: string;
  actual: number;
  budget: number;
}

interface BudgetComparisonChartProps {
  data: BudgetComparisonData[];
  translations: any;
  isDarkMode?: boolean;
}

const BudgetComparisonChart: React.FC<BudgetComparisonChartProps> = ({ data, translations: t, isDarkMode }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-96 flex flex-col transition-colors">
       <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.charts.budgetTitle}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.charts.budgetSubtitle}</p>
       </div>
       
       {data.length === 0 ? (
         <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
            {t.charts.noBudgetData}
         </div>
       ) : (
         <ResponsiveContainer width="100%" height="100%">
           <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
           >
              <CartesianGrid stroke={isDarkMode ? "#334155" : "#f1f5f9"} vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#64748b'}} 
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b'}} />
              <Tooltip 
                 cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                 contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    color: isDarkMode ? '#fff' : '#000'
                 }}
                 formatter={(value: number, name: string) => [
                    `${value.toFixed(3)} ${t.stats.currency}`, 
                    name === 'actual' ? t.charts.actual : t.charts.budget
                 ]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }} 
                formatter={(value) => <span style={{ color: isDarkMode ? '#cbd5e1' : '#1e293b' }}>{value === 'actual' ? t.charts.actual : t.charts.budget}</span>}
              />
              <Bar dataKey="actual" barSize={32} radius={[4, 4, 0, 0]} name="actual">
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.budget > 0 && entry.actual > entry.budget ? '#ef4444' : '#10b981'} 
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                name="budget"
              />
           </ComposedChart>
         </ResponsiveContainer>
       )}
    </div>
  );
};

export default BudgetComparisonChart;