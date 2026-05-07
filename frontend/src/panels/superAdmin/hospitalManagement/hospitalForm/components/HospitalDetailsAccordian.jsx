import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Grid,
  MenuItem,
  Button,
  Typography,
  Avatar,
  Autocomplete,
  Box,
  Switch,
  FormControlLabel
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { IndianStatesWithDistricts } from "./State";
import { useFormikContext } from "formik"
import toast from "react-hot-toast";

const HospitalBasicDetailAccrodian = ({
  values,
  handleChange,
  handleBlur,
  touched,
  errors,
  colors,
  setFieldValue
}) => {
  const { submitCount } = useFormikContext();
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (values.state) {
      setCities(IndianStatesWithDistricts[values.state] || []);
    } else {
      setCities([]);
    }
  }, [values.state]);

  const handleStateChange = (event) => {
    const newState = event.target.value;
    handleChange(event);
    // Clear city when state changes
    handleChange({ target: { name: "city", value: "" } });
  };

  return (
    <Accordion defaultExpanded sx={{ backgroundColor: colors.primary[900] }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Hospital Details</Typography>
      </AccordionSummary>
      <AccordionDetails>

        <Grid container spacing={2}>
          <Grid item xs={12} sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between"
          }} >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
              }}
            >
              <Avatar
                src={
                  values.hospitallogoPreview ||
                  (typeof values.hospitallogo === "string"
                    ? values.hospitallogo
                    : "")
                }
                sx={{ width: 80, height: 80 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Hospital / Branch Logo  <Typography component="span" variant="caption" color="text.secondary">(Max 2MB)</Typography>
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoAlternateIcon />}
                  sx={{ mr: 1 }}
                >
                  Upload Picture
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    name="hospitallogo"
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("Image size should be less than 2MB");
                          e.target.value = null;
                          return;
                        }

                        //  actual file backend ke liye
                        setFieldValue("hospitallogo", file);

                        //  preview UI ke liye
                        setFieldValue(
                          "hospitallogoPreview",
                          URL.createObjectURL(file)
                        );
                      }
                    }}
                  />
                </Button>
                {values.hospitallogo && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={() => {
                      setFieldValue("hospitallogo", null);
                      setFieldValue("hospitallogoPreview", null);
                      setFieldValue("removeHospitalLogo", true)
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 2,
                mb: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={values.itsBranch || false}
                    onChange={(e) =>
                      setFieldValue("itsBranch", e.target.checked)
                    }
                    color="warning"
                    size="small"
                  />
                }
                label={
                  <Typography
                    sx={{ color: colors.grey[100], fontSize: "0.9rem" }}
                  >
                    Is this a branch?
                  </Typography>
                }
              />

              {/* <Typography
                variant="caption"
                sx={{ color: colors.grey[400], minWidth: 180 }}
              >
                {values.itsBranch
                  ? "This will be linked as a branch of an existing hospital"
                  : "This will create a new main hospital"}
              </Typography> */}
            </Box>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              label="Hospital Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              error={(touched.name || submitCount > 0) && Boolean(errors.name)}
              helperText={(touched.name || submitCount > 0) && errors.name}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              label="Code of the hospital"
              name="hospitalCode"
              value={values.hospitalCode}
              inputProps={{
                minLength: 4,
                maxLength: 9,
              }}
              onChange={(e) => {
                const value = e.target.value;

                // Allow only:
                // a-z A-Z 0-9 _ -
                const sanitizedValue = value
                  .replace(/[^a-zA-Z0-9_-]/g, "")
                  .slice(0, 9);


                handleChange({
                  target: {
                    name: "hospitalCode",
                    value: sanitizedValue,
                  },
                });
              }}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              error={(touched.hospitalCode || submitCount > 0) && Boolean(errors.hospitalCode)}
              helperText={(touched.hospitalCode || submitCount > 0) && errors.hospitalCode}
            />
          </Grid>
          <Grid item xs={12} md={4} lg={4} >
            <TextField
              label="Beds"
              type="number"
              value={values.beds}
              onChange={(e) => setFieldValue("beds", e.target.value)}
              onBlur={handleBlur}
              fullWidth
              inputProps={{ min: 0, max: 10000 }}
              onInput={(e) => {
                if (e.target.value > 10000) e.target.value = 10000;
                if (e.target.value < 0) e.target.value = 0;
              }}
              variant="standard"
              // error={
              //   (touched.branches?.[branchIndex]?.email || submitCount > 0) &&
              //   Boolean(errors.branches?.[branchIndex]?.email)
              // }
              // helperText={
              //   (touched.branches?.[branchIndex]?.email || submitCount > 0) &&
              //   errors.branches?.[branchIndex]?.email
              // }
              placeholder="ex.10000"
            />
          </Grid>
          <Grid item xs={12} md={4} lg={4} >
            <TextField
              label="Email"
              value={values.email}
              onChange={(e) => setFieldValue("email", e.target.value)}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              // error={
              //   (touched.branches?.[branchIndex]?.email || submitCount > 0) &&
              //   Boolean(errors.branches?.[branchIndex]?.email)
              // }
              // helperText={
              //   (touched.branches?.[branchIndex]?.email || submitCount > 0) &&
              //   errors.branches?.[branchIndex]?.email
              // }
              placeholder="hospital@example.com"
            />
          </Grid>
          <Grid item xs={10} md={4} lg={4}>
            <TextField
              label="Contact Number"
              value={values.contact}
              onChange={(e) => setFieldValue("contact", e.target.value)}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              type="tel"
              inputProps={{
                maxLength: 10,
                pattern: "[0-9]*",
                inputMode: "numeric",
              }}
              // error={
              //   (touched.branches?.[branchIndex]?.contactNumbers?.[
              //     contactIndex
              //   ] || submitCount > 0) &&
              //   Boolean(
              //     errors.branches?.[branchIndex]?.contactNumbers?.[
              //     contactIndex
              //     ],
              //   )
              // }
              // helperText={
              //   (touched.branches?.[branchIndex]?.contactNumbers?.[
              //     contactIndex
              //   ] || submitCount > 0) &&
              //   errors.branches?.[branchIndex]?.contactNumbers?.[
              //   contactIndex
              //   ]
              // }
              placeholder="Enter 10-digit number"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Autocomplete
              options={Object.keys(IndianStatesWithDistricts)}
              value={values.state}
              onChange={(event, newValue) => {
                handleChange({ target: { name: "state", value: newValue } });
                // Clear city when state changes
                handleChange({ target: { name: "city", value: "" } });
              }}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State"
                  name="state"
                  variant="standard"
                  error={(touched.state || submitCount > 0) && Boolean(errors.state)}
                  helperText={(touched.state || submitCount > 0) && errors.state}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Autocomplete
              options={cities}
              value={values.city}
              onChange={(event, newValue) => {
                handleChange({ target: { name: "city", value: newValue } });
              }}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              disabled={!values.state}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City"
                  name="city"
                  variant="standard"
                  error={(touched.city || submitCount > 0) && Boolean(errors.city)}
                  helperText={(touched.city || submitCount > 0) && errors.city}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={8}>
            <TextField
              label="Corporate Address"
              name="corporateAddress"
              value={values.corporateAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              error={
                (touched.corporateAddress || submitCount > 0) && Boolean(errors.corporateAddress)
              }
              helperText={(touched.corporateAddress || submitCount > 0) && errors.corporateAddress}
            />
          </Grid>

        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default HospitalBasicDetailAccrodian;
