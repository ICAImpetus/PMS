import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import { useTheme } from '@emotion/react';
import { tokens } from '../../../theme';
import { styled } from '@mui/system';
const ScrollableForm = styled(Box)({
    width: '100%',
    height: 'calc(90vh - 100px)', // Adjust height as needed based on your layout
    overflowY: 'auto',
    padding: '20px',
    '&::-webkit-scrollbar': {
        width: '0px',  // This will hide the scrollbar horizontally
        height: '0px', // This will hide the scrollbar vertically
        display: 'none', // Optional: hide scrollbar when not interacting
    },
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // Internet Explorer/Edge
});

// const TableContainer = styled(Box)(({ theme }) => ({
//     width: '100%',
//     maxWidth: '100%',
//     height: '400px',
//     '& .MuiDataGrid-root': {
//         border: 'none',
//     },
//     '& .MuiDataGrid-cell': {
//         fontSize: '16px',
//     },
//     '& .MuiDataGrid-columnHeaders': {
//         backgroundColor: theme.palette.secondary,
//         color: theme.palette.primary.contrastText,
//         fontSize: '16px',
//     },
//     '& .MuiDataGrid-footerContainer': {
//         backgroundColor: theme.palette.primary.main,
//         color: theme.palette.primary.contrastText,
//     },
//     '@media (max-width: 600px)': {
//         '& .MuiDataGrid-root': {
//             width: '100%',
//             overflowX: 'auto',
//         },
//     },
// }));


const DynamicTable = ({ formData, prevStep, handleSubmit }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    // Convert formData object to an array of objects with unique IDs
    const tableData = React.useMemo(() => {
        return Object.keys(formData).map((key, index) => ({
            id: index,
            key,
            value: formData[key],
        }));
    }, [formData]);

    // Define columns for the DataGrid
    const columns = [
        { field: 'key', headerName: 'Key', width: 150 },
        { field: 'value', headerName: 'Value', width: 300 },
    ];

    return (
        // <Box mt={4} height={400}>
        //     <DataGrid rows={tableData} columns={columns} pageSize={5} />
        <ScrollableForm>
            <Box
                mt={4}
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        // border: "none",
                    },
                    "& .MuiDataGrid-cell": {
                        // borderBottom: "none",
                        whiteSpace: 'nowrap', // Prevent text wrapping in cells
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                    "& .name-column--cell": {
                        color: colors.greenAccent[300],
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[900],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                }}
            >
                {/* <TableContainer mt={4} theme={theme}> */}
                <div style={{ height: '100%', width: '100%' }}>
                    <DataGrid
                        checkboxSelection
                        rows={tableData}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        disableSelectionOnClick
                    />
                </div>
                {/* </TableContainer> */}


                <Button
                    variant="contained"
                    color='secondary'
                    onClick={prevStep}
                    sx={{ m: 2 }}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    color='secondary'
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </Box>
        </ScrollableForm>
    );
};

export default DynamicTable;
