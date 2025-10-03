import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS 中间件函数
function setCorsHeaders(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Range, X-Total-Count, Cache-Control, Pragma');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    res.setHeader('Access-Control-Max-Age', '86400');
}

// 主处理函数
export default function handler(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin;
    console.log('🌐 API请求:', origin, req.method, req.url);
    
    // 设置CORS头部
    setCorsHeaders(res);
    
    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        console.log('✅ OPTIONS预检请求，返回200');
        return res.status(200).end();
    }
    
    // 路由处理
    const url = req.url || '';
    
    if (url.includes('/api/health')) {
        return handleHealth(req, res);
    } else if (url.includes('/api/repositories')) {
        return handleRepositories(req, res);
    } else if (url.includes('/api/categories')) {
        return handleCategories(req, res);
    } else if (url.includes('/api/statistics')) {
        return handleStatistics(req, res);
    } else if (url.includes('/api/test')) {
        return handleTest(req, res);
    } else {
        return res.status(404).json({
            success: false,
            message: 'API端点不存在',
            available_endpoints: [
                '/api/health',
                '/api/repositories',
                '/api/categories',
                '/api/statistics',
                '/api/test'
            ]
        });
    }
}

// 健康检查端点
function handleHealth(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin;
    console.log('🏥 健康检查请求:', origin);
    
    const responseData = { 
        success: true, 
        message: 'GitHub自动化系统运行正常',
        origin: origin,
        cors_enabled: true,
        cors_origin: '*',
        vercel_env: !!process.env.VERCEL,
        vercel_env_type: process.env.VERCEL_ENV || 'unknown',
        github_token_set: !!process.env.GITHUB_TOKEN,
        node_env: process.env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString(),
        api_status: 'online',
        database_type: process.env.VERCEL ? 'memory' : 'file'
    };
    
    res.status(200).json(responseData);
}

// 测试端点
function handleTest(req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        success: true,
        message: 'API测试成功',
        timestamp: new Date().toISOString()
    });
}

// 仓库数据端点
function handleRepositories(req: VercelRequest, res: VercelResponse) {
    const mockRepositories = [
        {
            id: 1,
            name: 'test-repo',
            full_name: 'test/test-repo',
            description: '这是一个测试仓库',
            html_url: 'https://github.com/test/test-repo',
            language: 'TypeScript',
            stargazers_count: 100,
            forks_count: 20,
            watchers_count: 50,
            size: 1024,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z',
            pushed_at: '2024-01-15T00:00:00Z',
            topics: ['test', 'demo'],
            default_branch: 'main',
            open_issues_count: 5,
            archived: false,
            disabled: false,
            private: false,
            fork: false,
            license: {
                key: 'mit',
                name: 'MIT License',
                spdx_id: 'MIT',
                url: 'https://api.github.com/licenses/mit'
            },
            owner: {
                login: 'test',
                id: 1,
                avatar_url: 'https://github.com/test.png',
                html_url: 'https://github.com/test'
            }
        }
    ];

    res.status(200).json({
        success: true,
        data: mockRepositories,
        message: '获取仓库列表成功（模拟数据）'
    });
}

// 分类数据端点
function handleCategories(req: VercelRequest, res: VercelResponse) {
    const mockCategories = [
        {
            id: 'frontend',
            name: '前端开发',
            description: '前端框架、库和工具',
            color: '#3B82F6',
            criteria: {
                languages: ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
                keywords: ['react', 'vue', 'angular', 'frontend', 'ui', 'component'],
                topics: ['frontend', 'javascript', 'typescript', 'react', 'vue', 'angular']
            }
        },
        {
            id: 'backend',
            name: '后端开发',
            description: '后端框架、API和服务',
            color: '#10B981',
            criteria: {
                languages: ['Python', 'Java', 'Go', 'Node.js', 'C#', 'PHP', 'Ruby'],
                keywords: ['backend', 'api', 'server', 'framework', 'database'],
                topics: ['backend', 'api', 'server', 'framework']
            }
        }
    ];

    res.status(200).json({
        success: true,
        data: mockCategories,
        message: '获取分类列表成功（模拟数据）'
    });
}

// 统计数据端点
function handleStatistics(req: VercelRequest, res: VercelResponse) {
    const mockStats = {
        totalRepositories: 10,
        totalStars: 1000,
        totalForks: 200,
        totalWatchers: 500,
        languageDistribution: [
            { name: 'TypeScript', count: 5, percentage: 50 },
            { name: 'JavaScript', count: 3, percentage: 30 },
            { name: 'Python', count: 2, percentage: 20 }
        ],
        categoryDistribution: [
            { name: '前端开发', count: 6, percentage: 60 },
            { name: '后端开发', count: 4, percentage: 40 }
        ],
        topRepositories: [
            {
                name: 'test-repo',
                full_name: 'test/test-repo',
                stargazers_count: 100,
                forks_count: 20,
                language: 'TypeScript'
            }
        ]
    };

    res.status(200).json({
        success: true,
        data: mockStats,
        message: '获取统计信息成功（模拟数据）'
    });
}