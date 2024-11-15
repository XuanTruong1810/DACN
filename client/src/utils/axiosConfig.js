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

            if (!refreshToken) {
                // Nếu không có refresh token, chuyển về trang login
                window.location.href = '/auth/login';
                return Promise.reject(error);
            }

            try {
                // Gọi API refresh token
                const response = await instance.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh-token`, {
                    refreshToken: refreshToken
                });

                if (response.data.isSuccess) {
                    const { token, refreshToken: newRefreshToken } = response.data.data;

                    // Lưu token mới
                    localStorage.setItem('token', token);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // Cập nhật header cho request gốc
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;

                    // Xử lý queue
                    processQueue(null, token);

                    return instance(originalRequest);
                } else {
                    processQueue(error, null);
                    // Nếu refresh token thất bại, chuyển về trang login
                    window.location.href = '/auth/login';
                    return Promise.reject(error);
                }
            } catch (err) {
                processQueue(err, null);
                // Nếu có lỗi khi refresh token, chuyển về trang login
                window.location.href = '/auth/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // Nếu là lỗi 401 khác hoặc đã thử refresh token
        if (error.response?.status === 401) {
            window.location.href = '/auth/login';
        }

        return Promise.reject(error);
    }
);

export default instance; 