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