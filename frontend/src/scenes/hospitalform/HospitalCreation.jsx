import { Container } from '@mui/material';
import React from 'react';
import HospitalForm from './HospitalForm';


const Hospital = () => (
  // <Container>
  //   <HospitalForm />
  // </Container>
  <Container
    maxWidth="lg" // Adjust as needed for your layout
    sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '90vh', // Full viewport height
      overflowY: 'auto', // Enable vertical scrolling
      padding: 2,
      boxShadow: 3,
    }}
  >
    <HospitalForm />
  </Container>
);

export default Hospital;