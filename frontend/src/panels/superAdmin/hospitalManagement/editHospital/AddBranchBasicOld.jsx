import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { initialBranchState as initialValues } from "../hospitalform/formData";

// This component is the actual form content, previously named App
const AddBranchBasic = ({ handleClose }) => { // Destructure handleClose from props
  // State to hold the form data, initialized with the full structure
  const [formData, setFormData] = useState(initialValues); // Use initialBranchData here

  // Handle changes for basic text input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle changes for dynamic contact number inputs
  const handleContactNumberChange = (index, value) => {
    const newContactNumbers = [...formData.contactNumbers];
    newContactNumbers[index] = value;
    setFormData((prevData) => ({
      ...prevData,
      contactNumbers: newContactNumbers,
    }));
  };

  // Add a new contact number input field
  const addContactNumber = () => {
    setFormData((prevData) => ({
      ...prevData,
      contactNumbers: [...prevData.contactNumbers, ""],
    }));
  };

  // Remove a contact number input field
  const removeContactNumber = (index) => {
    const newContactNumbers = formData.contactNumbers.filter((_, i) => i !== index);
    setFormData((prevData) => ({
      ...prevData,
      contactNumbers: newContactNumbers.length > 0 ? newContactNumbers : [""], // Ensure at least one empty field remains
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Log the complete formData, which includes both basic and initial nested data
    console.log("Submitted Branch Data:", formData);
    // In a real application, you would send this formData to an API
    alert("Form submitted! Check console for data.");
    handleClose(); // Close the modal on successful submission
  };

  return (
    <Box
      component="form" // This is the main form container
      onSubmit={handleSubmit}
      sx={{
        bgcolor: "white", // Background color for the form content
        p: { xs: 1, md: 2 }, // Padding around the form content
        borderRadius: 4,
        boxShadow: 3,
        width: "100%",
        maxWidth: "600px", // Limit form width within the modal
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2, md: 3 }, // Responsive gap between form fields
      }}
    >
      <Typography variant="h4" component="h1" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold', textAlign: 'center' }}>
        Add New Hospital Branch
      </Typography>

      {/* Branch Name */}
      <TextField
        label="Branch Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        variant="outlined"
        size="medium"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />

      {/* Location */}
      <TextField
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        fullWidth
        variant="outlined"
        size="medium"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />

      {/* Code */}
      <TextField
        label="Branch Code"
        name="code"
        value={formData.code}
        onChange={handleChange}
        fullWidth
        variant="outlined"
        size="medium"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />

      {/* Beds */}
      <TextField
        label="Number of Beds"
        name="beds"
        type="number"
        value={formData.beds}
        onChange={handleChange}
        fullWidth
        variant="outlined"
        size="medium"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />

      {/* Contact Numbers (Dynamic) */}
      <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
        Contact Numbers
      </Typography>
      <Stack spacing={2}>
        {formData.contactNumbers.map((contact, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label={`Contact Number ${index + 1}`}
              value={contact}
              onChange={(e) => handleContactNumberChange(index, e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            {formData.contactNumbers.length > 1 && (
              <IconButton
                onClick={() => removeContactNumber(index)}
                color="error"
                aria-label="remove contact number"
                sx={{ borderRadius: 2 }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}
        <Button
          variant="outlined"
          onClick={addContactNumber}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            py: 1,
            '&:hover': {
              bgcolor: 'primary.light',
              color: 'white',
            },
          }}
        >
          Add Another Contact
        </Button>
      </Stack>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4 }}>
        <Button
          variant="outlined" // Changed to outlined for cancel
          onClick={handleClose}
          color="primary"
          sx={{
            borderRadius: 2,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          Submit 
        </Button>
      </Stack>
    </Box>
  );
};

export default AddBranchBasic;
