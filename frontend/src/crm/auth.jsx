import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useLocation } from "react-router-dom";

export const crm = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });
crm.interceptors.request.use((c) => {
  const t = sessionStorage.getItem("gsr_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

crm.interceptors.response.use((r) => r, (e) => {
  if (e?.response?.status === 401 && sessionStorage.getItem("gsr_token")) { sessionStorage.removeItem("gsr_token"); window.location.assign("/crm/login"); }
  return Promise.reject(e);
});

// Invalidate the previously persistent browser token; do not migrate it to a new session.
localStorage.removeItem("gsr_token");
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (!sessionStorage.getItem("gsr_token")) { setUser(false); return; }
    const controller = new AbortController();
    crm.get("/auth/me", { signal: controller.signal }).then((r) => setUser(r.data)).catch(() => {
      if (!controller.signal.aborted) { sessionStorage.removeItem("gsr_token"); setUser(false); }
    });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!user) return;
    const expire = () => { sessionStorage.removeItem("gsr_token"); setUser(false); };
    let expires;
    try {
      const payload = sessionStorage.getItem("gsr_token").split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      expires = JSON.parse(atob(payload)).exp * 1000;
      if (!Number.isFinite(expires) || expires <= Date.now()) { expire(); return; }
    } catch { expire(); return; }
    const timeout = setTimeout(expire, expires - Date.now());
    const interval = setInterval(() => { crm.get("/auth/me").then((r) => setUser(r.data)).catch(() => {}); }, 60_000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [user]);
  const login = async (email, password) => {
    const { data } = await crm.post("/auth/login", { email, password });
    sessionStorage.setItem("gsr_token", data.token);
    setUser(data.user);
  };
  const logout = async () => { try { await crm.post("/auth/logout"); } catch {} sessionStorage.removeItem("gsr_token"); setUser(false); };
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
};

export const Protected = ({ children }) => {
  const { user } = useAuth();
  const loc = useLocation();
  if (user === null) return <div className="min-h-screen grid place-items-center text-[#53616B]">Chargement…</div>;
  if (!user) return <Navigate to="/crm/login" state={{ from: loc.pathname }} replace />;
  return children;
};

export const RoleRoute = ({ roles, children }) => {
  const { user } = useAuth();
  return can(user, ...roles) ? children : <Navigate to="/crm" replace />;
};

export const can = (user, ...roles) => !!user && roles.includes(user.role);
