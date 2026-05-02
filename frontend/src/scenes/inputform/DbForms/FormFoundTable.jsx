import { useState } from "react";
import { Box, Typography, useTheme, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
// import { mockDataTeam } from "../../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import EditIcon from '@mui/icons-material/Edit';
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Header from "../../../components/Header";
import { styled } from '@mui/system';
// import DisplayFormData from './FormDataShow'
import DisplayFormData from "./FormDataShow2";
import FormFoundInDb from "./FormFoundInDb";

const ScrollableForm = styled(Box)({
    width: '100%',
    height: 'calc(90vh - 100px)', // Adjust height as needed based on your layout
    overflowY: 'auto',
    padding: '20px',
});

const FoundDbTable = ({
    formData,
    // setFormData,
    setIsFound,
    matchingObjects,
    handleBlur,
    handleChange,
    errors,
    handleSubmit,
    submitted,
    setSubmitted
}) => {
    const [showForm, setShowForm] = useState(false);
    const [formObj, setFormObj] = useState(null);
    const [editForm, setEditForm] = useState(false);

    console.log('formData before is ', formData);

    const handleOpen = () => {
        // setShowData(true);
        setShowForm(true)
        // Optionally, set formObj based on your application logic
    };

    const handleModelClose = () => {
        // setShowData(false);
        setShowForm(false)
        setFormObj(null);
    };

    // Iterate through keys of lastFormData and update propFormData
    const handleChangeHere = () => {
        // Object.keys(matchingObjects[matchingObjects.length - 1]).forEach(key => {
        //     formData[key] = matchingObjects[matchingObjects.length - 1][key];
        // });
        // setFormData(matchingObjects[matchingObjects.length - 1])
    }


    // console.log('formData after is ', formData);
    // for getting date from timeStamp
    const formatDateFromTimestamp = (timestamp) => {
        // Create a new Date object based on the timestamp
        const date = new Date(timestamp);

        // Get the individual components of the date
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero indexed
        const day = ('0' + date.getDate()).slice(-2);
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const seconds = ('0' + date.getSeconds()).slice(-2);

        // Format the date as desired, for example: "YYYY-MM-DD HH:MM:SS"
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        return formattedDate;
    };

    const mainContacts = matchingObjects.map((contact,index) => ({
        id: contact["_id"],
        ...contact,
        createdDate: formatDateFromTimestamp(contact.timeStamp),
        key:index,
    }))
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const hadleShowContact = (id) => {
        console.log('you clicked me with this id :', id);
        const selectedContact = mainContacts.find(contact => contact.id === id);
        console.log('selectedContact is :', selectedContact);
        setShowForm(true)
        setFormObj(selectedContact)
    }

    const handleNewQuery = () => {
        setEditForm(true)
    }


    const columns = [
        {
            field: "patientName",
            headerName: "Patient Name",
            flex: 1,
        },

        // {
        //     field: "patientGender",
        //     headerName: "Gender",
        //     flex: 1,
        // },

        // {
        //     field: "patientAge",
        //     headerName: "Age",
        //     flex: 1,
        // },

        {
            field: "contactNo",
            headerName: "Contact No",
            flex: 1,
        },

        {
            field: "address",
            headerName: "Address",
            flex: 1,
        },
        // {
        //     field: "patientCategory",
        //     headerName: "Payment Method",
        //     flex: 1,
        // },

        {
            field: "illnessType",
            headerName: "Type of Illness",
            flex: 1,
        },
        {
            field: "callPurpose",
            headerName: "Purpose of Calling",
            flex: 1,
        },
        {
            field: "id",
            headerName: "Show Contact",
            flex: 1,
            renderCell: ({ row }) => {
                return (
                    <Box
                        width="50%"
                        m="0 auto"
                        p="2px"
                        title='show'
                        // display="flex"
                        justifyContent="center"
                        // backgroundColor={
                        //     colors.greenAccent[700]
                        // }
                        borderRadius="4px"
                        sx={{ cursor: 'pointer' }}
                    // onClick={handleClick}
                    >
                        {/* {<EditIcon />} */}
                        <IconButton
                            aria-label="toggle visibility"
                            // onClick={handleClick}
                            onClick={() => hadleShowContact(row.id)}
                            sx={{
                                // backgroundColor: colors.blueAccent[700], // Background color of the button
                                borderRadius: '50%', // Makes the button circular
                                padding: '10px', // Adds padding inside the button
                                '&:hover': {
                                    backgroundColor: colors.greenAccent[400], // Background color on hover
                                    // backgroundColor: colors.blueAccent[700],
                                    color: 'rgb(17 24 39)'
                                },
                            }}
                        >
                            <VisibilityIcon
                                sx={{
                                    fontSize: '24px', // Icon size
                                    // color: 'rgb(17 24 39)', // Icon color
                                }}
                            />
                        </IconButton>
                        {/* <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
                            {''}
                        </Typography> */}
                    </Box>
                );
            },
        },
        // {
        //     field: "createdDate",
        //     headerName: "Contact Creation Date",
        //     flex: 1,
        // },
    ];



    return (
        <>
            {/* // <Box m="20px"> */}
            {(/*!showForm && */!editForm) &&
                (<ScrollableForm>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Header title="" subtitle="Available Contacts with same Number" />
                        <Box display="flex" justifyContent="end" mt="20px">
                            <Button
                                type="submit"
                                color="secondary"
                                variant="contained"
                                onClick={handleNewQuery}
                            >
                                Add New Query
                            </Button>
                        </Box>
                    </Box>
                    <Box
                        m="0 0 0 0"
                        height="75vh"
                        sx={{
                            "& .MuiDataGrid-root": {
                                border: "none",
                            },
                            "& .MuiDataGrid-cell": {
                                // borderBottom: "none",
                                whiteSpace: 'nowrap', // Prevent text wrapping in cells
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            },
                            "& .name-column--cell": {
                                color: colors.greenAccent[300],
                            },
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: colors.blueAccent[700],
                                borderBottom: "none",
                            },
                            "& .MuiDataGrid-virtualScroller": {
                                backgroundColor: colors.primary[900],
                            },
                            "& .MuiDataGrid-footerContainer": {
                                borderTop: "none",
                                backgroundColor: colors.blueAccent[700],
                            },
                            "& .MuiCheckbox-root": {
                                color: `${colors.greenAccent[200]} !important`,
                            },
                            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                                color: `${colors.grey[100]} !important`,
                                border: 'none'
                            },
                        }}
                    >
                        <DataGrid
                            checkboxSelection
                            rows={mainContacts}
                            columns={columns}
                            components={{ Toolbar: GridToolbar }}
                        />
                    </Box>
                    {/* </Box> */}
                    {/* <Box display="flex" justifyContent="end" mt="20px">
                    <Button type="submit" color="secondary" variant="contained">
                        Add New Query
                    </Button>
                </Box> */}
                    {/* </Box> */}
                </ScrollableForm>)}

            {(showForm /*&& !editForm*/) && (
                // <></>
                // <DisplayFormData
                //     formData={formObj}
                //     setShowData={setShowForm}
                //     setFormObj={setFormObj}
                // />
                <DisplayFormData
                    mainArray={mainContacts}
                    formData={formObj}
                    setShowData={setShowForm}
                    setFormObj={setFormObj}
                    // open={showData}
                    open={showForm}
                    handleClose={handleModelClose}
                />
            )}

            {editForm && (
                <ScrollableForm>
                    <FormFoundInDb
                        setIsFound={setIsFound}
                        formData={mainContacts[mainContacts.length - 1]}
                        submitted={submitted}
                        setSubmitted={setSubmitted}
                    />
                </ScrollableForm>
            )}
        </>
    );
};

export default FoundDbTable;
