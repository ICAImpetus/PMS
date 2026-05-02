import React, { useState, useEffect } from "react";
import "./QualityACA.css";
import { getDataFunc } from "../../../utils/services";

// --- STATIC FALLBACK ---
const STATIC_COMPLIANCE = [
  { type: "Incomplete Documentation", count: 12, trend: "↑ 3", team: "Team B" },
  { type: "Script Non-compliance", count: 8, trend: "↓ 2", team: "Team C" },
];

const QualityACA = () => {
  const [stats, setStats] = useState({ audited: 21847, score: "91.2%", issues: 32, fcr: "87.5%" });
  const [complianceList, setComplianceList] = useState(STATIC_COMPLIANCE);

  useEffect(() => {
    const fetchQuality = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const authQuery = token ? `?token=${token}&secret_token=${token}` : "";
        const res = await getDataFunc(`api/filled-forms/statistics/${authQuery}`);

        if (res.success && res.data) {
          const d = res.data;
          setStats({
            audited: d.totalAudited || 0,
            score: d.avgQuality || "0%",
            issues: d.totalErrors || 0,
            fcr: d.complianceRate || "0%" // Mapping compliance rate to this card for now
          });
        }
      } catch (e) {
        console.error("Quality stats error", e);
      }
    };
    fetchQuality();
  }, []);

  return (
    <div className="quality-page">
      <div className="page-header">
        <h2><i className="fas fa-robot"></i> Quality Assurance & Compliance</h2>
        <button className="btn btn-primary"><i className="fas fa-random"></i> Random Audit</button>
      </div>

      {/* Metrics Strip */}
      <div className="stats-grid">
        <div className="card metric info">
          <div className="val">{stats.audited}</div><div className="lbl">Calls Audited</div>
        </div>
        <div className="card metric success">
          <div className="val">{stats.score}</div><div className="lbl">Avg Score</div>
        </div>
        <div className="card metric danger">
          <div className="val">{stats.issues}</div><div className="lbl">Compliance Issues</div>
        </div>
        <div className="card metric warning">
          <div className="val">{stats.fcr}</div><div className="lbl">Compliance Rate</div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid-2">
        <div className="card">
          <h3>Score Distribution</h3>
          <div className="chart-placeholder" style={{display:'flex',justifyContent:'center',alignItems:'center', color:'#999'}}>Quality Distribution Chart</div>
        </div>
        <div className="card">
          <h3>Compliance Radar</h3>
          <div className="chart-placeholder" style={{display:'flex',justifyContent:'center',alignItems:'center', color:'#999'}}>Compliance Radar Chart</div>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="card">
        <h3>Top Compliance Issues</h3>
        <table>
          <thead><tr><th>Issue Type</th><th>Count</th><th>Trend</th><th>Team</th><th>Action</th></tr></thead>
          <tbody>
            {complianceList.map((row, i) => (
              <tr key={i}>
                <td>{row.type}</td>
                <td>{row.count}</td>
                <td className={row.trend.includes('↑') ? "text-danger" : "text-success"}>{row.trend}</td>
                <td>{row.team}</td>
                <td><button className="btn-xs warning">Review</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QualityACA;