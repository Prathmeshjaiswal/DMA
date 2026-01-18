import React from "react";
import { Select } from "antd";
import { STATUS_OPTIONS, TIMELINE_OPTIONS } from "./chartConfig";
 
export default function ChartContainer({
  title,
  selectedStatus,
  onStatusChange,
  selectedTimeline,
  onTimelineChange,
  children,
}) {
  return (
    <div className="rounded-xl border border-slate-300 p-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          {title}
        </h3>
 
        <div className="flex gap-2">
          <Select
            size="small"
            value={selectedStatus}
            onChange={onStatusChange}
            className="w-40"
            options={STATUS_OPTIONS.map(s => ({
              value: s.key,
              label: s.label,
            }))}
          />
 
          <Select
            size="small"
            value={selectedTimeline}
            onChange={onTimelineChange}
            className="w-32"
            options={TIMELINE_OPTIONS.map(t => ({
              value: t.key,
              label: t.label,
            }))}
          />
        </div>
      </div>
 
      {/* Chart */}
      {children}
    </div>
  );
}