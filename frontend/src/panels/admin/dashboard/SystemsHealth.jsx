import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import './AdminPages.css';

const SystemHealth = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // State for metrics to simulate real-time updates
  const [metrics, setMetrics] = useState({
    cpu: 42,
    memory: 68,
    storage: 86,
    uptime: 99.92,
    responseTime: 2.4
  });

  useEffect(() => {
    // Initialize Chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({length: 12}, (_, i) => `${i*2}:00`),
          datasets: [
            {
              label: 'CPU Usage',
              data: Array.from({length: 12}, () => Math.floor(Math.random() * 30) + 30),
              borderColor: '#e74c3c',
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'Memory Usage',
              data: Array.from({length: 12}, () => Math.floor(Math.random() * 20) + 60),
              borderColor: '#3498db',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              tension: 0.3,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, max: 100 }
          },
          animation: false // Disable animation for smoother real-time updates
        }
      });
    }

    // Simulate Real-time updates
    const interval = setInterval(() => {
      // Update State
      setMetrics(prev => ({
        ...prev,
        cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.min(100, Math.max(0, prev.memory + (Math.random() * 5 - 2.5))),
        responseTime: Math.max(0, prev.responseTime + (Math.random() * 0.2 - 0.1))
      }));

      // Update Chart
      if (chartInstance.current) {
        const chart = chartInstance.current;
        // Shift data
        chart.data.datasets[0].data.shift();
        chart.data.datasets[0].data.push(Math.floor(Math.random() * 30) + 30);
        chart.data.datasets[1].data.shift();
        chart.data.datasets[1].data.push(Math.floor(Math.random() * 20) + 60);
        chart.update();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, []);

  const handleRunHealthCheck = () => {
    alert("Running system health check...");
    setTimeout(() => alert("Health Check Complete: All systems operational."), 2000);
  };

  return (
    <div className="page-container" id="system">
      <h2 className="section-title"><i className="fas fa-server"></i> System Health</h2>
      
      <div className="filter-bar">
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <i className="fas fa-clock"></i>
          <select className="filter-select" defaultValue="realtime">
            <option value="realtime">Real-time</option>
            <option value="hourly">Last 24 Hours</option>
            <option value="daily">Last 7 Days</option>
            <option value="weekly">Last 30 Days</option>
          </select>
        </div>
        <div style={{flexGrow: 1}}></div>
        <div className="btn-group">
          <button className="btn btn-success"><i className="fas fa-file-excel"></i> Export</button>
          <button className="btn btn-admin" onClick={handleRunHealthCheck}><i className="fas fa-heartbeat"></i> Run Health Check</button>
          <button className="btn btn-warning"><i className="fas fa-bell"></i> Alert Settings</button>
        </div>
      </div>

      <section className="critical-strip">
        <div className="metric success">
          <div className="value">{metrics.uptime}%</div>
          <div className="label">Uptime (30 days)</div>
          <div className="metric-trend trend-up">↑0.01%</div>
        </div>
        <div className="metric warning">
          <div className="value">{metrics.responseTime.toFixed(1)}s</div>
          <div className="label">Avg Response Time</div>
          <div className="metric-trend trend-up">+0.2s</div>
        </div>
        <div className="metric info">
          <div className="value">{Math.round(metrics.storage)}%</div>
          <div className="label">Storage Used</div>
          <div className="metric-trend trend-up">+2%</div>
        </div>
        <div className="metric admin">
          <div className="value">0</div>
          <div className="label">Active Incidents</div>
          <div className="metric-trend trend-down">-1</div>
        </div>
      </section>

      <div className="data-grid">
        <div className="data-card">
          <h4>CPU & Memory Usage</h4>
          <div className="chart-container">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
        
        <div className="data-card">
          <h4>Database Performance</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">98%</div>
              <div className="stat-label">Health Score</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">42 ms</div>
              <div className="stat-label">Avg Query Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">128</div>
              <div className="stat-label">Active Connections</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">24</div>
              <div className="stat-label">Slow Queries</div>
            </div>
          </div>
          <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <span>Last Backup:</span>
              <strong>Today, 02:15 AM</strong>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '5px'}}>
              <span>Backup Size:</span>
              <strong>24.8 GB</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3><i className="fas fa-network-wired"></i> Service Status</h3>
          <button className="btn btn-small btn-success"><i className="fas fa-sync-alt"></i> Refresh</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Uptime</th>
                <th>Response Time</th>
                <th>Last Check</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Web Application</strong></td>
                <td><span className="badge badge-success">Operational</span></td>
                <td>99.99%</td>
                <td>142 ms</td>
                <td>Just now</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-small btn-secondary">Restart</button>
                    <button className="btn btn-small btn-secondary">Logs</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><strong>Database Server</strong></td>
                <td><span className="badge badge-success">Operational</span></td>
                <td>99.98%</td>
                <td>42 ms</td>
                <td>Just now</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-small btn-secondary">Optimize</button>
                    <button className="btn btn-small btn-secondary">Backup</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><strong>File Storage</strong></td>
                <td><span className="badge badge-warning">Degraded</span></td>
                <td>99.85%</td>
                <td>210 ms</td>
                <td>2 minutes ago</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-small btn-warning">Diagnose</button>
                    <button className="btn btn-small btn-secondary">Cleanup</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h4><i className="fas fa-hdd"></i> Storage Overview</h4>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '15px'}}>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
              <span>Call Recordings</span>
              <span>68% (142 GB)</span>
            </div>
            <div style={{height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden'}}>
              <div style={{width: '68%', height: '100%', background: 'var(--primary)'}}></div>
            </div>
          </div>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
              <span>Database</span>
              <span>45% (24.8 GB)</span>
            </div>
            <div style={{height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden'}}>
              <div style={{width: '45%', height: '100%', background: 'var(--info)'}}></div>
            </div>
          </div>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
              <span>Logs</span>
              <span>82% (8.2 GB)</span>
            </div>
            <div style={{height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden'}}>
              <div style={{width: '82%', height: '100%', background: 'var(--warning)'}}></div>
            </div>
          </div>
        </div>
        <button className="btn btn-admin" style={{width: '100%', marginTop: '20px'}}>
          <i className="fas fa-trash-alt"></i> Run Storage Cleanup
        </button>
      </div>
    </div>
  );
};

export default SystemHealth;