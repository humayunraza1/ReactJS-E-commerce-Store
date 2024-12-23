import axios from "axios";
const BASE_URL = 'https://ecomm-server.azurewebsites.net'
const LOCAL_URL = 'http://localhost:3000'

export default axios.create({
    baseURL:BASE_URL,
    withCredentials:true
})
export const axiosPrivate = axios.create({
    baseURL:BASE_URL,
    headers:{'Content-Type': 'application/json'},
    withCredentials: true
})