import axios from "axios";
const BASE_URL = 'react-js-e-commerce-store-client.vercel.app'

export default axios.create({
    baseURL: BASE_URL
})
export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers:{'Content-Type': 'application/json'},
    withCredentials: true
})