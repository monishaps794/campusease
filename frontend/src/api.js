// campusease-mobile/src/api.js
const BASE_URL = "http://192.168.31.180:5000";

const handleResp = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const api = {
  // Get available classrooms (optional query params: branch,year,section,day,timeSlot)
  getAvailableRooms: async (query = {}) => {
    const qs = new URLSearchParams(query).toString();
    const url = `${BASE_URL}/bookings/available${qs ? "?" + qs : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return handleResp(res);
  },

  // Create booking request
  requestBooking: async (payload) => {
    const res = await fetch(`${BASE_URL}/bookings/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return handleResp(res);
  },

  // Get bookings for a faculty email
  getMyBookings: async (email) => {
    const res = await fetch(`${BASE_URL}/bookings/faculty/${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return handleResp(res);
  },

  // Cancel booking (DELETE)
  cancelBooking: async (id) => {
    const res = await fetch(`${BASE_URL}/bookings/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return handleResp(res);
  },

  // Admin: get pending requests
  getPendingRequests: async () => {
    const res = await fetch(`${BASE_URL}/bookings/requests`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return handleResp(res);
  },

  // Admin: approve booking
  approveBooking: async (id) => {
    const res = await fetch(`${BASE_URL}/bookings/approve/${id}`, {
      method: "PUT",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return handleResp(res);
  },

  // Admin: reject booking
  rejectBooking: async (id) => {
    const res = await fetch(`${BASE_URL}/bookings/reject/${id}`, {
      method: "PUT",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return handleResp(res);
  },

  // Admin: get all bookings (optional)
  getAllBookings: async () => {
    const res = await fetch(`${BASE_URL}/bookings/all`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return handleResp(res);
  },

  // Upload helper (multipart form)
  uploadData: async (path, formData) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return handleResp(res);
  },
};

export default api;
