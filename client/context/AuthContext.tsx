import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/constants/axiosConfig";
import axios from "axios";

interface User {
  id: string;
  email: string;
  fullname?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    fullname: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      const userInfo = await AsyncStorage.getItem("userInfo");
      const accessToken = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      if (!userInfo || !accessToken || !refreshToken) {
        await logout();
      } else {
        setUser(JSON.parse(userInfo));
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log("res.data accessToken", res.data.accessToken);
      console.log("res.data refreshToken", res.data.refreshToken);
      if (res.data?.accessToken)
        await AsyncStorage.setItem("accessToken", res.data.accessToken);
      if (res.data?.refreshToken)
        await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
      if (res.data?.user) {
        setUser(res.data.user);
        await AsyncStorage.setItem("userInfo", JSON.stringify(res.data.user));
      }
    } finally {
      setLoading(false);
      checkToken();
    }
  };

  const register = async (
    email: string,
    fullname: string,
    password: string
  ) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        email,
        fullname,
        password,
      });
      console.log("res.data accessToken", res.data.accessToken);
      console.log("res.data refreshToken", res.data.refreshToken);
      if (res.data?.accessToken)
        await AsyncStorage.setItem("accessToken", res.data.accessToken);
      if (res.data?.refreshToken)
        await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
      if (res.data?.user) {
        setUser(res.data.user);
        await AsyncStorage.setItem("userInfo", JSON.stringify(res.data.user));
      }
    } finally {
      setLoading(false);
      checkToken();
    }
  };

  const logout = async () => {
    try {
      // Use direct axios to prevent the logout request from triggering the interceptor.
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/logout`,
        {}
      );
    } catch {
    } finally {
      setUser(null);
      await AsyncStorage.removeItem("userInfo");
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");

      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/profile");
      if (res.data?.accessToken)
        await AsyncStorage.setItem("accessToken", res.data.accessToken);
      if (res.data?.refreshToken)
        await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
      if (res.data?.user) {
        setUser(res.data.user);
        await AsyncStorage.setItem("userInfo", JSON.stringify(res.data.user));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const checkToken = async () => {
  const accessToken = await AsyncStorage.getItem("accessToken");
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  const userInfo = await AsyncStorage.getItem("userInfo");

  console.log("Access Token:", accessToken);
  console.log("Refresh Token:", refreshToken);
  console.log("User Info:", userInfo ? JSON.parse(userInfo) : null);
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Extract the logout function outside the interceptor as a callback
let logoutCallback: (() => void) | null = null;
export const setLogoutCallback = (cb: () => void) => {
  logoutCallback = cb;
};

export const triggerLogout = () => {
  if (logoutCallback) logoutCallback();
};
