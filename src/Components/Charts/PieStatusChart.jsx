import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
 
export default function PieStatusChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          outerRadius={90}
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}