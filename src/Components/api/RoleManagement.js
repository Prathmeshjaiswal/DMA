import axios from 'axios';
import api from './client.js';

export const createrole = async(payload) => {
console.log('[createRole] payload:', payload);
  const res = await api.post('/user_management/createrole', payload);
//const res = {
//                "success": true,
//                "message": "SUCCESS",
//                "data": [
//                                    {
//                                        "id": 1,
//                                        "role": "USER_MGMT_ADMIN",
//                                        "createdBy": "system",
//                                        "creationDate": "2026-01-21T19:38:32.109819",
//                                        "moduleChildModule": []
//                                    },
//                                    {
//                                        "id": 7,
//                                        "role": "TEST_ROLE2",
//                                        "createdBy": "system",
//                                        "creationDate": "2026-01-22T19:06:21.692823",
//                                        "moduleChildModule": [
//                                            {
//                                                "moduleId": 1,
//                                                "moduleName": "User Management",
//                                                "childModules": [
//                                                    {
//                                                        "id": 2,
//                                                        "name": "de",
//                                                        "action": false
//                                                    },
//                                                    {
//                                                        "id": 2,
//                                                        "name": "de",
//                                                        "action": false
//                                                    }
//                                                ]
//                                            }
//                                        ]
//                                    },
//                                    {
//                                        "id": 8,
//                                        "role": "TEST_ROLE3",
//                                        "createdBy": "system",
//                                        "creationDate": "2026-01-22T19:06:54.561682",
//                                        "moduleChildModule": [
//                                            {
//                                                "moduleId": 1,
//                                                "moduleName": "User Management",
//                                                "childModules": [
//                                                    {
//                                                        "id": 2,
//                                                        "name": "de",
//                                                        "action": false
//                                                    },
//                                                    {
//                                                        "id": 2,
//                                                        "name": "de",
//                                                        "action": false
//                                                    }
//                                                ]
//                                            },
//                                            {
//                                                "moduleId": 1,
//                                                "moduleName": "User Management",
//                                                "childModules": [
//                                                    {
//                                                        "id": 3,
//                                                        "name": "activate",
//                                                        "action": false
//                                                    },
//                                                    {
//                                                        "id": 2,
//                                                        "name": "de",
//                                                        "action": false
//                                                    }
//                                                ]
//                                            }
//                                        ]
//                                    }
//                                ]
//                }
  console.log('createRole response status:', res.status);
  return res.data;
}


export const editrole = async(roleId,payload) => {
console.log('[editRole] payload:', payload);
  const res = await api.put(`/user_management/${roleId}`, payload);
//const res = {
//                "success": true,
//                "message": "Success",
//                "status":200
//}
  console.log('editRole response status:', res.status);
  return res.data;
}


export const getpermissions = async() => {
  const res = await api.get('/user_management/getallmodulechildmodules', payload);

//const res = {
//                "success": true,
//                "message": "Success",
//                "data":[{
//                  "moduleId": "1",
//                  "moduleName": "Demands",
//                  "childModule": [
//                    { "childModuleId": "2", "childModuleName": "Tasks", "actionFlag": "VIEW" }
//                  ]
//                },
//                ]
//                }


  console.log('GET permission response status:', res.status);
  return res.data;
}

export const getroles = async() => {
  const res = await api.get('/user_management/getallroles', payload);
//const res = {
//                "success": true,
//                "message": "Success",
//                "data": [
//                    {
//                        "id": 1,
//                        "role": "USER_MGMT_ADMIN",
//                        "createdBy": "system",
//                        "creationDate": "2026-01-21T19:38:32.109819",
//                        "moduleChildModule": []
//                    },
//                    {
//                        "id": 7,
//                        "role": "TEST_ROLE2",
//                        "createdBy": "system",
//                        "creationDate": "2026-01-22T19:06:21.692823",
//                        "moduleChildModule": [
//                            {
//                                "moduleId": 1,
//                                "moduleName": "User Management",
//                                "childModules": [
//                                    {
//                                        "id": 2,
//                                        "name": "de",
//                                        "action": false
//                                    },
//                                    {
//                                        "id": 2,
//                                        "name": "de",
//                                        "action": false
//                                    }
//                                ]
//                            }
//                        ]
//                    },
//                    {
//                        "id": 8,
//                        "role": "TEST_ROLE3",
//                        "createdBy": "system",
//                        "creationDate": "2026-01-22T19:06:54.561682",
//                        "moduleChildModule": [
//                            {
//                                "moduleId": 1,
//                                "moduleName": "User Management",
//                                "childModules": [
//                                    {
//                                        "id": 2,
//                                        "name": "de",
//                                        "action": false
//                                    },
//                                    {
//                                        "id": 2,
//                                        "name": "de",
//                                        "action": false
//                                    }
//                                ]
//                            },
//                            {
//                                "moduleId": 1,
//                                "moduleName": "User Management",
//                                "childModules": [
//                                    {
//                                        "id": 3,
//                                        "name": "activate",
//                                        "action": false
//                                    },
//                                    {
//                                        "id": 2,
//                                        "name": "de",
//                                        "action": false
//                                    }
//                                ]
//                            }
//                        ]
//                    }
//                ]
//            }
  console.log('GetRoles response status:', res.status);
  return res.data;
}