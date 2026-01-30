
import api from './client.js';

export const createrole = async(payload) => {
  console.log('[createRole] payload:', payload);
  const res = await api.post('/user_management/createrole', payload);
  console.log('createRole response status:', res.status);
  return res.data;
}


export const editrole = async(roleId,payload) => {
console.log('[editRole] payload:', payload);
  const res = await api.put(`/user_management/${roleId}`, payload);
  console.log('editRole response status:', res.status);
  return res.data;
}


export const getpermissions = async() => {
  const res = await api.get('/user_management/getallmodulechildmodules');
  console.log('GET permission response status:', res.status);
  return res.data;
}

export const getroles = async() => {
  const res = await api.get('/user_management/getallroles');
  console.log('GetRoles response status:', res.status);
  return res.data;
}

export const updateRoleStatus = async (roleId, active) => {
  console.log('[updateRoleStatus] roleId:', roleId, 'active:', active);
  // Backend method updateStatus(Long userId, boolean active) should map to this endpoint.
  // Controller: @PatchMapping("/roles/status/{id}") expects a DTO with `isActive`.
    try {
      // Send both field names to be tolerant of backend naming conventions
      const payload = { isActive: !!active, active: !!active };
      console.log('[updateRoleStatus] payload ->', payload);
      // Controller lives under `/user_management` class-level mapping
      const res = await api.patch(`/user_management/roles/status/${roleId}`, payload);
      console.log('updateRoleStatus response status:', res.status);
      return res.data;
    } catch (err) {
      console.error('[updateRoleStatus] error response:', err?.response?.status, err?.response?.data);
      throw err;
    }
}