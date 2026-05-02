import React, { useState, useEffect } from "react";
import { X, RefreshCw, User, Shield, CheckCircle } from "lucide-react";
import { getDataFunc } from "../../utils/services";
import "./MigrationModal.css";

const MigrationModal = ({ isOpen, onClose }) => {
  const [executives, setExecutives] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [migrationSource, setMigrationSource] = useState(null); // { id, name }
  const [migrationTarget, setMigrationTarget] = useState(null); // { id, name }

  const fetchExecutives = async () => {
    setIsLoading(true);
    try {
      const res = await getDataFunc("getAllUsers");
      if (res?.success && Array.isArray(res.data)) {
        setExecutives(res.data.filter((u) => u.type === "executive"));
      }
    } catch (e) {
      console.error("Error fetching executives:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExecutives();
      setMigrationSource(null);
      setMigrationTarget(null);
    }
  }, [isOpen]);

  const handleMigrationSelect = (exec) => {
    if (!migrationSource) {
      setMigrationSource({ id: exec._id, name: exec.name });
    } else if (migrationSource.id !== exec._id) {
      setMigrationTarget({ id: exec._id, name: exec.name });
      // Simulate migration feedback
      setTimeout(() => {
        setMigrationSource(null);
        setMigrationTarget(null);
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="migration-overlay" onClick={onClose}>
      <div className="migration-container" onClick={(e) => e.stopPropagation()}>
        <div className="migration-header">
          <h3>
            <RefreshCw className="mr-2" size={20} /> Select Users for Migration
          </h3>
          <button className="migration-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="migration-body">
          {isLoading ? (
            <div className="migration-loading">
              <RefreshCw className="spinner" size={32} />
              <p>Fetching executives...</p>
            </div>
          ) : executives.length === 0 ? (
            <div className="migration-empty">
              <User size={48} color="var(--muted)" />
              <p>No executives found in the system.</p>
            </div>
          ) : (
            <div className="exec-migration-list">
              {executives.map((exec) => {
                const isSource = migrationSource?.id === exec._id;
                const isTarget = migrationTarget?.id === exec._id;
                let btnText = "Migrate";
                let btnClass = "btn-migrate-action";

                if (isSource) {
                  btnText = "Source Selected";
                  btnClass += " source-active";
                }
                if (isTarget) {
                  btnText = "Migrated...";
                  btnClass += " target-success";
                }

                return (
                  <div key={exec._id} className={`exec-migration-item ${isSource ? 'highlight-source' : ''}`}>
                    <div className="exec-main-info">
                      <div className="exec-avatar">
                        <User size={18} />
                      </div>
                      <div className="exec-text">
                        <span className="exec-name">{exec.name}</span>
                        <span className="exec-id">ID: {exec._id.substring(exec._id.length - 6)}</span>
                      </div>
                    </div>
                    <div className="exec-role-badge">
                        <Shield size={12} /> Executive
                    </div>
                    <button
                      className={btnClass}
                      disabled={isSource || (migrationSource && isTarget)}
                      onClick={() => handleMigrationSelect(exec)}
                    >
                      {isTarget ? <CheckCircle size={14} className="mr-1" /> : null}
                      {btnText}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {migrationSource && (
          <div className="migration-footer">
            <div className="migration-status-strip">
              <div className="status-step active">
                <span className="step-label">Source:</span>
                <span className="step-value">{migrationSource.name}</span>
              </div>
              <div className="status-arrow">➜</div>
              <div className={`status-step ${migrationTarget ? 'active' : ''}`}>
                <span className="step-label">Target:</span>
                <span className="step-value">{migrationTarget ? migrationTarget.name : 'Choose Target...'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationModal;
