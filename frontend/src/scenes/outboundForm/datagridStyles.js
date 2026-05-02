
export const DataGridStyles = (colors) => ({
    '& .MuiDataGrid-cell': {
        whiteSpace: 'nowrap', // Prevent text wrapping in cells
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '14px', // Set font size for table cells
    },
    '& .MuiDataGrid-columnsContainer': {
        overflowX: 'auto', // Ensure column headers are scrollable on smaller screens
    },
    '& .MuiDataGrid-root': {
        minWidth: '100%', // Ensure the grid takes full width
        border: 'none',
    },
    "& .name-column--cell": {
        color: colors.greenAccent[300],
    },
    "& .MuiDataGrid-columnHeaders": {
        backgroundColor: colors.blueAccent[700],
        borderBottom: "none",
        fontSize: "14px",
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
    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
        color: `${colors.grey[100]} !important`,
        border: 'none',
    },
});

export const DataGridStylesNormal = (colors) => ({
    '& .MuiDataGrid-cell': {
        whiteSpace: 'nowrap', // Prevent text wrapping in cells
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '14px', // Set font size for table cells
    },
    '& .MuiDataGrid-columnsContainer': {
        overflowX: 'auto', // Ensure column headers are scrollable on smaller screens
    },
    '& .MuiDataGrid-root': {
        minWidth: '100%', // Ensure the grid takes full width
        border: 'none',
    },
    "& .name-column--cell": {
        color: colors.greenAccent[300],
    },
    "& .MuiDataGrid-columnHeaders": {
        backgroundColor: colors.blueAccent[700],
        borderBottom: "none",
        fontSize: "14px",
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
    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
        color: `${colors.grey[100]} !important`,
        border: 'none',
    },
})
