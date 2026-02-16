import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_SERVERF_API,
});

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
};

instance.interceptors.request.use((config) => {
  const token = getCookie("app_token");

  console.log(token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default instance;
