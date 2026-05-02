import React, { useEffect } from 'react';
import { getDataFunc } from '../../../../utils/services';
import { Card, CardContent, Typography, Grid, Paper } from '@mui/material';
import { UserContextHook } from '../../../../contexts/UserContexts';
import { useNavigate } from 'react-router-dom';
import { commonRoutes } from '../../../../api/apiService';
import { useApi } from '../../../../api/useApi';



const HospitalList = () => {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = React.useState([]);
    const { currentUser } = UserContextHook();
    const {
        request: allHospital,
        loading: hosApiLoading,
        error: hosApiError,
    } = useApi(commonRoutes.getAllHospital);
    useEffect(() => {
        const fetchHospitals = async () => {
            const response = await allHospital();
            setHospitals(response?.data);
        };
        fetchHospitals();
    }, [allHospital]);

    // React.useEffect(() => {
    //     getDataFunc('getAllHospitals').then(response => {
    //         const data = response?.data || [];
    //         let filteredHospitals = data;

    //         if (userRole === 'admin') {
    //             filteredHospitals = data.filter(d =>
    //                 hospitalsOfAdmin.some(h => h.trim().toLowerCase() === d.name.trim().toLowerCase())
    //             );
    //         } else if (userRole === 'superadmin' || userRole === 'supermanager') {
    //             // Show all
    //             filteredHospitals = data;
    //         }

    //         setHospitals(filteredHospitals);
    //     }).catch(err => {
    //         console.error("Error fetching hospitals: ", err);
    //         setHospitals([]);
    //     })
    // }, [userRole, hospitalsOfAdmin]);

    const handleHospitalClick = (hospital) => {
        if (userRole === 'supermanager') {
            // Requirement: Clicking on any hospital loads the Team Leader Dashboard for that hospital (view-only)
            navigate(`/teamleader-dashboard/${hospital.ID || hospital._id}?viewOnly=true`);
        } else if (userRole === 'superadmin' || userRole === 'admin') {
            navigate(`/hospital-management/edit-branches/${hospital.ID || hospital._id}`);
        }
    };


    return (
        <div style={{ padding: "20px" }}>
            <Typography variant="h4" gutterBottom>
                Hospitals Assigned To the User
            </Typography>
            <Grid container spacing={3}>
                {hospitals.length > 0 ? (
                    hospitals.map((hospital, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                                component={Paper}
                                elevation={3}
                                sx={{
                                    padding: 2,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        boxShadow: 6,
                                        transform: 'translateY(-4px)',
                                        transition: 'all 0.3s ease'
                                    }
                                }}
                                onClick={() => handleHospitalClick(hospital)}
                            >
                                <CardContent>
                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {hospital.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                        📍 Location: {hospital.city || hospital.location || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        📞 ID: <b>{hospital.ID}</b>
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography align="center" variant="h6">
                            No hospitals found
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </div>
    );
}

export default HospitalList;
