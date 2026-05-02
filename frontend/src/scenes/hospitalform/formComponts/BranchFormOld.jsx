// BranchForm.js
import React from 'react';
import { Field, FieldArray } from 'formik';
import { TextField, Button, Grid, Typography } from '@mui/material';
import DepartmentForm from './DepartmentForm';

const BranchForm = ({ values, index,handleChange, arrayHelpers }) => (
  <div>
    <Typography variant="h6">Branch {index + 1}</Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${index}.name`}
          as={TextField}
          label="Name"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${index}.location`}
          as={TextField}
          label="Location"
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1">Contact Numbers</Typography>
        <FieldArray
          name={`branches.${index}.contactNumbers`}
          render={branchArrayHelpers => (
            <div>
              {values.branches[index].contactNumbers.map((contact, contactIndex) => (
                <Grid container spacing={2} key={contactIndex}>
                  <Grid item xs={10}>
                    <Field
                      name={`branches.${index}.contactNumbers.${contactIndex}`}
                      as={TextField}
                      label="Contact Number"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Button type="button" onClick={() => branchArrayHelpers.remove(contactIndex)}>-</Button>
                    <Button type="button" onClick={() => branchArrayHelpers.insert(contactIndex + 1, '')}>+</Button>
                  </Grid>
                </Grid>
              ))}
            </div>
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${index}.code`}
          as={TextField}
          label="Code"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Field
          name={`branches.${index}.numberOfBeds`}
          as={TextField}
          type="number"
          label="Number of Beds"
          fullWidth
        />
      </Grid>
    </Grid>
    <FieldArray
      name={`branches.${index}.departments`}
      render={deptArrayHelpers => (
        <div>
          {values.branches[index].departments.map((department, deptIndex) => (
            <DepartmentForm
              key={deptIndex}
              values={values}
              branchIndex={index}
              deptIndex={deptIndex}
              deptArrayHelpers={deptArrayHelpers}
            />
          ))}
          <Button type="button" onClick={() => deptArrayHelpers.push({
            doctorName: "",
            enabled: true,
            opdNumber: "",
            specialties: [""],
            opdTiming: { morning: "", evening: "" },
            opdDays: "",
            experience: "",
            contactNumber: "",
            extensionNumber: "",
            paName: "",
            paContactNumber: "",
            consultationCharges: 0,
            videoConsultation: { enabled: false, timeSlot: "", charges: 0, days: "" },
            teleMedicine: false,
            empanelmentList: ["Cash", "TPA", "RGHS", "CGHS"],
            additionalInfo: "",
            serviceDescription: "",
            availability: { enabled: true, leave: false, halfDay: false, fullDay: false }
          })}>
            Add Department
          </Button>
        </div>
      )}
    />
  </div>
);

export default BranchForm;