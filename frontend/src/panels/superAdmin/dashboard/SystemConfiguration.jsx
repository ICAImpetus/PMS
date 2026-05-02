import React, { useState } from 'react';
import './dashboard.css';

const SystemConfiguration = () => {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordPolicy: true,
    sessionTimeout: true
  });

  const [systemFeatures, setSystemFeatures] = useState({
    callRecording: true,
    liveMonitoring: true,
    advancedAnalytics: true
  });

  const handleSaveConfig = () => {
    // Save configuration logic
    console.log('Configuration saved');
  };

  const handleToggleSecurity = (setting) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleToggleFeature = (feature) => {
    setSystemFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  return (
    <div className="superAdminPage">
      <div className="superAdminPageHeader">
        <h2>System Configuration</h2>
        <div>
          <button className="superAdminBtn superAdminBtnSuccess" onClick={handleSaveConfig}>
            <i className="fas fa-save"></i> Save Changes
          </button>
        </div>
      </div>

      <div className="superAdminConfigGrid">
        <div className="superAdminConfigCard">
          <div className="superAdminConfigSection">
            <h4>Security Settings</h4>
            <div className="superAdminConfigOptions">
              <div className="superAdminConfigOption">
                <span>Two-Factor Authentication</span>
                <label className="superAdminToggleSwitch">
                  <input 
                    type="checkbox" 
                    checked={securitySettings.twoFactorAuth}
                    onChange={() => handleToggleSecurity('twoFactorAuth')}
                  />
                  <span className="superAdminToggleSlider"></span>
                </label>
              </div>
              <div className="superAdminConfigOption">
                <span>Password Policy Enforcement</span>
                <label className="superAdminToggleSwitch">
                  <input 
                    type="checkbox" 
                    checked={securitySettings.passwordPolicy}
                    onChange={() => handleToggleSecurity('passwordPolicy')}
                  />
                  <span className="superAdminToggleSlider"></span>
                </label>
              </div>
              <div className="superAdminConfigOption">
                <span>Session Timeout (30 min)</span>
                <label className="superAdminToggleSwitch">
                  <input 
                    type="checkbox" 
                    checked={securitySettings.sessionTimeout}
                    onChange={() => handleToggleSecurity('sessionTimeout')}
                  />
                  <span className="superAdminToggleSlider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="superAdminConfigCard">
          <div className="superAdminConfigSection">
            <h4>System Features</h4>
            <div className="superAdminConfigOptions">
              <div className="superAdminConfigOption">
                <span>Call Recording</span>
                <label className="superAdminToggleSwitch">
                  <input 
                    type="checkbox" 
                    checked={systemFeatures.callRecording}
                    onChange={() => handleToggleFeature('callRecording')}
                  />
                  <span className="superAdminToggleSlider"></span>
                </label>
              </div>
              <div className="superAdminConfigOption">
                <span>Live Monitoring</span>
                <label className="superAdminToggleSwitch">
                  <input 
                    type="checkbox" 
                    checked={systemFeatures.liveMonitoring}
                    onChange={() => handleToggleFeature('liveMonitoring')}
                  />
                  <span className="superAdminToggleSlider"></span>
                </label>
              </div>
              <div className="superAdminConfigOption">
                <span>Advanced Analytics</span>
                <label className="superAdminToggleSwitch">
                  <input 
                    type="checkbox" 
                    checked={systemFeatures.advancedAnalytics}
                    onChange={() => handleToggleFeature('advancedAnalytics')}
                  />
                  <span className="superAdminToggleSlider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="superAdminConfigCard" style={{gridColumn: '1 / -1'}}>
        <div className="superAdminConfigSection">
          <h4>System Limits</h4>
          <div className="superAdminConfigOptions">
            <div className="superAdminConfigOption">
              <span>Max Organizations: 50</span>
              <button className="superAdminBtn superAdminBtnSmall superAdminBtnSecondary">Modify</button>
            </div>
            <div className="superAdminConfigOption">
              <span>Max Users per Organization: 500</span>
              <button className="superAdminBtn superAdminBtnSmall superAdminBtnSecondary">Modify</button>
            </div>
            <div className="superAdminConfigOption">
              <span>Data Retention: 7 years</span>
              <button className="superAdminBtn superAdminBtnSmall superAdminBtnSecondary">Modify</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfiguration;