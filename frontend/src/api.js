import axios from "axios";

//const API_BASE = "http://192.168.0.103:5000";
const API_BASE = "http://localhost:5000";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

const handle = async (promise) => {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    console.error("API error:", err?.response?.data || err.message);
    throw err?.response?.data || err;
  }
};

const api = {
  // ─── Timetable ─────────────────────────────────────────────
  getTimetable: (branch, year, section, day) =>
    handle(client.get(`/timetable/${branch}/${year}/${section}/${day}`)),

  // ─── NEW for ADMIN booking ─────────────────────────────────
  getAvailableRoomsByDate: ({ branch, year, section, date }) =>
    handle(
      client.get(`/bookings/available-by-date`, {
        params: { branch, year, section, date },
      })
    ),

  adminBookRoom: (payload) =>
    handle(client.post(`/bookings/admin/book`, payload)),

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

export { client };
export default api;
