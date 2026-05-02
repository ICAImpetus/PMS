import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Box,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

// import hospitalImage from '../../public/medicine.png';

import hospitalImg from "../../src/assets/hospitalPlus.png";

export default function HospitalCard({
  hostpitalData,

  navigationFunction = () => {},

  avatarIcon = "",
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const open = Boolean(anchorEl);

  const [data, setData] = useState({});

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    // console.log(hostpitalData);

    // navigationFunction(hostpitalData);

    setData(hostpitalData);
  }, [hostpitalData]);

  const { name, location, state } = data;

  return (
    <Card
      sx={{
        // width: 200,

        height: 180,

        borderRadius: 3,

        margin: 2,

        boxShadow: 3,

        p: 1,

        position: "relative",

        cursor: "pointer",

        transition: "transform 0.2s ease",

        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
      onClick={() => navigationFunction(hostpitalData)}
    >
      {/* Three-dot menu */}

      {/* <Box sx={{ position: "absolute", top: 4, right: 4 }}>

        <IconButton

          size="small"

          onClick={(e) => {

            e.stopPropagation(); // ⛔ Prevent card click

            handleClick(e);

          }}

        >

          <MoreVertIcon fontSize="small" />

        </IconButton>

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}> */}

      {/* <MenuItem

            onClick={(e) => {

              e.stopPropagation();

              handleClose();

              console.log("Edit clicked");

            }}

          >

            Edit

          </MenuItem> */}

      {/* <MenuItem

            onClick={(e) => {

              e.stopPropagation();

              handleClose();

              console.log("Delete clicked");

            }}

          >

            Delete

          </MenuItem>

        </Menu>

      </Box> */}

      {/* Green dot */}

      <FiberManualRecordIcon
        fontSize="small"
        sx={{
          position: "absolute",

          top: 8,

          left: 8,

          color: "green",

          fontSize: 12,
        }}
      />

      {/* Image */}

      <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
        <Avatar
          src={avatarIcon}
          alt={name}
          sx={{ width: 56, height: 56, border: "2px solid #2196f3" }}
        />
      </Box>

      {/* Text content */}

      <CardContent sx={{ textAlign: "center", p: 1 }}>
        <Typography fontWeight="600" variant="body1">
          {name}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {location}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {state}
        </Typography>
      </CardContent>
    </Card>
  );
}
