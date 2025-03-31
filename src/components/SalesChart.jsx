import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

const SalesChart = ({ data }) => {
  const [dataKey, setDataKey] = useState('revenue');

  const metrics = [
    { key: 'revenue', label: 'Total Revenue', color: '#6366F1' },
    { key: 'orders', label: 'Order Count', color: '#EC4899' },
    { key: 'averageOrderValue', label: 'Average Order Value', color: '#14B8A6' },
  ];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm h-full flex items-center justify-center">
        <p className="text-gray-600">No sales data</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Sales Overview</h2>
        <div className="flex gap-3">
          {metrics.map(metric => (
            <button
              key={metric.key}
              onClick={() => setDataKey(metric.key)}
              className={`px-3 py-1 rounded-lg text-sm ${
                dataKey === metric.key ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metrics.find(m => m.key === dataKey)?.color} stopOpacity={0.1} />
                <stop offset="95%" stopColor={metrics.find(m => m.key === dataKey)?.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => {
                try {
                  return format(parseISO(date), 'MMM dd');
                } catch (error) {
                  return date; 
                }
              }}
              stroke="#94A3B8"
            />
            <YAxis
              stroke="#94A3B8"
              tickFormatter={(value) => {
                if (dataKey === 'revenue') return `₹${value.toLocaleString()}`;
                if (dataKey === 'orders') return value.toString();
                return `₹${value}`;
              }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelFormatter={(date) => {
                try {
                  return format(parseISO(date), 'MMMM dd, yyyy');
                } catch (error) {
                  console.warn(`Invalid date format in tooltip: ${date}`);
                  return date;
                }
              }}
              formatter={(value) => { 
                if (dataKey === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                if (dataKey === 'orders') return [value.toString(), 'Orders'];
                return [`₹${value}`, 'Avg. Order Value'];
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={metrics.find(m => m.key === dataKey)?.color}
              fillOpacity={1}
              fill="url(#colorMetric)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;