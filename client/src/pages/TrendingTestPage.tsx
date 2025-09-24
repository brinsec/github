import { useState } from 'react';
import { Card, Button, message } from 'antd';

interface TrendingRepository {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    topics: string[];
}

const TrendingTestPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TrendingRepository[]>([]);

    const testAPI = async (period: string) => {
        setLoading(true);
        try {
            console.log(`测试 ${period} API...`);
            const response = await fetch(`http://localhost:3001/api/trending/${period}`);
            const result = await response.json();
            
            console.log(`${period} API响应:`, result);
            
            if (result.success) {
                setData(result.data);
                message.success(`成功获取 ${result.data.length} 个${period}热门项目`);
            } else {
                message.error(result.error || '获取数据失败');
            }
        } catch (error) {
            console.error(`${period} API错误:`, error);
            message.error('网络请求失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <h1>热门项目API测试</h1>
            
            <div style={{ marginBottom: '24px' }}>
                <Button 
                    onClick={() => testAPI('weekly')} 
                    loading={loading}
                    style={{ marginRight: '8px' }}
                >
                    测试周度API
                </Button>
                <Button 
                    onClick={() => testAPI('monthly')} 
                    loading={loading}
                    style={{ marginRight: '8px' }}
                >
                    测试月度API
                </Button>
                <Button 
                    onClick={() => testAPI('quarterly')} 
                    loading={loading}
                >
                    测试季度API
                </Button>
            </div>

            <Card title={`热门项目列表 (${data.length}个)`}>
                {data.slice(0, 10).map((repo, index) => (
                    <div key={repo.id} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>
                            {index + 1}. {repo.name}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                            {repo.description || '暂无描述'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#1890ff' }}>
                                ⭐ {repo.stargazers_count.toLocaleString()} stars
                            </span>
                            <span style={{ color: '#52c41a' }}>
                                🍴 {repo.forks_count.toLocaleString()} forks
                            </span>
                            <span style={{ color: '#722ed1' }}>
                                {repo.language || '未知语言'}
                            </span>
                        </div>
                    </div>
                ))}
            </Card>
        </div>
    );
};

export default TrendingTestPage;
