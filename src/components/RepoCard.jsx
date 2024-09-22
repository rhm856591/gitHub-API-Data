import React from 'react';

const RepoCard = ({ repo }) => {
    return (
        <div className="repo-card">
            <h2>{repo.name}</h2>
            <p><strong>Description:</strong> {repo.description}</p>
            <p><strong>Owner:</strong> {repo.owner.login}</p>
            <p><strong>Public Repos:</strong> {repo.public_repos}</p>
            <p><strong>Created At:</strong> {new Date(repo.created_at).toLocaleDateString()}</p>
            <p><strong>Last Pushed:</strong> {new Date(repo.pushed_at).toLocaleDateString()}</p>
            <p><strong>Language:</strong> {repo.language || "Not specified"}</p>
            <p><strong>License:</strong> {repo.license ? repo.license.name : "No license"}</p>
            <p><strong>Visibility:</strong> {repo.visibility}</p>
            <p><strong>Forks:</strong> {repo.forks_count}</p>
            <p><strong>Open Issues:</strong> {repo.open_issues_count}</p>
            <p><strong>Watchers:</strong> {repo.watchers_count}</p>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                View on GitHub
            </a>
        </div>
    );
};

export default RepoCard;
