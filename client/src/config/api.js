import axios from "axios";
import baseURL from "./apiConfig"; 

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000, 
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
