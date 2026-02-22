// frontend/src/api.js
import axios from "axios";
import { Platform } from "react-native";

// 🔗 Backend base URL (same logic as LoginScreen)
const API_BASE =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://10.183.195.64:5000"; // change IP if your PC LAN IP is different

// Axios client
const client = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token from any of our storage fallback paths
client.interceptors.request.use((config) => {
  try {
    let token = null;

    // Web (localStorage)
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("@campusease_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token) token = parsed.token;
      }
    }

    // Memory fallback (we set these on login)
    if (!token && global.authData) {
      const parsed = JSON.parse(global.authData);
      if (parsed?.token) token = parsed.token;
    }

    // Last fallback (legacy)
    if (!token && global.authToken) token = global.authToken;

    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // ignore
  }
  return config;
});

// Unified error handler
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
  /* -------------------- Classrooms -------------------- */
  getAvailableRooms: ({ date, slot }) =>
    handle(client.get("/classrooms/available", { params: { date, slot } })),
  seedClassrooms: () => handle(client.post("/classrooms/seed")),
  getAllClassrooms: () => handle(client.get("/classrooms/all")),
  getClassroomDetails: (room) =>
    handle(client.get(`/classrooms/details/${encodeURIComponent(room)}`)),

  /* --------------------- Bookings --------------------- */
  requestBooking: (payload) => handle(client.post("/bookings/request", payload)),
  adminBook: (payload) => handle(client.post("/bookings/admin-book", payload)),
  adminOverrideBook: (payload) =>
    handle(client.post("/bookings/admin-book", { ...payload, override: true })),
  getPendingRequests: () => handle(client.get("/bookings/requests")),
  getAllBookings: () => handle(client.get("/bookings/all")),
  getBookingsByFaculty: (email) =>
    handle(client.get(`/bookings/faculty/${encodeURIComponent(email)}`)),
  approveBooking: (id) =>
    handle(client.put(`/bookings/approve/${encodeURIComponent(id)}`)),
  rejectBooking: (id) =>
    handle(client.put(`/bookings/reject/${encodeURIComponent(id)}`)),
  cancelBooking: (id) =>
    handle(client.delete(`/bookings/cancel/${encodeURIComponent(id)}`)),

  getBookingDetails: ({ roomNumber, date, slot }) =>
    handle(
      client.get("/bookings/details", {
        params: { roomNumber, date, slot },
      })
    ),

  cancelByTriplet: ({ roomNumber, date, slot }) =>
    handle(
      client.delete(`/bookings/cancel-by`, {
        params: { roomNumber, date, slot },
      })
    ),

  // ✅ used by StudentBookingsScreen (must exist)
  getSectionBookings: ({ branch, year, section, from, to }) =>
    handle(
      client.get("/bookings/section", {
        params: { branch, year, section, from, to },
      })
    ),

  /* --------------------- Allocator -------------------- */
  autoAllocate: () => handle(client.post("/allocator/run")),
  restoreDefault: () => handle(client.post("/allocator/restore-default")),
  saveAllocation: (allocation) =>
    handle(client.post("/allocator/save", { allocation })),
  getLatestAllocation: () => handle(client.get("/allocator/latest")),
  seedISEClassrooms: () => handle(client.post("/allocator/seed-classrooms")),

  /* --------------------- Timetable -------------------- */
  getTimetableMerged: (branch, year, section, day) =>
    handle(
      client.get(
        `/timetable/merged/${encodeURIComponent(
          branch
        )}/${encodeURIComponent(year)}/${encodeURIComponent(
          section
        )}/${encodeURIComponent(day)}`
      )
    ),

  getFacultyTimetable: (facultyName) =>
    handle(client.get(`/timetable/faculty/${encodeURIComponent(facultyName)}`)),

  // ✅ used by StudentTimetableScreen (must exist)
  getSectionTimetable: (branch, year, section) =>
    handle(
      client.get(
        `/timetable/section/${encodeURIComponent(
          branch
        )}/${encodeURIComponent(year)}/${encodeURIComponent(section)}`
      )
    ),

  /* --------------------- Staffrooms ------------------- */
  getStaffrooms: () => handle(client.get("/staffrooms/all")),

  /* ----------------------- Auth ----------------------- */
  requestOtp: (email) => handle(client.post("/auth/request-otp", { email })),
  verifyOtp: (payload) => handle(client.post("/auth/verify-otp", payload)),
  getAllUsers: () => handle(client.get("/users")),

  /* ------------------- Notifications ------------------ */
  getStudentNotifications: ({ department, year, section }) =>
    handle(
      client.get("/notifications/student", {
        params: { department, year, section },
      })
    ),
  getFacultyNotifications: (email) =>
    handle(
      client.get(`/notifications/faculty/${encodeURIComponent(email)}`)
    ),
  getAdminNotifications: () => handle(client.get("/notifications/admin")),
};

export { client };
export default api;
