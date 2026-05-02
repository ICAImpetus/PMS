import { useEffect, useState } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Divider,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/HeaderNew";
import { styled } from "@mui/system";
import { nanoid } from "@reduxjs/toolkit";
import EditIcon from "@mui/icons-material/Edit";
import { getDataFunc } from "../../utils/services";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import BreadcrumbNav from "../../components/BroadcrumNav";
import HospitalCards from "../../components/CardsUICom";
import { UserContextHook } from "../../contexts/UserContexts";

const ScrollableForm = styled(Box)({
  width: "100%",
  height: "calc(100vh - 100px)",
  overflowY: "auto",
  padding: "20px",
});

const FormsTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser } = UserContextHook();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, hospitalsResponse] = await Promise.allSettled([
          getDataFunc("getAllUsers"),
          getDataFunc("getAllHospitals"),
        ]);

        let allHospitals = [];
        let hospitalsFromUsers = [];

        // Process getAllUsers
        if (usersResponse.status === "fulfilled" && usersResponse.value.success) {
          const allUsers = usersResponse.value.data;
          const hospitalNamesSet = new Set();

          allUsers.forEach((user) => {
            if (user.hospitalName) {
              const hospitalName = typeof user.hospitalName === "object"
                  ? user.hospitalName.name
                  : user.hospitalName;
              if (hospitalName) hospitalNamesSet.add(hospitalName);
            }
          });

          hospitalsFromUsers = Array.from(hospitalNamesSet).map((hospitalName, index) => ({
              name: hospitalName,
              ID: `user_hospital_${index}`,
              location: "",
              state: "Rajasthan",
              source: "users",
            }));
        }

        // Process getAllHospitals
        if (hospitalsResponse.status === "fulfilled" && hospitalsResponse.value.success) {
          const hospitalsData = hospitalsResponse.value.data;
          const dataWithId = hospitalsData.map((d) => ({ ...d, id: nanoid() }));
          allHospitals = dataWithId.map((d) => ({
            name: d.name,
            ID: d.ID || d._id,
            location: d.city || "",
            state: "Rajasthan",
            source: "api",
          }));
        }

        const combinedHospitals = [...allHospitals];
        hospitalsFromUsers.forEach((userHospital) => {
          const exists = combinedHospitals.some(
            (h) => h.name.toLowerCase().trim() === userHospital.name.toLowerCase().trim()
          );
          if (!exists) combinedHospitals.push(userHospital);
        });

        // Filter Logic
        let finalData = [];
        if (currentUser.type === "superadmin") {
          finalData = combinedHospitals;
        } 
        else if (["admin", "supermanager", "teamLeader"].includes(currentUser.type)) {
          const hospitalsOfUser = currentUser.hospitals;

          finalData = combinedHospitals.filter((d) => {
            const hospitalName = d.name.trim().toLowerCase();
            
            // --- FIX START: Handle both Array and String for hospitalsOfUser ---
            if (Array.isArray(hospitalsOfUser)) {
              // Check if the hospital name exists IN the array
              return hospitalsOfUser.some(
                (h) => h.trim().toLowerCase() === hospitalName
              );
            } else if (typeof hospitalsOfUser === 'string') {
              // Direct string comparison
              return hospitalsOfUser.trim().toLowerCase() === hospitalName;
            }
            return false;
            // --- FIX END ---
          });
        }

        setData(finalData);

        if (usersResponse.status === "fulfilled") toast.success("Users loaded");
        if (hospitalsResponse.status === "fulfilled") toast.success("Hospitals loaded");

      } catch (error) {
        toast.error("Error fetching data: " + error.message);
      }
    };
    fetchData();
  }, [currentUser]);

  return (
    <ScrollableForm>
      <Toaster position="top-right" reverseOrder={false} />
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Header title="Hospital Management" subtitle="Hospitals from API and user data" />
      </Box>
      <Divider sx={{ borderBottomWidth: 2, my: 2 }} />
      <BreadcrumbNav />
      <HospitalCards hospitals={data} isHospital={true} />
    </ScrollableForm>
  );
};

export default FormsTable;