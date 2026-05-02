import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useApi } from '../../../api/useApi';
import { commonRoutes } from '../../../api/apiService';
import toast from 'react-hot-toast';
import moment from 'moment'

const AuditLogs = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [allLogs, setallLogs] = useState([]);

  const { request: auditLogs, loading: auditLogLoading, error: auditLogsError } = useApi(commonRoutes.getAuditLogs)
  useEffect(() => {
    const fetchlogs = async () => {
      const res = await auditLogs()
      setallLogs(res.data || [])
    }
    fetchlogs();
  }, []);

  const filteredLogs = allLogs.filter(log => {
    const matchesEvent = filterType === 'all' || log.event.toLowerCase().includes(filterType.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesEvent && matchesSeverity;
  });

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'polarArea',
        data: {
          labels: ['User Events', 'System Events', 'Security Events', 'Data Events', 'Permission Events'],
          datasets: [{
            data: [45, 28, 12, 32, 18],
            backgroundColor: [
              'rgba(156, 39, 176, 0.7)',
              'rgba(52, 152, 219, 0.7)',
              'rgba(231, 76, 60, 0.7)',
              'rgba(46, 204, 113, 0.7)',
              'rgba(243, 156, 18, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: { ticks: { display: false } }
          }
        }
      });
    }
  }, []);

  return (
    <div className="page-container" id="audit">
      <h2 className="section-title"><i className="fas fa-clipboard-list"></i> Audit Logs</h2>

      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-calendar"></i>
          <input type="date" className="date-input" defaultValue="2023-11-01" />
          <span>to</span>
          <input type="date" className="date-input" defaultValue="2023-11-15" />
        </div>
        <select className="filter-select" onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Event Types</option>
          <option value="login">Login Events</option>
          <option value="user">User Management</option>
          <option value="permission">Permission Changes</option>
          <option value="data">Data Access</option>
          <option value="system">System Changes</option>
          <option value="security">Security Events</option>
        </select>
        <select className="filter-select" onChange={(e) => setFilterSeverity(e.target.value)}>
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="danger">Critical</option>
        </select>
        <div style={{ flexGrow: 1 }}></div>
        <div className="btn-group">
          <button className="btn btn-success"><i className="fas fa-file-excel"></i> Export</button>
          <button className="btn btn-danger" onClick={() => alert('Logs cleared!')}><i className="fas fa-trash"></i> Clear Old Logs</button>
          <button className="btn btn-admin"><i className="fas fa-cog"></i> Settings</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Audit Trail</h3>
          <div className="btn-group">
            <button className="btn btn-small btn-success"><i className="fas fa-sync-alt"></i> Refresh</button>
            <button className="btn btn-small btn-secondary"><i className="fas fa-filter"></i> Filter</button>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Event</th>
                <th>Role</th>
                <th>IP Address</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log._id}>
                  <td>{moment(log?.timestamp).format("DD MMM YYYY, hh:mm A")}</td>
                  <td>{log?.metadata?.name}</td>
                  <td>{log?.metadata?.action}</td>
                  <td>
                    <span>
                      {log?.metadata?.role}
                    </span>
                  </td>
                  <td>{log?.metadata?.ip}</td>
                  <td>{log?.metadata?.customMessage}</td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-small btn-secondary"><i className="fas fa-eye"></i></button>
                      <button className="btn btn-small btn-secondary"><i className="fas fa-download"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="data-grid">
        <div className="data-card">
          <h4>Audit Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">1,248</div>
              <div className="stat-label">Total Events</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">42</div>
              <div className="stat-label">Security Events</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">8</div>
              <div className="stat-label">Failed Logins</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">3</div>
              <div className="stat-label">Critical Events</div>
            </div>
          </div>
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Log Retention:</span>
              <strong>90 days</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
              <span>Storage Used:</span>
              <strong>2.4 GB</strong>
            </div>
          </div>
        </div>

        <div className="data-card">
          <h4>Event Distribution</h4>
          <div className="chart-container-sm">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        <div className="data-card">
          <h4>Recent Security Events</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '15px' }}>
            <div className="log-entry">
              <div className="log-icon danger">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div style={{ flexGrow: 1 }}>
                <div><strong>Multiple failed login attempts</strong></div>
                <small style={{ color: 'var(--muted)' }}>IP: 192.168.1.105 • 10:15 AM</small>
              </div>
            </div>
            <div className="log-entry">
              <div className="log-icon warning">
                <i className="fas fa-user-lock"></i>
              </div>
              <div style={{ flexGrow: 1 }}>
                <div><strong>Account locked due to failed attempts</strong></div>
                <small style={{ color: 'var(--muted)' }}>User: john.doe • 09:42 AM</small>
              </div>
            </div>
            <div className="log-entry">
              <div className="log-icon info">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div style={{ flexGrow: 1 }}>
                <div><strong>Password changed by admin</strong></div>
                <small style={{ color: 'var(--muted)' }}>User: sarah.johnson • Yesterday</small>
              </div>
            </div>
          </div>
          <button className="btn btn-danger" style={{ width: '100%', marginTop: '15px' }}>
            <i className="fas fa-shield-alt"></i> View Security Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;