import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Tabs,
    Tab,
    LinearProgress,
    Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Sample PMS Training Data (Replace URLs with your actual video & PPT file paths/URLs)
const TRAINING_MODULES = [
    {
        id: 1,
        title: 'Complete PMS Workflow & SOP Presentation',
        description: 'Step-by-step slide deck explaining Patient Management System roles, leads, and escalations.',
        type: 'VIDEO',
        category: 'Getting Started',
        // duration: '08:45 mins',
        mediaUrl: 'https://drive.google.com/file/d/1fwBDtJTMXsu8D_wqLZdhc9camr-1sLUY/preview', // Local public folder or S3/Cloudinary URL
        // completed: true,
    },
    // {
    //     id: 2,
    //     title: 'Complete PMS Workflow & SOP Presentation',
    //     description: 'Step-by-step slide deck explaining Patient Management System roles, leads, and escalations.',
    //     type: 'PPT',
    //     category: 'SOP & Guidelines',
    //     // duration: '24 Slides',
    //     // For local PPTX download or public URL for Office Online Viewer:
    //     mediaUrl: '/assets/lms/pms-workflow-guide.pptx',
    //     viewerUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=YOUR_PUBLIC_PPT_URL',
    //     completed: true,
    // },
    // {
    //     id: 3,
    //     title: 'Managing Patient History & Records',
    //     description: 'How to search patient logs, update medical history, and verify past visits accurately.',
    //     type: 'VIDEO',
    //     category: 'Patient Records',
    //     duration: '12:20 mins',
    //     mediaUrl: '/assets/lms/patient-history-tutorial.mp4',
    //     completed: false,
    // },
    // {
    //     id: 4,
    //     title: 'WhatsApp Leads & Follow-Up Handling',
    //     description: 'Best practices for converting WhatsApp leads and clearing urgent pending follow-ups.',
    //     type: 'PPT',
    //     category: 'Lead Management',
    //     duration: '18 Slides',
    //     mediaUrl: '/assets/lms/whatsapp-leads-sop.pptx',
    //     viewerUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=YOUR_PUBLIC_PPT_URL',
    //     completed: false,
    // },
    // {
    //     id: 5,
    //     title: 'Filling Executive Forms & Reports',
    //     description: 'Detailed walkthrough on submitting inbound/outbound executive forms without errors.',
    //     type: 'VIDEO',
    //     category: 'Executive Forms',
    //     duration: '10:15 mins',
    //     mediaUrl: '/assets/lms/executive-forms-guide.mp4',
    //     completed: false,
    // },
    // {
    //     id: 6,
    //     title: 'Clinic Center Switching & Daily Announcements',
    //     description: 'Quick guide on switching between branches and checking daily clinic announcements.',
    //     type: 'PPT',
    //     category: 'Getting Started',
    //     duration: '12 Slides',
    //     mediaUrl: '/assets/lms/branch-announcements.pptx',
    //     viewerUrl: 'https://view.officeapps.live.com/op/embed.aspx?src=YOUR_PUBLIC_PPT_URL',
    //     completed: false,
    // },
];

// Theme Constants matching your Infinis UI
const THEME = {
    bg: '#F5F7FA',
    cardBg: '#FFFFFF',
    primary: '#155EEF',
    primarySoft: '#EEF4FF',
    textDark: '#101828',
    textMuted: '#667085',
    pptColor: '#D97706',
    pptSoft: '#FEF3C7',
    border: '#EAECF0',
};

export default function LMSPortal() {
    const [filterTab, setFilterTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMedia, setActiveMedia] = useState(null);

    const filteredModules = TRAINING_MODULES.filter((item) => {
        const matchesTab = filterTab === 'ALL' || item.type === filterTab;
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const videoCount = TRAINING_MODULES.filter((m) => m.type === 'VIDEO').length;
    const pptCount = TRAINING_MODULES.filter((m) => m.type === 'PPT').length;
    const completedCount = TRAINING_MODULES.filter((m) => m.completed).length;
    const progressPercent = Math.round((completedCount / TRAINING_MODULES.length) * 100);

    return (
        <Box sx={{ p: 3, backgroundColor: THEME.bg, minHeight: '100vh' }}>
            {/* Top Toolbar (Matches your Dashboard Top Controls) */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    mb: 3,
                }}
            >
                <Box>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: THEME.textDark, letterSpacing: '-0.02em' }}
                    >
                        LMS Training Portal
                    </Typography>
                    <Typography variant="body2" sx={{ color: THEME.textMuted }}>
                        Learn how Infinis PMS works through video tutorials & presentation guides
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search tutorials or PPTs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '10px',
                            minWidth: 260,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                '& fieldset': { borderColor: THEME.border },
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: THEME.textMuted }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
            </Box>

            {/* Top 3 KPI Summary Cards (Matches Volume / Schedule / Urgent Cards) */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {/* Card 1: Total Modules */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            borderRadius: '16px',
                            boxShadow: '0px 2px 10px rgba(16, 24, 40, 0.04)',
                            border: `1px solid ${THEME.border}`,
                        }}
                    >
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '10px',
                                        backgroundColor: THEME.primarySoft,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: THEME.primary,
                                    }}
                                >
                                    <SchoolOutlinedIcon fontSize="small" />
                                </Box>
                                <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.06em' }}
                                >
                                    COURSE PROGRESS
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: THEME.textDark }}>
                                        {TRAINING_MODULES.length}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.05em' }}
                                    >
                                        TOTAL PMS MODULES
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right', minWidth: 110 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: THEME.primary }}>
                                        {progressPercent}% COMPLETED
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progressPercent}
                                        sx={{
                                            mt: 0.5,
                                            height: 6,
                                            borderRadius: 4,
                                            backgroundColor: THEME.primarySoft,
                                            '& .MuiLinearProgress-bar': { backgroundColor: THEME.primary },
                                        }}
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 2: Video Tutorials */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            borderRadius: '16px',
                            boxShadow: '0px 2px 10px rgba(16, 24, 40, 0.04)',
                            border: `1px solid ${THEME.border}`,
                        }}
                    >
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '10px',
                                        backgroundColor: THEME.primarySoft,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: THEME.primary,
                                    }}
                                >
                                    <PlayCircleFilledWhiteOutlinedIcon fontSize="small" />
                                </Box>
                                <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.06em' }}
                                >
                                    VIDEO WALKTHROUGHS
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: THEME.textDark }}>
                                {videoCount}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.05em' }}
                            >
                                STEP-BY-STEP VIDEOS
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card 3: PPT Guides */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            borderRadius: '16px',
                            boxShadow: '0px 2px 10px rgba(16, 24, 40, 0.04)',
                            border: `1px solid ${THEME.border}`,
                        }}
                    >
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '10px',
                                        backgroundColor: THEME.pptSoft,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: THEME.pptColor,
                                    }}
                                >
                                    <SlideshowOutlinedIcon fontSize="small" />
                                </Box>
                                <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.06em' }}
                                >
                                    PRESENTATIONS
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: THEME.textDark }}>
                                {pptCount}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.05em' }}
                            >
                                PPT TRAINING DECKS
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter Section Header (Matches "Top Inbound Purpose" card header style) */}
            <Box
                sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    p: 2,
                    mb: 3,
                    border: `1px solid ${THEME.border}`,
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 4,
                            height: 20,
                            borderRadius: 2,
                            backgroundColor: THEME.primary,
                        }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: THEME.textDark }}>
                        PMS Learning Library
                    </Typography>
                </Box>

                <Tabs
                    value={filterTab}
                    onChange={(_, newValue) => setFilterTab(newValue)}
                    sx={{
                        minHeight: 36,
                        '& .MuiTabs-indicator': { display: 'none' },
                        '& .MuiTab-root': {
                            minHeight: 36,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            borderRadius: '8px',
                            px: 2,
                            mr: 1,
                            color: THEME.textMuted,
                            '&.Mui-selected': {
                                backgroundColor: THEME.primary,
                                color: '#FFFFFF',
                            },
                        },
                    }}
                >
                    <Tab label={`All (${TRAINING_MODULES.length})`} value="ALL" /> <Tab label={`Videos (${videoCount})`} value="VIDEO" />
                    <Tab label={`PPT Decks (${pptCount})`} value="PPT" />
                </Tabs>
            </Box>

            {/* Training Cards Grid */}
            <Grid container spacing={2.5}>
                {filteredModules.map((module) => {
                    const isVideo = module.type === 'VIDEO';
                    return (
                        <Grid item xs={12} sm={6} lg={4} key={module.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    borderRadius: '16px',
                                    boxShadow: '0px 2px 10px rgba(16, 24, 40, 0.04)',
                                    border: `1px solid ${THEME.border}`,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0px 8px 20px rgba(16, 24, 40, 0.08)',
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    {/* Badge Row */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Chip
                                            icon={
                                                isVideo ? (
                                                    <PlayCircleFilledWhiteOutlinedIcon sx={{ fontSize: 16 }} />
                                                ) : (
                                                    <SlideshowOutlinedIcon sx={{ fontSize: 16 }} />
                                                )
                                            }
                                            label={isVideo ? 'VIDEO TUTORIAL' : 'PPT PRESENTATION'}
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                letterSpacing: '0.04em',
                                                backgroundColor: isVideo ? THEME.primarySoft : THEME.pptSoft,
                                                color: isVideo ? THEME.primary : THEME.pptColor,
                                                '& .MuiChip-icon': {
                                                    color: isVideo ? THEME.primary : THEME.pptColor,
                                                },
                                            }}
                                        />

                                        {module.completed && (
                                            <Chip
                                                icon={<CheckCircleOutlineIcon sx={{ fontSize: 15 }} />}
                                                label="Watched"
                                                size="small"
                                                sx={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 600,
                                                    backgroundColor: '#ECFDF3',
                                                    color: '#027A48',
                                                    '& .MuiChip-icon': { color: '#027A48' },
                                                }}
                                            />
                                        )}
                                    </Box>

                                    {/* Category & Title */}
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 700,
                                            color: THEME.primary,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        {module.category}
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: '1.05rem',
                                            color: THEME.textDark,
                                            mt: 0.5,
                                            mb: 1,
                                            lineHeight: 1.35,
                                        }}
                                    >
                                        {module.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: THEME.textMuted, fontSize: '0.86rem', lineHeight: 1.5 }}
                                    >
                                        {module.description}
                                    </Typography>
                                </CardContent>

                                {/* Card Footer Actions */}
                                <Box
                                    sx={{
                                        px: 2.5,
                                        pb: 2.5,
                                        pt: 1.5,
                                        borderTop: `1px solid ${THEME.border}`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: THEME.textMuted }}>
                                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {module.duration}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={
                                            isVideo ? <PlayCircleFilledWhiteOutlinedIcon /> : <SlideshowOutlinedIcon />
                                        }
                                        onClick={() => setActiveMedia(module)}
                                        sx={{
                                            backgroundColor: THEME.primary,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: '8px',
                                            boxShadow: 'none',
                                            px: 2,
                                            '&:hover': {
                                                backgroundColor: '#0B4EC9',
                                                boxShadow: 'none',
                                            },
                                        }}
                                    >
                                        {isVideo ? 'Watch Video' : 'View PPT'}
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Media Viewer Dialog (Plays Video or Previews/Downloads PPT) */}
            <Dialog
                open={Boolean(activeMedia)}
                onClose={() => setActiveMedia(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', overflow: 'hidden' },
                }}
            >
                {activeMedia && (
                    <>
                        <DialogTitle
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: `1px solid ${THEME.border}`,
                                py: 1.5,
                                px: 2.5,
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: THEME.textDark }}>
                                    {activeMedia.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: THEME.textMuted }}>
                                    {activeMedia.category} • {activeMedia.duration}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {activeMedia.type === 'PPT' && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DownloadOutlinedIcon />}
                                        href={activeMedia.mediaUrl}
                                        download
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: '8px',
                                            borderColor: THEME.primary,
                                            color: THEME.primary,
                                        }}
                                    >
                                        Download PPT
                                    </Button>
                                )}
                                <IconButton onClick={() => setActiveMedia(null)} size="small">
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>

                        <DialogContent sx={{ p: 0, backgroundColor: '#0F172A' }}>
                            {activeMedia.type === 'VIDEO' ? (
                                activeMedia.mediaUrl.includes('drive.google.com') ? (
                                    <iframe
                                        src={activeMedia.mediaUrl.replace('/view?usp=sharing', '/preview').replace('/view', '/preview')}
                                        title={activeMedia.title}
                                        width="100%"
                                        height="480px"
                                        allow="autoplay; fullscreen"
                                        style={{ border: 'none', display: 'block' }}
                                    />
                                ) : (
                                    <video
                                        src={activeMedia.mediaUrl}
                                        controls
                                        autoPlay
                                        style={{ width: '100%', maxHeight: '72vh', display: 'block' }}
                                    />
                                )
                            ) : (
                                <Box sx={{ width: '100%', height: '70vh', backgroundColor: '#F8FAFC' }}>
                                    <iframe
                                        src={
                                            activeMedia.mediaUrl.includes('drive.google.com')
                                                ? activeMedia.mediaUrl.replace('/view?usp=sharing', '/preview').replace('/view', '/preview')
                                                : activeMedia.mediaUrl.endsWith('.pdf')
                                                    ? activeMedia.mediaUrl
                                                    : activeMedia.viewerUrl
                                        }
                                        title={activeMedia.title}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 'none' }}
                                    />
                                </Box>
                            )}
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Box>
    );
}