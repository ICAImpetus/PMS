// DepartmentForm.js
import React from 'react';
import { Field, FieldArray } from 'formik';
import { TextField, Button, Grid, Typography, Switch, FormControlLabel } from '@mui/material';

const DepartmentForm = ({ values, branchIndex, deptIndex, deptArrayHelpers }) => (
  <div>
    <Typography variant="h6">Department {deptIndex + 1}</Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${branchIndex}.departments.${deptIndex}.doctorName`}
          as={TextField}
          label="Doctor Name"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${branchIndex}.departments.${deptIndex}.opdNumber`}
          as={TextField}
          label="OPD Number"
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1">Specialties</Typography>
        <FieldArray
          name={`branches.${branchIndex}.departments.${deptIndex}.specialties`}
          render={specialtiesArrayHelpers => (
            <div>
              {values.branches[branchIndex].departments[deptIndex].specialties.map((specialty, specIndex) => (
                <Grid container spacing={2} key={specIndex}>
                  <Grid item xs={10}>
                    <Field
                      name={`branches.${branchIndex}.departments.${deptIndex}.specialties.${specIndex}`}
                      as={TextField}
                      label="Specialty"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Button type="button" onClick={() => specialtiesArrayHelpers.remove(specIndex)}>-</Button>
                    <Button type="button" onClick={() => specialtiesArrayHelpers.insert(specIndex + 1, '')}>+</Button>
                  </Grid>
                </Grid>
              ))}
            </div>
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${branchIndex}.departments.${deptIndex}.opdTiming.morning`}
          as={TextField}
          label="Morning OPD Timing"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${branchIndex}.departments.${deptIndex}.opdTiming.evening`}
          as={TextField}
          label="Evening OPD Timing"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${branchIndex}.departments.${deptIndex}.opdDays`}
          as={TextField}
          label="OPD Days"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${branchIndex}.departments.${deptIndex}.experience`}
          as={TextField}
          label="Experience"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${branchIndex}.departments.${deptIndex}.contactNumber`}
          as={TextField}
          label="Contact Number"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${branchIndex}.departments.${deptIndex}.extensionNumber`}
          as={TextField}
          label="Extension Number"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${branchIndex}.departments.${deptIndex}.paName`}
          as={TextField}
          label="PA Name"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${branchIndex}.departments.${deptIndex}.paContactNumber`}
          as={TextField}
          label="PA Contact Number"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${branchIndex}.departments.${deptIndex}.consultationCharges`}
          as={TextField}
          type="number"
          label="Consultation Charges"
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Field
              name={`branches.${branchIndex}.departments.${deptIndex}.videoConsultation.enabled`}
              type="checkbox"
              as={Switch}
            />
          }
          label="Video Consultation"
        />
      </Grid>
      {values.branches[branchIndex].departments[deptIndex].videoConsultation.enabled && (
        <div>
          <Grid item xs={12} sm={4}>
            <Field
              name={`branches.${branchIndex}.departments.${deptIndex}.videoConsultation.timeSlot`}
              as={TextField}
              label="Time Slot"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field
              name={`branches.${branchIndex}.departments.${deptIndex}.videoConsultation.charges`}
              as={TextField}
              type="number"
              label="Charges"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field
              name={`branches.${branchIndex}.departments.${deptIndex}.videoConsultation.days`}
              as={TextField}
              label="Days"
              fullWidth
            />
          </Grid>
        </div>
      )}
    </Grid>
    {/* Add other fields similarly */}
  </div>
);

export default DepartmentForm;
