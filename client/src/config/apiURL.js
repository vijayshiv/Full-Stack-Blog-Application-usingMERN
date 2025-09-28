// Uses environment variable - change VITE_API_URL in .env file
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default baseURL;
