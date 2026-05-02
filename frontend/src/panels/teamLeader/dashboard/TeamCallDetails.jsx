import React, { useState } from 'react';

const TeamCallDetails = () => {
    const initialCallData = [
        { id: '#CALL-2047', agent: 'Sarah Johnson', caller: 'Robert Wilson', dateTime: 'Oct 10, 2023 10:24 AM', duration: '4:32', progress: 0 },
        { id: '#CALL-2046', agent: 'David Wilson', caller: 'Jennifer Lopez', dateTime: 'Oct 10, 2023 09:52 AM', duration: '3:15', progress: 0 },
        { id: '#CALL-2045', agent: 'Emily Davis', caller: 'David Miller', dateTime: 'Oct 10, 2023 09:30 AM', duration: '6:04', progress: 0 },
        { id: '#CALL-2044', agent: 'Michael Brown', caller: 'Amanda Collins', dateTime: 'Oct 9, 2023 04:15 PM', duration: '5:22', progress: 0 },
    ];

    const [callData, setCallData] = useState(initialCallData);

    const togglePlayback = (callId) => {
        setCallData(prevData => prevData.map(call => {
            if (call.id === callId) {
                const isPlaying = call.progress > 0;
                return { ...call, progress: isPlaying ? 0 : 30 }; 
            }
            return call; 
        }));
    };

    return (
        <div className="page" id="call-details">
            <div className="page-header">
                <h2>Call Details & Recordings</h2>
                <div><button className="btn"><i className="fas fa-filter"></i> Filter</button></div>
            </div>

            <div className="search-box">
                <input type="text" placeholder="Search calls..." />
                <button><i className="fas fa-search"></i></button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Call ID</th><th>Agent</th><th>Caller</th><th>Date & Time</th><th>Duration</th><th>Recording</th>
                        </tr>
                    </thead>
                    <tbody>
                        {callData.map(call => (
                            <tr key={call.id}>
                                <td>{call.id}</td>
                                <td>{call.agent}</td>
                                <td>{call.caller}</td>
                                <td>{call.dateTime}</td>
                                <td>{call.duration}</td>
                                <td>
                                    <div className="audio-player">
                                        <button onClick={() => togglePlayback(call.id)}>
                                            <i className={`fas ${call.progress > 0 ? 'fa-pause' : 'fa-play'}`}></i>
                                        </button>
                                        <progress value={call.progress} max="100"></progress>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamCallDetails;