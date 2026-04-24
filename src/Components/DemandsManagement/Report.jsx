import React from "react";
import Layout from "../Layout";
import { ExportOutlined} from "@ant-design/icons";


import { exportDemandSheet } from "../api/Export/demandsheet";
import { exportProfileSheet } from "../api/Export/profilesheet";
import { exportProfileTrackerSheet } from "../api/Export/profiletrackersheet";
import { exportOnboardingTrackerSheet } from "../api/Export/onboardingtrackersheet";
import { exportAllCombinedExcel } from "../api/Export/combineexcelexport";

const ExportButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="
      w-full flex items-center gap-3
      px-4 py-3
      border border-gray-300
      rounded-lg
      bg-white
      text-gray-800
      font-medium
      shadow-sm
      hover:bg-gray-50 hover:border-gray-400
      transition
    "
  >
    <ExportOutlined className="w-5 h-5 text-gray-600" />
    <span>{label}</span>
  </button>
);

export default function Report() {
  return (
    <Layout>
      <div className="p-5 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Reports & Exports
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Download individual reports or export all data in a combined Excel file
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <ExportButton
              label="Export Demand Sheet"
              onClick={exportDemandSheet}
            />

            <ExportButton
              label="Export Profile Sheet"
              onClick={exportProfileSheet}
            />

            <ExportButton
              label="Export Profile Tracker"
              onClick={exportProfileTrackerSheet}
            />

            <ExportButton
              label="Export Onboarding Tracker"
              onClick={exportOnboardingTrackerSheet}
            />

            <ExportButton
              label="Export All Reports (Combined Excel)"
              onClick={exportAllCombinedExcel}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}