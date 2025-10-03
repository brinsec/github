"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockTrendingService = void 0;
class MockTrendingService {
    /**
     * 获取模拟的周度热门项目
     */
    getWeeklyTrending() {
        return [
            {
                id: 1,
                name: 'react',
                full_name: 'facebook/react',
                description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
                html_url: 'https://github.com/facebook/react',
                clone_url: 'https://github.com/facebook/react.git',
                language: 'JavaScript',
                stargazers_count: 220000,
                forks_count: 45000,
                topics: ['javascript', 'react', 'ui', 'frontend'],
                created_at: '2013-05-24T16:15:54Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 100000,
                default_branch: 'main',
                open_issues_count: 1000,
                watchers_count: 220000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'mit',
                    name: 'MIT License',
                    spdx_id: 'MIT',
                    url: 'https://api.github.com/licenses/mit',
                },
                owner: {
                    login: 'facebook',
                    id: 69631,
                    avatar_url: 'https://github.com/facebook.png',
                    html_url: 'https://github.com/facebook'
                }
            },
            {
                id: 2,
                name: 'vue',
                full_name: 'vuejs/vue',
                description: 'Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.',
                html_url: 'https://github.com/vuejs/vue',
                clone_url: 'https://github.com/vuejs/vue.git',
                language: 'JavaScript',
                stargazers_count: 200000,
                forks_count: 33000,
                topics: ['javascript', 'vue', 'framework', 'frontend'],
                created_at: '2013-07-29T03:24:51Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 80000,
                default_branch: 'main',
                open_issues_count: 500,
                watchers_count: 200000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'mit',
                    name: 'MIT License',
                    spdx_id: 'MIT',
                    url: 'https://api.github.com/licenses/mit',
                },
                owner: {
                    login: 'vuejs',
                    id: 6128107,
                    avatar_url: 'https://github.com/vuejs.png',
                    html_url: 'https://github.com/vuejs'
                }
            },
            {
                id: 3,
                name: 'angular',
                full_name: 'angular/angular',
                description: 'The modern web developer\'s platform',
                html_url: 'https://github.com/angular/angular',
                clone_url: 'https://github.com/angular/angular.git',
                language: 'TypeScript',
                stargazers_count: 90000,
                forks_count: 24000,
                topics: ['typescript', 'angular', 'framework', 'frontend'],
                created_at: '2014-12-19T00:00:00Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 120000,
                default_branch: 'main',
                open_issues_count: 2000,
                watchers_count: 90000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'mit',
                    name: 'MIT License',
                    spdx_id: 'MIT',
                    url: 'https://api.github.com/licenses/mit',
                },
                owner: {
                    login: 'angular',
                    id: 139426,
                    avatar_url: 'https://github.com/angular.png',
                    html_url: 'https://github.com/angular'
                }
            },
            {
                id: 4,
                name: 'next.js',
                full_name: 'vercel/next.js',
                description: 'The React Framework for the Web',
                html_url: 'https://github.com/vercel/next.js',
                clone_url: 'https://github.com/vercel/next.js.git',
                language: 'JavaScript',
                stargazers_count: 110000,
                forks_count: 25000,
                topics: ['javascript', 'react', 'nextjs', 'framework'],
                created_at: '2016-10-05T00:00:00Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 150000,
                default_branch: 'canary',
                open_issues_count: 800,
                watchers_count: 110000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'mit',
                    name: 'MIT License',
                    spdx_id: 'MIT',
                    url: 'https://api.github.com/licenses/mit',
                },
                owner: {
                    login: 'vercel',
                    id: 14985020,
                    avatar_url: 'https://github.com/vercel.png',
                    html_url: 'https://github.com/vercel'
                }
            },
            {
                id: 5,
                name: 'nuxt',
                full_name: 'nuxt/nuxt',
                description: 'The Intuitive Vue Framework',
                html_url: 'https://github.com/nuxt/nuxt',
                clone_url: 'https://github.com/nuxt/nuxt.git',
                language: 'TypeScript',
                stargazers_count: 50000,
                forks_count: 5000,
                topics: ['typescript', 'vue', 'nuxt', 'framework'],
                created_at: '2016-10-12T00:00:00Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 60000,
                default_branch: 'main',
                open_issues_count: 300,
                watchers_count: 50000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'mit',
                    name: 'MIT License',
                    spdx_id: 'MIT',
                    url: 'https://api.github.com/licenses/mit',
                },
                owner: {
                    login: 'nuxt',
                    id: 23360977,
                    avatar_url: 'https://github.com/nuxt.png',
                    html_url: 'https://github.com/nuxt'
                }
            },
            {
                id: 6,
                name: 'svelte',
                full_name: 'sveltejs/svelte',
                description: 'Cybernetically enhanced web apps',
                html_url: 'https://github.com/sveltejs/svelte',
                clone_url: 'https://github.com/sveltejs/svelte.git',
                language: 'TypeScript',
                stargazers_count: 75000,
                forks_count: 4000,
                topics: ['typescript', 'svelte', 'compiler', 'frontend'],
                created_at: '2016-11-20T00:00:00Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 40000,
                default_branch: 'main',
                open_issues_count: 200,
                watchers_count: 75000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'mit',
                    name: 'MIT License',
                    spdx_id: 'MIT',
                    url: 'https://api.github.com/licenses/mit',
                },
                owner: {
                    login: 'sveltejs',
                    id: 23617963,
                    avatar_url: 'https://github.com/sveltejs.png',
                    html_url: 'https://github.com/sveltejs'
                }
            },
            {
                id: 7,
                name: 'solid',
                full_name: 'solidjs/solid',
                description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
                html_url: 'https://github.com/solidjs/solid',
                clone_url: 'https://github.com/solidjs/solid.git',
                language: 'TypeScript',
                stargazers_count: 30000,
                forks_count: 800,
                topics: ['typescript', 'solid', 'reactive', 'frontend'],
                created_at: '2018-09-18T00:00:00Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 25000,
                default_branch: 'main',
                open_issues_count: 100,
                watchers_count: 30000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'mit',
                    name: 'MIT License',
                    spdx_id: 'MIT',
                    url: 'https://api.github.com/licenses/mit',
                },
                owner: {
                    login: 'solidjs',
                    id: 79226042,
                    avatar_url: 'https://github.com/solidjs.png',
                    html_url: 'https://github.com/solidjs'
                }
            }
        ];
    }
    /**
     * 获取模拟的月度热门项目
     */
    getMonthlyTrending() {
        return [
            {
                id: 1,
                name: 'tensorflow',
                full_name: 'tensorflow/tensorflow',
                description: 'An Open Source Machine Learning Framework',
                html_url: 'https://github.com/tensorflow/tensorflow',
                clone_url: 'https://github.com/tensorflow/tensorflow.git',
                language: 'C++',
                stargazers_count: 180000,
                forks_count: 88000,
                topics: ['machine-learning', 'tensorflow', 'ai', 'deep-learning'],
                created_at: '2015-11-09T00:00:00Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 2000000,
                default_branch: 'master',
                open_issues_count: 2000,
                watchers_count: 180000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'apache-2.0',
                    name: 'Apache License 2.0',
                    spdx_id: 'Apache-2.0',
                    url: 'https://api.github.com/licenses/apache-2.0',
                },
                owner: {
                    login: 'tensorflow',
                    id: 15658638,
                    avatar_url: 'https://github.com/tensorflow.png',
                    html_url: 'https://github.com/tensorflow'
                }
            },
            {
                id: 2,
                name: 'pytorch',
                full_name: 'pytorch/pytorch',
                description: 'Tensors and Dynamic neural networks in Python with strong GPU acceleration',
                html_url: 'https://github.com/pytorch/pytorch',
                clone_url: 'https://github.com/pytorch/pytorch.git',
                language: 'Python',
                stargazers_count: 75000,
                forks_count: 20000,
                topics: ['python', 'pytorch', 'machine-learning', 'ai'],
                created_at: '2016-08-18T00:00:00Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 1000000,
                default_branch: 'main',
                open_issues_count: 1000,
                watchers_count: 75000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'bsd-3-clause',
                    name: 'BSD 3-Clause License',
                    spdx_id: 'BSD-3-Clause',
                    url: 'https://api.github.com/licenses/bsd-3-clause',
                },
                owner: {
                    login: 'pytorch',
                    id: 21003710,
                    avatar_url: 'https://github.com/pytorch.png',
                    html_url: 'https://github.com/pytorch'
                }
            },
            {
                id: 3,
                name: 'opencv',
                full_name: 'opencv/opencv',
                description: 'Open Source Computer Vision Library',
                html_url: 'https://github.com/opencv/opencv',
                clone_url: 'https://github.com/opencv/opencv.git',
                language: 'C++',
                stargazers_count: 70000,
                forks_count: 55000,
                topics: ['computer-vision', 'opencv', 'c++', 'image-processing'],
                created_at: '2010-06-23T00:00:00Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 800000,
                default_branch: 'master',
                open_issues_count: 500,
                watchers_count: 70000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'apache-2.0',
                    name: 'Apache License 2.0',
                    spdx_id: 'Apache-2.0',
                    url: 'https://api.github.com/licenses/apache-2.0',
                },
                owner: {
                    login: 'opencv',
                    id: 500693,
                    avatar_url: 'https://github.com/opencv.png',
                    html_url: 'https://github.com/opencv'
                }
            },
            {
                id: 4,
                name: 'scikit-learn',
                full_name: 'scikit-learn/scikit-learn',
                description: 'scikit-learn: machine learning in Python',
                html_url: 'https://github.com/scikit-learn/scikit-learn',
                clone_url: 'https://github.com/scikit-learn/scikit-learn.git',
                language: 'Python',
                stargazers_count: 60000,
                forks_count: 22000,
                topics: ['python', 'machine-learning', 'scikit-learn', 'data-science'],
                created_at: '2010-07-14T00:00:00Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 500000,
                default_branch: 'main',
                open_issues_count: 300,
                watchers_count: 60000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'bsd-3-clause',
                    name: 'BSD 3-Clause License',
                    spdx_id: 'BSD-3-Clause',
                    url: 'https://api.github.com/licenses/bsd-3-clause',
                },
                owner: {
                    login: 'scikit-learn',
                    id: 365630,
                    avatar_url: 'https://github.com/scikit-learn.png',
                    html_url: 'https://github.com/scikit-learn'
                }
            },
            {
                id: 5,
                name: 'pandas',
                full_name: 'pandas-dev/pandas',
                description: 'Flexible and powerful data analysis / manipulation library for Python',
                html_url: 'https://github.com/pandas-dev/pandas',
                clone_url: 'https://github.com/pandas-dev/pandas.git',
                language: 'Python',
                stargazers_count: 42000,
                forks_count: 18000,
                topics: ['python', 'pandas', 'data-analysis', 'data-science'],
                created_at: '2010-08-24T00:00:00Z',
                updated_at: '2025-09-22T17:30:00Z',
                pushed_at: '2025-09-22T17:30:00Z',
                size: 300000,
                default_branch: 'main',
                open_issues_count: 200,
                watchers_count: 42000,
                archived: false,
                disabled: false,
                private: false,
                fork: false,
                license: {
                    key: 'bsd-3-clause',
                    name: 'BSD 3-Clause License',
                    spdx_id: 'BSD-3-Clause',
                    url: 'https://api.github.com/licenses/bsd-3-clause',
                },
                owner: {
                    login: 'pandas-dev',
                    id: 21206976,
                    avatar_url: 'https://github.com/pandas-dev.png',
                    html_url: 'https://github.com/pandas-dev'
                }
            }
        ];
    }
    /**
     * 获取模拟的季度热门项目
     */
    getQuarterlyTrending() {
        return this.getMonthlyTrending();
    }
    /**
     * 获取模拟的总体排名
     */
    getOverallRanking() {
        return this.getWeeklyTrending();
    }
}
exports.MockTrendingService = MockTrendingService;
//# sourceMappingURL=mockTrendingService.js.map