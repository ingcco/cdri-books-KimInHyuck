import axios from "axios";

export const api = axios.create({
  baseURL: "https://dapi.kakao.com",
  headers: {
    Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`,
  },
  validateStatus: (status) => status >= 200 && status < 300,
});
