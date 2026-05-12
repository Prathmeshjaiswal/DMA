// ================== src/pages/Profiles/ProfileTable.jsx ==================
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Tooltip,
  Modal,
  Form,
  Select as AntdSelect,
  InputNumber,
  Input,
  Button,
  message,
} from "antd";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  DownloadOutlined,
  EditOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  submitProfileUpdate,
} from "../api/Profiles/addProfile.js";


// ✅ Mask PAN – show only last 4 characters// ✅ Mask PAN – show only};

const maskPan = (pan) => {
  const p = String(pan || "");
  if (p.length <= 4) return p;
  return "XXXXXX" + p.slice(-4);
};






export default function ProfileTable({
  rows = [],
  columns = [],
  visibleColumns = [],
  onViewRow,
  onDownload,
  // onUploadCv,
  onSavePatch,
  dropdownOptions = {},
  serverPage = 0,
  serverSize = 10,
  serverTotal = 0,
  onPageChange,
  onPageSizeChange,
  // NEW: search plumbing
  query = {},
  onQueryChange,
  canUpdateProfile = false,
  canViewProfile = false,
  canPanVisibility = false,
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm(); // <-- the instance we must connect BEFORE using

  const [cvUploading, setCvUploading] = useState(false);

  const [pendingCvFile, setPendingCvFile] = useState(null);


  const scrollRef = React.useRef(null);

const isDownRef = React.useRef(false);
const startXRef = React.useRef(0);
const scrollLeftRef = React.useRef(0);

  const [openSearch, setOpenSearch] = useState({});
  const toggleSearch = (key) => setOpenSearch((s) => ({ ...s, [key]: !s[key] }));

  // Track which row PAN is visible
  const [visiblePanRowId, setVisiblePanRowId] = useState(null);

  const opts = {
    locations: dropdownOptions?.demandLocation ?? [],
    hbu: dropdownOptions?.hbu ?? [],
    skillCluster: dropdownOptions?.skillCluster ?? [],
    primarySkills: dropdownOptions?.primarySkills ?? [],
    secondarySkills: dropdownOptions?.secondarySkills ?? [],


    origin: dropdownOptions?.origins ?? [],
    karatStatuses: dropdownOptions?.karatStatuses ?? [],
    sources: dropdownOptions?.sources ?? [],
    overallStatuses: dropdownOptions?.overallStatuses ?? [],

    // REQUIRED
    profileStatus: dropdownOptions?.profileStatus ?? [],
  };
  const ensureId = (row) => row?.id ?? row?.profileId;

  const uploadCvFromEditModal = async (file) => {
    if (!file) return;

    if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
      message.error("Only PDF, DOC, DOCX files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error("File must be 10MB or less");
      return;
    }

    const profileId = ensureId(editRow);
    if (!profileId) {
      message.error("Profile ID not found");
      return;
    }

    try {
      setCvUploading(true);

      // ✅ CV UPDATE ONLY
      await submitProfileUpdate(profileId, {}, file);

      message.success("CV uploaded successfully");

      // refresh table
      onPageChange?.(serverPage);
    } catch (err) {
      console.error("CV upload error:", err);
      message.error(
        err?.response?.data?.message || "Failed to upload CV"
      );
    } finally {
      setCvUploading(false);
    }
  };

  // --- compute initial values for the edit form from the selected row
  const buildInitialValues = (row) => ({



    originId: row?.origin?.id ? String(row.origin.id) : undefined,
    karatStatusId: row?.karatStatus?.id ? String(row.karatStatus.id) : undefined,
    sourceId: row?.source?.id ? String(row.source.id) : undefined,

    overallStatusRdgId: row?.overallStatusRdg?.id
      ? String(row.overallStatusRdg.id)
      : undefined,


    dateOfSubmission: row?.dateOfSubmission,
    weekOf: row?.weekOf,
    accountReceivedOn: row?.accountReceivedOn,
    statusDate: row?.statusDate,

    karatReadiness: row?.karatReadiness ?? "",
    lobShared: row?.lobShared ?? "",
    practice: row?.practice ?? "",
    band: row?.band ?? "",
    codes: row?.codes ?? "",
    codeType: row?.codeType ?? "",
    projectCode: row?.projectCode ?? "",

    ageing: row?.ageing,
    ageingRange: row?.ageingRange ?? "",
    minBillingRate: row?.minBillingRate,


    candidateName: row?.candidateName ?? "",
    emailId: row?.emailId ?? "",
    phoneNumber:
      row?.phoneNumber != null && row?.phoneNumber !== "" ? String(row.phoneNumber) : "",
    // show only if row had empId (internal)
    empId:
      row?.empId != null && String(row.empId).trim() !== "" ? String(row.empId) : undefined,

    sapId:
      row?.sapId && String(row.sapId).trim() !== ""
        ? String(row.sapId)
        : undefined,

  experienceYears:
  row?.experience != null
    ? parseFloat(row.experience)
    : undefined,

    locationId:
      row?.locationId != null && row?.locationId !== "" ? String(row.locationId) : undefined,
    hbuId: row?.hbuId != null && row?.hbuId !== "" ? String(row.hbuId) : undefined,
    skillClusterId:
      row?.skillClusterId != null && row?.skillClusterId !== ""
        ? String(row.skillClusterId)
        : undefined,
    primarySkillsIds: Array.isArray(row?.primarySkillsArray)
      ? row.primarySkillsArray.map((n) => String(n))
      : [],
    secondarySkillsIds: Array.isArray(row?.secondarySkillsArray)
      ? row.secondarySkillsArray.map((n) => String(n))
      : [],
    summary: row?.summary ?? "",


    profileStatusId:
      row?.profileStatusId != null
        ? String(row.profileStatusId)
        : undefined,



    // NEW: PAN initial (try common keys; normalize to uppercase)
    panNumber:
      row?.panNumber && String(row.panNumber).trim() !== ""
        ? String(row.panNumber).toUpperCase()
        : row?.pan && String(row.pan).trim() !== ""
          ? String(row.pan).toUpperCase()
          : row?.pan_no && String(row.pan_no).trim() !== ""
            ? String(row.pan_no).toUpperCase()
            : row?.panNo && String(row.panNo).trim() !== ""
              ? String(row.panNo).toUpperCase()
              : row?.panCard && String(row.panCard).trim() !== ""
                ? String(row.panCard).toUpperCase()
                : undefined,
  });

  const openEdit = (row) => {
    const id = ensureId(row);
    if (!id) {
      message.warning("Cannot edit: profile ID not found.");
      return;
    }
    setEditRow(row);
    setEditOpen(true); // <-- just open; we will set fields after form is mounted (see useEffect below)
  };

  // ✅ Populate form only after the modal is open and the Form is mounted/connected
  useEffect(() => {
    if (editOpen && editRow && opts.profileStatus.length > 0) {
      form.setFieldsValue(buildInitialValues(editRow));
    }
  }, [editOpen, editRow, opts.profileStatus, form]);

  useEffect(() => {
    setVisiblePanRowId(null);
  }, [rows]);



  const closeEdit = () => {
    setEditOpen(false);
    setEditRow(null);
    setPendingCvFile(null);
    form.resetFields();
  };

  const handleSave = async () => {
    const id = ensureId(editRow);
    if (!id) {
      Modal.warning({
        title: "Profile ID missing",
        content: "Cannot update because id/profileId was not found.",
      });
      return;
    }

    try {
      const values = await form.validateFields();

      const patch = {};

      const toNum = (v) =>
        v == null || v === "" || Number.isNaN(Number(v)) ? undefined : Number(v);

      const toNumArr = (arr) =>
        Array.isArray(arr)
          ? arr.map((v) => Number(v)).filter((n) => !Number.isNaN(n))
          : [];

      // ---------- BUILD PATCH ----------
      if (values.candidateName != null)
        patch.candidateName = values.candidateName.trim();

      if (values.emailId != null)
        patch.emailId = values.emailId.trim();

      if (values.phoneNumber)
        // patch.phoneNumber = String(values.phoneNumber).replace(/\D+/g, "");
        patch.phoneNumber = Number(
          String(values.phoneNumber).replace(/\D+/g, "")
        );


      if (values.sapId)
        patch.sapId = String(values.sapId).replace(/\D+/g, "");

      if (values.empId)
        patch.empId = String(values.empId).replace(/\D+/g, "");

      if (values.experienceYears != null)
        patch.experience = Number(values.experienceYears);

      if (values.profileStatusId != null)
        patch.profileStatusId = Number(values.profileStatusId);

      const locationId = toNum(values.locationId);
      if (locationId != null) patch.locationId = locationId;

      const hbuId = toNum(values.hbuId);
      if (hbuId != null) patch.hbuId = hbuId;

      const skillClusterId = toNum(values.skillClusterId);
      if (skillClusterId != null) patch.skillClusterId = skillClusterId;

      patch.primarySkillsIds = toNumArr(values.primarySkillsIds);
      patch.secondarySkillsIds = toNumArr(values.secondarySkillsIds);

      if (values.summary != null)
        patch.summary = values.summary.trim();

      if (values.panNumber)
        patch.panNumber = values.panNumber.toUpperCase().replace(/\s+/g, "");



      if (values.originId != null) patch.originId = Number(values.originId); if (values.lobShared != null) patch.lobShared = values.lobShared;
      if (values.practice != null) patch.practice = values.practice;
      if (values.band != null) patch.band = values.band;

      if (values.ageing != null) patch.ageing = Number(values.ageing);
      if (values.ageingRange != null) patch.ageingRange = values.ageingRange;

      if (values.codes != null) patch.codes = values.codes;
      if (values.codeType != null) patch.codeType = values.codeType;
      if (values.minBillingRate != null) patch.minBillingRate = Number(values.minBillingRate);
      if (values.projectCode != null) patch.projectCode = values.projectCode;
      if (values.karatStatusId != null) patch.karatStatusId = Number(values.karatStatusId);
      if (values.sourceId != null) patch.sourceId = Number(values.sourceId);
      if (values.overallStatusRdgId != null) {
        patch.overallStatusRdgId = Number(values.overallStatusRdgId);
      }


      if (values.dateOfSubmission) patch.dateOfSubmission = values.dateOfSubmission;
      if (values.weekOf) patch.weekOf = values.weekOf;
      if (values.accountReceivedOn) patch.accountReceivedOn = values.accountReceivedOn;
      if (values.statusDate) patch.statusDate = values.statusDate;

      if (values.karatReadiness != null) patch.karatReadiness = values.karatReadiness;


      // ---------- SAVE ----------
      setSaving(true);

      if (pendingCvFile) {
        await submitProfileUpdate(id, patch, pendingCvFile);
        setPendingCvFile(null);
      } else {
        await onSavePatch(id, patch);
      }

      message.success("Profile updated successfully");


      // FORCE REFRESH SO CV APPEARS
      onPageChange?.(serverPage);

      closeEdit();

    } catch (err) {
      if (!err?.errorFields) {
        Modal.error({
          title: "Update failed",
          content: err?.message || "Something went wrong while saving.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Central download handler with guards + stopPropagation
  const handleDownloadClick = (e, row) => {
    e?.stopPropagation?.();
    if (!onDownload) {
      message.warning("Download action is not available.");
      return;
    }
    if (!row?.cvFileName || String(row.cvFileName).trim() === "") {
      message.warning("No CV available for this profile.");
      return;
    }
    onDownload(row);
  };


  // console.log("ProfileTable dropdownOptions:", dropdownOptions);
  // console.log("ProfileTable profileStatus opts:", dropdownOptions?.profileStatus);
  // ``

  // ------- columns (narrow widths & ellipsis) -------
  const antdColumns = useMemo(() => {
    const base = columns
      .filter((c) => visibleColumns.includes(c.key))
      .map((c) => {
        const isPan = c.key === "panNumber";
        const isSkill =
          c.key === "skillCluster" ||
          c.key === "primarySkills" ||
          c.key === "secondarySkills";

        const colWidth = isSkill ? 220 : undefined;


        //  Make Candidate Name sticky
        const isStickyCandidate = c.key === "candidateName"


        return {
          key: c.key,
          dataIndex: c.key,


          // REQUIRED for fixed columns
          width: isStickyCandidate ? 180 : colWidth,


          // ✅ ADD THIS
          // className: isStickyCandidate ? "sticky-candidate-col" : "",

          // onCell: () => ({
          //   className: isStickyCandidate ? "sticky-candidate-col" : "",
          // }),

          // onHeaderCell: () => ({
          //   className: isStickyCandidate ? "sticky-candidate-col" : "",
          // }),


          fixed: isStickyCandidate ? "left" : undefined,


          title: (
            <div className="flex flex-col items-center justify-center gap-1 font-semibold">
              <div className="flex items-center gap-2">
                <span>{c.label}</span>
                <SearchOutlined
                  className={`text-gray-400 text-xs cursor-pointer ${openSearch[c.key] ? "text-blue-600" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSearch(c.key);
                  }}
                  title="Search"
                />
              </div>
              {openSearch[c.key] && (
                <Input
                  size="small"
                  allowClear
                  placeholder={`Search ${c.label}`}
                  value={query?.[c.key] ?? ""}
                  onChange={(e) => onQueryChange?.(c.key, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 140 }}
                />
              )}
            </div>
          ),
          render: (text, row) => {
            const value = text == null || text === "" ? "-" : String(text);
            // ✅ DATE FIELDS FORMATTING
            if (c.key === "l1InterviewDate" || c.key === "negotiableNpLwd") {
              if (value === "-") return "-";
              return new Date(value).toLocaleDateString();
            }

            if (c.key === "activeStatus") {
              const isActive = value === "Active";

              return (
                <span
                  style={{
                    color: isActive ? "#166534" : "#991b1b",
                    fontWeight: 600,
                  }}
                >
                  {value}
                </span>
              );
            }


            // ✅ PAN COLUMN LOGIC
            if (c.key === "panNumber") {
              const rowId = ensureId(row);
              const isVisible = visiblePanRowId === rowId;

              return (
                <div className="flex items-center gap-2">
                  <span className="font-mono tracking-wide">
                    {isVisible ? value : maskPan(value)}
                  </span>

                  {value !== "-" && (
                    <Button type="text"
                      size="small"
                      //  disabled={!canPanVisibility}
                      icon={isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // if (!canPanVisibility) return;
                        setVisiblePanRowId(isVisible ? null : rowId);
                      }}
                    />
                  )}
                </div>
              );
            }

            if (isSkill) {
              return (
                <Tooltip
                  placement="topLeft"
                  styles={{ root: { maxWidth: 600 } }}
                  title={<span className="whitespace-pre-wrap break-words">{value}</span>}
                >
                  <div className="cell-ellipsis cell-ellipsis-compact">{value}</div>
                </Tooltip>
              );
            }

            return <div className="text-gray-800">{value}</div>;
          },
          onHeaderCell: () => ({
            className: "bg-white !py-2  text-gray-800",
          }),
          onCell: () => ({
            className: "align-middle !py-2",
          }),
        };
      });

    base.push({
      key: "actions",
      title: <div className="text-center font-semibold">Actions</div>,
      fixed: "right",
      width: 160,
      render: (_, row) => {
        const hasId = !!ensureId(row);
        const hasCv = !!(row?.cvFileName && String(row.cvFileName).trim() !== "");

        let fileName = "";
        if (hasCv) {
          let raw = String(row.cvFileName).split(/[\\/]/).pop();

          // 1. remove "profile-" or "profile_"
          raw = raw.replace(/^profile[-_]?/i, "");

          // 2. remove leading digits like "9_", "10-", "1234_"
          raw = raw.replace(/^\d+[-_]?/, "");

          fileName = raw;
        }





        return (
          <div
            className="flex items-center justify-center gap-2 text-gray-700"
            style={{ pointerEvents: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {canViewProfile && (
              <Tooltip title="View">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewRow?.(row);
                  }}
                />
              </Tooltip>
            )}

            {canUpdateProfile && (
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
            )}

            {/* <Tooltip title={hasCv ? `Download CV (${fileName} )` : "No CV"}>
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                disabled={!hasCv}
                onClick={(e) => handleDownloadClick(e, row)}
              />
            </Tooltip> */}
            {/* CV Download / Upload */}
            {hasCv ? (
              <Tooltip title={`Download CV (${fileName})`}>
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={(e) => handleDownloadClick(e, row)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Upload CV">
                <Button
                  type="text"
                  size="small"
                  icon={<UploadOutlined />}

                  style={{ color: "#dc2626" }}   // ✅ Tailwind red-600
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#b91c1c")} // red-700
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#dc2626")}

                  onClick={(e) => {
                    e.stopPropagation();

                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".pdf,.doc,.docx";

                    input.style.display = "none";           // ✅ HIDE
                    document.body.appendChild(input);


                    input.onchange = async () => {
                      const file = input.files?.[0];
                      if (!file) return;

                      //  validate file
                      if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
                        message.error("Only PDF, DOC, DOCX files are allowed");
                        return;
                      }

                      if (file.size > 10 * 1024 * 1024) {
                        message.error("File must be 10MB or less");
                        return;
                      }

                      try {
                        const profileId = ensureId(row);
                        if (!profileId) {
                          message.error("Profile ID not found. Cannot upload CV.");
                          return;
                        }

                        // CALL UPDATE API WITH FILE ONLY
                        await submitProfileUpdate(profileId, {}, file);

                        message.success("CV uploaded successfully");

                        // FORCE REFRESH (pick ONE)
                        // Option A: refetch list from parent (BEST)
                        onPageChange?.(serverPage);

                        // Option B (if above not available):
                        // window.location.reload();

                      } catch (err) {
                        console.error("Upload CV error:", err);
                        message.error(
                          err?.response?.data?.message || "Failed to upload CV"
                        );
                      }
                    };

                    input.click();
                  }}
                />
              </Tooltip>

            )}

          </div>
        );
      },
    });

    return base;
  },
    [columns,
      visibleColumns,
      onViewRow,
      openSearch,
      query,
      onQueryChange,
      canPanVisibility,
      visiblePanRowId
    ]);


  const pagination = useMemo(
    () => ({
      current: serverPage,
      pageSize: serverSize,
      total: serverTotal,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50"],
      showTotal: (total) => `${total} profiles`,
      placement: "bottomRight",
      size: "default",
      onChange: (page, pageSize) => {
        if (pageSize !== serverSize) {
          onPageSizeChange?.(pageSize);
        } else {
          onPageChange?.(page);
        }
      },
      onShowSizeChange: (_, pageSize) => {
        onPageSizeChange?.(pageSize);
      },
    }),
    [serverPage, serverSize, serverTotal]
  );

  return (
    <>
      <div className=" rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ---- Scoped CSS ---- */}
        <style>{`
        .profiles-table .ant-table-thead > tr > th {
          border-bottom: 1px solid #eef0f2;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }
 
        .profiles-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }
 
        .profiles-table .cell-ellipsis {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #1f2937;
          max-width: 100%;
          display: block;
        }
 
        .profiles-table .cell-ellipsis-compact {
          max-width: 180px;
        }
 
        /* 🔥 FIX: prevent sticky column overlapping navbar */
        .profiles-table .ant-table-container {
          position: relative;
          z-index: 0;
        }
 
        /* 🔥 FIX: reduce z-index so navbar stays above */
        .profiles-table .ant-table-cell-fix-left {
          background: white;
          z-index: 2;
        }
 
        .profiles-table .ant-table-thead .ant-table-cell-fix-left {
          z-index: 3;
          background: #f9fafb;
        }
 
        /* 🔥 FIX: right fixed column */
        .profiles-table .ant-table-cell-fix-right {
          z-index: 2;
          background: white;
        }
 
        /* 🔥 FIX: vertical scroll body */
        .profiles-table .ant-table-body {
          overflow-y: auto !important;
        }
 
        /* Divider between sticky and scroll */
        .profiles-table .ant-table-cell-fix-left::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 1px;
          height: 100%;
          background: #7094dc;
        }
      `}</style>
      </div>
<div
  ref={scrollRef}
  className="overflow-x-auto cursor-grab active:cursor-grabbing"
  style={{ overflowY: "auto" }}

  onMouseDown={(e) => {
  const body = scrollRef.current?.querySelector('.ant-table-body');
  if (!body) return;

  isDownRef.current = true;
  startXRef.current = e.pageX - scrollRef.current.offsetLeft;
  scrollLeftRef.current = body.scrollLeft;
}}

  onMouseLeave={() => {
    isDownRef.current = false;
  }}

  onMouseUp={() => {
    isDownRef.current = false;
  }}

onMouseMove={(e) => {
  if (!isDownRef.current) return;

  e.preventDefault();

  const body = scrollRef.current?.querySelector('.ant-table-body');
  if (!body) return;

  const x = e.pageX - scrollRef.current.offsetLeft;
  const walk = (x - startXRef.current) * 1.5;

  body.scrollLeft = scrollLeftRef.current - walk;
}}

 onWheel={(e) => {
  const body = scrollRef.current?.querySelector('.ant-table-body');
  if (!body) return;

  if (e.deltaY !== 0) {
    body.scrollLeft += e.deltaY;
  }
}}
>
  <Table
    rowKey={(r) =>
      String(r.id ?? r.profileId ?? r.emailId ?? `${r.emailId}-${r.phoneNumber}`)
    }
    dataSource={rows}
    columns={antdColumns}
    pagination={pagination}
    size="middle"
    className="profiles-table"
    scroll={{ x: true }}
  />



        {/* ---- Edit Modal ---- */}
        <Modal
          open={editOpen}
          onCancel={closeEdit}
          //  Mount form subtree even when modal is closed so the form instance is always connected
          forceRender
          destroyOnHidden
          title={
            <div className="flex items-center justify-between pr-6">
              <span className="text-md font-bold">Edit Profile</span>
            </div>
          }
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button onClick={closeEdit}>Cancel</Button>
              <Button
                type="primary"
                loading={saving}
                onClick={handleSave}
                className="bg-green-700 hover:bg-green-800"
              >
                Save
              </Button>
            </div>
          }
          maskClosable
          width={780}
        >
          {/* ================= EDIT FORM ================= */}
          <Form
            form={form} // <-- connected here; warning gone
            layout="vertical"
            className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3"
          >
            <Form.Item
              name="candidateName"
              label="Candidate Name"
              rules={[{ whitespace: true, message: "Candidate name is required" }]}
            >
              <Input placeholder="Candidate name" />
            </Form.Item>

            <Form.Item
              name="emailId"
              label="Email ID"
              rules={[
                { message: "Email is required" },
                { type: "email", message: "Invalid email address" },
              ]}
            >
              <Input placeholder="name@example.com" />
            </Form.Item>

            {/* NEW: PAN Number (match backend key: panNumber) */}
            {/* <Form.Item
              name="panNumber"
              label="PAN Number"
              getValueFromEvent={(e) =>
                (e?.target?.value || "").toUpperCase().replace(/\s+/g, "")
              }
              rules={[
                { required: true, message: "PAN is required" },
                {
                  pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
                  message:
                    "Invalid PAN format. Use 10 chars: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F).",
                },
              ]}
            >
              <Input placeholder="e.g., ABCDE1234F" maxLength={10} />
            </Form.Item> */}

            <Form.Item
              name="panNumber"
              label="PAN Number"
              getValueFromEvent={(e) =>
                (e?.target?.value || "").toUpperCase().replace(/\s+/g, "")
              }
              rules={[
                {
                  validator: (_, v) => {
                    if (!v || String(v).trim() === "") {
                      return Promise.resolve(); // ✅ optional
                    }
                    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v)) {
                      return Promise.reject(
                        new Error(
                          "Invalid PAN format. Example: ABCDE1234F"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="e.g., ABCDE1234F (optional)" maxLength={10} />
            </Form.Item>

            {editRow?.empId != null && String(editRow.empId).trim() !== "" && (
              <Form.Item
                name="empId"
                label="Employee ID"
                getValueFromEvent={(e) => e?.target?.value?.replace(/\D+/g, "") ?? ""}
                rules={[
                  {
                    validator: async (_, v) => {
                      if (v == null || String(v).trim() === "") return Promise.resolve();
                      const digits = String(v).replace(/\D+/g, "");
                      if (digits.length < 6) {
                        return Promise.reject(new Error("Employee ID must be at least 6 digits."));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="e.g., 128713" inputMode="numeric" />
              </Form.Item>
            )}


            {(!editRow?.empId || String(editRow.empId).trim() === "") && (
              <Form.Item
                name="sapId"
                label="SAP ID"
                rules={[
                  {
                    validator: async (_, v) => {
                      if (!v) return Promise.resolve();
                      if (!/^\d+$/.test(String(v))) {
                        return Promise.reject(new Error("SAP ID must be numeric"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="e.g., 128754" inputMode="numeric" />
              </Form.Item>
            )}

            <Form.Item name="experienceYears" label="Experience (yrs)">
              <InputNumber

                key={editRow?.id}   // ✅ FORCE REFRESH

                style={{ width: "100%" }}
                controls={false}
                min={0}
                max={60}
                step={0.5}
                placeholder="e.g., 4"
              />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Phone"
              getValueFromEvent={(e) => e?.target?.value?.replace(/\D+/g, "") ?? ""}
              rules={[
                { message: "Please enter phone number" },
                {
                  pattern: /^[6-9]\d{9}$/,
                  message: "For India (+91), enter 10 digits starting with 6–9.",
                },
              ]}
            >
              <Input placeholder="Digits only (e.g., 9876543210)" inputMode="numeric" />
            </Form.Item>

            <Form.Item
              name="locationId"
              label="Location"
              rules={[{ message: "Select a Location" }]}
            >
              <AntdSelect
                allowClear
                placeholder="Select location"
                options={opts.locations}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item name="hbuId" label="HBU">
              <AntdSelect
                allowClear
                placeholder="Select HBU"
                options={opts.hbu}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item
              name="profileStatusId"
              label="Status"
            >
              <AntdSelect
                allowClear
                placeholder="Select status"
                options={opts.profileStatus}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item
              name="skillClusterId"
              label="Skill Cluster"
              rules={[{ message: "Select a Skill Cluster" }]}
            >
              <AntdSelect
                allowClear
                placeholder="Select skill cluster"
                options={opts.skillCluster}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item name="primarySkillsIds" label="Primary Skills" className="md:col-span-2">
              <AntdSelect
                mode="multiple"
                allowClear
                placeholder="Select primary skills"
                options={opts.primarySkills}
                showSearch
                optionFilterProp="label"
                maxTagCount="responsive"
              />
            </Form.Item>

            <Form.Item name="secondarySkillsIds" label="Secondary Skills" className="md:col-span-2">
              <AntdSelect
                mode="multiple"
                allowClear
                placeholder="Select secondary skills"
                options={opts.secondarySkills}
                showSearch
                optionFilterProp="label"
                maxTagCount="responsive"
              />
            </Form.Item>

            <Form.Item name="originId" label="Origin">
              <AntdSelect
                allowClear
                options={opts.origin}
                placeholder="Select Origin"
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item name="karatStatusId" label="Karat Status">
              <AntdSelect
                allowClear
                options={opts.karatStatuses}
                placeholder="Select Karat Status"
              />
            </Form.Item>

            <Form.Item name="sourceId" label="Source">
              <AntdSelect
                allowClear
                options={opts.sources}
                placeholder="Select Source"
              />
            </Form.Item>

            <Form.Item name="overallStatusRdgId" label="Overall Status">

              <AntdSelect
                allowClear
                options={opts.overallStatuses}
                placeholder="Select Overall Status"
              />
            </Form.Item>
            <Form.Item name="dateOfSubmission" label="Date of Submission">
              <Input type="date" />
            </Form.Item>

            <Form.Item name="weekOf" label="Week Of">
              <Input type="date" />
            </Form.Item>

            <Form.Item name="accountReceivedOn" label="Account Received On">
              <Input type="date" />
            </Form.Item>

            <Form.Item name="statusDate" label="Status Date">
              <Input type="date" />
            </Form.Item>

            <Form.Item name="karatReadiness" label="Karat Readiness">
              <Input />
            </Form.Item>


            <Form.Item name="band" label="Band">
              <Input />
            </Form.Item>

            <Form.Item name="codes" label="Codes">
              <Input />
            </Form.Item>

            <Form.Item name="codeType" label="Code Type">
              <Input />
            </Form.Item>

            <Form.Item name="projectCode" label="Project Code">
              <Input />
            </Form.Item>


            <Form.Item name="lobShared" label="LOB Shared">
              <Input />
            </Form.Item>

            <Form.Item name="practice" label="Practice">
              <Input />
            </Form.Item>



            <Form.Item name="ageing" label="Ageing">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="ageingRange" label="Ageing Range">
              <Input />
            </Form.Item>

            <Form.Item name="minBillingRate" label="Min Billing Rate">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>

            {/* ================= CV UPLOAD / REPLACE ================= */}
            <Form.Item
              label="Resume / CV"
              className="md:col-span-2"
            >
              <div className="flex items-center justify-between gap-4 rounded-md border border-gray-200 px-4 py-2">
                {/* <div className="text-sm text-gray-700">
                  {editRow?.fileName ? (
                    <>
                      <span className="font-medium">Current CV:</span>{" "}
                      <span className="text-gray-600 break-all">
                        {String(editRow.fileName).split(/[\\/]/).pop()}
                      </span>
                    </>
                  ) : (
                    <span className="text-red-600 font-medium">
                      No CV uploaded
                    </span>
                  )}
                </div> */}
                <div className="text-sm text-gray-700">
                  {pendingCvFile ? (
                    <>
                      <span className="font-medium text-green-700">
                        Selected CV:
                      </span>{" "}
                      <span className="text-gray-600 break-all">
                        {pendingCvFile.name}
                      </span>
                    </>
                  ) : editRow?.fileName ? (
                    <>
                      <span className="font-medium">
                        Current CV:
                      </span>{" "}
                      <span className="text-gray-600 break-all">
                        {String(editRow.fileName).split(/[\\/]/).pop()}
                      </span>
                    </>
                  ) : (
                    <span className="text-red-600 font-medium">
                      No CV uploaded
                    </span>
                  )}
                </div>



                <Button
                  type="default"
                  icon={<UploadOutlined />}
                  loading={cvUploading}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".pdf,.doc,.docx";
                    input.style.display = "none";
                    document.body.appendChild(input);

                    input.onchange = () => {
                      const file = input.files?.[0];
                      if (!file) return;

                      if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
                        message.error("Only PDF, DOC, DOCX files are allowed");
                        document.body.removeChild(input);
                        return;
                      }

                      if (file.size > 10 * 1024 * 1024) {
                        message.error("File must be 10MB or less");
                        document.body.removeChild(input);
                        return;
                      }

                      // ✅ STORE ONLY
                      setPendingCvFile(file);

                      document.body.removeChild(input); // ✅ cleanup
                    };

                    input.click();
                  }}

                >
                  {editRow?.fileName ? "Replace CV" : "Upload CV"}
                </Button>
              </div>
            </Form.Item>


            <Form.Item
              name="summary"
              label="Summary"
              rules={[{ max: 2000, message: "Max 2000 characters" }]}
              className="md:col-span-2"
            >
              <Input.TextArea rows={3} placeholder="Short summary / remark" maxLength={2000} showCount />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}