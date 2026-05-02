import React from 'react';

const TeamPerformance = () => {
    const performanceData = [
        { agent: 'Sarah Johnson', calls: 42, avgDuration: '4:32', fcr: '92%', status: 'active' },
        { agent: 'Michael Brown', calls: 38, avgDuration: '5:12', fcr: '87%', status: 'active' },
        { agent: 'Emily Davis', calls: 35, avgDuration: '4:58', fcr: '85%', status: 'pending' },
        { agent: 'David Wilson', calls: 31, avgDuration: '4:15', fcr: '90%', status: 'pending' },
    ];

    return (
        <div className="page" id="team-performance">
            <div className="page-header">
                <h2>Team Performance</h2>
                <div><button className="btn"><i className="fas fa-download"></i> Export</button></div>
            </div>

            <div className="dashboard-cards">
                <div className="card">
                    <div className="card-header"><h3>Team Satisfaction</h3><i className="fas fa-smile"></i></div>
                    <div className="card-content"><h2>92%</h2><p>Based on 124 reviews</p></div>
                </div>
                <div className="card">
                    <div className="card-header"><h3>Avg. Response Time</h3><i className="fas fa-clock"></i></div>
                    <div className="card-content"><h2>18s</h2><p>To answer calls</p></div>
                </div>
                <div className="card">
                    <div className="card-header"><h3>First Call Resolution</h3><i className="fas fa-check-circle"></i></div>
                    <div className="card-content"><h2>88%</h2><p>Issues resolved in first call</p></div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Agent</th><th>Calls Today</th><th>Avg. Duration</th><th>First Call Resolution</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performanceData.map((data, index) => (
                            <tr key={index}>
                                <td>{data.agent}</td>
                                <td>{data.calls}</td>
                                <td>{data.avgDuration}</td>
                                <td>{data.fcr}</td>
                                <td><span className={`status ${data.status}`}>{data.status === 'active' ? 'On Call' : 'Available'}</span></td>
                                <td>
                                    <button className="btn btn-secondary btn-small"><i className="fas fa-chart-bar"></i> Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamPerformance;