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
    <div className="rounded-xl border border-slate-700 bg-white p-4">
 
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          {title}
        </h3>
 
        <div className="flex gap-2">
          {/* MULTI SELECT STATUS */}
          <Select
            mode="multiple"
            size="small"
            value={selectedStatus}
            onChange={onStatusChange}
            className="w-44"
            placeholder="Status"
            options={STATUS_OPTIONS.map(s => ({
              value: s.key,
              label: s.label,
            }))}
          />
 
          {/* TIMELINE */}
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