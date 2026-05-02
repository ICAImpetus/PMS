import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './Executive.css'; // Import the shared CSS file

const CallDetails = () => {
    const callPerformanceChartRef = useRef(null);
    const callPerformanceChartInstance = useRef(null);

    // Effect for initializing Call Performance Chart
    useEffect(() => {
        if (callPerformanceChartRef.current) {
            // Destroy previous chart instance if it exists
            if (callPerformanceChartInstance.current) {
                callPerformanceChartInstance.current.destroy();
            }

            const callPerformanceCtx = callPerformanceChartRef.current.getContext('2d');
            callPerformanceChartInstance.current = new Chart(callPerformanceCtx, {
                type: "line",
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Inbound Calls',
                        data: [320, 450, 380, 520, 410, 290, 350],
                        backgroundColor: '#3498db',
                        borderColor: '#2980b9',
                        borderWidth: 1
                    }, {
                        label: 'Outbound Calls',
                        data: [280, 390, 420, 380, 450, 320, 400],
                        backgroundColor: '#2ecc71',
                        borderColor: '#27ae60',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Calls'
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (callPerformanceChartInstance.current) {
                callPerformanceChartInstance.current.destroy();
            }
        };
    }, []);

    return (
        <div className="call-details-page">
            <div className="executive-header">
                <h1><i className="fas fa-phone-alt"></i> Call Management</h1>
                <div className="executive-user-info">
                    <div className="executive-user-avatar">JD</div>
                    <div>
                        <div>John Doe</div>
                        <div className="executive-gray-text">Senior Agent</div>
                    </div>
                </div>
            </div>

            <div className="call-details-grid">
                <div className="call-details-list">
                    <div className="executive-chart-title"><i className="fas fa-history"></i> Recent Calls</div>
                    <div className="call-details-item">
                        <div className="call-details-info">
                            <div className="call-details-number">+91 98765 43210</div>
                            <div className="call-details-time">Today, 10:23 AM</div>
                        </div>
                        <div className="call-details-type call-details-inbound">Inbound</div>
                    </div>
                    <div className="call-details-item">
                        <div className="call-details-info">
                            <div className="call-details-number">+91 87654 32109</div>
                            <div className="call-details-time">Today, 09:45 AM</div>
                        </div>
                        <div className="call-details-type call-details-outbound">Outbound</div>
                    </div>
                    <div className="call-details-item">
                        <div className="call-details-info">
                            <div className="call-details-number">+91 76543 21098</div>
                            <div className="call-details-time">Today, 09:12 AM</div>
                        </div>
                        <div className="call-details-type call-details-missed">Missed</div>
                    </div>
                    <div className="call-details-item">
                        <div className="call-details-info">
                            <div className="call-details-number">+91 65432 10987</div>
                            <div className="call-details-time">Yesterday, 05:30 PM</div>
                        </div>
                        <div className="call-details-type call-details-inbound">Inbound</div>
                    </div>
                    <div className="call-details-item">
                        <div className="call-details-info">
                            <div className="call-details-number">+91 54321 09876</div>
                            <div className="call-details-time">Yesterday, 04:15 PM</div>
                        </div>
                        <div className="call-details-type call-details-outbound">Outbound</div>
                    </div>
                    <div className="call-details-item">
                        <div className="call-details-info">
                            <div className="call-details-number">+91 43210 98765</div>
                            <div className="call-details-time">Yesterday, 03:45 PM</div>
                        </div>
                        <div className="call-details-type call-details-inbound">Inbound</div>
                    </div>
                </div>
                
                <div className="call-details-stats">
                    <div className="call-details-stat-card">
                        <div className="call-details-stat-value">6,650</div>
                        <div className="call-details-stat-label">Total Calls</div>
                    </div>
                    <div className="call-details-stat-card">
                        <div className="call-details-stat-value">2,424</div>
                        <div className="call-details-stat-label">Inbound Calls</div>
                    </div>
                    <div className="call-details-stat-card">
                        <div className="call-details-stat-value">4,226</div>
                        <div className="call-details-stat-label">Outbound Calls</div>
                    </div>
                    <div className="call-details-stat-card">
                        <div className="call-details-stat-value">1:56</div>
                        <div className="call-details-stat-label">Avg. Call Duration</div>
                    </div>
                </div>
            </div>
            
            <div className="call-details-performance-card">
                <div className="executive-chart-title"><i className="fas fa-chart-bar"></i> Call Performance</div>
                <canvas id="callPerformanceChart" ref={callPerformanceChartRef}></canvas>
            </div>
        </div>
    );
};

export default CallDetails;