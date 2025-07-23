import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkToken, triggerLogout } from "@/context/AuthContext";

const api = axios.create({
  baseURL: `${
    process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.145:3000"
  }/api`,
});

/* The Need for a "White List":
Not all API endpoints require authentication. Some might be publicly accessible, like a signup endpoint or a publicly available data endpoint. 
Directly applying authentication logic (like attaching a bearer token) to every request can lead to unnecessary errors or issues with public endpoints. 
Therefore, a "white list" or selective application of authentication logic is crucial. */
const AUTH_WHITELIST = [
  "/auth/register",
  "/auth/login",
  "/auth/refresh-token",
  "/forgot-password",
  "/google",
  "/google/callback",
];

const isWhitelisted = (url: string | undefined) => {
  if (AUTH_WHITELIST.some((path) => url?.includes(path))) return true;
  if (url?.startsWith("/reset-password/")) return true;
  return false;
};

api.interceptors.request.use(
  async (config) => {
    if (!isWhitelisted(config?.url)) {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      (error.response.data?.error === "TokenExpiredError" ||
        error.response.data?.error === "NoAccessToken") &&
      !isWhitelisted(originalRequest.url)
    ) {
      originalRequest._retry = true;
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      checkToken();
      if (!refreshToken) {
        setTimeout(() => {
          triggerLogout();
        }, 2000);
        return Promise.reject(error);
      }

      try {
        const res = await api.post("/auth/refresh-token", { refreshToken });

        console.log("res.data accessToken", res.data.accessToken);
        console.log(
          "res.data refreshToken",
          res.data.refreshToken || refreshToken
        );
        await AsyncStorage.setItem("accessToken", res.data.accessToken);
        await AsyncStorage.setItem(
          "refreshToken",
          res.data.refreshToken || refreshToken
        );

        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${res.data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        setTimeout(() => {
          triggerLogout();
        }, 2000);
        console.log("refreshError", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
