import axios from "axios";

export const API_BASE_URL = "https://content.zrobie.jutro.net/api";
// export const API_BASE_URL = "https://api.bieszczady.plus/api";
// export const API_BASE_URL = "http://0.0.0.0:8000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("Network Error: No response received");
    } else {
      // Something else happened
      console.error("Request Error:", error.message);
    }
    return Promise.reject(error);
  },
);
