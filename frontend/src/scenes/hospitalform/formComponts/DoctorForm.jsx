import React from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  IconButton,
  MenuItem,
  useTheme,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { FieldArray, Field, FastField } from "formik";
import DeleteIcon from "@mui/icons-material/Delete";
import { AddCircleOutline } from "@mui/icons-material";

const DoctorForm = React.memo(
  ({ branchIndex, departmentIndex, doctorIndex, doctor, removeDoctor }) => {
    const theme = useTheme();
    const [whatsappOption, setWhatsappOption] = React.useState(
      doctor.whatsappNumber === doctor.contactNumber && doctor.contactNumber
        ? "same"
        : "custom",
    );

    const fieldPrefix = `branches[${branchIndex}].departments[${departmentIndex}].doctors[${doctorIndex}]`;

    const textFieldStyleObj = {
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: theme.palette.mode === "dark" ? "#fff" : "black",
        },
        "&:hover fieldset": {
          borderColor: theme.palette.mode === "dark" ? "#379777" : "#379777",
        },
        "&.Mui-focused fieldset": {
          borderColor: theme.palette.mode === "dark" ? "#EEEEEE" : "black",
          borderWidth: 2,
        },
      },
      "& .MuiInputLabel-root": {
        color: theme.palette.mode === "dark" ? "#EEEEEE" : "black",
      },
      "& .MuiFormHelperText-root": {
        color: theme.palette.mode === "dark" ? "#EEEEEE" : "black",
      },
    };

    return (
      <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.600">
        <Typography variant="subtitle1" gutterBottom color="primary">
          Doctor {doctorIndex + 1}
        </Typography>

        <Grid container spacing={2}>
          {/* Doctor Name */}
          <Grid item xs={12}>
            <FastField name={`${fieldPrefix}.name`}>
              {({ field }) => (
                <TextField
                  label="Doctor Name"
                  variant="filled"
                  {...field}
                  fullWidth
                  sx={textFieldStyleObj}
                />
              )}
            </FastField>
          </Grid>

          {/* OPD Number - Strict Numeric */}
          <Grid item xs={12}>
            <Field name={`${fieldPrefix}.opdNo`}>
              {({ field, form }) => (
                <TextField
                  {...field}
                  label="OPD Number"
                  variant="filled"
                  fullWidth
                  sx={textFieldStyleObj}
                  value={field.value || ""} // Ensure controlled input
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, ""); // Strip non-digits
                    if (val.length <= 10) {
                      form.setFieldValue(field.name, val);
                    }
                  }}
                  inputProps={{ inputMode: "numeric" }}
                />
              )}
            </Field>
          </Grid>

          {/* Specialties */}
          <Grid item xs={12}>
            <FieldArray name={`${fieldPrefix}.specialties`}>
              {({ push, remove }) => (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Specialties
                  </Typography>
                  {doctor.specialties &&
                    doctor.specialties.map((specialty, specIndex) => (
                      <Box
                        key={specIndex}
                        mb={2}
                        display="flex"
                        alignItems="center"
                      >
                        <FastField
                          name={`${fieldPrefix}.specialties[${specIndex}]`}
                        >
                          {({ field }) => (
                            <TextField
                              label={`Specialty ${specIndex + 1}`}
                              variant="filled"
                              {...field}
                              fullWidth
                              sx={{ ...textFieldStyleObj, mb: 1 }}
                            />
                          )}
                        </FastField>
                        <IconButton
                          onClick={() => remove(specIndex)}
                          color="error"
                          sx={{ ml: 1, bgcolor: "rgba(255,0,0,0.1)" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  <Button
                    onClick={() => push("")}
                    variant="outlined"
                    color="secondary"
                    startIcon={<AddCircleOutline />}
                    size="small"
                  >
                    Add Specialty
                  </Button>
                </Box>
              )}
            </FieldArray>
          </Grid>

          {/* Experience - Strict Numeric */}
          <Grid item xs={12}>
            <Field name={`${fieldPrefix}.experience`}>
              {({ field, form }) => (
                <TextField
                  {...field}
                  label="Experience (Years)"
                  variant="filled"
                  fullWidth
                  sx={textFieldStyleObj}
                  value={field.value || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val.length <= 2) {
                      // Max 2 digits for experience
                      form.setFieldValue(field.name, val);
                    }
                  }}
                  inputProps={{ inputMode: "numeric" }}
                />
              )}
            </Field>
          </Grid>

          {/* Contact Number - Strict Numeric */}
          <Grid item xs={12}>
            <Field name={`${fieldPrefix}.contactNumber`}>
              {({ field, form }) => (
                <TextField
                  {...field}
                  label="Contact Number"
                  variant="filled"
                  fullWidth
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    form.setFieldValue(field.name, val);
                    if (whatsappOption === "same") {
                      form.setFieldValue(`${fieldPrefix}.whatsappNumber`, val);
                    }
                  }}
                  placeholder="10 Digits Only"
                  inputProps={{ inputMode: "numeric" }}
                />
              )}
            </Field>

            <Box mt={1}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.mode === "dark" ? "#ccc" : "#666",
                  display: "block",
                  mb: 0.5,
                }}
              >
                WhatsApp Number Option
              </Typography>
              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Radio
                      size="small"
                      checked={whatsappOption === "same"}
                      onChange={() => {
                        setWhatsappOption("same");
                        form.setFieldValue(
                          `${fieldPrefix}.whatsappNumber`,
                          doctor.contactNumber,
                        );
                      }}
                      sx={{
                        color: "#379777",
                        "&.Mui-checked": { color: "#379777" },
                      }}
                    />
                  }
                  label={
                    <Typography variant="caption">Same as Contact</Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Radio
                      size="small"
                      checked={whatsappOption === "custom"}
                      onChange={() => setWhatsappOption("custom")}
                      sx={{
                        color: "#379777",
                        "&.Mui-checked": { color: "#379777" },
                      }}
                    />
                  }
                  label={
                    <Typography variant="caption">Add Different</Typography>
                  }
                />
              </Stack>
            </Box>

            {whatsappOption === "custom" && (
              <Box mt={1}>
                <Field name={`${fieldPrefix}.whatsappNumber`}>
                  {({ field, form }) => (
                    <TextField
                      {...field}
                      label="WhatsApp Number"
                      variant="filled"
                      fullWidth
                      size="small"
                      sx={textFieldStyleObj}
                      value={field.value || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        if (val.length <= 10) {
                          form.setFieldValue(field.name, val);
                        }
                      }}
                      inputProps={{ inputMode: "numeric" }}
                    />
                  )}
                </Field>
              </Box>
            )}
          </Grid>

          {/* Tele Consultation - Dropdown */}
          <Grid item xs={12}>
            <FastField name={`${fieldPrefix}.teleMedicine`}>
              {({ field }) => (
                <TextField
                  select
                  label="Tele Consultation"
                  variant="filled"
                  {...field}
                  fullWidth
                  sx={textFieldStyleObj}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              )}
            </FastField>
          </Grid>

          {/* Timings */}
          <Grid item xs={12} sm={6}>
            <FastField name={`${fieldPrefix}.timings.morning`}>
              {({ field }) => (
                <TextField
                  label="Morning Timing"
                  variant="filled"
                  {...field}
                  fullWidth
                  sx={textFieldStyleObj}
                />
              )}
            </FastField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FastField name={`${fieldPrefix}.timings.evening`}>
              {({ field }) => (
                <TextField
                  label="Evening Timing"
                  variant="filled"
                  {...field}
                  fullWidth
                  sx={textFieldStyleObj}
                />
              )}
            </FastField>
          </Grid>

          {/* OPD Days Selector */}
          <Grid item xs={12}>
            <Field name={`${fieldPrefix}.opdDays`}>
              {({ field, form }) => {
                const DAYS = [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ];
                const currentVal = field.value || "";

                // Helper for individual day toggle
                const handleDayToggle = (day) => {
                  let selectedDays = currentVal
                    ? currentVal.split(", ").filter((d) => d)
                    : [];
                  if (selectedDays.includes(day)) {
                    selectedDays = selectedDays.filter((d) => d !== day);
                  } else {
                    selectedDays.push(day);
                  }
                  // Optional: Sort days to keep order consistent
                  selectedDays.sort(
                    (a, b) => DAYS.indexOf(a) - DAYS.indexOf(b),
                  );
                  form.setFieldValue(field.name, selectedDays.join(", "));
                };

                return (
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: theme.palette.divider,
                      borderRadius: 1,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ mb: 2, display: "block", fontWeight: "bold" }}
                    >
                      OPD Days *
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ mb: 1, display: "block", color: "text.secondary" }}
                    >
                      Select Days
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {DAYS.map((day) => {
                        const isSelected = currentVal.split(", ").includes(day);
                        return (
                          <Chip
                            key={day}
                            label={day.slice(0, 3)}
                            onClick={() => handleDayToggle(day)}
                            color={isSelected ? "secondary" : "default"}
                            variant={isSelected ? "filled" : "outlined"}
                            size="small"
                          />
                        );
                      })}
                    </Stack>

                    {currentVal && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 2,
                          fontWeight: 500,
                          color: theme.palette.secondary.main,
                        }}
                      >
                        Selected: {currentVal}
                      </Typography>
                    )}
                  </Box>
                );
              }}
            </Field>
          </Grid>

          {/* Extension Number */}
          <Grid item xs={12}>
            <FastField name={`${fieldPrefix}.extensionNumber`}>
              {({ field }) => (
                <TextField
                  label="Extension Number"
                  variant="filled"
                  {...field}
                  fullWidth
                  sx={textFieldStyleObj}
                />
              )}
            </FastField>
          </Grid>

          {/* PA Name */}
          <Grid item xs={12}>
            <FastField name={`${fieldPrefix}.paName`}>
              {({ field }) => (
                <TextField
                  label="PA Name"
                  variant="filled"
                  {...field}
                  fullWidth
                  sx={textFieldStyleObj}
                />
              )}
            </FastField>
          </Grid>

          {/* PA Contact Number */}
          <Grid item xs={12}>
            <FastField name={`${fieldPrefix}.paContactNumber`}>
              {({ field }) => (
                <TextField
                  label="PA Contact Number"
                  variant="filled"
                  {...field}
                  fullWidth
                  sx={textFieldStyleObj}
                />
              )}
            </FastField>
          </Grid>

          {/* Consultation Charges */}
          <Grid item xs={12}>
            <FastField name={`${fieldPrefix}.consultationCharges`}>
              {({ field }) => (
                <TextField
                  label="Consultation Charges"
                  variant="filled"
                  {...field}
                  fullWidth
                  sx={textFieldStyleObj}
                />
              )}
            </FastField>
          </Grid>
          

          {/* Empanelment List Dropdown */}
          {/* <Grid item xs={12}>
            <Field name={`${fieldPrefix}.empanelmentList`}>
              {({ field, form }) => (
                <FormControl fullWidth variant="filled" sx={textFieldStyleObj}>
                  <InputLabel id={`${fieldPrefix}-empanelment-label`}>
                    Empanelment List *
                  </InputLabel>
                  <Select
                    labelId={`${fieldPrefix}-empanelment-label`}
                    multiple
                    value={Array.isArray(field.value) ? field.value : []}
                    onChange={(e) => {
                      const value = e.target.value;
                      form.setFieldValue(
                        field.name,
                        typeof value === "string" ? value.split(",") : value,
                      );
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {[
                      "Medi Assist Insurance ТРА",
                      "MDIndia Health Insurance TPA",
                      "Paramount Health Services",
                      "Vidal Health Insurance",
                      "Raksha Health Insurance ТРА",
                      "Family Health Plan (FHPL)",
                      "Heritage Health Insurance TΡΑ",
                      "Medsave Health Insurance TPA",
                      "Vipul Medcorp Insurance TPA",
                      "United Health Parekh",
                      "Safeway Insurance TPA",
                      "Good Health Insurance TPA",
                      "AB-PMJAY (Ayushman Bharat)",
                      "CGHS",
                      "ECHS",
                      "ESIC",
                      "CAPF",
                      "Mukhyamantri Ayushman Arogya",
                      "RGHS",
                      "Corporate Tie-ups",
                    ].map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox
                          checked={
                            (Array.isArray(field.value)
                              ? field.value
                              : []
                            ).indexOf(name) > -1
                          }
                        />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Field>
          </Grid> */}

          {/* Additional Info & Description */}
          <Grid item xs={12}>
            <FastField name={`${fieldPrefix}.additionalInfo`}>
              {({ field }) => (
                <TextField
                  label="Additional Information"
                  variant="filled"
                  {...field}
                  fullWidth
                  sx={textFieldStyleObj}
                />
              )}
            </FastField>
          </Grid>

          <Grid item xs={12}>
            <FastField name={`${fieldPrefix}.descriptionOfServices`}>
              {({ field }) => (
                <TextField
                  label="Description of Services"
                  variant="filled"
                  {...field}
                  fullWidth
                  sx={textFieldStyleObj}
                />
              )}
            </FastField>
          </Grid>

          {/* Remove Doctor Button */}
          <Grid item xs={12}>
            <Button
              onClick={removeDoctor}
              variant="outlined"
              color="error"
              fullWidth
            >
              Remove Doctor
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  },
);

export default DoctorForm;
