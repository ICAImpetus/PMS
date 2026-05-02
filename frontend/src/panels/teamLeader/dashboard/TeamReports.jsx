import React from 'react';
const TeamReports = () => {
    const reportData = [
        { id: '#RPT-0015', type: 'Team Performance Summary', date: 'Oct 1-10, 2023', team: "St. Mary's Hospital", status: 'completed' },
        { id: '#RPT-0014', type: 'Agent Quality Assessment', date: 'Sep 2023', team: "St. Mary's Hospital", status: 'completed' },
        { id: '#RPT-0013', type: 'Call Volume Analysis', date: 'Q3 2023', team: "St. Mary's Hospital", status: 'completed' },
        { id: '#RPT-0012', type: 'Weekly Team Performance', date: 'Oct 3-9, 2023', team: "St. Mary's Hospital", status: 'pending' },
    ];

    return (
        <div className="page" id="reports">
            <div className="page-header">
                <h2>Team Reports</h2>
                <div><button className="btn"><i className="fas fa-download"></i> Export</button></div>
            </div>

            <div className="search-box">
                <input type="text" placeholder="Search reports..." />
                <button><i className="fas fa-search"></i></button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Report ID</th>
                            <th>Report Type</th>
                            <th>Date Range</th>
                            <th>Team</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((report, index) => (
                            <tr  key={index}>
                                <td>{report.id}</td>
                                <td>{report.type}</td>
                                <td>{report.date}</td>
                                <td>{report.team}</td>
                                <td>
                                    <span className={`status ${report.status}`}>
                                        {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('ing', 'ing')}
                                    </span>
                                </td>
                                <td>
                                    {report.status === 'pending' ? (
                                        <button className="btn btn-secondary" disabled><i className="fas fa-clock"></i> Processing</button>
                                    ) : (
                                        <button className="btn btn-secondary"><i className="fas fa-eye"></i> View</button>
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

export default TeamReports;