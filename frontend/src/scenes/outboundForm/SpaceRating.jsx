import React from "react";
import { Box, Rating, Typography } from "@mui/material";
import { styled } from "@mui/system";

// Custom styled Rating component with spacing between stars
const SpacedRating = styled(Rating)({
  '& .MuiRating-icon': {
    margin: '0 4px', // Adjust the margin to control spacing
  },
});

const RatingWithSpacing = ({question}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {question}
      </Typography>
      <SpacedRating name="custom-spacing-rating" />
    </Box>
  );
};

export default RatingWithSpacing;
