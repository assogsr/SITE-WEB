import axios from "axios";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

export const getRappelCreneaux = (agency) => api.get("/rappel-creneaux", { params: { agency } }).then((r) => r.data.days);
export const getCreneaux = (agency) => api.get("/creneaux", { params: { agency } }).then((r) => r.data);
export const createDemande = (body) => api.post("/demandes", body).then((r) => r.data);
export const getIaSessions = () => api.get("/formation-ia/sessions").then((r) => r.data);
export const getArticles = () => api.get("/articles").then((r) => r.data);
export const getDemande = (ref) => api.get(`/demandes/${encodeURIComponent(ref)}`).then((r) => r.data);

export const apiError = (e, fallback = "Une erreur est survenue.") => {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x.msg?.replace(/^Value error, /, "")).join(" ");
  return fallback;
};

export default api;
