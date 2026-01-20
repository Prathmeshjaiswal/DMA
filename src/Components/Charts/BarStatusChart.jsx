import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
 
const COLORS = {
  openPosition: "#2563eb",
  closedPosition: "#16a34a",
  rejected: "#dc2626",
};
 
export default function BarStatusChart({ data, selectedStatus }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
 
        {selectedStatus.map(status => (
          <Bar
            key={status}
            dataKey={status}
            fill={COLORS[status]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
