// frontend/src/services/apiClient.ts
import axios from 'axios';

console.log(process.env.NEXT_PUBLIC_API_URL);
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // This is crucial for sending HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
    // 'X-CSRFToken': 'your-csrf-token', // We might need to handle CSRF if not using JWT exclusively for state-changing requests
    // For GET requests with JWT cookie auth, CSRF is often not an issue.
    // For POST/PUT/DELETE, Django's CSRF protection might still apply unless
    // the view is explicitly exempted or uses a different auth method that bypasses it.
    // dj_rest_auth views are usually CSRF exempt if using Token/JWT auth.
  },
});

// Optional: Add interceptors for request/response handling
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle global errors (e.g., redirect on 401 if not on login page)
//     if (error.response && error.response.status === 401) {
//       // Potentially redirect to login or refresh token
//       console.error("API client: Unauthorized access - 401");
//       if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
//         // window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;
