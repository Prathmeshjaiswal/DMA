import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  openPosition: "#2563eb",
  closedPostion: "#16a34a",
  rejected: "#dc2626",
};

export default function PieStatusChart({ data, selectedStatus }) {
  const pieData = selectedStatus.map(status => ({
    name: status,
    value: data.reduce((sum, d) => sum + d[status], 0),
    fill: COLORS[status],
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          outerRadius={70}
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
