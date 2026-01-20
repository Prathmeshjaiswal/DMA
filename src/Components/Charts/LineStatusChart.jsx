import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  openPosition: "#2563eb",
  closedPosition: "#16a34a",
  rejected: "#dc2626",
};

export default function LineStatusChart({ data, selectedStatus }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />

        {selectedStatus.map(status => (
          <Line
            key={status}
            dataKey={status}
            stroke={COLORS[status]}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}