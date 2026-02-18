// src/Components/DemandsManagement/DemandDetailModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Tabs, Button, message } from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";

import { getProfiles } from "../api/Profiles/addProfile.js";
import {
  attachProfilesToDemand,
//   getAttachedProfilesByDemandPkId, // <-- fetch attached profiles from backend
} from "../api/Demands/attachment.js";

const nameOf = (obj) =>
  obj && typeof obj === "object" ? (obj.name ?? "") : String(obj ?? "");

function ProfileCard({ p }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-gray-800">
          {p.candidateName ?? "-"} <span className="text-gray-500">#{p.id}</span>
        </div>
        <div className="text-xs text-gray-500">
          {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div><strong>Experience:</strong> {p.experience ?? "-"}</div>
        <div><strong>HBU:</strong> {nameOf(p.hbu) || "-"}</div>
        <div className="col-span-2">
          <strong>Primary Skills:</strong>{" "}
          {(p.primarySkills || []).map(nameOf).join(", ") || "-"}
        </div>
        {p.secondarySkills?.length ? (
          <div className="col-span-2">
            <strong>Secondary Skills:</strong>{" "}
            {(p.secondarySkills || []).map(nameOf).join(", ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProfileRow({ p, selected, onToggle }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 py-2">
      <div className="min-w-0">
        <div className="font-medium text-gray-800 truncate">
          {p.candidateName} <span className="text-gray-500">#{p.id}</span>
        </div>
        <div className="text-xs text-gray-500">
          Exp: {p.experience ?? "-"} &nbsp;•&nbsp; HBU: {nameOf(p.hbu) || "-"} &nbsp;•&nbsp; Loc:{" "}
          {nameOf(p.location) || "-"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="small" type={selected ? "primary" : "default"} onClick={() => onToggle(p)}>
          {selected ? "Attached" : "Attach"}
        </Button>
      </div>
    </div>
  );
}

/**
 * Props:
 * - open: boolean
 * - onClose: fn
 * - row: normalized demand row (has demandId for display and id as PK)
 * - statusChip: optional string
 */
export default function DemandDetailModal({
  open,
  onClose,
  row,
  statusChip,
}) {
  const [tab, setTab] = useState("details");
  const [attachMode, setAttachMode] = useState(false);

  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const [attachedProfiles, setAttachedProfiles] = useState([]);
  const [loadingAttached, setLoadingAttached] = useState(false);

  const [working, setWorking] = useState(false);
  const [selectedMap, setSelectedMap] = useState({}); // id -> profile

  // PK id required by backend
  const demandPkId = row?.id ?? null;

  // Seed selection from already-attached profiles when entering attach mode
  useEffect(() => {
    if (attachMode) {
      const seeded = {};
      (attachedProfiles || []).forEach((p) => (seeded[p.id] = p));
      setSelectedMap(seeded);
    }
  }, [attachMode, attachedProfiles]);

  // Load available profiles (unattached pool)
  const loadAvailable = async () => {
    try {
      setLoadingProfiles(true);
      const resp = await getProfiles();
      const list = Array.isArray(resp?.items) ? resp.items : (Array.isArray(resp) ? resp : []);
      setAvailableProfiles(list);
    } catch (e) {
      console.error(e);
      message.error(e?.message || "Failed to load profiles");
    } finally {
      setLoadingProfiles(false);
    }
  };

  // Load already attached profiles for this demand (server)
  const loadAttached = async () => {
    if (!demandPkId) return;
    try {
      setLoadingAttached(true);
      const res = await getAttachedProfilesByDemandPkId(demandPkId);
      // Support either paged {items:[]} or plain arrays
      const list = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
      setAttachedProfiles(list);
    } catch (e) {
      console.error(e);
      message.error(e?.message || "Failed to load attached profiles");
    } finally {
      setLoadingAttached(false);
    }
  };

  // Open behaviour: when switching to Profile tab
  useEffect(() => {
    if (!open) return;
    if (tab === "profile") {
      if (attachMode) {
        loadAvailable();
      } else {
        loadAttached();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, attachMode, demandPkId]);

  const toggleSelect = (p) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[p.id]) delete next[p.id];
      else next[p.id] = p;
      return next;
    });
  };

  const selectedArray = useMemo(() => Object.values(selectedMap), [selectedMap]);

  const submitAttach = async () => {
    if (!demandPkId) {
      message.error("Missing demand primary key id");
      return;
    }
    const ids = selectedArray.map((p) => p.id);
    if (!ids.length) {
      message.warning("Select at least one profile to attach.");
      return;
    }
    try {
      setWorking(true);
      await attachProfilesToDemand({ demandPkId, profileIds: ids });
      message.success("Profiles attached");
      // After attaching, go back to cards and refresh from backend
      setAttachMode(false);
      await loadAttached();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to attach profiles";
      message.error(msg);
    } finally {
      setWorking(false);
    }
  };

  const header = (
    <div className="flex items-center justify-between pr-2">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 text-gray-800">
          <EyeOutlined />
          <span className="font-semibold">Demand Details — {row?.demandId}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {statusChip ? (
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: "#EDF2F7",
              color: "#2D3748",
              border: "1px solid #CBD5E0",
            }}
            title="Status"
          >
            {statusChip}
          </span>
        ) : null}
      </div>
    </div>
  );

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={980} title={header}>
      {!row ? null : (
        <div className="space-y-4">
          <Tabs
            activeKey={tab}
            onChange={setTab}
            items={[
              {
                key: "details",
                label: "Demand Detail",
                children: (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div><strong>RR:</strong> {row.rrNumber || "-"}</div>
                      <div><strong>Pod/Programme:</strong> {row.prodProgramName || "-"}</div>

                      <div><strong>LOB:</strong> {row.lob || "-"}</div>
                      <div><strong>Skill Cluster:</strong> {row.skillCluster || "-"}</div>

                      <div><strong>Primary Skill:</strong> {row.primarySkills || "-"}</div>
                      <div><strong>Secondary Skill:</strong> {row.secondarySkills || "-"}</div>

                      <div><strong>Priority:</strong> {row.priority || "-"}</div>
                      <div><strong>Status:</strong> {row.status || "-"}</div>

                      <div><strong>Band:</strong> {row.band || "-"}</div>
                      <div><strong>Experience:</strong> {row.experience || "-"}</div>

                      <div><strong>Hiring Manager:</strong> {row.hiringManager || "-"}</div>
                      <div><strong>Delivery Manager:</strong> {row.deliveryManager || "-"}</div>

                      <div><strong>PM:</strong> {row.pm || "-"}</div>
                      <div><strong>PMO SPOC:</strong> {row.pmoSpoc || "-"}</div>

                      <div><strong>Sales Spoc:</strong> {row.salesSpoc || "-"}</div>
                      <div><strong>PMO:</strong> {row.pmo || "-"}</div>

                      <div><strong>HBU:</strong> {row.hbu || "-"}</div>
                      <div><strong>Timeline:</strong> {row.demandTimeline || "-"}</div>

                      <div><strong>Type:</strong> {row.demandType || "-"}</div>
                      <div><strong>Received Date:</strong> {row.demandReceivedDate || "-"}</div>

                      <div className="sm:col-span-2"><strong>Location:</strong> {row.demandLocation || "-"}</div>
                      <div className="sm:col-span-2"><strong>Remark:</strong> {row.remark || "-"}</div>
                    </div>
                  </div>
                ),
              },

              {
                key: "profile",
                label: "Profile Shared",
                children: (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm text-sm">
                    {/* Top bar INSIDE Profile Shared tab with top-right Attach Profile */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-gray-700 font-medium">Profile Shared</div>
                      {!attachMode ? (
                        <Button
                          icon={<PlusOutlined />}
                          type="primary"
                          onClick={() => {
                            setAttachMode(true);
                            // When entering attach mode, load available pool
                            loadAvailable();
                          }}
                        >
                          Attach Profile
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button onClick={() => setAttachMode(false)} disabled={working}>
                            Back
                          </Button>
                          <Button type="primary" loading={working} onClick={submitAttach}>
                            Submit
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Content area */}
                    {!attachMode ? (
                      <>
                        {loadingAttached ? (
                          <div className="text-gray-500 text-sm px-2 py-6">Loading attached profiles…</div>
                        ) : attachedProfiles?.length ? (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {attachedProfiles.map((p) => (
                              <ProfileCard key={p.id} p={p} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-600">No profile attached.</div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="rounded-md border border-gray-100 p-2">
                          {loadingProfiles ? (
                            <div className="text-gray-500 text-sm px-2 py-6">Loading profiles…</div>
                          ) : availableProfiles?.length ? (
                            <div className="divide-y divide-gray-200">
                              {availableProfiles.map((p) => (
                                <ProfileRow
                                  key={p.id}
                                  p={p}
                                  selected={!!selectedMap[p.id]}
                                  onToggle={toggleSelect}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm px-2 py-6">
                              No profiles available.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ),
              },

              {
                key: "history",
                label: "History",
                children: (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="space-y-2 text-sm">
                      <div><strong>Updated By:</strong> {"-"}</div>
                      <div><strong>Updated At:</strong> {"-"} </div>
                      <div><strong>Updated Data:</strong></div>
                      <pre className="bg-gray-50 p-2 rounded border border-gray-200 overflow-auto text-xs">
                        {"No change log available."}
                      </pre>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </Modal>
  );
}