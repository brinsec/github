import axios from 'axios';

// 检测环境并设置API地址
const isGitHubPages = window.location.hostname.includes('github.io');
const isVercel = window.location.hostname.includes('vercel.app');

let baseURL = '/api'; // 默认本地开发

if (isGitHubPages) {
    // GitHub Pages环境，使用Vercel部署的API
    baseURL = 'https://github-3o192x6m4-brinsecs-projects.vercel.app/api';
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
    withCredentials: false, // 避免跨域证书问题
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// 检测API是否可用的辅助函数
const testApiAvailability = async () => {
    try {
        console.log('🔍 正在检测后端健康状态...');
        const response = await axios.get(`${baseURL}/health`, { 
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ 后端健康检测成功:', response.data);
        return true;
    } catch (error: any) {
        console.error('❌ 后端健康检测失败:', error?.message || error);
        return false;
    }
};

// 在GitHub Pages环境中自动进行后端健康检测
if (isGitHubPages) {
    testApiAvailability();
}

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
    async (error) => {
        console.error('API请求失败:', error);
        
        // 处理CORS错误和401认证错误
        const isNetworkError = error.code === 'ERR_NETWORK' || error.name === 'AxiosError';
        const isUnauthorized = error.response?.status === 401;
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        if (isNetworkError || isUnauthorized) {
            if (isGitHubPages) {
                console.log('🔄 CORS/401错误检测，自动切换到模拟数据模式');
                // 这里将在后续的API拦截器中处理挂起的请求
                return Promise.reject(error);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
