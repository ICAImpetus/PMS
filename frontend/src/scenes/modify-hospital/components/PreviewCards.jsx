import React from 'react';
import { Box, Grid, Card, CardContent, CardActions, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ModeOutlinedIcon from '@mui/icons-material/ModeOutlined';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../../theme'; // Assuming tokens is defined in your theme file

const PreviewCards = ({ rows, handleModalOpen }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
                {rows.map((row, index) => {
                    if (row.key === 'hospital') return null;
                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={row.id}>
                            <Card sx={{
                                bgcolor: index % 2 === 0 ? colors.primary[800] : colors.primary[900],
                                borderRadius: "8px",
                                p: 1,
                                boxShadow: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'stretch',
                                height: '100%',
                                cursor: 'pointer',
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    {/* <Typography variant="h3" fontWeight="bold" color="primary.contrastText">
                                        {row.value}
                                    </Typography> */}
                                    <Typography variant="h3" fontWeight="bold" color={colors.primary[500]} >
                                        {row.key2}
                                    </Typography>
                                    <Typography variant="h5" color="primary.contrastText" sx={{ mt: 1 }}>
                                        {row.content}: {row.value}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'flex-end' }}>
                                    <IconButton  onClick={() => handleModalOpen(row)}>
                                        <ModeOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default PreviewCards;
