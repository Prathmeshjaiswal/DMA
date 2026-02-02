import api from "./client.js"


// LOAD ALL DROPDOWNS AT ONCE (CREATE USER PAGE)
export const getAllDropdowns = async () => {
  const res = await api.get("/user_management/all");
  return res.data;
};
 
// OPTIONAL: for edit user page
export const getAllEditDropdowns = async () => {
  const res = await api.get("/user_management/editall");
  return res.data;
};

export const getAllUsers =async ()=>{
  const res= await api.get("/user_management/users");
  


  return res.data;
}

export const updateUserById = async (id, payload) => {
  const res = await api.put(`/user_management/users/${id}`, payload);
  return res.data;
};


export const updateUserStatus = async (userId, active) => {
  const res = await api.patch(
    `/user_management/users/${encodeURIComponent(userId)}/status`,
    { active } // boolean
  );
  return res.data;
};
