// ================== src/components/history/HistoryPanel.jsx ==================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Timeline, Tag, Empty, Spin, Alert } from "antd";
import {
  ClockCircleOutlined,
  EditOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SwapOutlined,
  TeamOutlined,
  ReloadOutlined,
  FileSearchOutlined,
  StopOutlined,
  PlayCircleOutlined,
  FieldTimeOutlined,
  UserOutlined,
} from "@ant-design/icons";

// 🔁 Adjust import path if needed
import { getDemandHistory, getProfileHistory } from ".././api/History";

/* ----------------------------- icon + color ------------------------------ */
const actionStyle = (action = "") => {
  const a = String(action || "").toUpperCase();
  if (/CREATE|CREATED|ADD|ADDED/.test(a)) return { color: "green", icon: <PlusOutlined /> };
  if (/UPDATE|UPDATED|EDIT/.test(a)) return { color: "blue", icon: <EditOutlined /> };
  if (/STATUS|STATE|MOVE|TRANSITION|CHANGE/.test(a)) return { color: "geekblue", icon: <SwapOutlined /> };
  if (/ATTACH|LINK|ASSIGN/.test(a)) return { color: "purple", icon: <TeamOutlined /> };
  if (/DETACH|UNLINK|REMOVE/.test(a)) return { color: "volcano", icon: <MinusOutlined /> };
  if (/CLOSE|FULFILLED|DONE|COMPLETED/.test(a)) return { color: "default", icon: <CheckCircleOutlined /> };
  if (/REOPEN|OPEN/.test(a)) return { color: "cyan", icon: <ReloadOutlined /> };
  if (/REJECT|BACKOUT|RESIGN|ABANDON/.test(a)) return { color: "red", icon: <CloseCircleOutlined /> };
  if (/BGV/.test(a)) return { color: "orange", icon: <FileSearchOutlined /> };
  if (/HOLD/.test(a)) return { color: "gold", icon: <StopOutlined /> };
  if (/START|BEGIN/.test(a)) return { color: "lime", icon: <PlayCircleOutlined /> };
  return { color: "default", icon: <ClockCircleOutlined /> };
};

/* ----------------------------- utilities --------------------------------- */
function toLocal(ts) {
  if (!ts) return "-";
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return String(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
}
const capitalizeWords = (s) => {
  if (!s) return "";
  return String(s)
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Title-case a name like "simran kasare" -> "Simran Kasare"
const titleCase = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Prefer names/labels; handle arrays; and for plain objects that
 * don't expose a friendly key, return null (so UI shows —) rather than JSON.
 */
function extractDisplay(val) {
  if (val == null) return null;

  // Array
  if (Array.isArray(val)) {
    const parts = val
      .map((x) => {
        if (x == null) return null;
        if (typeof x === "object") {
          const named = x.name ?? x.label ?? x.value ?? null;
          return named != null && String(named).trim() !== "" ? String(named) : null;
        }
        const s = String(x);
        return s.trim() !== "" ? s : null;
      })
      .filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }

  // Object
  if (typeof val === "object") {
    const named = val.name ?? val.label ?? val.value ?? null;
    if (named == null || String(named).trim() === "") return null;
    return String(named);
  }

  // Primitive
  const s = String(val);
  return s.trim() === "" ? null : s;
}

// Friendly labels
const LABELS = {
  priority: "Priority",
  skillCluster: "Skill Cluster",
  primarySkills: "Primary Skills",
  secondarySkills: "Secondary Skills",
  demandTimeline: "Demand Timeline",
  demandTimelineId: "Demand Timeline Id",
  hbuId: "HBU Id",
  hbu: "HBU",
  locationId: "Location Id",
  location: "Location",
  onboardingStatus: "Onboarding Status",
  bgvStatus: "BGV Status",
  interviewDate: "Interview Date",
};
function makeFieldLabel(field) {
  return LABELS[field] ?? capitalizeWords(field);
}

/**
 * Build sentences from diff (non-ATTACH path):
 *  - Uses names/labels if present. Otherwise shows — for blank/unknown.
 *  - Keeps ID fields visible.
 */
function buildChangeSentences(item) {
  const sentences = [];
  const diff = item?.diff && typeof item.diff === "object" ? item.diff : {};

  // Optional explicit status support
  const fromStatus = item?.fromStatus ?? item?.oldStatus ?? item?.prevStatus ?? item?.previousStatus;
  const toStatus = item?.toStatus ?? item?.newStatus ?? item?.currentStatus;
  if (fromStatus !== undefined || toStatus !== undefined) {
    const sFrom = extractDisplay(fromStatus) ?? "—";
    const sTo = extractDisplay(toStatus) ?? "—";
    sentences.push({
      field: "Status",
      from: sFrom,
      to: sTo,
      sentence: `Status changed from ${sFrom} to ${sTo}`,
    });
  }

  for (const [fieldRaw, detail] of Object.entries(diff)) {
    const field = String(fieldRaw);
    let fromVal, toVal;

    if (detail && typeof detail === "object" && !Array.isArray(detail)) {
      fromVal = detail.old ?? detail.from ?? detail.previous ?? undefined;
      toVal = detail.new ?? detail.to ?? detail.current ?? undefined;
    } else if (Array.isArray(detail) && detail.length >= 2) {
      fromVal = detail[0];
      toVal = detail[1];
    } else {
      fromVal = undefined;
      toVal = detail;
    }

    const fromTxt = extractDisplay(fromVal) ?? "—";
    const toTxt = extractDisplay(toVal) ?? "—";
    const label = makeFieldLabel(field);

    sentences.push({
      field: label,
      from: fromTxt,
      to: toTxt,
      sentence: `${label} changed from ${fromTxt} to ${toTxt}`,
    });
  }

  // De-dup by sentence
  const seen = new Set();
  return sentences.filter((s) => {
    if (seen.has(s.sentence)) return false;
    seen.add(s.sentence);
    return true;
  });
}

/* -------------------------- sentence rendering --------------------------- */
function ValuePill({ value, tone = "old" }) {
  // old -> red, new -> green
  const styleOld = { backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" };
  const styleNew = { backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" };
  const style = tone === "new" ? styleNew : styleOld;

  return (
    <span className="inline-block rounded-md px-1.5 py-[1px] text-[12px] align-baseline" style={style}>
      {String(value)}
    </span>
  );
}

function SentenceRow({ s }) {
  const fieldLabel = s.field || "Field";
  const hasBoth = s.from != null && s.to != null;

  return (
    <div className="text-gray-800">
      <span className="select-none">•</span>{" "}
      <strong>{fieldLabel}</strong>
      {hasBoth ? (
        <>
          {" "}changed from{" "}
          <ValuePill value={s.from ?? "—"} tone="old" />
          {" "}to{" "}
          <ValuePill value={s.to ?? "—"} tone="new" />
        </>
      ) : (
        <>
          {" "}changed to{" "}
          <ValuePill value={s.to ?? "—"} tone="new" />
        </>
      )}
    </div>
  );
}

/* ----------------------------- item renderer ----------------------------- */
function HistoryItem({ item }) {
  const action = item?.action ?? "EVENT";
  const { color, icon } = actionStyle(action);

  // changedByUserId can be an object: { userId, username }
  const actor =
    (typeof item?.changedByUserId === "object" && (item?.changedByUserId?.username || item?.changedByUserId?.userId)) ||
    item?.username ||
    item?.userName ||
    item?.changedByName ||
    item?.changedByUserId ||
    "System";

  const changedAt =
    item?.changedAt ?? item?.timestamp ?? item?.occurredAt ?? item?.createdAt ?? item?.updatedAt;

  const type = item?.entityType;

  // ---------- Special case: ATTACH event ----------
  const isAttach = String(action).toUpperCase().includes("ATTACH");

  // Resolve candidate name robustly and title-case it
  const candidateNameRaw =
    item?.profileInfoDTO?.candidateName ??
    item?.candidateName ??
    item?.profileName ??
    null;
  const candidateName = candidateNameRaw ? titleCase(candidateNameRaw) : null;

  let sentences = [];
  if (isAttach) {
    // ✅ As requested: show candidate name inside the green (styleNew) ValuePill
    // Single friendly sentence, no diff rows.
    sentences = [{
      field: "Attachment",
      from: "—",
      to: candidateName ?? "—",
      sentence: candidateName
        ? `Profile attached: ${candidateName}`
        : `Profile attached`,
    }];
  } else {
    // Non-attach: use normal diff mapping
    sentences = buildChangeSentences(item);
  }

  return (
    <div className="w-full">
      <div className="rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Tag color={color} className="px-2 py-0.5 text-[12px]">{action}</Tag>
            {/* {type ? <Tag className="px-2 py-0.5 text-[12px]">{String(type)}</Tag> : null} */}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1">
              <UserOutlined />
              <span className="font-medium">{String(actor)}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <FieldTimeOutlined />
              <span title={String(changedAt)}>{toLocal(changedAt)}</span>
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-3 text-sm space-y-1.5">
          {sentences.length > 0 ? (
            isAttach ? (
              // Render the attach sentence with candidate name in green pill
              <div className="text-gray-800">
                <span className="select-none">•</span>{" "}
                <strong>Profile attached:</strong>{" "}
                <ValuePill value={candidateName ?? "—"} tone="new" />
              </div>
            ) : (
              sentences.map((s, i) => <SentenceRow key={i} s={s} />)
            )
          ) : (
            <div className="text-gray-500">No readable changes.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ main panel ------------------------------- */
export default function HistoryPanel({
  mode = "",        // "demand" | "profile"
  entityId,
  fetchSize = 100,  // fetch more to avoid pagination
  className = "",
  maxHeight = "48vh", // scrollable
}) {
  const [data, setData] = useState({ content: [], total: 0, page: 0, size: fetchSize });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const fetcher = useCallback(async () => {
    if (entityId == null) return;
    setLoading(true);
    setErr(null);
    try {
      const fn = mode === "profile" ? getProfileHistory : getDemandHistory;
      const res = await fn(entityId, { page: 0, size: fetchSize, includeDiff: true });
      setData(res);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [mode, entityId, fetchSize]);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  const items = useMemo(() => data?.content ?? [], [data]);

  return (
    <div className={className}>
      <div className="font-semibold text-gray-800 mb-3">Activity Log</div>

      <div
        className="rounded-xl border border-gray-200 bg-white"
        style={{ maxHeight, overflowY: "auto" }}
      >
        {err ? (
          <div className="p-4">
            <Alert
              type="error"
              message="Failed to load history"
              description={String(err?.message ?? "Unknown error")}
              showIcon
            />
          </div>
        ) : loading ? (
          <div className="p-8 flex items-center justify-center">
            <Spin tip="Loading history..." />
          </div>
        ) : items.length === 0 ? (
          <div className="p-10">
            <Empty description="No activity yet" />
          </div>
        ) : (
          <div className="p-3">
            <Timeline
              mode="left"
              items={items.map((it) => {
                const action = it?.title ?? "EVENT";
                const { color, icon } = actionStyle(action);
                return { color, dot: icon, children: <HistoryItem item={it} /> };
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}