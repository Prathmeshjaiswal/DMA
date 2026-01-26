import api from "./client.js"

export const getCountries=()=>
    api.get("/master/countries");

export const getLocations=()=>
    api.get("/master/locations");

export const getDepartments=()=>
    api.get("/master/departments");

export const getSubDepartments=(departmentId) =>
    api.get(`/master/subdepartments?departmentId=${departmentId}`);

export const getRoles=()=>
    api.get("/master/roles");
    
