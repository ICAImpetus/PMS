import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  Box,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
// import { tokens } from "../../../../theme";
import { styled } from "@mui/material/styles";
import Header from "../../../../components/HeaderNew";
import AddHeader from "../../../../components/AddHeader";
import BreadcrumbNav from "../../../../components/BroadcrumNav";
// import { nanoid } from "@reduxjs/toolkit";
import { Toaster, toast } from "react-hot-toast";
import AddHospitalData1 from "./index2";
import HospitalCards from "../../../../components/CardsUICom"; //  Ensure this path points to your CardsUICom
// import AssignAdminModal from "./AssignAdminModel"; //  Import the Modal
// import { getDataFunc } from "../../../../utils/services";
// import { UserContextHook } from "../../../../contexts/UserContexts";
import { useNavigate } from "react-router-dom";
// import { useApi } from "../../../../api/useApi";
// import { superAdminRoutes } from "../../../../api/apiService";
import SearchIcon from "@mui/icons-material/Search";
import HospitalContext from "../../../../contexts/HospitalContexts";

const ScrollableForm = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "calc(100vh - 180px)",
  overflowY: "auto",
  padding: theme.spacing(3),
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-track": {
    background: "#f4f6fb",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.primary.main,
    borderRadius: "10px",
  },
}));

const modalStyle = (theme) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "900px",
  maxHeight: "90vh",
  bgcolor: "background.paper",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[5],
  p: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  "&:focus-visible": { outline: "none" },
});

const HospitalCreationNew = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null)
  const navigate = useNavigate();

  const {
    loading,
    hospitals,
    isSuperAdmin,
    role,
    setHospitals,
    errors,
    selectedHostpital,
    pagination,
    setPagination,
  } = useContext(HospitalContext);

  const handleOpenAdd = () => {
    setSelectedHospital(null);
    setOpen(true);
  };
  const handleEditHospital = (hospital) => {
    setSelectedHospital(hospital);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedHospital(null);
  };


  // Filter hospitals based on search term
  const filteredHospitals = hospitals?.filter((hospital) =>
    hospital?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading?.hospitalLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <ScrollableForm>
      <Toaster position="top-right" />
      <Box
        display="flex"
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        flexDirection={{ xs: "column", md: "row" }}
        gap={2}
      >
        <Header
          title={isSuperAdmin ? "Create" : "Manage"}
          subtitle="Hospitals"
        />
        {isSuperAdmin && (
          <Box
            display="flex"
            gap={2}
            alignItems="center"
            width={{ xs: "100%", md: "auto" }}
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <TextField
              placeholder="Search by hospital name..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: "250px" } }}
            />
            <Box
              sx={{
                width: { xs: "100%", sm: "auto" },
                transition: "all 0.1s ease",
                boxShadow: "0 4px 0 rgba(0,0,0,0.2)",

                "&:hover": {
                  boxShadow: "0 6px 0 rgba(0,0,0,0.2)",
                },

                "&:active": {
                  transform: "translateY(3px)",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.2)",
                }
              }}
            >
              <AddHeader text="Add Hospital" onClick={handleOpenAdd} />
            </Box>
          </Box>
        )}
      </Box>
      <Divider sx={{ borderBottomWidth: 2, my: 2 }} />
      <BreadcrumbNav />
      <Divider sx={{ borderBottomWidth: 2, my: 2 }} />

      {/*  Hospital Cards with Assign Logic */}
      <HospitalCards
        hospitals={filteredHospitals}
        userRole={role}
        onEdit={handleEditHospital}
        onManageBranches={(hospital) =>
          navigate(`/hospital-management/edit-branches/${hospital._id}`, {
            state: {
              hospital: {
                name: hospital?.name,
                hospitalCode: hospital?.hospitalCode,
                contact: hospital?.contact,
                hospitallogo: hospital?.hospitallogo


              }
            }
          })
        }
      // onAssignUser={handleOpenAssign} // Pass function to open modal
      // onRemoveUser={handleRemoveUser}
      />

      {/* Add/Edit Hospital Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle(theme)}>
          <AddHospitalData1
            initialState={selectedHospital}
            setData={setHospitals}
            handleClose={handleClose}
          />
        </Box>
      </Modal>

      {/*  Assign Admin Popup Modal */}
      {/* <AssignAdminModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleAssignAdmins}
        hospitalName={targetHospital?.name || ""}
      /> */}
    </ScrollableForm >
  );
};

export default HospitalCreationNew;
