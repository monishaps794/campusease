// frontend/src/api.js
import axios from "axios";

const API_BASE = "http://10.183.195.64:5000";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  try {
    let token = null;

    // ✅ Web: try correct key
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("@campusease_user");
      if (stored) token = JSON.parse(stored).token;
    }

    // ✅ Memory fallback
    if (!token && global.authData) {
      token = JSON.parse(global.authData).token;
    }

    // ✅ AsyncStorage fallback (mobile)
    if (!token && global.authToken) {
      token = global.authToken;
    }

    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}

  return config;
});


const handle = async (p) => {
  try {
    const r = await p;
    return r.data;
  } catch (e) {
    if (e?.response) {
      const data = e.response.data || {};
      throw { status: e.response.status, ...data, raw: e };
    }
    throw e;
  }
};

const api = {
  // Classrooms
  getAvailableRooms: ({ date, slot }) =>
    handle(client.get("/classrooms/available", { params: { date, slot } })),
  seedClassrooms: () => handle(client.post("/classrooms/seed")),
  getAllClassrooms: () => handle(client.get("/classrooms/all")),
  getClassroomDetails: (room) => handle(client.get(`/classrooms/details/${encodeURIComponent(room)}`)),

  // Bookings
  requestBooking: (payload) => handle(client.post("/bookings/request", payload)),
  adminBook: (payload) => handle(client.post("/bookings/admin-book", payload)),
  adminOverrideBook: (payload) => handle(client.post("/bookings/admin-book", { ...payload, override: true })),
  getPendingRequests: () => handle(client.get("/bookings/requests")),
  getAllBookings: () => handle(client.get("/bookings/all")),
  getBookingsByFaculty: (email) => handle(client.get(`/bookings/faculty/${encodeURIComponent(email)}`)),
  approveBooking: (id) => handle(client.put(`/bookings/approve/${encodeURIComponent(id)}`)),
  rejectBooking: (id) => handle(client.put(`/bookings/reject/${encodeURIComponent(id)}`)),
  cancelBooking: (id) => handle(client.delete(`/bookings/cancel/${encodeURIComponent(id)}`)),
  getBookingDetails: ({ roomNumber, date, slot }) =>
    handle(client.get("/bookings/details", { params: { roomNumber, date, slot } })),
  cancelByTriplet: ({ roomNumber, date, slot }) =>
    handle(client.delete(`/bookings/cancel-by`, { params: { roomNumber, date, slot } })),
  getSectionBookings: ({ branch, year, section, from, to }) =>
    handle(client.get("/bookings/section", { params: { branch, year, section, from, to } })),

  // Allocator
  autoAllocate: () => handle(client.post("/allocator/run")),
  restoreDefault: () => handle(client.post("/allocator/restore-default")),
  saveAllocation: (allocation) => handle(client.post("/allocator/save", { allocation })),
  getLatestAllocation: () => handle(client.get("/allocator/latest")),
  seedISEClassrooms: () => handle(client.post("/allocator/seed-classrooms")),

  // Timetable (existing)
  getTimetableMerged: (branch, year, section, day) =>
    handle(client.get(`/timetable/merged/${encodeURIComponent(branch)}/${encodeURIComponent(year)}/${encodeURIComponent(section)}/${encodeURIComponent(day)}`)),
  //staffroom
  getStaffrooms: () => handle(client.get("/staffrooms/all")),

  // Faculty CSV
  getFacultyTimetable: (facultyName) =>
    handle(client.get(`/timetable/faculty/${encodeURIComponent(facultyName)}`)),

  // ✅ NEW: Student CSV full-week
  getSectionTimetable: (branch, year, section) =>
    handle(client.get(`/timetable/section/${encodeURIComponent(branch)}/${encodeURIComponent(year)}/${encodeURIComponent(section)}`)),

  // Auth
  requestOtp: (email) => handle(client.post("/auth/request-otp", { email })),
  verifyOtp: (payload) => handle(client.post("/auth/verify-otp", payload)),
  getAllUsers: () => handle(client.get("/users")),
};

export { client };
export default api;
