import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_SERVERF_API,
  withCredentials: true,
});

export default instance;
