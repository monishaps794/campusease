import axios from "axios";

// ✅ Your LAN backend base URL (update if your IP changes)
const API_BASE = "http://10.242.24.77:5000";

// Create a reusable axios client
const client = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to handle responses and errors
const handle = async (promise) => {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    console.error("API error:", err?.response?.data || err.message);
    throw err?.response?.data || err;
  }
};

// ✅ All REST endpoints grouped logically
const api = {
  // ─── Timetable ─────────────────────────────────────────────
  getTimetable: (branch, year, section, day) =>
    handle(
      client.get(
        `/timetable/${encodeURIComponent(branch)}/${encodeURIComponent(
          year
        )}/${encodeURIComponent(section)}/${encodeURIComponent(day)}`
      )
    ),

  // ─── Classrooms ────────────────────────────────────────────
  getAvailableRooms: ({ branch, year, section, date, slot, day }) =>
    handle(
      client.get("/classrooms/available", {
        params: { branch, year, section, date, slot, day },
      })
    ),

  seedClassrooms: () => handle(client.post("/classrooms/seed")),
  getAllClassrooms: () => handle(client.get("/classrooms/all")),

  // ─── Bookings ──────────────────────────────────────────────
  // Payload must include:
  // { facultyEmail, classroom, date, slot, reason }
  requestBooking: (payload) =>
    handle(client.post("/bookings/request", payload)),

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

  // ─── Allocator ─────────────────────────────────────────────
  autoAllocate: () => handle(client.post("/allocator/run")),
  saveAllocation: (allocation) =>
    handle(client.post("/allocator/save", { allocation })),

  // ─── Auth ─────────────────────────────────────────────────
  requestOtp: (email) => handle(client.post("/auth/request-otp", { email })),
  verifyOtp: (payload) => handle(client.post("/auth/verify-otp", payload)),

  // ─── Users (Admin) ─────────────────────────────────────────
  getAllUsers: () => handle(client.get("/users")),
};

// ✅ Export both named and default
export { client };
export default api;
