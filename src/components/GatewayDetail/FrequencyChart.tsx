import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatTime } from '@/utils/dateUtils';

interface FrequencyDataPoint {
  time: Date;
  latency: number;
  success: boolean;
}

interface FrequencyChartProps {
  data: FrequencyDataPoint[];
  stats: {
    avgLatency: number;
    successRate: number;
    recentFailed: number;
  };
}

export const FrequencyChart: React.FC<FrequencyChartProps> = ({ data, stats }) => {
  const chartData = data.map((d) => ({
    ...d,
    time: formatTime(d.time),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-300">上报延迟趋势</h4>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400">平均延迟</span>
            <span className="text-cyan-400 font-mono">{stats.avgLatency}ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">成功率</span>
            <span className="text-emerald-400 font-mono">{stats.successRate}%</span>
          </div>
        </div>
      </div>
      <div className="h-48">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit="ms"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#cbd5e1' }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', r: 3 }}
                activeDot={{ r: 5, fill: '#06b6d4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            暂无数据
          </div>
        )}
      </div>
    </div>
  );
};

export default FrequencyChart;
