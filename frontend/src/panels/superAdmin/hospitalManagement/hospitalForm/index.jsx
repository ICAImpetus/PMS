import React from "react";
import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  useTheme,
  Modal,
  Grid,
} from "@mui/material";
import { Formik, Form, FieldArray, FastField, useFormik } from "formik";
import { initialValues } from "../../../../scenes/hospitalform/formData";
import CancelIcon from "@mui/icons-material/Cancel";
import AddBox from "@mui/icons-material/AddBox";
import { sendDataApiFunc } from "../../../../utils/services";
import { Toaster, toast } from "react-hot-toast";
import { tokens } from "../../../../theme";

const AddHospitalData = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const handleSubmit = async (values, submitForm) => {

    const response = await sendDataApiFunc(
      "addOrUpdateHospital",
      values,
      "post",
    );
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }

    // setIsPreviewOpen(false);
  };

  return (
    <Box
      sx={{
        width: "80%",
        maxWidth: "900px",
        margin: "auto",
        padding: "20px",
        backgroundColor: colors.primary[900],
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ values, handleChange, submitForm }) => (
          <Form>
            <Box>
              <Toaster position="top-right" reverseOrder={false} />
              <Typography variant="h4" gutterBottom>
                {/* Hospital Creation Formsss */}
              </Typography>

              {/*  Hospital Details - Responsive Grid Layout */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    label="Hospital Name"
                    variant="standard"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    label="Address"
                    variant="standard"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    label="Director"
                    variant="standard"
                    name="director"
                    value={values.director}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    label="CEO Name"
                    variant="standard"
                    name="ceoName"
                    value={values.ceoName}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    label="Manager"
                    variant="standard"
                    name="manager"
                    value={values.manager}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    label="GST"
                    variant="standard"
                    name="gst"
                    value={values.gst}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    label="TDS"
                    variant="standard"
                    name="tds"
                    value={values.tds}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>

              {/*  Contact Numbers - Responsive Grid Layout */}
              <Typography variant="h6" mt={3}>
                Contact Numbers
              </Typography>
              <FieldArray name="contactNumbers">
                {({ push, remove }) => (
                  <Grid container spacing={2} alignItems="center">
                    {values.contactNumbers.map((_, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Box display="flex" alignItems="center">
                          <TextField
                            label={`Contact Number ${index + 1}`}
                            variant="standard"
                            name={`contactNumbers[${index}]`}
                            value={values.contactNumbers[index]}
                            onChange={handleChange}
                            fullWidth
                          />
                          <IconButton
                            onClick={() => remove(index)}
                            sx={{ ml: 1 }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Button
                        onClick={() => push("")}
                        color="secondary"
                        startIcon={<AddBox />}
                        variant="outlined"
                      >
                        Add Contact Number
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </FieldArray>

              {/*  Submit Button */}
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                  onClick={submitForm}
                  variant="outlined"
                  color="secondary"
                  sx={{
                    ":hover": {
                      borderColor: "green",
                      backgroundColor: "#379777",
                      color: "black",
                    },
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AddHospitalData;
