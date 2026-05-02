// RolesPermissions.jsx
import React from 'react';
import './UserManagement.css';

const RolesPermissions = () => {
  return (
    <div className="content-page">
      <div className="action-bar card">
        <input type="text" className="search-input wide" placeholder="Search roles or permissions..." />
        <div className="btn-group">
          <button className="btn btn-export"><i className="fas fa-file-excel"></i> Export</button>
          <button className="btn btn-add"><i className="fas fa-plus"></i> Create Role</button>
          <button className="btn btn-matrix"><i className="fas fa-table"></i> Permission Matrix</button>
        </div>
      </div>

      <div className="roles-layout">
        <div className="card role-card-container">
          <h4>System Roles</h4>
          {[
            { name: "System Administrator", users: 42, desc: "Full system access and configuration privileges" },
            { name: "Operations Manager", users: 85, desc: "Full access to operations, reporting, and team management" },
            { name: "Team Supervisor", users: 65, desc: "Team management, quality review, and performance monitoring" },
            { name: "Call Center Agent", users: 120, desc: "Call handling, customer service, and basic reporting" }
          ].map(role => (
            <div className="role-entry" key={role.name}>
              <div className="role-details">
                <strong>{role.name}</strong>
                <p>{role.desc}</p>
              </div>
              <div className="role-meta">
                <span className="user-count">{role.users} users</span>
                <button className="btn-edit-small">Edit</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card role-card-container">
          <h4>Custom Roles</h4>
          {[
            { name: "Quality Auditor", users: 12, desc: "Quality review, compliance monitoring, and reporting" },
            { name: "Reporting Analyst", users: 8, desc: "Report generation, data analysis, and dashboard access" },
            { name: "Read-Only Viewer", users: 5, desc: "View-only access to dashboards and reports" }
          ].map(role => (
            <div className="role-entry" key={role.name}>
              <div className="role-details">
                <strong>{role.name}</strong>
                <p>{role.desc}</p>
              </div>
              <div className="role-meta">
                <span className="user-count">{role.users} users</span>
                <button className="btn-edit-small">Edit</button>
              </div>
            </div>
          ))}
          <button className="btn-create-custom-role">+ Create Custom Role</button>
        </div>
      </div>

      <div className="card permissions-matrix">
        <h4><i className="fas fa-list-check"></i> Permission Categories</h4>
        <div className="perm-grid">
          <div className="perm-column">
            <h5>User Management</h5>
            <label><input type="checkbox" defaultChecked /> Create users</label>
            <label><input type="checkbox" defaultChecked /> Edit users</label>
            <label><input type="checkbox" defaultChecked /> Delete users</label>
            <label><input type="checkbox" /> Reset passwords</label>
          </div>
          <div className="perm-column">
            <h5>System Configuration</h5>
            <label><input type="checkbox" defaultChecked /> Modify settings</label>
            <label><input type="checkbox" /> Update system</label>
            <label><input type="checkbox" /> Backup/Restore</label>
            <label><input type="checkbox" /> API management</label>
          </div>
          <div className="perm-column">
            <h5>Data Access</h5>
            <label><input type="checkbox" defaultChecked /> View reports</label>
            <label><input type="checkbox" /> Export data</label>
            <label><input type="checkbox" /> Audit logs</label>
            <label><input type="checkbox" /> Sensitive data</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;