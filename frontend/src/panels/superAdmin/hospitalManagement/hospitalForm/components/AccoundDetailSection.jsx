import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Grid,
  Select,
  MenuItem,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const AccountDetailAccordian = ({ values, handleChange, colors }) => {
  const predefinedCycles = [30, 40, 50, 60, 75];
  const currentCycle = values.accondDetails?.cycleOfPayment;

  // Initialize state: Custom if value exists and is NOT in the predefined list
  const [isCustomCycle, setIsCustomCycle] = useState(() => {
    return currentCycle && !predefinedCycles.includes(Number(currentCycle));
  });

  // Handle Button Click (Standard Options)
  const handleCycleButtonClick = (value) => {
    setIsCustomCycle(false);
    handleChange({
      target: {
        name: "accondDetails.cycleOfPayment",
        value: value,
      },
    });
  };

  // Handle "Others" Click
  const handleOthersClick = () => {
    setIsCustomCycle(true);
    handleChange({
      target: {
        name: "accondDetails.cycleOfPayment",
        value: "",
      },
    });
  };

  return (
    <Accordion sx={{ backgroundColor: colors.primary[900] }}
      data-testId='accountdetails'
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Account Details</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              label="Name of Legal Entity For Billing"
              name="accondDetails.nameOfLegalEntityForBilling"
              value={values.accondDetails?.nameOfLegalEntityForBilling || ""}
              onChange={handleChange}
              fullWidth
              variant="standard"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              label="GST"
              name="accondDetails.gst"
              value={values.accondDetails?.gst || ""}
              onChange={handleChange}
              fullWidth
              variant="standard"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              label="TAN"
              name="accondDetails.tan"
              value={values.accondDetails?.tan || ""}
              onChange={handleChange}
              fullWidth
              variant="standard"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              label="Bank Name"
              name="accondDetails.bankName"
              value={values.accondDetails?.bankName || ""}
              onChange={handleChange}
              fullWidth
              variant="standard"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              label="IFSC"
              name="accondDetails.ifsc"
              value={values.accondDetails?.ifsc || ""}
              onChange={handleChange}
              fullWidth
              variant="standard"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              label="Account Number"
              name="accondDetails.accountNumber"
              value={values.accondDetails?.accountNumber || ""}
              onChange={handleChange}
              fullWidth
              variant="standard"
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <FormControl fullWidth variant="standard">
              <InputLabel>Mode Of Payment</InputLabel>
              <Select
                label="Mode Of Payment"
                name="accondDetails.modeOfPayment"
                value={values.accondDetails?.modeOfPayment || ""}
                onChange={handleChange}
                fullWidth
                data-testid="modeOfPaymentSelect"
              >
                <MenuItem value="">
                  <em>Select Mode</em>
                </MenuItem>
                <MenuItem value="NEFT" data-testid="mop-option-NEFT">NEFT</MenuItem>
                <MenuItem value="NET BANKING">NET BANKING</MenuItem>
                <MenuItem value="RTGS">RTGS</MenuItem>
                <MenuItem value="IMPS">IMPS</MenuItem>
                <MenuItem value="CHEQUE">CHEQUE</MenuItem>
                <MenuItem value="CASH">CASH</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/*  FIXED: Increased width to lg={8} to fit all buttons in one line */}
          <Grid item xs={12} md={12} lg={8}>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", mb: 1, display: "block" }}
            >
              Cycle Of Payment (Days)
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "nowrap", // Forces single line
                gap: 1,
                overflowX: "auto", // Adds scroll only on very small screens
                alignItems: "center",
                pb: 0.5
              }}
            >
              {predefinedCycles.map((cycle) => (
                <Button
                  key={cycle}
                  variant={
                    !isCustomCycle && Number(currentCycle) === cycle
                      ? "contained"
                      : "outlined"
                  }
                  color="secondary"
                  onClick={() => handleCycleButtonClick(cycle)}
                  sx={{
                    borderRadius: "4px",
                    minWidth: "48px",
                    height: "36px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  data-testid={`cycle-btn-${cycle}`}
                >
                  {cycle}
                </Button>
              ))}
              <Button
                variant={isCustomCycle ? "contained" : "outlined"}
                color="secondary"
                onClick={handleOthersClick}
                sx={{
                  borderRadius: "4px",
                  height: "36px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Others
              </Button>

              {/* Inline Custom Input */}
              {isCustomCycle && (
                <TextField
                  variant="standard"
                  placeholder="Days"
                  name="accondDetails.cycleOfPayment"
                  value={values.accondDetails?.cycleOfPayment || ""}
                  onChange={handleChange}
                  type="number"
                  sx={{ width: "80px", ml: 1 }}
                  autoFocus
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default AccountDetailAccordian;
