import React from 'react';
import './AdminPages.css';

const SystemStatus = ({ onClose }) => {
  // Mock data for system status
  const uptime = 99.92;
  const activeSessions = 142;
  const cpuLoad = 42.5;
  const memoryUsage = 68.2;
  
  const recentEvents = [
    { event: "User created", time: "10:24 AM", details: "Created user: Sarah Johnson" },
    { event: "Permission modified", time: "09:45 AM", details: "Modified permissions for John Doe" },
    { event: "Backup completed", time: "02:15 AM", details: "Daily backup completed successfully" },
    { event: "Security scan", time: "01:00 AM", details: "Nightly security scan completed" },
    { event: "Settings updated", time: "Yesterday", details: "Updated notification settings" }
  ];

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card-header">
        <h2><i className="fas fa-server"></i> System Status</h2>
        {onClose && (
          <button className="btn btn-small btn-secondary" onClick={onClose}>&times;</button>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h5>System Uptime</h5>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>{uptime}%</div>
            <small style={{ color: 'var(--muted)' }}>Last 30 days</small>
          </div>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h5>Active Users</h5>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{activeSessions}</div>
            <small style={{ color: 'var(--muted)' }}>Current sessions</small>
          </div>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h5>System Load</h5>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: cpuLoad > 70 ? 'var(--warning)' : 'var(--success)' }}>
              {cpuLoad.toFixed(1)}%
            </div>
            <small style={{ color: 'var(--muted)' }}>CPU Usage</small>
          </div>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h5>Memory Usage</h5>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: memoryUsage > 80 ? 'var(--warning)' : 'var(--success)' }}>
              {memoryUsage.toFixed(1)}%
            </div>
            <small style={{ color: 'var(--muted)' }}>RAM Usage</small>
          </div>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h4>Recent System Events</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
            {recentEvents.map((log, index) => (
              <div key={index} style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>
                <div><strong>{log.event}</strong></div>
                <small style={{ color: 'var(--muted)' }}>{log.time} • {log.details}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;