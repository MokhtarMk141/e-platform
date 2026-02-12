import { useState, useEffect } from "react";
import { login as loginService, register as registerService } from "../services/auth.service";

export function useAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // optional: decode token to get user info or call /me endpoint
      setUser({ token });
    }
  }, []);

  const login = async (dto: { email: string; password: string }) => {
    const loggedInUser = await loginService(dto);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (dto: { name: string; email: string; password: string }) => {
    const registeredUser = await registerService(dto);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return { user, login, register, logout };
}
