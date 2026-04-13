import axios from "axios";
import API_BASE_URL from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const fixImageUrl = (url) => {
  if (!url) return "/placeholder.png";
  if (url.includes("localhost:5000")) {
    return url.replace("http://localhost:5000", API_BASE_URL);
  }
  return url;
};

export default api;
