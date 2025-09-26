import axios from 'axios';

// 检测环境并设置API地址
const isGitHubPages = window.location.hostname.includes('github.io');
const isVercel = window.location.hostname.includes('vercel.app');

let baseURL = '/api'; // 默认本地开发

if (isGitHubPages) {
    // GitHub Pages环境，使用Vercel部署的API
    baseURL = 'https://github-9w72r2qu4-brinsecs-projects.vercel.app/api';
    console.log('🌐 GitHub Pages环境，API地址:', baseURL);
} else if (isVercel) {
    // Vercel环境，使用相对路径
    baseURL = '/api';
    console.log('🔧 Vercel环境，API地址:', baseURL);
} else {
    baseURL = '/api';
    console.log('🏠 本地开发环境，API地址:', baseURL);
}

const api = axios.create({
    baseURL,
    timeout: 30000,
});

// 检测API是否可用的辅助函数 (当前未使用)
// const testApiAvailability = async () => {
//     try {
//         const response = await axios.get(`${baseURL}/health`, { timeout: 5000 });
//         return response.status === 200;
//     } catch (error) {
//         return false;
//     }
// };

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
