import { setLogoutCallback, useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function LogoutSetup() {
  const { logout } = useAuth();

  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  return null;
}
