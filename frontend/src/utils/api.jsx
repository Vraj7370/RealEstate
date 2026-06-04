import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,          // 30s for image uploads
  withCredentials: false,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => API.post('/auth/register', data),
  login:          (data) => API.post('/auth/login', data),
  getMe:          ()     => API.get('/auth/me'),

  // Profile update — always send as FormData (handles both with/without pic)
  updateProfile: (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
    return API.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  changePassword:  (data) => API.put('/auth/change-password', data),
  removeProfilePic: ()   => API.delete('/auth/profile-pic'),
  createStaff:    (data) => API.post('/auth/create-staff', data),

  // ── Forgot Password OTP flow ──
  forgotPassword: (data) => API.post('/auth/forgot-password', data),  // Step 1
  verifyOTP:      (data) => API.post('/auth/verify-otp', data),       // Step 2
  resetPassword:  (data) => API.post('/auth/reset-password', data),   // Step 3
};

// ── Properties ────────────────────────────────────────────
export const propertyAPI = {
  getAll:         (params) => API.get('/properties', { params }),
  getOne:         (id)     => API.get(`/properties/${id}`),

  // Always send as FormData to support image uploads
  create: (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'images') {
        // v is a FileList or array of File objects
        Array.from(v).forEach(file => fd.append('images', file));
      } else if (v !== undefined && v !== null) {
        fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
      }
    });
    return API.post('/properties', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  update: (id, data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'images') {
        Array.from(v).forEach(file => fd.append('images', file));
      } else if (v !== undefined && v !== null) {
        fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
      }
    });
    return API.put(`/properties/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  delete:           (id)       => API.delete(`/properties/${id}`),
  deleteImage:      (id, data) => API.delete(`/properties/${id}/image`, { data }),
  updateApproval:   (id, data) => API.patch(`/properties/${id}/approval`, data),
  updateStatus:     (id, data) => API.patch(`/properties/${id}/status`, data),   // owner marks sold/rented
  getFeatured:      ()         => API.get('/properties/featured'),
  addReview:        (id, data) => API.post(`/properties/${id}/reviews`, data),
  getStats:         ()         => API.get('/properties/stats'),
};

// ── Inquiries ─────────────────────────────────────────────
export const inquiryAPI = {
  create:       (propId, data) => API.post(`/inquiries/property/${propId}`, data),
  getMy:        ()              => API.get('/inquiries/my'),
  getReceived:  ()              => API.get('/inquiries/received'),
  getByProperty:(propId)        => API.get(`/inquiries/property/${propId}`),
  updateStatus: (id, data)      => API.patch(`/inquiries/${id}/status`, data),
  getAll:       ()              => API.get('/inquiries/all'),
};

// ── Visits ────────────────────────────────────────────────
export const visitAPI = {
  schedule:     (propId, data) => API.post(`/visits/property/${propId}`, data),
  getMy:        ()              => API.get('/visits/my'),
  getOwner:     ()              => API.get('/visits/owner'),
  updateStatus: (id, data)      => API.patch(`/visits/${id}/status`, data),
};

// ── Favorites ─────────────────────────────────────────────
export const favoriteAPI = {
  toggle: (propId) => API.post(`/favorites/${propId}`),
  getMy:  ()        => API.get('/favorites/my'),
};

// ── Payments ──────────────────────────────────────────────
export const paymentAPI = {
  create: (data) => API.post('/payments', data),
  getMy:  ()     => API.get('/payments/my'),
  getAll: ()     => API.get('/payments/all'),
};

// ── Support ───────────────────────────────────────────────
export const supportAPI = {
  create:  (data)      => API.post('/support', data),
  getMy:   ()          => API.get('/support/my'),
  getAll:  ()          => API.get('/support/all'),
  respond: (id, data)  => API.patch(`/support/${id}/respond`, data),
};

// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
  getStats:   ()       => API.get('/admin/stats'),
  getUsers:   (params) => API.get('/admin/users', { params }),
  toggleUser: (id)     => API.patch(`/admin/users/${id}/toggle`),
};

export default API;
