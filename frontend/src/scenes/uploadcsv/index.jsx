import React, { useState } from 'react';
import Papa from 'papaparse';
import { Box, Button, Modal, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// const CSVUploader = () => {
//   const [data, setData] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setLoading(true);
//       Papa.parse(file, {
//         complete: (results) => {
//           setData(results.data);
//           setLoading(false);
//         },
//         header: true, // if your CSV has headers
//         skipEmptyLines: true,
//         error: (err) => {
//           setError(err.message);
//           setLoading(false);
//         },
//       });
//     }
//   };

//   return (
//     <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
//       <Typography variant="h5" gutterBottom>
//         Upload CSV File
//       </Typography>
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           mb: 2,
//         }}
//       >
//         <Button
//           variant="outlined"
//           color='secondary'
//           component="label"
//           startIcon={<UploadFileIcon />}
//           sx={{ mb: 2 }}
//         >
//           Choose File
//           <input
//             type="file"
//             accept=".csv"
//             hidden
//             onChange={handleFileChange}
//           />
//         </Button>
//         {loading && <CircularProgress />}
//         {error && <Alert severity="error">{error}</Alert>}
//       </Box>
//       {data.length > 0 && (
//         <Box>
//           <Typography variant="h6" gutterBottom>
//             CSV Data:
//           </Typography>
//           <pre>{JSON.stringify(data, null, 2)}</pre>
//         </Box>
//       )}
//     </Box>
//   );
// };

const CSVUploader = () => {
    const [csvData, setCsvData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        file.uploadData = new Date().toISOString();


        // if (file) {
        //     Papa.parse(file, {
        //         complete: (result) => {
        //             setCsvData(result.data); // Set parsed data
        //         },
        //         header: true,
        //     });
        // }
        if (file) {
            setLoading(true);
            Papa.parse(file, {
                complete: (result) => {
                    setCsvData(result.data); // Set parsed data
                    setLoading(false);
                },
                header: true, // if your CSV has headers
                skipEmptyLines: true,
                error: (err) => {
                    setError(err.message);
                    setLoading(false);
                },
            });
        }

    };

    const handleSubmitModel = () => {
        alert('Submit Button Clicked');
    }

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
            {/* <Button variant="contained" component="label">
                Upload CSV
                <input type="file" accept=".csv" hidden onChange={handleFileChange} />
            </Button> */}

            <Typography variant="h5" gutterBottom>
                Upload CSV File
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Button
                    variant="outlined"
                    color='secondary'
                    component="label"
                    startIcon={<UploadFileIcon />}
                    sx={{ mb: 2 }}
                >
                    Choose File
                    <input
                        type="file"
                        accept=".csv"
                        hidden
                        onChange={handleFileChange}
                    />
                </Button>

                {/* Open Modal Button */}
                {csvData.length > 0 && <Button variant="outlined" onClick={handleOpen} color='secondary' sx={{ ml: 2 }}>
                    Show uploaded Data
                </Button>}
                {loading && <CircularProgress />}
                {error && <Alert severity="error">{error}</Alert>}
            </Box>

            {/* CSV Data Modal */}
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        width: '80%',
                        maxHeight: '80vh',
                        margin: '5% auto',
                        p: 2,
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                        CSV Data
                    </Typography>

                    {/* Table Container with Scrollbars */}
                    <TableContainer
                        component={Paper}
                        sx={{
                            flexGrow: 1,
                            overflow: 'auto', // Enables both horizontal and vertical scroll
                        }}
                    >
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {csvData.length > 0 &&
                                        csvData[0] &&
                                        Object.keys(csvData[0]).map((header, index) => (
                                            <TableCell key={index}>{header}</TableCell>
                                        ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {csvData.slice(1).map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        {Object.values(row).map((cell, cellIndex) => (
                                            <TableCell key={cellIndex}>{cell}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Submit Button */}
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <Button variant="contained" onClick={handleSubmitModel}>
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Modal>

        </Box>
    );
};

export default CSVUploader;
