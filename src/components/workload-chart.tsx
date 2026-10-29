"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function WorkloadChart({
  data,
}: {
  data: { name: string; openMatches: number; pendingOutreach: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(15,118,110,0.06)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(15,23,42,0.08)",
              boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
            }}
          />
          <Legend />
          <Bar dataKey="openMatches" name="Open matches" fill="#0f766e" radius={[6, 6, 0, 0]} />
          <Bar
            dataKey="pendingOutreach"
            name="Pending outreach"
            fill="#1e3a8a"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
