import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Rating } from '@mui/material';
import { styled } from '@mui/system';

// Custom styled Rating component with spacing between stars
const SpacedRating = styled(Rating)({
    '& .MuiRating-icon': {
        margin: '0 10px', // Adjust the margin to control spacing
    },
});

const RatingWithLabels = ({ name, value, onChange, required, question }) => {
    const [hover, setHover] = useState(-1);

    const labels = {
        1: 'Bad',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent',
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Rating Component */}
            <SpacedRating
                name={name}
                value={value}
                onChange={(event, newValue) => onChange(event, newValue)}
                onChangeActive={(event, newHover) => setHover(newHover)}
                precision={1}
                max={5}
                required={required}
                sx={{ mr: 2 }} // Optional: Add margin-right for spacing between rating and label
            />

            {/* Label for the current rating */}
            <Typography variant="body2" sx={{ fontWeight: 'bold',padding: 2 }}>
                {hover !== -1 ? labels[hover] : labels[value] || ''}
            </Typography>
        </Box>
    );
};

export default RatingWithLabels;
