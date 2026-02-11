// // ================== src/pages/Profiles/ProfileTable.jsx ==================
// import React, { useMemo, useState } from "react";
// import {
//   Table,
//   Tooltip,
//   Modal,
//   Form,
//   Select as AntdSelect,
//   InputNumber,
//   Input,
//   Button,
//   message,
// } from "antd";
// import {
//   EyeOutlined,
//   DownloadOutlined,
//   EditOutlined,
//   SearchOutlined,
// } from "@ant-design/icons";

// export default function ProfileTable({
//   rows = [],
//   columns = [],
//   visibleColumns = [],
//   onViewRow,
//   onDownload,
//   onSavePatch,
//   dropdownOptions = {},
//   serverPage = 0,
//   serverSize = 10,
//   serverTotal = 0,
//   onPageChange,
//   onPageSizeChange,
//   // NEW: search plumbing
//   query = {},
//   onQueryChange,
// }) {
//   // Edit modal state
//   const [editOpen, setEditOpen] = useState(false);
//   const [editRow, setEditRow] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [form] = Form.useForm();

//   // Per-column search toggle state
//   const [openSearch, setOpenSearch] = useState({});
//   const toggleSearch = (key) => setOpenSearch((s) => ({ ...s, [key]: !s[key] }));

//   // Dropdowns normalized
//   const opts = {
//     locations: dropdownOptions?.demandLocation ?? [],
//     hbu: dropdownOptions?.hbu ?? [],
//     skillCluster: dropdownOptions?.skillCluster ?? [],
//     primarySkills: dropdownOptions?.primarySkills ?? [],
//     secondarySkills: dropdownOptions?.secondarySkills ?? [],
//   };

//   const ensureId = (row) => row?.id ?? row?.profileId;

//   const openEdit = (row) => {
//     const id = ensureId(row);
//     if (!id) {
//       message.warning("Cannot edit: profile ID not found.");
//       return;
//     }
//     setEditRow(row);
//     form.setFieldsValue({
//       // ================= PRE-FILL ALL FIELDS (UPDATED) =================
//       candidateName: row?.candidateName ?? "",
//       emailId: row?.emailId ?? "",
//       phoneNumber:
//         row?.phoneNumber != null && row?.phoneNumber !== ""
//           ? String(row.phoneNumber)
//           : "",
//       empId:
//         row?.empId != null && String(row.empId).trim() !== ""
//           ? String(row.empId)
//           : undefined,

//       experienceYears:
//         row?.experienceYears != null && row?.experienceYears !== ""
//           ? Number(row.experienceYears)
//           : undefined,
//       locationId:
//         row?.locationId != null && row?.locationId !== ""
//           ? String(row.locationId)
//           : undefined,
//       hbuId:
//         row?.hbuId != null && row?.hbuId !== "" ? String(row.hbuId) : undefined,
//       skillClusterId:
//         row?.skillClusterId != null && row?.skillClusterId !== ""
//           ? String(row.skillClusterId)
//           : undefined,
//       primarySkillsIds: Array.isArray(row?.primarySkillsArray)
//         ? row.primarySkillsArray.map((n) => String(n))
//         : [],
//       secondarySkillsIds: Array.isArray(row?.secondarySkillsArray)
//         ? row.secondarySkillsArray.map((n) => String(n))
//         : [],
//       summary: row?.summary ?? "",
//     });
//     setEditOpen(true);
//   };

//   const closeEdit = () => {
//     setEditOpen(false);
//     setEditRow(null);
//     form.resetFields();
//   };

//   const handleSave = async () => {
//     const id = ensureId(editRow);
//     if (!id) {
//       Modal.warning({
//         title: "Profile ID missing",
//         content: "Cannot update because id/profileId was not found.",
//       });
//       return;
//     }

//     try {
//       const values = await form.validateFields();

//       // Numeric helpers
//       const toNum = (v) =>
//         v == null || v === "" || Number.isNaN(Number(v)) ? undefined : Number(v);
//       const toNumArr = (arr) =>
//         Array.isArray(arr)
//           ? arr
//               .map((v) => Number(v))
//               .filter((n) => typeof n === "number" && !Number.isNaN(n))
//           : [];

//       // ================= READ ALL FIELDS (UPDATED) =================
//       const candidateName =
//         values.candidateName?.trim() ??
//         (editRow?.candidateName != null ? String(editRow.candidateName).trim() : undefined);

//       const emailId =
//         values.emailId?.trim() ??
//         (editRow?.emailId != null ? String(editRow.emailId).trim() : undefined);

//       const phoneRaw =
//         values.phoneNumber != null
//           ? String(values.phoneNumber)
//           : editRow?.phoneNumber != null
//           ? String(editRow.phoneNumber)
//           : "";
//       const phoneDigits = phoneRaw.replace(/\D+/g, ""); // keep digits only

//       const empRaw = values.empId != null ? String(values.empId) : editRow?.empId != null ? String(editRow.empId) : undefined;
//       const empDigits =
//         empRaw != null && empRaw !== "" ? empRaw.replace(/\D+/g, "") : undefined;

//       const experience =
//         values.experienceYears != null
//           ? Number(values.experienceYears)
//           : editRow?.experienceYears != null
//           ? Number(editRow.experienceYears)
//           : undefined;

//       // Foreign keys from selects (fall back to row ids if untouched)
//       const locationId =
//         toNum(values.locationId) ??
//         (editRow?.locationId != null ? Number(editRow.locationId) : undefined);

//       const hbuId =
//         toNum(values.hbuId) ?? (editRow?.hbuId != null ? Number(editRow.hbuId) : undefined);

//       const skillClusterId =
//         toNum(values.skillClusterId) ??
//         (editRow?.skillClusterId != null ? Number(editRow.skillClusterId) : undefined);

//       // Skills
//       const primarySkillsIds = toNumArr(
//         values.primarySkillsIds ?? editRow?.primarySkillsArray ?? []
//       );
//       const secondarySkillsIds = toNumArr(
//         values.secondarySkillsIds ?? editRow?.secondarySkillsArray ?? []
//       );

//       // ---- FINAL PATCH (DTO-friendly keys) ----
//       const patch = {};
//       if (candidateName != null) patch.candidateName = candidateName; // UPDATED
//       if (emailId != null) patch.emailId = emailId;                   // UPDATED
//       if (phoneDigits) patch.phoneNumber = phoneDigits;               // UPDATED

//       if (experience != null) patch.experience = experience;
//       if (locationId != null) patch.locationId = locationId;
//       if (hbuId != null) patch.hbuId = hbuId;
//       if (skillClusterId != null) patch.skillClusterId = skillClusterId;

//       // arrays (always include)
//       patch.primarySkillsIds = primarySkillsIds;
//       patch.secondarySkillsIds = secondarySkillsIds;

//       if (empDigits !== undefined) patch.empId = empDigits; // UPDATED (only for internal rows)

//       if (values.summary != null) {
//         patch.summary = String(values.summary).trim();
//       } else if (editRow?.summary != null) {
//         patch.summary = String(editRow.summary).trim();
//       }

//       setSaving(true);
//       await onSavePatch?.(id, patch);
//       message.success("Profile updated");
//       closeEdit();
//     } catch (err) {
//       if (!err?.errorFields) {
//         Modal.error({
//           title: "Update failed",
//           content: err?.message || "Something went wrong while saving.",
//         });
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Columns with header search (icon toggles input)
//   const antdColumns = useMemo(() => {
//     const base = columns
//       .filter((c) => visibleColumns.includes(c.key))
//       .map((c) => {
//         const isSkill =
//           c.key === "skillCluster" ||
//           c.key === "primarySkills" ||
//           c.key === "secondarySkills";

//         // Narrow width to force early truncation
//         const colWidth = isSkill ? 220 : undefined;

//         return {
//           key: c.key,
//           dataIndex: c.key,
//           width: colWidth,
//           title: (
//             <div className="flex flex-col items-center justify-center gap-1 font-semibold">
//               <div className="flex items-center gap-2">
//                 <span>{c.label}</span>
//                 <SearchOutlined
//                   className={`text-gray-400 text-xs cursor-pointer ${
//                     openSearch[c.key] ? "text-blue-600" : ""
//                   }`}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     toggleSearch(c.key);
//                   }}
//                   title="Search"
//                 />
//               </div>
//               {openSearch[c.key] && (
//                 <Input
//                   size="small"
//                   allowClear
//                   placeholder={`Search ${c.label}`}
//                   value={query?.[c.key] ?? ""}
//                   onChange={(e) => onQueryChange?.(c.key, e.target.value)}
//                   onClick={(e) => e.stopPropagation()}
//                   style={{ width: 140 }}
//                 />
//               )}
//             </div>
//           ),
//           render: (text) => {
//             const value = text == null || text === "" ? "-" : String(text);

//             if (isSkill) {
//               return (
//                 <Tooltip
//                   placement="topLeft"
//                   styles={{ root: { maxWidth: 600 } }}
//                   title={<span className="whitespace-pre-wrap break-words">{value}</span>}
//                 >
//                   <div className="cell-ellipsis cell-ellipsis-compact">{value}</div>
//                 </Tooltip>
//               );
//             }

//             return <div className="text-gray-800">{value}</div>;
//           },
//           onHeaderCell: () => ({
//             className: "bg-white !py-2 md:!py-2 text-gray-800", // tighter header
//           }),
//           onCell: () => ({
//             className: "align-middle !py-2", // tighter row height
//           }),
//         };
//       });

//     base.push({
//       key: "actions",
//       title: <div className="text-center font-semibold">Actions</div>,
//       fixed: "right",
//       width: 120,
//       render: (_, row) => {
//         const hasId = !!ensureId(row);
//         return (
//           <div className="flex items-center justify-center gap-3 text-gray-700">
//             <EyeOutlined
//               className="cursor-pointer hover:text-blue-600"
//               onClick={() => onViewRow?.(row)}
//               title="View"
//             />
//             <EditOutlined
//               className={
//                 "hover:text-amber-600 " +
//                 (hasId ? "cursor-pointer" : "cursor-not-allowed text-gray-300")
//               }
//               onClick={() => hasId && openEdit(row)}
//               title={hasId ? "Edit" : "Edit (ID missing)"}
//             />
//             <DownloadOutlined
//               className="cursor-pointer hover:text-green-700"
//               onClick={() => onDownload?.(row)}
//               title="Download CV"
//             />
//           </div>
//         );
//       },
//     });

//     return base;
//   }, [columns, visibleColumns, onViewRow, onDownload, openSearch, query, onQueryChange]);

//   // Pagination
//   const pagination = useMemo(
//     () => ({
//       current: serverPage + 1,
//       pageSize: serverSize,
//       total: serverTotal,
//       showSizeChanger: true,
//       pageSizeOptions: [ "10", "20", "50"],
//       showTotal: (total) => `${total} profiles`,
//       placement: "bottomRight",
//       size: "default",
//       onChange: (page, pageSize) => {
//         if (pageSize !== serverSize) {
//           onPageSizeChange?.(pageSize);
//         } else {
//           onPageChange?.(page - 1);
//         }
//       },
//       onShowSizeChange: (_, pageSize) => {
//         onPageSizeChange?.(pageSize);
//       },
//     }),
//     [serverPage, serverSize, serverTotal, onPageChange, onPageSizeChange]
//   );

//   return (
//     <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//       <Table
//         rowKey={(r) => String(r.id ?? r.profileId ?? r.emailId ?? `${r.emailId}-${r.phoneNumber}`)}
//         dataSource={rows}
//         columns={antdColumns}
//         pagination={pagination}
//         size="middle"
//         className="profiles-table"
//         scroll={{ x: true }}
//       />

//       {/* ---- Edit Modal ---- */}
//       <Modal
//         open={editOpen}
//         onCancel={closeEdit}
//         title={
//           <div className="flex items-center justify-between pr-6">
//             <span className="text-lg font-bold">Edit Profile</span>
//           </div>
//         }
//         footer={
//           <div className="flex items-center justify-end gap-2">
//             <Button onClick={closeEdit}>Cancel</Button>
//             <Button
//               type="primary"
//               loading={saving}
//               onClick={handleSave}
//               className="bg-green-700 hover:bg-green-800"
//             >
//               Save
//             </Button>
//           </div>
//         }
//         destroyOnHidden
//         maskClosable
//         width={780}
//       >
//         {/* ================= EDIT FORM WITH ALL FIELDS (UPDATED) ================= */}
//         <Form
//           form={form}
//           layout="vertical"
//           className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3"
//         >
//           <Form.Item
//             name="candidateName"
//             label="Candidate Name"
//             rules={[{  message: "Candidate name is required" }]}
//           >
//             <Input placeholder="Candidate name" />
//           </Form.Item>

//           <Form.Item
//             name="emailId"
//             label="Email ID"
//             rules={[
//               {  message: "Email is required" },
//               { type: "email", message: "Invalid email" },
//             ]}
//           >
//             <Input placeholder="name@example.com" />
//           </Form.Item>

//           {/* Conditionally show Employee ID if present on row */}
//           {editRow?.empId != null && String(editRow.empId).trim() !== "" && (
//             <Form.Item
//               name="empId"
//               label="Employee ID"
//               rules={[
//                 {
//                   validator: async (_, v) => {
//                     if (v == null || String(v).trim() === "") return Promise.resolve();
//                     const digits = String(v).replace(/\D+/g, "");
//                     if (digits.length < 6) {
//                       return Promise.reject(
//                         new Error("Employee ID must be at least 6 digits")
//                       );
//                     }
//                     return Promise.resolve();
//                   },
//                 },
//               ]}
//             >
//               <Input placeholder="e.g., 128713" inputMode="numeric" />
//             </Form.Item>
//           )}

//           <Form.Item name="experienceYears" label="Experience (yrs)">
//             <InputNumber style={{ width: "100%" }} controls={false} min={0} max={60} step={0.5} placeholder="e.g., 4" />
//           </Form.Item>

//           <Form.Item name="phoneNumber" label="Phone">
//             <Input placeholder="Digits only" inputMode="numeric" />
//           </Form.Item>

//           <Form.Item name="locationId" label="Location">
//             <AntdSelect
//               allowClear
//               placeholder="Select location"
//               options={opts.locations}
//               showSearch
//               optionFilterProp="label"
//             />
//           </Form.Item>

//           <Form.Item name="hbuId" label="HBU">
//             <AntdSelect
//               allowClear
//               placeholder="Select HBU"
//               options={opts.hbu}
//               showSearch
//               optionFilterProp="label"
//             />
//           </Form.Item>

//           <Form.Item name="skillClusterId" label="Skill Cluster">
//             <AntdSelect
//               allowClear
//               placeholder="Select skill cluster"
//               options={opts.skillCluster}
//               showSearch
//               optionFilterProp="label"
//             />
//           </Form.Item>

//           <Form.Item name="primarySkillsIds" label="Primary Skills" className="md:col-span-2">
//             <AntdSelect
//               mode="multiple"
//               allowClear
//               placeholder="Select primary skills"
//               options={opts.primarySkills}
//               showSearch
//               optionFilterProp="label"
//               maxTagCount="responsive"
//             />
//           </Form.Item>

//           <Form.Item name="secondarySkillsIds" label="Secondary Skills" className="md:col-span-2">
//             <AntdSelect
//               mode="multiple"
//               allowClear
//               placeholder="Select secondary skills"
//               options={opts.secondarySkills}
//               showSearch
//               optionFilterProp="label"
//               maxTagCount="responsive"
//             />
//           </Form.Item>

//           <Form.Item name="summary" label="Summary" className="md:col-span-2">
//             <Input.TextArea rows={3} placeholder="Short summary / remark" maxLength={1000} showCount />
//           </Form.Item>
//         </Form>
//       </Modal>

//       {/* ---- Scoped CSS ---- */}
//       <style>{`
//         .profiles-table .ant-table-thead > tr > th {
//           border-bottom: 1px solid #eef0f2;
//           padding-top: 8px !important;
//           padding-bottom: 8px !important;
//         }
//         .profiles-table .ant-table-tbody > tr > td {
//           border-bottom: 1px solid #f3f4f6;
//           padding-top: 8px !important;
//           padding-bottom: 8px !important;
//         }
//         /* Single-line ellipsis for long text cells (skills) */
//         .profiles-table .cell-ellipsis {
//           overflow: hidden;
//           text-overflow: ellipsis;
//           white-space: nowrap;
//           color: #1f2937; /* gray-800 */
//           max-width: 100%;
//           display: block;
//         }
//         /* Shorter preview for long skills */
//         .profiles-table .cell-ellipsis-compact {
//           max-width: 180px;
//         }
//       `}</style>
//     </div>
//   );
// }


// ================== src/pages/Profiles/ProfileTable.jsx ==================
import React, { useMemo, useState } from "react";
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
  DownloadOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";

export default function ProfileTable({
  rows = [],
  columns = [],
  visibleColumns = [],
  onViewRow,
  onDownload,
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
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const [openSearch, setOpenSearch] = useState({});
  const toggleSearch = (key) => setOpenSearch((s) => ({ ...s, [key]: !s[key] }));

  const opts = {
    locations: dropdownOptions?.demandLocation ?? [],
    hbu: dropdownOptions?.hbu ?? [],
    skillCluster: dropdownOptions?.skillCluster ?? [],
    primarySkills: dropdownOptions?.primarySkills ?? [],
    secondarySkills: dropdownOptions?.secondarySkills ?? [],
  };

  const ensureId = (row) => row?.id ?? row?.profileId;

  const openEdit = (row) => {
    const id = ensureId(row);
    if (!id) {
      message.warning("Cannot edit: profile ID not found.");
      return;
    }
    setEditRow(row);

    form.setFieldsValue({
      candidateName: row?.candidateName ?? "",
      emailId: row?.emailId ?? "",
      phoneNumber:
        row?.phoneNumber != null && row?.phoneNumber !== ""
          ? String(row.phoneNumber)
          : "",

      // show only if row had empId (internal)
      empId:
        row?.empId != null && String(row.empId).trim() !== ""
          ? String(row.empId)
          : undefined,

      experienceYears:
        row?.experienceYears != null && row?.experienceYears !== ""
          ? Number(row.experienceYears)
          : undefined,
      locationId:
        row?.locationId != null && row?.locationId !== ""
          ? String(row.locationId)
          : undefined,
      hbuId:
        row?.hbuId != null && row?.hbuId !== "" ? String(row.hbuId) : undefined,
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
    });

    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditRow(null);
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

      const toNum = (v) =>
        v == null || v === "" || Number.isNaN(Number(v)) ? undefined : Number(v);
      const toNumArr = (arr) =>
        Array.isArray(arr)
          ? arr.map((v) => Number(v)).filter((n) => typeof n === "number" && !Number.isNaN(n))
          : [];

      const candidateName = values.candidateName?.trim();
      const emailId = values.emailId?.trim();

      // sanitize digits only
      const phoneDigits = String(values.phoneNumber ?? "")
        .replace(/\D+/g, "");

      const empDigits =
        values.empId != null && String(values.empId).trim() !== ""
          ? String(values.empId).replace(/\D+/g, "")
          : undefined;

      const experience =
        values.experienceYears != null ? Number(values.experienceYears) : undefined;

      const locationId = toNum(values.locationId);
      const hbuId = toNum(values.hbuId);
      const skillClusterId = toNum(values.skillClusterId);

      const primarySkillsIds = toNumArr(values.primarySkillsIds);
      const secondarySkillsIds = toNumArr(values.secondarySkillsIds);

      const patch = {};
      if (candidateName != null) patch.candidateName = candidateName; // UPDATED
      if (emailId != null)       patch.emailId = emailId;             // UPDATED
      if (phoneDigits)           patch.phoneNumber = phoneDigits;      // UPDATED

      if (experience != null)    patch.experience = experience;
      if (locationId != null)    patch.locationId = locationId;        // REQUIRED
      if (hbuId != null)         patch.hbuId = hbuId;                  // optional
      if (skillClusterId != null)patch.skillClusterId = skillClusterId; // REQUIRED

      patch.primarySkillsIds   = primarySkillsIds;
      patch.secondarySkillsIds = secondarySkillsIds;

      if (empDigits !== undefined) patch.empId = empDigits;            // UPDATED

      if (values.summary != null) patch.summary = String(values.summary).trim();

      setSaving(true);
      await onSavePatch?.(id, patch);
      message.success("Profile updated");
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

  // ------- columns (unchanged except for narrow widths & ellipsis) -------
  const antdColumns = useMemo(() => {
    const base = columns
      .filter((c) => visibleColumns.includes(c.key))
      .map((c) => {
        const isSkill =
          c.key === "skillCluster" ||
          c.key === "primarySkills" ||
          c.key === "secondarySkills";

        const colWidth = isSkill ? 220 : undefined;

        return {
          key: c.key,
          dataIndex: c.key,
          width: colWidth,
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
          render: (text) => {
            const value = text == null || text === "" ? "-" : String(text);
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
            className: "bg-white !py-2 md:!py-2 text-gray-800",
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
      width: 120,
      render: (_, row) => {
        const hasId = !!ensureId(row);
        return (
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <EyeOutlined
              className="cursor-pointer hover:text-blue-600"
              onClick={() => onViewRow?.(row)}
              title="View"
            />
            <EditOutlined
              className={
                "hover:text-amber-600 " +
                (hasId ? "cursor-pointer" : "cursor-not-allowed text-gray-300")
              }
              onClick={() => hasId && openEdit(row)}
              title={hasId ? "Edit" : "Edit (ID missing)"}
            />
            <DownloadOutlined
              className="cursor-pointer hover:text-green-700"
              onClick={() => onDownload?.(row)}
              title="Download CV"
            />
          </div>
        );
      },
    });

    return base;
  }, [columns, visibleColumns, onViewRow, onDownload, openSearch, query, onQueryChange]);

  const pagination = useMemo(
    () => ({
      current: serverPage + 1,
      pageSize: serverSize,
      total: serverTotal,
      showSizeChanger: true,
      pageSizeOptions: ["5", "10", "20", "50"],
      showTotal: (total) => `${total} profiles`,
      placement: "bottomRight",
      size: "default",
      onChange: (page, pageSize) => {
        if (pageSize !== serverSize) {
          onPageSizeChange?.(pageSize);
        } else {
          onPageChange?.(page - 1);
        }
      },
      onShowSizeChange: (_, pageSize) => {
        onPageSizeChange?.(pageSize);
      },
    }),
    [serverPage, serverSize, serverTotal, onPageChange, onPageSizeChange]
  );


  return (
    <>
    
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* <Table
        rowKey={(r) => String(r.id ?? r.profileId ?? r.emailId ?? `${r.emailId}-${r.phoneNumber}`)}
        dataSource={rows}
        columns={antdColumns}
        pagination={false}
        size="middle"
        className="profiles-table"
        scroll={{ x: true }}
      /> */}

      {/* ---- Edit Modal ---- */}
      <Modal
        open={editOpen}
        onCancel={closeEdit}
        title={
          <div className="flex items-center justify-between pr-6">
            <span className="text-sm font-semibold">Edit Profile</span>
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
        destroyOnHidden
        maskClosable
        width={780}
      >
        {/* ================= EDIT FORM WITH SAME VALIDATIONS AS CREATE (UPDATED) ================= */}
        <Form
          form={form}
          layout="vertical"
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3"
        >
          <Form.Item
            name="candidateName"
            label="Candidate Name"
            rules={[{  whitespace: true, message: "Candidate name is required" }]} // REQUIRED
          >
            <Input placeholder="Candidate name" />
          </Form.Item>

          <Form.Item
            name="emailId"
            label="Email ID"
            rules={[
              {  message: "Email is required" },            // REQUIRED
              { type: "email", message: "Invalid email address" },         // same as create
            ]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>

          {/* Only if row had empId (internal) */}
          {editRow?.empId != null && String(editRow.empId).trim() !== "" && (
            <Form.Item
              name="empId"
              label="Employee ID"
              // digits only + min 6 (same as create)
              getValueFromEvent={(e) => e?.target?.value?.replace(/\D+/g, "") ?? ""} // sanitize
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

          {/* <Form.Item
            name="experienceYears"
            label="Experience (yrs)"
            rules={[
              {  message: "Experience is required" },  // REQUIRED
              // { type: "number", min: 0, max: 60, message: "0 - 60 only" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} controls={false} min={0} max={60} step={0.5} placeholder="e.g., 4" />
          </Form.Item> */}
           <Form.Item name="experienceYears" label="Experience (yrs)">
            <InputNumber style={{ width: "100%" }} controls={false} min={0} max={60} step={0.5} placeholder="e.g., 4" />
         </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone"
            // sanitize to digits while typing
            getValueFromEvent={(e) => e?.target?.value?.replace(/\D+/g, "") ?? ""}
            rules={[
              {  message: "Please enter phone number" },   // REQUIRED
              {
                // India (+91) rule from create: 10 digits starting with 6–9
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
            rules={[{  message: "Select a Location" }]}   // REQUIRED
          >
            <AntdSelect
              allowClear
              placeholder="Select location"
              options={opts.locations}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="hbuId"
            label="HBU"
            // HBU is optional in your create form; keeping optional here too
          >
            <AntdSelect
              allowClear
              placeholder="Select HBU"
              options={opts.hbu}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="skillClusterId"
            label="Skill Cluster"
            rules={[{  message: "Select a Skill Cluster" }]}  // REQUIRED
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

          <Form.Item
            name="summary"
            label="Summary"
            rules={[
              { max: 2000, message: "Max 2000 characters" },  // same as create
            ]}
            className="md:col-span-2"
          >
            <Input.TextArea rows={3} placeholder="Short summary / remark" maxLength={2000} showCount />
          </Form.Item>
        </Form>
      </Modal>

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
        .profiles-table .cell-ellipsis-compact { max-width: 180px; }
      `}</style>
    </div>

    <div className="" >
        <Table
        rowKey={(r) => String(r.id ?? r.profileId ?? r.emailId ?? `${r.emailId}-${r.phoneNumber}`)}
        dataSource={rows}
        columns={antdColumns}
        pagination={pagination}
        size="middle"
        className="profiles-table"
        scroll={{ x: true }}
      />

        
    </div>
    </>
  );
}