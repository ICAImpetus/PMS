import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 20000,
  // headers: {
  //   "Content-Type": "application/json"
  // }
});


API.interceptors.request.use((req) => {
  const token = JSON.parse(localStorage.getItem("token"));

  // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2VmMzNhM2RmY2IwYTRhMTFjMGFkNCIsIm5hbWUiOiJLYW5haXlhIiwiZW1haWwiOiJrYW5haXlhLnRlc3RAZ21haWwuY29tIiwiaWF0IjoxNzY4NjMyNTk5LCJleHAiOjE3NjkyMzczOTl9.Hr6py6MopSnHpnVeLvUUvPiLfSIj3z-aSIvYeiNc1R0"
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
