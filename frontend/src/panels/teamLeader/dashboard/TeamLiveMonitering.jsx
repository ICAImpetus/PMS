import React from 'react';
// import './TeamLiveMonitoring.css';

const TeamLiveMonitering = () => {
    const agents = [
        { name: 'Sarah Johnson', status: 'on-call', call: 'Robert Wilson', duration: '4:32', callsToday: 24 },
        { name: 'David Wilson', status: 'on-call', call: 'Jennifer Lopez', duration: '2:15', callsToday: 18 },
        { name: 'Emily Davis', status: 'available', call: '-', duration: '-', callsToday: 22 },
        { name: 'Michael Brown', status: 'break', call: '-', duration: '-', callsToday: 20 },
    ];

    const liveCalls = [
        { agent: 'Sarah Johnson', caller: 'Robert Wilson', issue: 'Appointment Rescheduling', duration: '4:32' },
        { agent: 'David Wilson', caller: 'Jennifer Lopez', issue: 'Prescription Refill', duration: '2:15' },
    ];

    return (
        <div className="page" id="live-monitoring">
            <div className="page-header">
                <h2>Live Agent Monitoring</h2>
                <div>
                    <button className="btn"><i className="fas fa-sync-alt"></i> Refresh</button>
                </div>
            </div>

            <div className="team-stats">
                <div className="stat-card"><h3>8</h3><p>On Call</p></div>
                <div className="stat-card"><h3>3</h3><p>Available</p></div>
                <div className="stat-card"><h3>1</h3><p>On Break</p></div>
                <div className="stat-card"><h3>0</h3><p>Offline</p></div>
            </div>

            <h3 style={{ marginBottom: '15px' }}>Active Calls</h3>
            {liveCalls.map((call, index) => (
                <div className="live-call" key={index}>
                    <div className="live-call-header">
                        <div className="live-call-agent">{call.agent}</div>
                        <div className="live-call-duration">Duration: {call.duration}</div>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <strong>Caller:</strong> {call.caller}<br />
                        <strong>Issue:</strong> {call.issue}
                    </div>
                    <div className="live-call-actions">
                        <button className="btn btn-small"><i className="fas fa-headphones"></i> Listen</button>
                        <button className="btn btn-small btn-secondary"><i className="fas fa-comment"></i> Whisper</button>
                        <button className="btn btn-small btn-warning"><i className="fas fa-sign-in-alt"></i> Barge</button>
                    </div>
                </div>
            ))}

            <h3 style={{ margin: '20px 0 15px' }}>Agent Status</h3>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Agent</th><th>Status</th><th>Current Call</th><th>Duration</th><th>Calls Today</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map((agent, index) => (
                            <tr key={index}>
                                <td>{agent.name}</td>
                                <td><span className={`status ${agent.status}`}>{agent.status.charAt(0).toUpperCase() + agent.status.slice(1).replace('-', ' ')}</span></td>
                                <td>{agent.call}</td>
                                <td>{agent.duration}</td>
                                <td>{agent.callsToday}</td>
                                <td>
                                    {agent.status === 'on-call' ? (
                                        <>
                                            <button className="btn btn-secondary btn-small"><i className="fas fa-headphones"></i> Listen</button>
                                            <button className="btn btn-secondary btn-small"><i className="fas fa-comment"></i> Whisper</button>
                                        </>
                                    ) : (
                                        <button className="btn btn-secondary btn-small" disabled>Not on call</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamLiveMonitering;