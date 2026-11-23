import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    Chip,
    CircularProgress,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import HospitalContext from '../../contexts/HospitalContexts';

export function CampData() {
    const [campList, setCampList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination states
    const [page, setPage] = useState(0); // MUI TablePagination is 0-indexed
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const {
        campData,
        isCampLoading,
        fetchCampData

    } = useContext(HospitalContext);

    useEffect(() => {
        console.log("campdata", campData);
        if (campData && campData?.success) {
            setCampList(campData?.data || []);
            setTotalRecords(campData?.totalRecords || 0);
        }
    }, [campData]);



    // useEffect(() => {
    //     fetchCampData(page, rowsPerPage);
    // }, [page, rowsPerPage]);

    // Client-side search filter for visible rows
    const filteredRows = campList.filter((row) => {
        const query = searchQuery.toLowerCase();
        return (
            row.patientName?.toLowerCase().includes(query) ||
            row.patientPhone?.includes(query) ||
            row.patientAddress?.toLowerCase().includes(query) ||
            row.doctorId?.name?.toLowerCase().includes(query)
        );
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Page Title & Controls */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    mb: 3
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 4,
                            height: 24,
                            bgcolor: '#1565c0',
                            borderRadius: 1
                        }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.25rem' }}>
                        Camp Data
                    </Typography>
                    <Chip
                        label={`${totalRecords} Records`}
                        size="small"
                        sx={{
                            bgcolor: '#eff6ff',
                            color: '#1565c0',
                            fontWeight: 700,
                            fontSize: '0.75rem'
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TextField
                        size="small"
                        placeholder="Search patient, phone, doctor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            bgcolor: '#ffffff',
                            minWidth: 260,
                            '& .MuiOutlinedInput-root': { borderRadius: '10px' }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                                </InputAdornment>
                            )
                        }}
                    />

                    <Tooltip title="Refresh Data">
                        <IconButton
                            onClick={() => fetchCampData(page, rowsPerPage)}
                            sx={{
                                bgcolor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                '&:hover': { bgcolor: '#f1f5f9' }
                            }}
                        >
                            <RefreshIcon fontSize="small" sx={{ color: '#475569' }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Main Data Table Card */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    bgcolor: '#ffffff'
                }}
            >
                <TableContainer>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>
                                    #
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>
                                    PATIENT NAME
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>
                                    PHONE NUMBER
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>
                                    GENDER
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>
                                    ADDRESS
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>
                                    DOCTOR
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>
                                    CREATED AT
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {isCampLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={30} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: '#94a3b8' }}>
                                        No camp records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRows.map((row, index) => (
                                    <TableRow
                                        key={row._id}
                                        hover
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>
                                            {page * rowsPerPage + index + 1}
                                        </TableCell>

                                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                                            {row.patientName}
                                        </TableCell>

                                        <TableCell sx={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                            {row.patientPhone}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={row.patientGender}
                                                size="small"
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    bgcolor: row.patientGender?.toLowerCase() === 'female' ? '#fdf2f8' : '#eff6ff',
                                                    color: row.patientGender?.toLowerCase() === 'female' ? '#db2777' : '#2563eb'
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ color: '#475569' }}>
                                            {row.patientAddress}
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                {row.doctorId?.name || '—'}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{ color: '#64748b', textTransform: 'capitalize', display: 'block' }}
                                            >
                                                {row.doctorId?.specialization || ''}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={{ color: '#475569', fontSize: '0.85rem' }}>
                                            {new Date(row.createdAt).toLocaleString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={totalRecords}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50]}
                />
            </Paper>
        </Box>
    );
}