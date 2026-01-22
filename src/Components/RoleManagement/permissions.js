
export const PERMISSIONS_TREE = [
  {
    title: "Demands",
    key: "demands",
    children: [
      { title: "Create", key: "demands:create" },
      { title: "View", key: "demands:view" },
      { title: "Update", key: "demands:update" },
    ],
  },
  {
    title: "Profile",
    key: "profile",
    children: [
      { title: "Add Profile", key: "profile:add" },
      { title: "View Profile", key: "profile:view" },
      { title: "Track Profile", key: "profile:track" },
      { title: "Assign Profile to Demand", key: "profile:assignToDemand" },
    ],
  },
    {
      title: "User",
      key: "user",
      children: [
        { title: "Create", key: "user:create" },
        { title: "View", key: "user:view" },
        { title: "Update", key: "user:update" },
      ],
    },
      {
        title: "Role",
        key: "role",
        children: [
          { title: "Create", key: "role:create" },
          { title: "View", key: "role:view" },
          { title: "Update", key: "role:update" },
        ],
      },
];


export const ALL_LEAF_KEYS = PERMISSIONS_TREE.flatMap((module) =>
  (module.children || []).map((child) => child.key)
);


