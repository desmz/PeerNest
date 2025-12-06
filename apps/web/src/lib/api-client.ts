import { envObj } from '@peernest/config/static';
import axios, { AxiosError, AxiosInstance } from 'axios';

import { APP_ROUTE } from '@/lib/app-route';

const api: AxiosInstance = axios.create({
  baseURL: envObj.API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      switch (error.response.status) {
        case 401: {
          // Handle unauthorized error
          redirectToLogin();
          break;
        }
        case 403:
          // Handle forbidden error
          break;
        case 404:
          // Handle not found error
          break;
        case 500:
          // Handle internal server error
          break;
        default:
          break;
      }
    }
    return Promise.reject(error.response?.data);
  }
);

function redirectToLogin() {
  const exemptPaths = [APP_ROUTE.AUTH];
  if (!exemptPaths.some((path) => window.location.pathname.startsWith(path))) {
    window.location.href = APP_ROUTE.AUTH;
  }
}

export default api;
