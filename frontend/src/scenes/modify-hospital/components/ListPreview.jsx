import {
    List,
    ListItem,
    ListItemText,
    IconButton,
    colors,
    useTheme,
    Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { tokens } from "../../../theme";

const PreviewList = ({ rows, handleModalOpen }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh", // Full height of the screen
            }}
        >
            <List sx={{
                maxWidth: "600px", // Limit width
                width: "100%", // Ensure it doesn't shrink too much
            }}>
                {rows.map((row, index) => (
                    <ListItem
                        key={row.id}
                        sx={{
                            bgcolor: index % 2 === 0 ? colors.primary[800] : colors.primary[900], // Alternating row colors
                            borderRadius: "8px", // Optional: Rounded corners
                            mb: 1, // Optional: Margin between items
                            boxShadow: 1, // Optional: Adds a slight shadow
                        }}
                        secondaryAction={
                            <IconButton
                                edge="end"
                                color="primary"
                                onClick={() => handleModalOpen(row)}
                            >
                                <EditIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText
                            primary={`${row.key}: ${row.value}`}
                            secondary={`Type: ${row.type}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default PreviewList;
