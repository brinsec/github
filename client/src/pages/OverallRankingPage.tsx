import React, { useState, useEffect } from 'react';
import { TrophyOutlined, StarOutlined, ForkOutlined, EyeOutlined } from '@ant-design/icons';
import { Card, Row, Col, Button, Spin, message, Tag, Statistic, List, Avatar, Typography } from 'antd';

const { Title, Text, Paragraph } = Typography;

interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    topics: string[];
    created_at: string;
    updated_at: string;
    pushed_at: string;
    size: number;
    default_branch: string;
    open_issues_count: number;
    watchers_count: number;
    archived: boolean;
    disabled: boolean;
    private: boolean;
    fork: boolean;
    license: {
        key: string;
        name: string;
        spdx_id: string;
        url: string;
    };
}

const OverallRankingPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
    const [statistics, setStatistics] = useState({
        totalRepos: 0,
        totalStars: 0,
        totalForks: 0,
        avgStars: 0,
    });

    const fetchOverallRanking = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/trending/overall');
            const result = await response.json();
            
            if (result.success) {
                setRepositories(result.data);
                
                // 计算统计信息
                const totalStars = result.data.reduce((sum: number, repo: GitHubRepository) => sum + repo.stargazers_count, 0);
                const totalForks = result.data.reduce((sum: number, repo: GitHubRepository) => sum + repo.forks_count, 0);
                const avgStars = result.data.length > 0 ? Math.round(totalStars / result.data.length) : 0;
                
                setStatistics({
                    totalRepos: result.data.length,
                    totalStars,
                    totalForks,
                    avgStars,
                });
                
                message.success(`总榜加载完成，共 ${result.data.length} 个项目`);
            } else {
                message.error(result.error || '加载总榜失败');
            }
        } catch (error) {
            console.error('获取总榜失败:', error);
            message.error('获取总榜失败，请检查网络连接');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverallRanking();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    const getLanguageColor = (language: string) => {
        const colors: { [key: string]: string } = {
            'JavaScript': '#f7df1e',
            'TypeScript': '#3178c6',
            'Python': '#3776ab',
            'Java': '#ed8b00',
            'Go': '#00add8',
            'Rust': '#dea584',
            'C++': '#00599c',
            'C#': '#239120',
            'PHP': '#777bb4',
            'Ruby': '#cc342d',
            'Swift': '#fa7343',
            'Kotlin': '#7f52ff',
            'Dart': '#0175c2',
            'Shell': '#89e051',
            'HTML': '#e34c26',
            'CSS': '#1572b6',
            'Vue': '#4fc08d',
            'React': '#61dafb',
        };
        return colors[language] || '#666';
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <Title level={1} className="flex items-center gap-3 mb-2">
                    <TrophyOutlined className="text-yellow-500" />
                    总榜排行
                </Title>
                <Paragraph className="text-gray-600 text-lg">
                    综合所有时间段的热门项目排行榜，展示GitHub上最受欢迎的开源项目
                </Paragraph>
            </div>

            {/* 统计信息 */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="总项目数"
                            value={statistics.totalRepos}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="总Star数"
                            value={statistics.totalStars}
                            prefix={<StarOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                            formatter={(value) => formatNumber(Number(value))}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="总Fork数"
                            value={statistics.totalForks}
                            prefix={<ForkOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                            formatter={(value) => formatNumber(Number(value))}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="平均Star数"
                            value={statistics.avgStars}
                            prefix={<EyeOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                            formatter={(value) => formatNumber(Number(value))}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 操作按钮 */}
            <div className="mb-6">
                <Button 
                    type="primary" 
                    size="large"
                    onClick={fetchOverallRanking}
                    loading={loading}
                    icon={<TrophyOutlined />}
                >
                    刷新总榜
                </Button>
            </div>

            {/* 排行榜列表 */}
            <Card title="🏆 总榜排行榜" className="mb-6">
                {loading ? (
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <div className="mt-4">正在加载总榜数据...</div>
                    </div>
                ) : repositories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        暂无总榜数据
                    </div>
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={repositories}
                        renderItem={(repo, index) => (
                            <List.Item
                                key={repo.id}
                                className="border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex items-start gap-4 w-full">
                                    {/* 排名 */}
                                    <div className="flex-shrink-0 w-12 text-center">
                                        <div className="text-2xl font-bold text-gray-400">
                                            {getRankIcon(index)}
                                        </div>
                                    </div>

                                    {/* 项目信息 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Title level={4} className="mb-0">
                                                <a 
                                                    href={repo.html_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {repo.full_name}
                                                </a>
                                            </Title>
                                            {repo.language && (
                                                <Tag 
                                                    color={getLanguageColor(repo.language)}
                                                    className="text-xs"
                                                >
                                                    {repo.language}
                                                </Tag>
                                            )}
                                        </div>

                                        <Paragraph 
                                            className="text-gray-600 mb-3"
                                            ellipsis={{ rows: 2 }}
                                        >
                                            {repo.description}
                                        </Paragraph>

                                        {/* 统计信息 */}
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <StarOutlined />
                                                <span>{formatNumber(repo.stargazers_count)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ForkOutlined />
                                                <span>{formatNumber(repo.forks_count)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <EyeOutlined />
                                                <span>{formatNumber(repo.watchers_count)}</span>
                                            </div>
                                            <div>
                                                Issues: {repo.open_issues_count}
                                            </div>
                                        </div>

                                        {/* 标签 */}
                                        {repo.topics && repo.topics.length > 0 && (
                                            <div className="mt-2">
                                                {repo.topics.slice(0, 5).map((topic) => (
                                                    <Tag key={topic} size="small" className="mb-1">
                                                        {topic}
                                                    </Tag>
                                                ))}
                                                {repo.topics.length > 5 && (
                                                    <Tag size="small" className="mb-1">
                                                        +{repo.topics.length - 5}
                                                    </Tag>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* 项目头像 */}
                                    <div className="flex-shrink-0">
                                        <Avatar 
                                            size={64}
                                            src={`https://github.com/${repo.full_name.split('/')[0]}.png`}
                                            className="border border-gray-200"
                                        />
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};

export default OverallRankingPage;
