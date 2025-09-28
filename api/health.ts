import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // 设置CORS头部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const responseData = {
        success: true,
        message: 'Vercel API 运行正常',
        timestamp: new Date().toISOString(),
        vercel_env: !!process.env.VERCEL,
        vercel_env_type: process.env.VERCEL_ENV || 'unknown',
        github_token_set: !!process.env.GITHUB_TOKEN,
        node_env: process.env.NODE_ENV || 'unknown',
        api_status: 'online'
    };
    
    res.status(200).json(responseData);
}
