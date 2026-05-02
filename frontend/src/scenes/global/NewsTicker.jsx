import { Box, Typography, Avatar } from "@mui/material";
import HospitalIcon from "../../../src/assets/hospitalIcon.png";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export const NewsTicker = ({ currentUser }) => {


  if (currentUser?.type?.includes("admin")) return null;




  const hospital = currentUser?.hospitals?.[0]
  const hospitalName = hospital?.name || "Hospital";
  const hospitalAddress = hospital?.hospitalId?.corporateAddress || "Corporate Address";
  const hospitallogo = hospital?.hospitalId?.hospitallogo || null

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        // justifyContent: "center",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 0.7,
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 0.07)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        {/* Hospital Icon */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px",
          }}
        >
          <Avatar
            src={hospitallogo || undefined}
            alt="Hospital Logo"
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              bgcolor: "#fff",
              "& img": {
                objectFit: "contain",
                padding: "4px",
              },
            }}
          />
        </Box>

        {/* Divider Line */}
        <Box
          sx={{
            width: "1px",
            height: "30px",
            background: "rgba(255,255,255,0.2)",
            flexShrink: 0,
          }}
        />

        {/* Hospital Name + Address */}
        <Box sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Typography
            sx={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.3px",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {hospitalName}
          </Typography>

          {hospitalAddress && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, mt: 0.1 }}>
              <LocationOnIcon sx={{ fontSize: 10, color: "rgba(255,255,255,0.5)", flexShrink: 0 }} />
              <Typography
                sx={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.5)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  letterSpacing: "0.2px",
                }}
              >
                {hospitalAddress}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};