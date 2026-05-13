import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, TextField, Grid, MenuItem, Button, Typography, Box, Autocomplete } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { superAdminRoutes } from '../../../../../api/apiService';
import { useState } from 'react';

const ManagementDetailsAccordion = ({ values, handleChange, handleBlur, touched, errors, push, remove, setFieldValue }) => {

  const [initialSuggestions, setInitialSuggestions] = useState(["Director", "CEO", "CFO", "COO", "Manager"]);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await superAdminRoutes.getMasterSuggestions("membertype");
        if (response?.data?.success && response.data.data.length > 0) {
          const suggestions = response.data.data.map(item => item.value);
          // Merge with defaults and remove duplicates
          const uniqueSuggestions = [...new Set([...suggestions, "Director", "CEO", "CFO", "COO", "Manager"])];
          setInitialSuggestions(uniqueSuggestions);
        }
      } catch (error) {
        console.error("Failed to fetch member type suggestions:", error);
      }
    };
    fetchSuggestions();
  }, []);

  // Compute combined suggestions: fetched + what's currently in the form
  const memberTypeSuggestions = React.useMemo(() => {
    const currentValues = (values.managementDetails ?? [])
      .map(m => m.memberType)
      .filter(val => typeof val === "string" && val.trim() !== "");
    
    return [...new Set([...initialSuggestions, ...currentValues])];
  }, [initialSuggestions, values.managementDetails]);

  // Handle phone number input to allow only numeric values and limit to 10 digits
  const handlePhoneNumberChange = (event, fieldName) => {
    const value = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
    if (value.length <= 10) {
      handleChange({
        target: {
          name: fieldName,
          value: value
        }
      });
    }
  };

  return (

    <>
      {(values.managementDetails ?? []).map((member, memberIndex) => (
        <Box key={memberIndex} sx={{ mb: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                freeSolo
                options={memberTypeSuggestions}
                value={member.memberType || null}
                onInputChange={(event, newInputValue) => {
                  setFieldValue(`managementDetails[${memberIndex}].memberType`, newInputValue);
                }}
                onChange={(event, newValue) => {
                  setFieldValue(`managementDetails[${memberIndex}].memberType`, newValue || "");
                }}
                onBlur={handleBlur}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Type of Member"
                    variant="standard"
                    name={`managementDetails[${memberIndex}].memberType`}
                    error={
                      touched.managementDetails?.[memberIndex]?.memberType &&
                      Boolean(errors.managementDetails?.[memberIndex]?.memberType)
                    }
                    helperText={
                      touched.managementDetails?.[memberIndex]?.memberType &&
                      errors.managementDetails?.[memberIndex]?.memberType
                    }
                  />
                )}
              />
              {/* <TextField
                select
                fullWidth
                label="Type of Member"
                data-testid='membertypetestid'
                name={`managementDetails[${memberIndex}].memberType`}
                value={member.memberType || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="standard"
                error={touched.managementDetails?.[memberIndex]?.memberType && Boolean(errors.managementDetails?.[memberIndex]?.memberType)}
                helperText={touched.managementDetails?.[memberIndex]?.memberType && errors.managementDetails?.[memberIndex]?.memberType}
              >
                <MenuItem value="director">Director</MenuItem>
                <MenuItem value="ceo">CEO</MenuItem>
                <MenuItem value="cfo">CFO</MenuItem>
                <MenuItem value="coo">COO</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </TextField> */}
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Name"
                name={`managementDetails[${memberIndex}].name`}
                data-testid='membernametestid'
                value={member.name}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="standard"
                error={touched.managementDetails?.[memberIndex]?.name && Boolean(errors.managementDetails?.[memberIndex]?.name)}
                helperText={touched.managementDetails?.[memberIndex]?.name && errors.managementDetails?.[memberIndex]?.name}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone Number"
                name={`managementDetails[${memberIndex}].phoneNumber`}
                data-testid='memberphonenumbertest'
                value={member.phoneNumber}
                onChange={(event) => handlePhoneNumberChange(event, `managementDetails[${memberIndex}].phoneNumber`)}
                onBlur={handleBlur}
                variant="standard"
                placeholder="Enter 10-digit phone number"
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
                error={touched.managementDetails?.[memberIndex]?.phoneNumber && Boolean(errors.managementDetails?.[memberIndex]?.phoneNumber)}
                helperText={touched.managementDetails?.[memberIndex]?.phoneNumber && errors.managementDetails?.[memberIndex]?.phoneNumber}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Hospital Designation"
                name={`managementDetails[${memberIndex}].hospitalDesignation`}
                data-testid='memberdesginationtest'
                value={member.hospitalDesignation}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="standard"
                error={touched.managementDetails?.[memberIndex]?.hospitalDesignation && Boolean(errors.managementDetails?.[memberIndex]?.hospitalDesignation)}
                helperText={touched.managementDetails?.[memberIndex]?.hospitalDesignation && errors.managementDetails?.[memberIndex]?.hospitalDesignation}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="EA Name"
                name={`managementDetails[${memberIndex}].eaName`}
                data-testid='membereanametest'
                value={member.eaName}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="standard"
                error={touched.managementDetails?.[memberIndex]?.eaName && Boolean(errors.managementDetails?.[memberIndex]?.eaName)}
                helperText={touched.managementDetails?.[memberIndex]?.eaName && errors.managementDetails?.[memberIndex]?.eaName}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="EA Contact Number"
                name={`managementDetails[${memberIndex}].eaContactNumber`}
                data-testid='membereacontacttest'
                value={member.eaContactNumber}
                onChange={(event) => handlePhoneNumberChange(event, `managementDetails[${memberIndex}].eaContactNumber`)}
                onBlur={handleBlur}
                variant="standard"
                placeholder="Enter 10-digit contact number"
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
                error={touched.managementDetails?.[memberIndex]?.eaContactNumber && Boolean(errors.managementDetails?.[memberIndex]?.eaContactNumber)}
                helperText={touched.managementDetails?.[memberIndex]?.eaContactNumber && errors.managementDetails?.[memberIndex]?.eaContactNumber}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Alignment of Location"
                name={`managementDetails[${memberIndex}].alignmentOfLocation`}
                data-testid='memberalignlocationtest'
                value={member.alignmentOfLocation || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="standard"
                error={touched.managementDetails?.[memberIndex]?.alignmentOfLocation && Boolean(errors.managementDetails?.[memberIndex]?.alignmentOfLocation)}
                helperText={touched.managementDetails?.[memberIndex]?.alignmentOfLocation && errors.managementDetails?.[memberIndex]?.alignmentOfLocation}
              >
                <MenuItem value="branch">Branch</MenuItem>
                <MenuItem value="centre">Centre</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Remove Member Button Row - Right aligned */}
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            sx={{ mt: 2, mb: 1 }}
          >
            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => remove(memberIndex)}
              size="small"
              sx={{
                minWidth: 140,
                textTransform: "none",
                fontWeight: "medium",
                borderRadius: 1.5,
                px: 2,
                py: 0.8,
                '&:hover': {
                  transform: (values.managementDetails?.length ?? 0) === 1 ? 'none' : 'translateY(-1px)',
                  boxShadow: (values.managementDetails?.length ?? 0) === 1 ? 'none' : 1
                },
                '&:disabled': {
                  opacity: 0.5,
                  cursor: 'not-allowed'
                }
              }}
            >
              Remove Member
            </Button>
          </Box>
        </Box>
      ))}

      {/* Add Member Button - Right aligned, outside of member boxes */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        sx={{ mt: 3, mb: 2 }}
      >
        <Button
          color="primary"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            push({
              memberType: "",
              name: "",
              phoneNumber: "",
              hospitalDesignation: "",
              eaName: "",
              eaContactNumber: "",
              alignmentOfLocation: "",
            })
          }
          size="small"
          sx={{
            minWidth: 140,
            textTransform: "none",
            fontWeight: "medium",
            borderRadius: 1.5,
            px: 2,
            py: 0.8,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-1px)'
            }
          }}
        >
          Add Member
        </Button>
      </Box>
    </>

  );
};

export default ManagementDetailsAccordion;
