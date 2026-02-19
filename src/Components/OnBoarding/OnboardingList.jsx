import React, { useEffect, useMemo, useState } from "react";
import Layout from "../Layout";
import { Table, Tooltip, Button, /* Input, */ message, Alert } from "antd";
import { EditOutlined /*, SearchOutlined */ } from "@ant-design/icons";
import { getAllOnboardings } from "../api/Onboarding/onBoarding";
import OnboardingEditModal from "./OnboardingEditModal";

// ---- helpers ----
function fmtDate(d) {
  if (!d) return "-";
  const parts = String(d).split("-");
  if (parts.length !== 3) return String(d);
  const [y, m, day] = parts;
  const date = new Date(Number(y), Number(m) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}
const chip =
  "inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700";

const ensureId = (row) =>
  row?.onboardingId ?? row?.id ?? row?.onboarding?.onboardingId ?? null;

export default function OnboardingList() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // --- Search UI (commented as requested) ---
  // const [query, setQuery] = useState({});
  // const [openSearch, setOpenSearch] = useState({});
  // const toggleSearch = (key) => setOpenSearch((s) => ({ ...s, [key]: !s[key] }));
  // const onQueryChange = (key, val) => setQuery((q) => ({ ...q, [key]: val }));

  async function load() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getAllOnboardings(page, size);
      console.log("Onboarding page response:", res); // sanity log

      setRows(Array.isArray(res?.content) ? res.content : []);
      setTotal(Number(res?.totalElements ?? 0));
      setFirst(Boolean(res?.first));
      setLast(Boolean(res?.last));
    } catch (err) {
      console.error("GET /onboarding failed:", err);
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load Onboarding.";
      setErrorMsg(apiMsg);
      setRows([]);
      setTotal(0);
      setFirst(true);
      setLast(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  function openEdit(row) {
    const id = ensureId(row);
    if (!id) {
      message.warning("Cannot edit: onboarding ID not found.");
      return;
    }
    setEditRow(row);
    setEditOpen(true);
  }
  function closeEdit() {
    setEditOpen(false);
    setEditRow(null);
  }

  // ----- Fixed columns for Onboarding -----
  // Demand ID first; Profile ID -> Candidate ID
  const colModel = useMemo(
    () => [
      { key: "demandId", label: "Demand ID" }, // ✅ fixed syntax; placed first
      { key: "profileId", label: "Candidate ID" }, // ✅ renamed Profile ID -> Candidate ID
      { key: "wbsType", label: "WBS Type" },
      { key: "offerDate", label: "Offer Date" },
      { key: "dateOfJoining", label: "DOJ" },
      { key: "ctoolId", label: "C-Tool ID" },
      { key: "bgvStatus", label: "BGV Status" },
      { key: "pevUpdateDate", label: "PEV Update" },
      { key: "vpTagging", label: "VP Tagging" },
      { key: "techSelectDate", label: "Tech Select" },
      { key: "hsbcOnboardingDate", label: "HSBC Onboard" },
      { key: "onboardingStatus", label: "Onboarding Status" },
    ],
    []
  );

  const antdColumns = useMemo(() => {
    const base = colModel.map((c) => {
      const isDate =
        c.key === "offerDate" ||
        c.key === "dateOfJoining" ||
        c.key === "pevUpdateDate" ||
        c.key === "vpTagging" ||
        c.key === "techSelectDate" ||
        c.key === "hsbcOnboardingDate";
      const isStatus = c.key === "bgvStatus" || c.key === "onboardingStatus";

      const renderCell = (_, row) => {
        switch (c.key) {
          case "demandId":
            // Demand ID from nested demand
            return (
              <div className="text-gray-800">{row?.demand?.demandId ?? "-"}</div>
            );

          case "profileId":
            return (
              <div className="text-gray-800">
                {row?.profile?.profileId ?? "-"}
              </div>
            );

          case "wbsType":
            return row?.wbsType ? <span className={chip}>{row.wbsType}</span> : "-";

          case "ctoolId":
            return <div className="text-gray-800">{row?.ctoolId ?? "-"}</div>;

          case "bgvStatus":
            return row?.bgvStatus ? (
              <span className={chip}>{row.bgvStatus}</span>
            ) : (
              "-"
            );

          case "onboardingStatus":
            return row?.onboardingStatus ? (
              <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {row.onboardingStatus}
              </span>
            ) : (
              "-"
            );

          case "offerDate":
            return <div className="text-gray-800">{fmtDate(row?.offerDate)}</div>;
          case "dateOfJoining":
            return <div className="text-gray-800">{fmtDate(row?.dateOfJoining)}</div>;
          case "pevUpdateDate":
            return <div className="text-gray-800">{fmtDate(row?.pevUpdateDate)}</div>;
          case "vpTagging":
            return <div className="text-gray-800">{fmtDate(row?.vpTagging)}</div>;
          case "techSelectDate":
            return <div className="text-gray-800">{fmtDate(row?.techSelectDate)}</div>;
          case "hsbcOnboardingDate":
            return (
              <div className="text-gray-800">{fmtDate(row?.hsbcOnboardingDate)}</div>
            );

          default:
            return (
              <div className="text-gray-800">{String(row?.[c.key] ?? "-")}</div>
            );
        }
      };

      return {
        key: c.key,
        dataIndex: c.key,
        title: (
          <div className="flex flex-col items-center justify-center gap-1 font-semibold">
            <div className="flex items-center gap-2">
              <span>{c.label}</span>
              {/* --- Search toggle removed as requested ---
              <SearchOutlined
                className={`text-gray-400 text-xs cursor-pointer ${
                  openSearch[c.key] ? "text-blue-600" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSearch(c.key);
                }}
                title="Search"
              />
              */}
            </div>
            {/* --- Header search input removed as requested ---
            {openSearch[c.key] && (
              <Input
                size="small"
                allowClear
                placeholder={`Search ${c.label}`}
                value={query?.[c.key] ?? ""}
                onChange={(e) => onQueryChange(c.key, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ width: 140 }}
              />
            )}
            */}
          </div>
        ),
        render: renderCell,
        onHeaderCell: () => ({
          className: "bg-white !py-2 md:!py-2 text-gray-800",
        }),
        onCell: () => ({
          className: "align-middle !py-2",
        }),
        width: isDate ? 130 : isStatus ? 150 : undefined,
      };
    });

    base.push({
      key: "actions",
      title: <div className="text-center font-semibold">Actions</div>,
      fixed: "right",
      width: 120,
      render: (_, row) => {
        const hasId = !!ensureId(row);
        return (
          <div
            className="flex items-center justify-center gap-2 text-gray-700"
            style={{ pointerEvents: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title={hasId ? "Edit" : "Edit (ID missing)"}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                disabled={!hasId}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasId) openEdit(row);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    });

    return base;
  }, [colModel /*, openSearch, query */]);

  const pagination = useMemo(
    () => ({
      current: page + 1,
      pageSize: size,
      total,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50"],
      showTotal: (t) => `${t} records`,
      placement: "bottomRight",
      size: "default",
      onChange: (p, pageSize) => {
        if (pageSize !== size) {
          setPage(0);
          setSize(pageSize);
        } else {
          setPage(p - 1);
        }
      },
      onShowSizeChange: (_, pageSize) => {
        setPage(0);
        setSize(pageSize);
      },
    }),
    [page, size, total]
  );

  return (
    <>
      <Layout>
        <div className="p-4 md:p-6">
          {/* Title row */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Onboarding</h2>
          </div>

          {/* ---- Scoped CSS (like Profiles table) ---- */}
          <style>{`
            .onboarding-table .ant-table-thead > tr > th {
              border-bottom: 1px solid #eef0f2;
              padding-top: 8px !important;
              padding-bottom: 8px !important;
            }
            .onboarding-table .ant-table-tbody > tr > td {
              border-bottom: 1px solid #f3f4f6;
              padding-top: 8px !important;
              padding-bottom: 8px !important;
            }
          `}</style>

          {errorMsg && (
            <div className="mb-2">
              <Alert type="error" showIcon message={errorMsg} />
            </div>
          )}

          <Table
            rowKey={(r) =>
              String(
                r.onboardingId ??
                  r.id ??
                  r?.onboarding?.onboardingId ??
                  `${r?.profile?.profileId ?? "p"}-${r?.demand?.demandId ?? "d"}`
              )
            }
            dataSource={rows}
            columns={antdColumns}
            pagination={pagination}
            size="middle"
            className="onboarding-table"
            loading={loading}
            scroll={{ x: true }}
          />

          {/* Edit Modal */}
          <OnboardingEditModal
            open={editOpen}
            onClose={closeEdit}
            row={
              editRow
                ? {
                    onboardingId: ensureId(editRow),
                    onboardingStatus: editRow?.onboardingStatus,
                    wbsType: editRow?.wbsType,
                    bgvStatus: editRow?.bgvStatus,
                    offerDate: editRow?.offerDate,
                    dateOfJoining: editRow?.dateOfJoining,
                    ctoolId: editRow?.ctoolId,
                    pevUpdateDate: editRow?.pevUpdateDate,
                    vpTagging: editRow?.vpTagging,
                    techSelectDate: editRow?.techSelectDate,
                    hsbcOnboardingDate: editRow?.hsbcOnboardingDate,
                    onboardingStatusId: editRow?.onboardingStatusId,
                    wbsTypeId: editRow?.wbsTypeId,
                    bgvStatusId: editRow?.bgvStatusId,
                  }
                : null
            }
            onUpdated={() => load()}
          />
        </div>
      </Layout>
    </>
  );
}