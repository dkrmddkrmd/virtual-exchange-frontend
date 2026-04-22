import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://virtual-exchange.kro.kr';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // 쿠키(refreshToken) 자동 전송
});

// 요청마다 localStorage의 accessToken을 헤더에 자동 주입
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// 401 응답 시 reissue → 원래 요청 재시도
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const reissueResponse = await axios.post(
                    `${API_BASE_URL}/api/users/reissue`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = reissueResponse.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
