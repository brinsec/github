import express from 'express';

const app = express();

// 基础中间件
app.use(express.json());

// CORS 中间件
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // 允许的域名列表
    const allowedOrigins = [
        'https://brinsec.github.io',
        'https://brinsecs-projects.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
    ];
    
    // 检查 origin 是否在允许列表中
    const allowedOrigin = allowedOrigins.includes(origin as string) ? origin : '*';
    
    // 设置CORS头部
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ success: true });
    }
    
    next();
});

// 健康检查端点
app.get('/api/health', (req, res) => {
    const origin = req.headers.origin;
    console.log('🏥 健康检查请求:', origin);
    
    const responseData = { 
        success: true, 
        message: 'GitHub自动化系统运行正常',
        origin: origin,
        cors_enabled: true,
        vercel_env: !!process.env.VERCEL,
        vercel_env_type: process.env.VERCEL_ENV || 'unknown',
        github_token_set: !!process.env.GITHUB_TOKEN,
        node_env: process.env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString(),
        api_status: 'online',
        database_type: process.env.VERCEL ? 'memory' : 'file'
    };
    
    res.status(200).json(responseData);
});

// 测试端点
app.get('/api/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API测试成功',
        timestamp: new Date().toISOString()
    });
});

// 模拟数据端点（用于测试）
app.get('/api/repositories', (req, res) => {
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
                avatar_url: 'https://github.com/test.png'
            }
        }
    ];

    res.status(200).json({
        success: true,
        data: mockRepositories,
        message: '获取仓库列表成功（模拟数据）'
    });
});

// 模拟分类数据
app.get('/api/categories', (req, res) => {
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
});

// 模拟统计数据
app.get('/api/statistics', (req, res) => {
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
});

export default app;