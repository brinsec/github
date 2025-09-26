"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const axios_1 = __importDefault(require("axios"));
const database_1 = require("../database");
class GitHubService {
    constructor() {
        this.baseURL = 'https://api.github.com';
        this.token = process.env.GITHUB_TOKEN || '';
        console.log('🔍 环境变量检查:', {
            GITHUB_TOKEN: this.token ? `${this.token.substring(0, 10)}...` : '未设置',
            NODE_ENV: process.env.NODE_ENV
        });
        if (!this.token) {
            console.warn('⚠️ 未设置GITHUB_TOKEN，API调用将受到限制');
        }
        else {
            console.log('✅ GITHUB_TOKEN已设置');
        }
    }
    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Automation-System',
        };
        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }
        return headers;
    }
    async getStarredRepositories(username) {
        const repositories = [];
        let page = 1;
        const perPage = 100; // GitHub API允许的最大值
        try {
            while (true) {
                console.log(`📥 正在获取第 ${page} 页的starred仓库...`);
                const response = await axios_1.default.get(`${this.baseURL}/users/${username}/starred`, {
                    headers: this.getHeaders(),
                    params: {
                        page,
                        per_page: perPage,
                        sort: 'created',
                    },
                });
                if (response.data.length === 0) {
                    break;
                }
                // 获取每个仓库的详细信息（包括topics）
                const detailedRepos = await Promise.all(response.data.map(async (repo) => {
                    try {
                        const detailResponse = await axios_1.default.get(`${this.baseURL}/repos/${repo.full_name}`, { headers: this.getHeaders() });
                        return detailResponse.data;
                    }
                    catch (error) {
                        console.warn(`⚠️ 获取仓库详情失败: ${repo.full_name}`);
                        return repo;
                    }
                }));
                repositories.push(...detailedRepos);
                page++;
                // 添加延迟以避免触发API限制
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            console.log(`✅ 成功获取 ${repositories.length} 个starred仓库`);
            return repositories;
        }
        catch (error) {
            if (error.response?.status === 403) {
                throw new Error('GitHub API限制，请稍后重试或检查token');
            }
            else if (error.response?.status === 404) {
                throw new Error('用户不存在或没有公开的starred仓库');
            }
            else {
                throw new Error(`获取starred仓库失败: ${error.message}`);
            }
        }
    }
    async getUserInfo(username) {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/users/${username}`, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 404) {
                throw new Error('用户不存在');
            }
            throw new Error(`获取用户信息失败: ${error.message}`);
        }
    }
    async searchRepositories(query, sort = 'stars') {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/search/repositories`, {
                headers: this.getHeaders(),
                params: {
                    q: query,
                    sort,
                    order: 'desc',
                    per_page: 100,
                },
            });
            return response.data.items;
        }
        catch (error) {
            throw new Error(`搜索仓库失败: ${error.message}`);
        }
    }
    async syncStarredRepositories(username) {
        console.log(`🔄 开始同步用户 ${username} 的starred仓库...`);
        try {
            const repositories = await this.getStarredRepositories(username);
            // 保存到数据库
            for (const repo of repositories) {
                await (0, database_1.saveRepository)(repo);
            }
            console.log(`✅ 成功同步 ${repositories.length} 个仓库到数据库`);
            return repositories.length;
        }
        catch (error) {
            console.error('❌ 同步失败:', error.message);
            throw error;
        }
    }
}
exports.GitHubService = GitHubService;
//# sourceMappingURL=githubService.js.map