import React, { useState, useEffect } from 'react';
import { 
    Settings as SettingsIcon, 
    Key, 
    Database, 
    Save,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';

interface SettingsData {
    githubToken: string;
    databasePath: string;
    syncInterval: number;
    autoClassification: boolean;
}

export default function Settings() {
    const [settings, setSettings] = useState<SettingsData>({
        githubToken: '',
        databasePath: './data/github_repos.db',
        syncInterval: 24,
        autoClassification: true,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        // 从localStorage加载设置
        const savedSettings = localStorage.getItem('github-automation-settings');
        if (savedSettings) {
            setSettings({ ...settings, ...JSON.parse(savedSettings) });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);

        try {
            // 保存到localStorage
            localStorage.setItem('github-automation-settings', JSON.stringify(settings));
            
            setMessage({ type: 'success', text: '设置保存成功！' });
        } catch (error) {
            setMessage({ type: 'error', text: '保存设置失败，请重试' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof SettingsData, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
                <p className="mt-1 text-sm text-gray-500">配置GitHub自动化系统的各项参数</p>
            </div>

            {/* 消息提示 */}
            {message && (
                <div className={`rounded-md p-4 ${
                    message.type === 'success' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                }`}>
                    <div className="flex">
                        {message.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        )}
                        <div className="ml-3">
                            <p className={`text-sm font-medium ${
                                message.type === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {message.text}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 设置表单 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* GitHub配置 */}
                <div className="card">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Key className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">GitHub配置</h3>
                            <p className="text-sm text-gray-500">配置GitHub API访问权限</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Personal Access Token
                            </label>
                            <input
                                type="password"
                                value={settings.githubToken}
                                onChange={(e) => handleInputChange('githubToken', e.target.value)}
                                placeholder="请输入GitHub Personal Access Token"
                                className="input"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                用于访问GitHub API，获取你的starred仓库信息
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-800">
                                        <strong>如何获取Token：</strong>
                                    </p>
                                    <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
                                        <li>访问 GitHub Settings → Developer settings → Personal access tokens</li>
                                        <li>点击 "Generate new token"</li>
                                        <li>选择 "repo" 权限（读取仓库信息）</li>
                                        <li>复制生成的token并粘贴到上方输入框</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 数据库配置 */}
                <div className="card">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Database className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">数据库配置</h3>
                            <p className="text-sm text-gray-500">配置数据存储路径</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                数据库路径
                            </label>
                            <input
                                type="text"
                                value={settings.databasePath}
                                onChange={(e) => handleInputChange('databasePath', e.target.value)}
                                placeholder="./data/github_repos.db"
                                className="input"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                本地SQLite数据库文件路径
                            </p>
                        </div>
                    </div>
                </div>

                {/* 同步配置 */}
                <div className="card">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <SettingsIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">同步配置</h3>
                            <p className="text-sm text-gray-500">配置自动同步参数</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                同步间隔（小时）
                            </label>
                            <select
                                value={settings.syncInterval}
                                onChange={(e) => handleInputChange('syncInterval', parseInt(e.target.value))}
                                className="input"
                            >
                                <option value={1}>1小时</option>
                                <option value={6}>6小时</option>
                                <option value={12}>12小时</option>
                                <option value={24}>24小时</option>
                                <option value={168}>7天</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                自动同步GitHub仓库的间隔时间
                            </p>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="autoClassification"
                                checked={settings.autoClassification}
                                onChange={(e) => handleInputChange('autoClassification', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="autoClassification" className="ml-2 block text-sm text-gray-900">
                                自动分类
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">
                            同步完成后自动执行仓库分类
                        </p>
                    </div>
                </div>

                {/* 系统信息 */}
                <div className="card">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <SettingsIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">系统信息</h3>
                            <p className="text-sm text-gray-500">当前系统状态</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">版本</span>
                            <span className="text-sm font-medium text-gray-900">v1.0.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">环境</span>
                            <span className="text-sm font-medium text-gray-900">开发环境</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">数据库</span>
                            <span className="text-sm font-medium text-gray-900">SQLite</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">API状态</span>
                            <span className="text-sm font-medium text-green-600">正常</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary flex items-center"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {loading ? '保存中...' : '保存设置'}
                </button>
            </div>
        </div>
    );
}
