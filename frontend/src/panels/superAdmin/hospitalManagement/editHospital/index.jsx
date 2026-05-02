import React from "react";
import { useEffect, useState } from "react";
import { tokens } from "../../../../theme";
import Header from "../../../../components/Header.jsx";
import { Toaster, toast } from "react-hot-toast";
import BreadcrumbNav from "../../../../components/BroadcrumNav.jsx";
import { getDataFunc, sendDataApiFunc } from "../../../../utils/services";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { gridClasses, styled } from "@mui/system";
import {
  DataGridStyles,
  DataGridStylesNormal,
} from "../../../../utils/DataGridStyles";
// import {DataGridStyles} from '../../utils/DataGridStyles'
import { oscillateRotation } from "../../../../utils/keyFrameStyles.js";
import LockResetIcon from "@mui/icons-material/LockReset"; // Example import for an icon
import DeleteIcon from "@mui/icons-material/Delete";
import { EditSqureIcon } from "../../../../scenes/svgIcons/icons.jsx";
import AddHospitalData1 from "../hospitalForm/index2.jsx";
import DeleteConfirmationModal from "../../../../components/DeleteConfirmationModal.jsx";

import {
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Modal,
  Typography,
  Button,
} from "@mui/material";
export const ScrollableForm = styled(Box)({
  width: "100%",
  height: "calc(100vh - 100px)", // Adjust height as needed based on your layout
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  padding: "2px 20px 10px 20px", // Top, Right, Bottom, Left
  // Hide scrollbars
  "&::-webkit-scrollbar": {
    display: "none", // Hide scrollbar for WebKit browsers
  },
  scrollbarWidth: "none", // Hide scrollbar for Firefox
  "-ms-overflow-style": "none", // Hide scrollbar for IE/Edge
});
const modalStyle = {
  position: "absolute",
  display: "flex",
  flexDirection: "column",
  //   justifyContent: "center",
  //   alignItems: "center",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: "800px",
  width: "90%", // responsive width
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 3, // moderate padding
};

const EditHopsitalSuperadmin = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Checks for screens below 'sm' breakpoint (600px)
  const [deleteHospitalId, setDeleteHospitalId] = useState(null);
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 15,
    page: 0,
  });
  useEffect(() => {
    // Fetch hospital data
    if (open) return; // Prevent fetching data if modal is not open
    const fetchData = async () => {
      try {
        const response = await getDataFunc("hospitalsBasicInfo");
        // [];
        if (response.success) {
          toast.success(response.message);
          console.log("response.data", response.data);
          setData(response.data);
        } else {
          toast.error(response.message);
          setData([]);
        }
      } catch (error) {
        toast.error("Error fetching hospital data");
      }
    };
    fetchData();
  }, [open]);

  const deleteUser = async () => {
    console.log("Deleting hospital with ID:", deleteHospitalId);
    try {
      const response = await sendDataApiFunc(
        `deleteHospital/${deleteHospitalId}`,
        {},
        "delete",
      );
      if (response.success) {
        toast.success(response.message);
        setDeleteOpen(false);
        setDeleteHospitalId(null); // Reset deleteHospitalId after deletion
        // Optionally, you can refetch the hospital data after deletion
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error deleting hospital");
      setDeleteOpen(false);
      setDeleteHospitalId(null); // Reset deleteHospitalId on error
    }
    setDeleteOpen(false);
  };

  const handleDeleteHospital = async (hospitalId) => {
    console.log("Deleting hospital with ID:", hospitalId);
    setDeleteHospitalId(hospitalId);
    setDeleteOpen(true);
  };

  const handleOpenUpdateModel = (row) => {
    console.log("row data is handleOpenUpdateModal:", row);
    setSelectedHospital(row);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const StyledIconButton = styled(IconButton)(({ bgColor, color }) => ({
    transition: "background-color 0.3s",
    backgroundColor: bgColor, // Initial background color
    color,
    "&:hover": {
      backgroundColor: colors.primary[900], // Background color on hover
      color, // Icon color on hover
      animation: "oscillate 0.5s ease-in-out infinite", // Apply oscillation animation
    },
    "@keyframes oscillate": oscillateRotation,
  }));

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 170 : 170,
      valueGetter: (params) => {
        return params.row?.name || "Na";
      },
    },
    // {
    {
      field: "corporateAddress",
      headerName: "Corporate Address",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 170 : 170,
      valueGetter: (params) => {
        return params.row?.corporateAddress || ""; // Returns corporateAddress or an empty string if not found
      },
    },

    {
      field: "city",
      headerName: "City",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 170 : 170,
      valueGetter: (params) => {
        return params.row?.city || ""; // Returns city or an empty string if not found
      },
    },

    {
      field: "editHospital",
      headerName: "Edit Hospital",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 100 : 150,
      renderCell: (params) => {
        return (
          <StyledIconButton
            onClick={() => handleOpenUpdateModel(params.row)}
            bgColor={colors.secondary[800]}
            color={colors.greenAccent[700]}
          >
            <EditSqureIcon />
          </StyledIconButton>
        );
      },
    },
    // --- New Column for Update Password ---

    {
      field: "deleteHospital",
      headerName: "Delete Hospital",
      flex: isSmallScreen ? undefined : 1,
      width: isSmallScreen ? 100 : 150,
      renderCell: (params) => {
        return (
          <StyledIconButton
            onClick={() => handleDeleteHospital(params.row.ID)}
            bgColor={colors.secondary[800]}
            color={colors.redAccent[500]}
          >
            <DeleteIcon />
          </StyledIconButton>
        );
      },
    },
  ];

  const userDataInTable = data.map((item) => ({
    id: item.ID,
    ID: item.ID,
    ...item, // Spread the rest of the item properties
  }));

  return (
    <ScrollableForm>
      <Box
        display="flex"
        flexDirection={isSmallScreen ? "column" : "row"} // Column for mobile, row for desktop
        alignItems={isSmallScreen ? "flex-start" : "center"} // Adjust alignment for mobile
        justifyContent={isSmallScreen ? "flex-start" : "space-between"} // Adjust spacing for mobile
        gap={isSmallScreen ? 2 : 0} // Add spacing between items for mobile
        // mb={2} // Adds margin below the container
      >
        <Header
          title="Hospital Edit Management"
          subtitle={"Hospitals List in Superadmin Panel For Edit"}
        />
      </Box>
      <Box m="4px 0 0 0" height="80vh" sx={DataGridStyles(colors, theme)}>
        <DataGrid
          rows={userDataInTable}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          style={{ width: "90vh" }} // Set the width to 100% of the container's width
          pageSizeOptions={[15, 25, 50, 100]}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          {/* <Typography variant="h6" component="h2">
            Edit Hospital Basic Detail
          </Typography> */}
          <AddHospitalData1
            initialState={selectedHospital}
            handleClose={handleClose}
          />
        </Box>
      </Modal>
      {/* <BreadcrumbNav/> */}
      {/* <h3>EDIT HOSPITAL</h3> */}
      <DeleteConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteUser}
        title="Confirm Deletion"
        message="Are you sure you want to delete this hospital?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </ScrollableForm>
  );
};

export default EditHopsitalSuperadmin;
