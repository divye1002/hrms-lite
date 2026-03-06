import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Employee endpoints ──────────────────────

export const getEmployees = () => api.get("/employees/");

export const createEmployee = (data) => api.post("/employees/", data);

export const deleteEmployee = (employeeId) =>
  api.delete(`/employees/${employeeId}/`);

// ── Attendance endpoints ────────────────────

export const getAttendance = (params = {}) =>
  api.get("/attendance/", { params });

export const markAttendance = (data) => api.post("/attendance/", data);

// ── Dashboard endpoint ──────────────────────

export const getDashboard = () => api.get("/dashboard/");

export default api;
