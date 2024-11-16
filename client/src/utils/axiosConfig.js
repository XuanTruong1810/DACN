import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
});

// Biến để theo dõi refresh token đang xử lý
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu response là 401 và chưa thử refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Nếu đang refresh token, thêm request vào queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return instance(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            const token = localStorage.getItem('token');

            if (!refreshToken && !token) {
                // Chỉ chuyển về trang login khi không có cả refresh token và token
                window.location.href = '/auth/login';
                return Promise.reject(error);
            }

            try {
                // Gọi API refresh token
                const response = await instance.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/refreshtoken`, {
                    refreshToken: refreshToken
                });

                if (response.status === 200) {
                    const { accessToken: newToken, refreshToken: newRefreshToken } = response.data.data;

                    // Lưu token mới
                    localStorage.setItem('token', newToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // Cập nhật header cho request gốc
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                    // Xử lý queue
                    processQueue(null, newToken);

                    return instance(originalRequest);
                } else {
                    processQueue(error, null);
                    // Nếu refresh token thất bại, chuyển về trang login
                    window.location.href = '/auth/login';
                    return Promise.reject(error);
                }
            } catch (err) {
                processQueue(err, null);
                window.location.href = '/auth/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // Chỉ chuyển về login khi không có token hợp lệ
        if (error.response?.status === 401) {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) {
                window.location.href = '/auth/login';
            }
        }

        return Promise.reject(error);
    }
);

export default instance; 