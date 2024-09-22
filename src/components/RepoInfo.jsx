import React, { useEffect, useState, lazy, Suspense } from 'react';
// import React, {  } from 'react';
import axios from 'axios';
const RepoCard = lazy(() => import('./RepoCard'));
import '../components/RepoInfo.css'
import { Link } from 'react-router-dom';

const RepoInfo = () => {
    const [repoData, setRepoData] = useState([]);
    const fetchRepos = async () => {
        try {
            const response = await axios.get('https://api.github.com/users/rhm856591/repos');
            setRepoData(response.data);
        } catch (error) {
            console.error('Error fetching repositories:', error);
        }
    };

    useEffect(() => {
        
        fetchRepos();
    }, []);

    if (!repoData.length) return <h1>Loading...</h1>;

    return (
        <div>
            <h1>Repositories</h1>
            <h2>Click here to go back <Link to="/">Home</Link></h2>
            <Suspense fallback={<div>Loading component...</div>}>
                <div className="repo-container">
                    {repoData.map((repo) => (
                        <div className="full-repo-card" key={repo.id}>
                            <RepoCard repo={repo} />
                        </div>
                    ))}
                </div>
            </Suspense>
        </div>

    );
};

export default RepoInfo;
