import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartData } from '../types';

interface ExpensesChartProps {
  data: ChartData[];
  translations: any;
  isDarkMode?: boolean;
}

const ExpensesChart: React.FC<ExpensesChartProps> = ({ data, translations: t, isDarkMode }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-96 flex flex-col transition-colors">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t.charts.expensesTitle}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.charts.expensesSubtitle}</p>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500">
            {t.charts.noData}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            layout="vertical" // Horizontal bars are often better for category names
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={110} 
              tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#475569' }} 
            />
            <Tooltip 
              cursor={{ fill: isDarkMode ? '#1e293b' : '#f0fdf4' }}
              contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                  color: isDarkMode ? '#fff' : '#000'
              }}
              formatter={(value: number) => [`${value.toFixed(3)} ${t.stats.currency}`, t.charts.amount]}
            />
            <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={30}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ExpensesChart;