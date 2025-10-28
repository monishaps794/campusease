// frontend/src/api.js
const BASE = "http://192.168.31.180:5000";

async function handleResp(res) {
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { return txt; }
}

export const api = {
  get: async (path) => {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return handleResp(res);
  },
  post: async (path, body) => {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return handleResp(res);
  },
  put: async (path, body) => {
    const res = await fetch(`${BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return handleResp(res);
  },
  del: async (path) => {
    const res = await fetch(`${BASE}${path}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return handleResp(res);
  },

  // convenience helpers used earlier:
  getAvailableRooms: async (query = {}) => {
    const qs = new URLSearchParams(query).toString();
    return api.get(`/classrooms/available${qs ? "?" + qs : ""}`);
  },
  requestBooking: async (payload) => api.post("/bookings/request", payload),
  getMyBookings: async (email) => api.get(`/bookings/faculty/${encodeURIComponent(email)}`),
  getPendingRequests: async () => api.get("/bookings/requests"),
  approveBooking: async (id) => api.put(`/bookings/approve/${id}`),
  rejectBooking: async (id) => api.put(`/bookings/reject/${id}`),
  getAllBookings: async () => api.get("/bookings/all"),
};
export default api;
