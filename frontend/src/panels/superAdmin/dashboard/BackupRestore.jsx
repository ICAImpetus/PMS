import React, { useState } from 'react';
import './dashboard.css';

const BackupRestore = () => {
  const [automatedBackups, setAutomatedBackups] = useState(true);

  const backups = [
    {
      name: 'System_Backup_20231015',
      date: 'Oct 15, 2023 02:00 AM',
      size: '2.1 GB',
      type: 'Full Backup',
      status: 'Completed'
    },
    {
      name: 'System_Backup_20231014',
      date: 'Oct 14, 2023 02:00 AM',
      size: '2.0 GB',
      type: 'Full Backup',
      status: 'Completed'
    }
  ];

  const handleCreateBackup = () => {
    // Create backup logic
    console.log('Creating backup...');
  };

  const handleDownloadBackup = (backupName) => {
    // Download backup logic
    console.log('Downloading backup:', backupName);
  };

  const handleRestoreBackup = (backupName) => {
    // Restore backup logic
    console.log('Restoring backup:', backupName);
  };

  const handleConfigureSchedule = () => {
    // Configure schedule logic
    console.log('Configuring backup schedule...');
  };

  const handleCloudStorage = () => {
    // Cloud storage logic
    console.log('Opening cloud storage settings...');
  };

  return (
    <div className="superAdminPage">
      <div className="superAdminPageHeader">
        <h2>Backup & Restore</h2>
        <div>
          <button className="superAdminBtn" onClick={handleCreateBackup}>
            <i className="fas fa-plus"></i> Create Backup
          </button>
        </div>
      </div>

      <div className="superAdminBackupSection">
        <h3 style={{marginBottom: '15px'}}>Automated Backups</h3>
        <div className="superAdminConfigOption">
          <span>Daily Automated Backups</span>
          <label className="superAdminToggleSwitch">
            <input 
              type="checkbox" 
              checked={automatedBackups}
              onChange={() => setAutomatedBackups(!automatedBackups)}
            />
            <span className="superAdminToggleSlider"></span>
          </label>
        </div>
        <div className="superAdminBackupActions">
          <button className="superAdminBtn superAdminBtnSecondary" onClick={handleConfigureSchedule}>
            <i className="fas fa-cog"></i> Configure Schedule
          </button>
          <button className="superAdminBtn superAdminBtnSecondary" onClick={handleCloudStorage}>
            <i className="fas fa-cloud-upload-alt"></i> Cloud Storage
          </button>
        </div>
      </div>

      <div className="superAdminTableContainer">
        <table>
          <thead>
            <tr>
              <th>Backup Name</th>
              <th>Date & Time</th>
              <th>Size</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((backup, index) => (
              <tr key={index}>
                <td>{backup.name}</td>
                <td>{backup.date}</td>
                <td>{backup.size}</td>
                <td>{backup.type}</td>
                <td><span className="superAdminStatus superAdminStatusActive">{backup.status}</span></td>
                <td>
                  <button 
                    className="superAdminBtn superAdminBtnSecondary superAdminBtnSmall"
                    onClick={() => handleDownloadBackup(backup.name)}
                  >
                    <i className="fas fa-download"></i> Download
                  </button>
                  <button 
                    className="superAdminBtn superAdminBtnSecondary superAdminBtnSmall"
                    onClick={() => handleRestoreBackup(backup.name)}
                  >
                    <i className="fas fa-undo"></i> Restore
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

export default BackupRestore;