import React, { useState } from 'react';
import './dashboard.css';

const OrganizationManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const organizations = [
    {
      name: 'MediCare Health System',
      type: 'Hospital Network',
      hospitals: 8,
      users: 156,
      status: 'Active',
      subscription: 'Enterprise'
    },
    {
      name: 'City Healthcare Network',
      type: 'Healthcare System',
      hospitals: 6,
      users: 132,
      status: 'Active',
      subscription: 'Professional'
    },
    {
      name: 'Regional Medical Group',
      type: 'Medical Group',
      hospitals: 4,
      users: 89,
      status: 'Active',
      subscription: 'Professional'
    },
    {
      name: 'National Health Partners',
      type: 'Health System',
      hospitals: 10,
      users: 235,
      status: 'Active',
      subscription: 'Enterprise'
    }
  ];

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOrganization = () => {
    // Add organization logic
    console.log('Add organization clicked');
  };

  const handleEditOrganization = (orgName) => {
    // Edit organization logic
    console.log('Edit organization:', orgName);
  };

  const handleManageOrganization = (orgName) => {
    // Manage organization logic
    console.log('Manage organization:', orgName);
  };

  return (
    <div className="superAdminPage">
      <div className="superAdminPageHeader">
        <h2>Organization Management</h2>
        <div>
          <button className="superAdminBtn" onClick={handleAddOrganization}>
            <i className="fas fa-plus"></i> Add Organization
          </button>
        </div>
      </div>

      <div className="superAdminSearchBox">
        <input 
          type="text" 
          placeholder="Search organizations..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button><i className="fas fa-search"></i></button>
      </div>

      <div className="superAdminTableContainer">
        <table>
          <thead>
            <tr>
              <th>Organization Name</th>
              <th>Type</th>
              <th>Hospitals</th>
              <th>Users</th>
              <th>Status</th>
              <th>Subscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrganizations.map((org, index) => (
              <tr key={index}>
                <td>{org.name}</td>
                <td>{org.type}</td>
                <td>{org.hospitals}</td>
                <td>{org.users}</td>
                <td><span className="superAdminStatus superAdminStatusActive">{org.status}</span></td>
                <td>{org.subscription}</td>
                <td>
                  <button 
                    className="superAdminBtn superAdminBtnSecondary superAdminBtnSmall"
                    onClick={() => handleEditOrganization(org.name)}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button 
                    className="superAdminBtn superAdminBtnSecondary superAdminBtnSmall"
                    onClick={() => handleManageOrganization(org.name)}
                  >
                    <i className="fas fa-cog"></i> Manage
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

export default OrganizationManagement;