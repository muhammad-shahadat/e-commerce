import axios from "axios";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL  || "http://localhost:3000",
    withCredentials: true, // browser sends cookie
});



export default api;


