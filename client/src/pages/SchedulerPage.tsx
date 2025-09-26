import React, { useState, useEffect } from 'react';
import { Card, Button, Switch, message, Descriptions, Tag, Space, Divider, Row, Col } from 'antd';
import { 
    PlayCircleOutlined, 
    PauseCircleOutlined, 
    ClockCircleOutlined
} from '@ant-design/icons';
import api from '../services/api';
import { mockApi } from '../services/mockApi';

interface SchedulerStatus {
    isRunning: boolean;
    lastRun?: string;
    nextRun?: string;
    tasks: Array<{
        name: string;
        enabled: boolean;
        schedule: string;
    }>;
}

const SchedulerPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<SchedulerStatus>({ isRunning: false, tasks: [] });
    const [schedulerEnabled, setSchedulerEnabled] = useState(false);

    // 获取调度器状态
    const fetchStatus = async () => {
        try {
            try {
                // 首先尝试使用统一API服务
                const response = await api.get('/scheduler/status');
                setStatus(response.data.data);
            } catch (apiError) {
                console.error('API请求失败，使用模拟数据:', apiError);
                // API连接失败，回退到模拟数据
                const result = await mockApi.getSchedulerStatus();
                setStatus(result.data.data);
            }
        } catch (error) {
            console.error('获取状态失败:', error);
            // 最终回退到模拟数据
            try {
                const result = await mockApi.getSchedulerStatus();
                setStatus(result.data.data);
            } catch (mockError) {
                console.error('模拟数据出错:', mockError);
            }
        }
    };

    // 启动调度器
    const startScheduler = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/scheduler/start', {
                method: 'POST',
            });
            const result = await response.json();
            
            if (result.success) {
                message.success('定时任务已启动');
                setSchedulerEnabled(true);
                fetchStatus();
            } else {
                message.error(result.error || '启动失败');
            }
        } catch (error) {
            message.error('网络请求失败');
        } finally {
            setLoading(false);
        }
    };

    // 停止调度器
    const stopScheduler = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/scheduler/stop', {
                method: 'POST',
            });
            const result = await response.json();
            
            if (result.success) {
                message.success('定时任务已停止');
                setSchedulerEnabled(false);
                fetchStatus();
            } else {
                message.error(result.error || '停止失败');
            }
        } catch (error) {
            message.error('网络请求失败');
        } finally {
            setLoading(false);
        }
    };

    // 手动执行任务
    const runTask = async (taskType: string) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/scheduler/run/${taskType}`, {
                method: 'POST',
            });
            const result = await response.json();
            
            if (result.success) {
                message.success(result.data.message);
            } else {
                message.error(result.error || '执行失败');
            }
        } catch (error) {
            message.error('网络请求失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const taskConfigs = [
        {
            key: 'daily',
            name: '每日热门发现',
            description: '每天凌晨2点自动发现并star热门项目',
            cron: '0 2 * * *',
            icon: <ClockCircleOutlined />,
        },
        {
            key: 'weekly',
            name: '周度热门发现',
            description: '每周一凌晨3点自动发现并star热门项目',
            cron: '0 3 * * 1',
            icon: <ClockCircleOutlined />,
        },
        {
            key: 'monthly',
            name: '月度热门发现',
            description: '每月1号凌晨4点自动发现并star热门项目',
            cron: '0 4 1 * *',
            icon: <ClockCircleOutlined />,
        },
        {
            key: 'quarterly',
            name: '季度热门发现',
            description: '每季度第一天凌晨5点自动发现并star热门项目',
            cron: '0 5 1 1,4,7,10 *',
            icon: <ClockCircleOutlined />,
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                    ⏰ 定时任务管理
                </h1>
                <p style={{ fontSize: '16px', color: '#666' }}>
                    管理自动发现热门项目的定时任务
                </p>
            </div>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="调度器控制" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: 0, marginBottom: '8px' }}>定时任务调度器</h3>
                                <p style={{ margin: 0, color: '#666' }}>
                                    控制所有定时任务的启动和停止
                                </p>
                            </div>
                            <Space>
                                <Switch
                                    checked={schedulerEnabled}
                                    onChange={(checked) => {
                                        if (checked) {
                                            startScheduler();
                                        } else {
                                            stopScheduler();
                                        }
                                    }}
                                    loading={loading}
                                    checkedChildren="运行中"
                                    unCheckedChildren="已停止"
                                />
                                <Button
                                    type="primary"
                                    icon={schedulerEnabled ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                                    onClick={schedulerEnabled ? stopScheduler : startScheduler}
                                    loading={loading}
                                >
                                    {schedulerEnabled ? '停止调度器' : '启动调度器'}
                                </Button>
                            </Space>
                        </div>
                        
                        <Divider />
                        
                        <Descriptions column={2} size="small">
                            <Descriptions.Item label="运行状态">
                                <Tag color={status.isRunning ? 'green' : 'red'}>
                                    {status.isRunning ? '运行中' : '已停止'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="活跃任务数">
                                {status.tasks.length}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="定时任务配置">
                        <Row gutter={[16, 16]}>
                            {taskConfigs.map((task) => (
                                <Col xs={24} sm={12} lg={6} key={task.key}>
                                    <Card
                                        size="small"
                                        title={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {task.icon}
                                                <span style={{ marginLeft: '8px' }}>{task.name}</span>
                                            </div>
                                        }
                                        extra={
                                            <Button
                                                type="link"
                                                size="small"
                                                onClick={() => runTask(task.key)}
                                                loading={loading}
                                            >
                                                立即执行
                                            </Button>
                                        }
                                    >
                                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                            {task.description}
                                        </p>
                                        <Tag color="blue" style={{ fontSize: '11px' }}>
                                            {task.cron}
                                        </Tag>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="使用说明">
                        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                            <h4>📋 功能说明：</h4>
                            <ul>
                                <li><strong>每日热门发现</strong>：每天自动发现并star一周内最热门的项目</li>
                                <li><strong>周度热门发现</strong>：每周自动发现并star一周内最热门的项目</li>
                                <li><strong>月度热门发现</strong>：每月自动发现并star一个月内最热门的项目</li>
                                <li><strong>季度热门发现</strong>：每季度自动发现并star一个季度内最热门的项目</li>
                            </ul>
                            
                            <h4>⚙️ 自动化流程：</h4>
                            <ol>
                                <li>根据时间周期搜索GitHub上的热门项目</li>
                                <li>自动star前20个最热门的项目</li>
                                <li>自动将新star的项目分类到相应区域</li>
                                <li>更新统计数据和分类信息</li>
                            </ol>
                            
                            <h4>⚠️ 注意事项：</h4>
                            <ul>
                                <li>确保GitHub Token有足够的权限</li>
                                <li>定时任务会消耗GitHub API调用次数</li>
                                <li>建议在非高峰时段运行定时任务</li>
                                <li>可以随时手动执行任务进行测试</li>
                            </ul>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SchedulerPage;
