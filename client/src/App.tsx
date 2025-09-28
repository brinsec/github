import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import Categories from './pages/Categories';
import Statistics from './pages/Statistics';
import TrendingPage from './pages/TrendingPageSimple';
import TrendingTestPage from './pages/TrendingTestPage';
import SchedulerPage from './pages/SchedulerPage';
import OverallRankingPage from './pages/OverallRankingPage';
import ProjectDiscoveryPage from './pages/ProjectDiscoveryPage';
import SearchDatabasePage from './pages/SearchDatabasePage';
import Settings from './pages/Settings';

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/repositories" element={<Repositories />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/trending" element={<TrendingPage />} />
                <Route path="/trending-test" element={<TrendingTestPage />} />
                <Route path="/scheduler" element={<SchedulerPage />} />
                <Route path="/overall" element={<OverallRankingPage />} />
                <Route path="/discovery" element={<ProjectDiscoveryPage />} />
                <Route path="/search-db" element={<SearchDatabasePage />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Layout>
    );
}

export default App;
