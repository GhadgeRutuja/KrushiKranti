import axios from "axios";
import { getErrorMessage, isAuthErrorStatus } from "../utils/errorHandler";

export const API_ERROR_EVENT = "krushikranti:api-error";
let lastNetworkErrorAt = 0;

const rawUrl = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8080";
// Clean out any accidental trailing slashes or /api/v1 fragments from the env URL
const cleanBaseUrl = rawUrl.replace(/\/api(\/v1)?\/?$/, "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${cleanBaseUrl}/api/v1`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let axios set Content-Type automatically for FormData
    // For non-FormData requests, default to JSON
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = getErrorMessage(
      error,
      "Something went wrong. Please try again.",
    );
    const isNetworkDown = !status;
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const isAuthRoute = [
      "/login",
      "/register",
      "/forgot-password",
      "/verify-otp",
    ].includes(currentPath);

    if (isAuthErrorStatus(status)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(API_ERROR_EVENT, {
            detail: { status, message: "Please login to continue" },
          }),
        );
        if (!isAuthRoute) {
          window.location.href = "/login";
        }
      }
      const authError = new Error("Please login to continue");
      (authError as Error & { status?: number }).status = status;
      return Promise.reject(authError);
    }

    if (typeof window !== "undefined") {
      if (isNetworkDown) {
        const now = Date.now();
        // Avoid spamming repeated connection-refused errors during backend downtime.
        if (now - lastNetworkErrorAt < 5000) {
          const networkError = new Error(
            "Unable to connect to server. Please try again later.",
          );
          (networkError as Error & { status?: number }).status = status;
          return Promise.reject(networkError);
        }
        lastNetworkErrorAt = now;
      }

      window.dispatchEvent(
        new CustomEvent(API_ERROR_EVENT, {
          detail: { status, message },
        }),
      );
    }

    const enhancedError = new Error(message);
    (enhancedError as Error & { status?: number }).status = status;
    return Promise.reject(enhancedError);
  },
);

export default api;
