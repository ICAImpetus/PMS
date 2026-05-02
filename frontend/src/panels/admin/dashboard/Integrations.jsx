import React from 'react';
import './AdminPages.css';

const Integrations = () => {
  const handleTestAll = () => {
    alert("Testing all system integrations...");
    setTimeout(() => alert("All integrations tested successfully."), 2000);
  };

  const handleConfigure = (type) => {
    alert(`Configuring ${type} integration.`);
  };

  return (
    <div className="page-container" id="integrations">
      <h2 className="section-title"><i className="fas fa-plug"></i> System Integrations</h2>
      
      <div className="filter-bar">
        <select className="filter-select" defaultValue="all">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="error">Error</option>
        </select>
        <select className="filter-select" defaultValue="all">
          <option value="all">All Types</option>
          <option value="api">API</option>
          <option value="database">Database</option>
          <option value="messaging">Messaging</option>
          <option value="payment">Payment</option>
          <option value="analytics">Analytics</option>
        </select>
        <div style={{flexGrow: 1}}></div>
        <div className="btn-group">
          <button className="btn btn-success"><i className="fas fa-file-excel"></i> Export</button>
          <button className="btn btn-admin"><i className="fas fa-plus"></i> Add Integration</button>
          <button className="btn btn-primary" onClick={handleTestAll}><i className="fas fa-vial"></i> Test All</button>
        </div>
      </div>

      <div className="integration-grid">
        <div className="integration-card active">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h4><i className="fas fa-comments" style={{color: 'var(--info)'}}></i> Slack Integration</h4>
            <span className="badge badge-success">Active</span>
          </div>
          <p style={{margin: '10px 0', fontSize: '0.9rem'}}>Real-time notifications and team collaboration</p>
          <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>Last sync: 2 minutes ago</div>
          <div className="btn-group" style={{marginTop: '15px'}}>
            <button className="btn btn-small btn-secondary" onClick={() => handleConfigure('slack')}>Configure</button>
            <button className="btn btn-small btn-secondary">Test</button>
            <button className="btn btn-small btn-warning">Disable</button>
          </div>
        </div>

        <div className="integration-card active">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h4><i className="fas fa-envelope" style={{color: 'var(--primary)'}}></i> Email Service</h4>
            <span className="badge badge-success">Active</span>
          </div>
          <p style={{margin: '10px 0', fontSize: '0.9rem'}}>Transactional emails and notifications</p>
          <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>Last sync: 5 minutes ago</div>
          <div className="btn-group" style={{marginTop: '15px'}}>
            <button className="btn btn-small btn-secondary" onClick={() => handleConfigure('email')}>Configure</button>
            <button className="btn btn-small btn-secondary">Test</button>
            <button className="btn btn-small btn-warning">Disable</button>
          </div>
        </div>

        <div className="integration-card active">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h4><i className="fas fa-chart-bar" style={{color: 'var(--success)'}}></i> Analytics API</h4>
            <span className="badge badge-success">Active</span>
          </div>
          <p style={{margin: '10px 0', fontSize: '0.9rem'}}>Data analytics and reporting integration</p>
          <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>Last sync: 15 minutes ago</div>
          <div className="btn-group" style={{marginTop: '15px'}}>
            <button className="btn btn-small btn-secondary" onClick={() => handleConfigure('analytics')}>Configure</button>
            <button className="btn btn-small btn-secondary">Test</button>
            <button className="btn btn-small btn-warning">Disable</button>
          </div>
        </div>

        <div className="integration-card error">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h4><i className="fas fa-credit-card" style={{color: 'var(--danger)'}}></i> Payment Gateway</h4>
            <span className="badge badge-danger">Error</span>
          </div>
          <p style={{margin: '10px 0', fontSize: '0.9rem'}}>Payment processing and billing</p>
          <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>Last sync: 2 hours ago</div>
          <div className="btn-group" style={{marginTop: '15px'}}>
            <button className="btn btn-small btn-secondary" onClick={() => handleConfigure('payment')}>Configure</button>
            <button className="btn btn-small btn-danger">Fix</button>
            <button className="btn btn-small btn-secondary">Logs</button>
          </div>
        </div>

        <div className="integration-card inactive">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h4><i className="fas fa-sms" style={{color: 'var(--muted)'}}></i> SMS Service</h4>
            <span className="badge">Inactive</span>
          </div>
          <p style={{margin: '10px 0', fontSize: '0.9rem'}}>SMS notifications and alerts</p>
          <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>Last sync: 3 days ago</div>
          <div className="btn-group" style={{marginTop: '15px'}}>
            <button className="btn btn-small btn-secondary" onClick={() => handleConfigure('sms')}>Configure</button>
            <button className="btn btn-small btn-success">Enable</button>
          </div>
        </div>

        <div className="integration-card active">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h4><i className="fas fa-database" style={{color: 'var(--warning)'}}></i> CRM Integration</h4>
            <span className="badge badge-success">Active</span>
          </div>
          <p style={{margin: '10px 0', fontSize: '0.9rem'}}>Customer relationship management sync</p>
          <div style={{fontSize: '0.8rem', color: 'var(--muted)'}}>Last sync: 30 minutes ago</div>
          <div className="btn-group" style={{marginTop: '15px'}}>
            <button className="btn btn-small btn-secondary" onClick={() => handleConfigure('crm')}>Configure</button>
            <button className="btn btn-small btn-secondary">Test</button>
            <button className="btn btn-small btn-warning">Disable</button>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: '24px'}}>
        <div className="card-header">
          <h3><i className="fas fa-code"></i> API Configuration</h3>
          <button className="btn btn-small btn-admin"><i className="fas fa-key"></i> API Keys</button>
        </div>
        <div style={{marginTop: '15px'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
            <div>
              <h5>REST API Endpoints</h5>
              <div style={{marginTop: '10px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                  <span>Base URL:</span>
                  <code>https://api.pms.example.com/v1</code>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                  <span>Status:</span>
                  <span className="badge badge-success">Active</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span>Rate Limit:</span>
                  <span>1000 requests/hour</span>
                </div>
              </div>
            </div>
            <div>
              <h5>Webhook Configuration</h5>
              <div style={{marginTop: '10px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                  <span>URL:</span>
                  <code>https://hooks.pms.example.com</code>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                  <span>Status:</span>
                  <span className="badge badge-success">Active</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span>Events:</span>
                  <span>12 configured</span>
                </div>
              </div>
            </div>
          </div>
          <div className="btn-group" style={{marginTop: '20px'}}>
            <button className="btn btn-admin"><i className="fas fa-cog"></i> Configure API</button>
            <button className="btn btn-secondary"><i className="fas fa-book"></i> API Documentation</button>
            <button className="btn btn-warning"><i className="fas fa-sync-alt"></i> Regenerate Keys</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;