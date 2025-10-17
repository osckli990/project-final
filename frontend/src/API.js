import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const withAuth = async (getToken) => ({
  headers: { Authorization: `Bearer ${await getToken()}` },
});
