import React, { useState } from 'react';
import './dashboard.css';

const SystemHealth = () => {
  const [healthData, setHealthData] = useState({
    uptime: '99.8%',
    responseTime: '1.2s',
    storageUsage: '78%',
    activeUsers: '648'
  });

  const services = [
    {
      name: 'Database Server',
      status: 'Healthy',
      responseTime: '0.8s',
      uptime: '99.9%',
      lastCheck: 'Just now'
    },
    {
      name: 'API Gateway',
      status: 'Healthy',
      responseTime: '1.2s',
      uptime: '99.8%',
      lastCheck: 'Just now'
    },
    {
      name: 'File Storage',
      status: 'Healthy',
      responseTime: '2.1s',
      uptime: '99.7%',
      lastCheck: 'Just now'
    },
    {
      name: 'Authentication Service',
      status: 'Healthy',
      responseTime: '0.5s',
      uptime: '99.9%',
      lastCheck: 'Just now'
    }
  ];

  const handleRefreshHealth = () => {
    // Refresh health data logic
    console.log('Refreshing health data...');
  };

  const handleViewMetrics = (serviceName) => {
    // View metrics logic
    console.log('View metrics for:', serviceName);
  };

  return (
    <div className="superAdminPage">
      <div className="superAdminPageHeader">
        <h2>System Health Monitoring</h2>
        <div>
          <button className="superAdminBtn" onClick={handleRefreshHealth}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      <div className="superAdminSystemHealthGrid">
        <div className="superAdminHealthCard">
          <div className="superAdminHealthValue">{healthData.uptime}</div>
          <div className="superAdminHealthLabel">System Uptime</div>
          <div className="superAdminHealthProgress">
            <div 
              className="superAdminHealthProgressBar" 
              style={{width: healthData.uptime}}
            ></div>
          </div>
        </div>
        <div className="superAdminHealthCard">
          <div className="superAdminHealthValue">{healthData.responseTime}</div>
          <div className="superAdminHealthLabel">Avg Response Time</div>
          <div className="superAdminHealthProgress">
            <div 
              className="superAdminHealthProgressBar" 
              style={{width: '95%'}}
            ></div>
          </div>
        </div>
        <div className="superAdminHealthCard">
          <div className="superAdminHealthValue">{healthData.storageUsage}</div>
          <div className="superAdminHealthLabel">Storage Usage</div>
          <div className="superAdminHealthProgress">
            <div 
              className="superAdminHealthProgressBar" 
              style={{width: healthData.storageUsage}}
            ></div>
          </div>
        </div>
        <div className="superAdminHealthCard">
          <div className="superAdminHealthValue">{healthData.activeUsers}</div>
          <div className="superAdminHealthLabel">Active Users</div>
          <div className="superAdminHealthProgress">
            <div 
              className="superAdminHealthProgressBar" 
              style={{width: '65%'}}
            ></div>
          </div>
        </div>
      </div>

      <div className="superAdminTableContainer">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
              <th>Response Time</th>
              <th>Uptime</th>
              <th>Last Check</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={index}>
                <td>{service.name}</td>
                <td><span className="superAdminStatus superAdminStatusActive">{service.status}</span></td>
                <td>{service.responseTime}</td>
                <td>{service.uptime}</td>
                <td>{service.lastCheck}</td>
                <td>
                  <button 
                    className="superAdminBtn superAdminBtnSecondary superAdminBtnSmall"
                    onClick={() => handleViewMetrics(service.name)}
                  >
                    <i className="fas fa-chart-bar"></i> Metrics
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemHealth;