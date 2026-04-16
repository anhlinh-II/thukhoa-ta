import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import loadingService from "./loadingService";
import { handleProblems } from "../utils/functions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: AxiosRequestConfig | any) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const skip =
        config &&
        (config.skipGlobalLoader === true ||
          config.headers?.["X-Skip-Global-Loader"] === "true");
      if (!skip) {
        loadingService.show();
        (config as any).__globalLoaderShown = true;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (typeof window !== "undefined") {
      if ((response.config as any)?.__globalLoaderShown) {
        loadingService.hide();
      }
    }
    return response;
  },
  (error) => {
    if (typeof window !== "undefined") {
      if (error.config && (error.config as any).__globalLoaderShown) {
        loadingService.hide();
      }
    }
    handleProblems(error);
    if (typeof window !== "undefined" && error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
