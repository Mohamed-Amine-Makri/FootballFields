export const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
    users: `${API_BASE_URL}/users/`,
    fields: `${API_BASE_URL}/fields/`,
    reservations: `${API_BASE_URL}/reservations/`,
    reservationsWithDetails: `${API_BASE_URL}/reservations/with-details/`,
    auth: {
        login: `${API_BASE_URL}/auth/login/`,
        signup: `${API_BASE_URL}/auth/signup/`
    }
} as const;
