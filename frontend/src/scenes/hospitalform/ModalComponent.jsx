import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { tokens } from "../../theme";

const ModalComponent = ({
  values,
  handleEdit,
  handleSubmit,
  isSubmitting,
  isValid,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bgcolor="rgba(0, 0, 0, 0.5)" // Background overlay for better focus
      zIndex="1300" // Ensures the modal is above other elements
    >
      <Box
        p={4}
        // bgcolor="background.paper"
        bgcolor={colors.primary[400]}
        boxShadow={24}
        borderRadius={2}
        width="80%"
        maxWidth="600px"
        maxHeight="80vh"
        overflow="auto"
        margin="auto"
      >
        <Typography variant="h5" gutterBottom color="green">
          Preview Hospital Details
        </Typography>

        {/* Hospital Name */}
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography variant="h6" color="secondary">
                  Hospital Name
                </Typography>
              </TableCell>
              <TableCell>
                <Typography>{values.name}</Typography>
              </TableCell>
            </TableRow>

            {/* Contact Numbers */}
            <TableRow>
              <TableCell>
                <Typography variant="h6" color="secondary">
                  Contact Numbers
                </Typography>
              </TableCell>
              <TableCell>
                {values.contactNumbers.map((number, index) => (
                  <Typography key={index}>{number}</Typography>
                ))}
              </TableCell>
            </TableRow>

            {/* Branches */}
            {values.branches.map((branch, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="h6" color="secondary">
                      Branch {index + 1}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>{branch.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell>{branch.location}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>{branch.code}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Beds</TableCell>
                  <TableCell>{branch.beds}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Contact Numbers</TableCell>
                  <TableCell>{branch.contactNumbers.join(", ")}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}

            {/* Departments */}
            {values.departments.map((department, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="h6" color="secondary">
                      Department {index + 1}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>{department.name}</TableCell>
                </TableRow>
                {department.doctors.map((doctor, docIndex) => (
                  <React.Fragment key={docIndex}>
                    <TableRow>
                      <TableCell>Doctor Name</TableCell>
                      <TableCell>{doctor.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>OPD No</TableCell>
                      <TableCell>{doctor.opdNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Specialties</TableCell>
                      <TableCell>{doctor.specialties.join(", ")}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Experience</TableCell>
                      <TableCell>{doctor.experience}</TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}

            {/* Empanelment List */}
            {values.empanelmentList.map((empanelment, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell>Policy Name</TableCell>
                  <TableCell>{empanelment.policyName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Specialties</TableCell>
                  <TableCell>
                    {empanelment.coveringAreasOfSpeciality.join(", ")}
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}

            {/* Test Labs */}
            {values.testLabs.map((lab, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell>Test Lab {index + 1}</TableCell>
                  <TableCell>{lab.location}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Test Code</TableCell>
                  <TableCell>{lab.testCode}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Test Name</TableCell>
                  <TableCell>{lab.testName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Service Group</TableCell>
                  <TableCell>{lab.serviceGroup}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Service Charge</TableCell>
                  <TableCell>{lab.serviceCharge}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Floor</TableCell>
                  <TableCell>{lab.floor}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>{lab.description}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Precaution</TableCell>
                  <TableCell>{lab.precaution}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Categories</TableCell>
                  <TableCell>{lab.categoryApplicability.join(", ")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>TAT Report</TableCell>
                  <TableCell>{lab.tatReport}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Source</TableCell>
                  <TableCell>{lab.source}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Remarks</TableCell>
                  <TableCell>{lab.remarks}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}

            {/* Code Announcements */}
            {values.codeAnnouncements.map((announcement, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>{announcement.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Color</TableCell>
                  <TableCell>{announcement.color}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>{announcement.description}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Concerned Person</TableCell>
                  <TableCell>{announcement.concernedPerson}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Short Code</TableCell>
                  <TableCell>{announcement.shortCode}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Time Availability</TableCell>
                  <TableCell>{announcement.timeAvailability}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Enabled</TableCell>
                  <TableCell>{announcement.enabled ? "Yes" : "No"}</TableCell>
                </TableRow>
                {announcement.staff.map((staffMember, staffIndex) => (
                  <React.Fragment key={staffIndex}>
                    <TableRow>
                      <TableCell>Staff Name</TableCell>
                      <TableCell>{staffMember.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Shift</TableCell>
                      <TableCell>{staffMember.shift}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Contact No</TableCell>
                      <TableCell>{staffMember.contactNo}</TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}

            {/* IPD Details */}
            <TableRow>
              <TableCell>
                <Typography variant="h6" color="secondary">
                  IPD Details
                </Typography>
              </TableCell>
              <TableCell>
                <Typography>
                  No of Beds: {values.ipdDetails.noOfBeds}
                </Typography>
                <Typography>Charges: {values.ipdDetails.charges}</Typography>
                <Typography>Location: {values.ipdDetails.location}</Typography>
                <Typography>Category: {values.ipdDetails.category}</Typography>
                <Typography>
                  Service Type: {values.ipdDetails.serviceType}
                </Typography>
              </TableCell>
            </TableRow>

            {/* Day Care Details */}
            <TableRow>
              <TableCell>
                <Typography variant="h6" color="secondary">
                  Day Care Details
                </Typography>
              </TableCell>
              <TableCell>
                <Typography>
                  No of Beds: {values.dayCareDetails.noOfBeds}
                </Typography>
                <Typography>
                  Charges: {values.dayCareDetails.charges}
                </Typography>
                <Typography>
                  Location: {values.dayCareDetails.location}
                </Typography>
                <Typography>
                  Category: {values.dayCareDetails.category}
                </Typography>
                <Typography>
                  Service Type: {values.dayCareDetails.serviceType}
                </Typography>
              </TableCell>
            </TableRow>

            {/* Procedure List */}
            {values.procedureList.map((procedure, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6" color="secondary">
                      Procedure {index + 1}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>{procedure.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>{procedure.description}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>{procedure.category}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Doctor Name</TableCell>
                  <TableCell>{procedure.doctorName.join(", ")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Empanelment Type</TableCell>
                  <TableCell>{procedure.empanelmentType.join(", ")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Rates Charges</TableCell>
                  <TableCell>{procedure.ratesCharges}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Coordinator Name</TableCell>
                  <TableCell>{procedure.coordinatorName.join(", ")}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}

            {/* Department Incharge */}
            {values.departmentIncharge.map((incharge, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6" color="secondary">
                      Department Incharge {index + 1}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>{incharge.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Extension No</TableCell>
                  <TableCell>{incharge.extensionNo}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Contact No</TableCell>
                  <TableCell>{incharge.contactNo}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Department Name</TableCell>
                  <TableCell>{incharge.departmentName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Time Slot</TableCell>
                  <TableCell>{incharge.timeSlot}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Service Type</TableCell>
                  <TableCell>{incharge.serviceType}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>

        {/* Buttons */}
        <Grid container spacing={2} justifyContent="center" mt={4}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? "Saving Hospital..." : "Submit"}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="secondary" onClick={handleEdit}>
              Edit
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ModalComponent;
