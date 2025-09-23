import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
    },
    (error) => {
        console.error('响应错误:', error);
        if (error.response) {
            console.error('错误详情:', error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;
