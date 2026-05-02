import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Grid,
  MenuItem,
  Button,
  Typography,
  IconButton,
  Autocomplete,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FieldArray, useFormikContext } from "formik";
import CancelIcon from "@mui/icons-material/Cancel";
import AddBox from "@mui/icons-material/AddBox";
import { IndianStatesWithDistricts } from "./State";

const BranchesDetail = ({
  values,
  handleChange,
  handleBlur,
  touched,
  errors,
  push,
  remove,
}) => {
  const { submitCount } = useFormikContext();
  // Enhanced handleChange for contact numbers with validation
  const handleContactChange = (e, branchIndex, contactIndex) => {
    const { value } = e.target;

    // Allow only numeric input and limit to 10 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 10);

    // Create a synthetic event to maintain compatibility with Formik
    const syntheticEvent = {
      target: {
        name: `branches[${branchIndex}].contactNumbers[${contactIndex}]`,
        value: numericValue,
      },
    };

    handleChange(syntheticEvent);
  };

  // Enhanced handleChange for beds with validation
  const handleBedsChange = (e, branchIndex) => {
    const { value } = e.target;

    // Allow only numeric input and limit to 1000
    const numericValue = value.replace(/\D/g, "");
    const limitedValue = numericValue
      ? Math.min(parseInt(numericValue), 10000).toString()
      : "";

    // Create a synthetic event to maintain compatibility with Formik
    const syntheticEvent = {
      target: {
        name: `branches[${branchIndex}].beds`,
        value: limitedValue,
      },
    };

    handleChange(syntheticEvent);
  };

  const getCitiesForBranch = (branchState) => {
    return branchState ? IndianStatesWithDistricts[branchState] || [] : [];
  };

  const handleBranchStateChange = (branchIndex, newValue) => {
    const syntheticEvent = {
      target: {
        name: `branches[${branchIndex}].state`,
        value: newValue || "",
      },
    };
    handleChange(syntheticEvent);

    // Clear city when state changes
    const cityEvent = {
      target: {
        name: `branches[${branchIndex}].city`,
        value: "",
      },
    };
    handleChange(cityEvent);
  };

  return (
    <>
      {(values.branches ?? []).map((branch, branchIndex) => (
        <Grid container item xs={12} spacing={2} key={branchIndex}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Branch Name"
              name={`branches[${branchIndex}].name`}
              value={branch.name}
              data-testid='nametestid'
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              error={
                (touched.branches?.[branchIndex]?.name || submitCount > 0) &&
                Boolean(errors.branches?.[branchIndex]?.name)
              }
              helperText={
                (touched.branches?.[branchIndex]?.name || submitCount > 0) &&
                errors.branches?.[branchIndex]?.name
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Location"
              name={`branches[${branchIndex}].location`}
              value={branch.location}
              onChange={handleChange}
              data-testid='branchlocationtestid'
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              error={
                (touched.branches?.[branchIndex]?.location || submitCount > 0) &&
                Boolean(errors.branches?.[branchIndex]?.location)
              }
              helperText={
                (touched.branches?.[branchIndex]?.location || submitCount > 0) &&
                errors.branches?.[branchIndex]?.location
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Code"
              name={`branches[${branchIndex}].code`}
              value={branch.code}
              data-testid='branchcodetestid'
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              error={
                (touched.branches?.[branchIndex]?.code || submitCount > 0) &&
                Boolean(errors.branches?.[branchIndex]?.code)
              }
              helperText={
                (touched.branches?.[branchIndex]?.code || submitCount > 0) &&
                errors.branches?.[branchIndex]?.code
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Beds"
              name={`branches[${branchIndex}].beds`}
              data-testid='branchbedstestid'
              value={branch.beds}
              type="number"
              onChange={(e) => handleBedsChange(e, branchIndex)}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              inputProps={{
                min: 0,
                max: 10000,
                step: 1,
              }}
              error={
                (touched.branches?.[branchIndex]?.beds || submitCount > 0) &&
                Boolean(errors.branches?.[branchIndex]?.beds)
              }
              helperText={
                (touched.branches?.[branchIndex]?.beds || submitCount > 0) &&
                errors.branches?.[branchIndex]?.beds
              }
              placeholder="Max 10000 beds"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Email"
              name={`branches[${branchIndex}].email`}
              data-testid='branchemailtestid'
              value={branch.email}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
              error={
                (touched.branches?.[branchIndex]?.email || submitCount > 0) &&
                Boolean(errors.branches?.[branchIndex]?.email)
              }
              helperText={
                (touched.branches?.[branchIndex]?.email || submitCount > 0) &&
                errors.branches?.[branchIndex]?.email
              }
              placeholder="branch@example.com"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              options={Object.keys(IndianStatesWithDistricts)}

              value={branch.state || null}
              onChange={(event, newValue) =>
                handleBranchStateChange(branchIndex, newValue)
              }
              onBlur={handleBlur}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State"
                  data-testid='branchstate'
                  variant="standard"
                  placeholder="Select state"
                  error={
                    (touched.branches?.[branchIndex]?.state || submitCount > 0) &&
                    Boolean(errors.branches?.[branchIndex]?.state)
                  }
                  helperText={
                    (touched.branches?.[branchIndex]?.state || submitCount > 0) &&
                    errors.branches?.[branchIndex]?.state
                  }
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete

              options={getCitiesForBranch(branch.state)}
              value={branch.city || null}
              onChange={(event, newValue) => {
                const syntheticEvent = {
                  target: {
                    name: `branches[${branchIndex}].city`,
                    value: newValue,
                  },
                };
                handleChange(syntheticEvent);
              }}
              onBlur={handleBlur}
              disabled={!branch.state}
              renderInput={(params) => (
                <TextField
                  data-testid='branchcity'
                  {...params}
                  label="City"
                  variant="standard"
                  placeholder={
                    branch.state ? "Select city" : "Select state first"
                  }
                  error={
                    (touched.branches?.[branchIndex]?.city || submitCount > 0) &&
                    Boolean(errors.branches?.[branchIndex]?.city)
                  }
                  helperText={
                    (touched.branches?.[branchIndex]?.city || submitCount > 0) &&
                    errors.branches?.[branchIndex]?.city
                  }
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Contact Person"
              name={`branches[${branchIndex}].contact`}
              value={branch.contact}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              variant="standard"
            />
          </Grid>

          {/* Contact Numbers Section */}
          <FieldArray name={`branches[${branchIndex}].contactNumbers`}>
            {({ push, remove }) => (
              <>
                {(branch.contactNumbers ?? []).map((contact, contactIndex) => (
                  <Grid
                    container
                    item
                    xs={12}
                    md={4}
                    spacing={1}
                    key={contactIndex}
                  >
                    <Grid item xs={10}>
                      <TextField
                        label="Contact Number"
                        name={`branches[${branchIndex}].contactNumbers[${contactIndex}]`}
                        data-testid='branchcontactnumber'
                        value={contact}
                        onChange={(e) =>
                          handleContactChange(e, branchIndex, contactIndex)
                        }
                        onBlur={handleBlur}
                        fullWidth
                        variant="standard"
                        type="tel"
                        inputProps={{
                          maxLength: 10,
                          pattern: "[0-9]*",
                          inputMode: "numeric",
                        }}
                        error={
                          (touched.branches?.[branchIndex]?.contactNumbers?.[
                            contactIndex
                          ] || submitCount > 0) &&
                          Boolean(
                            errors.branches?.[branchIndex]?.contactNumbers?.[
                            contactIndex
                            ],
                          )
                        }
                        helperText={
                          (touched.branches?.[branchIndex]?.contactNumbers?.[
                            contactIndex
                          ] || submitCount > 0) &&
                          errors.branches?.[branchIndex]?.contactNumbers?.[
                          contactIndex
                          ]
                        }
                        placeholder="Enter 10-digit number"
                      />
                    </Grid>
                    <Grid item xs={2} display="flex" alignItems="center">
                      <IconButton
                        color="error"
                        onClick={() => remove(contactIndex)}
                        disabled={(branch.contactNumbers?.length ?? 0) === 1} // Prevent removing the last contact
                      >
                        <CancelIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    onClick={() => push("")}
                    color="primary"
                    startIcon={<AddBox />}
                    variant="outlined"
                  >
                    Add Contact
                  </Button>
                </Grid>
              </>
            )}
          </FieldArray>

          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => remove(branchIndex)}
            >
              Remove Branch
            </Button>
          </Grid>
        </Grid >
      ))}
    </>
  );
};

export default BranchesDetail;
