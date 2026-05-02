import { useEffect, useState, useReducer } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Modal, Box, TextField, Button, useTheme, Badge, useMediaQuery, Tooltip, CircularProgress, IconButton } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { gridClasses, styled } from '@mui/system';
import { nanoid } from "@reduxjs/toolkit";
import EditIcon from '@mui/icons-material/Edit';
import { getDataFunc } from "../../utils/services";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DataGridStyles } from "../outboundForm/DataGridStyles";
import { UserContextHook } from "../../contexts/UserContexts";
import { getTableArrayFunc } from "./utilityFuncs.js";
import BranchForm from "./components/Branhes.jsx";
import { ModalContainer } from "./ModalContainer.jsx";
import { Formik, Field, FieldArray, Form } from 'formik';
import CodeAnnouncementForm from "./components/CodeAnnouncements.jsx";



const ScrollableForm = styled(Box)({
    width: '100%',
    height: 'calc(100vh - 100px)', // Adjust height as needed based on your layout
    overflowY: 'auto',
    padding: '20px',
});

const initialState = {
    hospital: '',
    branches: [],
    codeAnnouncements: [],
    departments: [],
    empanelmentList: [],
    testLabs: [],
    ipdDetails: {},
    dayCareDetails: {},
    procedureList: [],
    departmentIncharge: [],
    tableRowArray: [],
};

const hospitalReducer = (state, action) => {
    switch (action.type) {
        case "SET_HOSPITAL":
            return { ...state, hospital: action.payload };
        case "SET_BRANCHES":
            return { ...state, branches: action.payload };
        case "SET_CODE_ANNOUNCEMENTS":
            return { ...state, codeAnnouncements: action.payload };
        case "SET_DEPARTMENTS":
            return { ...state, departments: action.payload };
        case "SET_EMPANELMENT_LIST":
            return { ...state, empanelmentList: action.payload };
        case "SET_TEST_LABS":
            return { ...state, testLabs: action.payload };
        case "SET_IPD_DETAILS":
            return { ...state, ipdDetails: action.payload };
        case "SET_DAY_CARE_DETAILS":
            return { ...state, dayCareDetails: action.payload };
        case "SET_PROCEDURES":
            return { ...state, procedureList: action.payload };
        case "SET_DEPARTMENT_INCHARGE":
            return { ...state, departmentIncharge: action.payload };
        case "SET_TABLE_ROW_ARRAY":
            return { ...state, tableRowArray: action.payload };
        default:
            return state;
    }
};

const HospitalData = () => {
    const { currentUser } = UserContextHook();
    const hospitalName = currentUser?.nameOfHospital;
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [data, setData] = useState({});
    const navigate = useNavigate();
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 15,
        page: 0,
    });
    const [isTable, setIsTable] = useState(true);
    // const [hospital, setHospital] = useState('');
    // const [branches, setBranches] = useState({ branches: [] });
    // const [codeAnnouncements, setCodeAnnouncements] = useState({ codeAnnouncements: [] });
    // const [departments, setDepartments] = useState({ departments: [] });
    // const [empanelmentList, setEmpanelmentList] = useState({ empanelmentList: [] });
    // const [testLabs, setTestLabs] = useState({ testLabs: [] });
    // const [ipdDetails, setIpdDetails] = useState({ ipdDetails: {} });
    // const [dayCareDetails, setDayCareDetails] = useState({ dayCareDetails: {} });
    // const [procedures, setProcedures] = useState({ empanelmentList: [] });
    // const [departmentIncharge, setDepartmentIncharge] = useState({ departmentIncharge: [] });
    const [state, dispatch] = useReducer(hospitalReducer, initialState);
    // * state of the table row array
    const [tableRowArray, setTableRowArray] = useState([])
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Checks for screens below'sm' breakpoint (600px)
    const [branchesOpen, setBranchesOpen] = useState(false); //
    const [codeAnnouncementsOpen, setCodeAnnouncementsOpen] = useState(false);
    const [departmentsOpen, setDepartmentsOpen] = useState(false);
    const [empanelmentListOpen, setEmpanelmentListOpen] = useState(false);
    const [testLabsOpen, setTestLabsOpen] = useState(false);
    const [ipdDetailsOpen, setIpdDetailsOpen] = useState(false);
    const [dayCareDetailsOpen, setDayCareDetailsOpen] = useState(false);
    const [proceduresOpen, setProceduresOpen] = useState(false);
    const [departmentInchargeOpen, setDepartmentInchargeOpen] = useState(false);

    const handleModalOpen = (rowdata) => {
        console.log('rowData is :', rowdata);
        const key = rowdata?.key;

        switch (key) {
            case "branches":
                setBranchesOpen(true);
                break;
            case "codeAnnouncements":
                setCodeAnnouncementsOpen(true);
                break;
            case "departments":
                setDepartmentsOpen(true);
                break;
            case "empanelmentList":
                setEmpanelmentListOpen(true);
                break;
            case "testLabs":
                setTestLabsOpen(true);
                break;
            case "ipdDetails":
                setIpdDetailsOpen(true);
                break;
            case "dayCareDetails":
                setDayCareDetailsOpen(true);
                break;
            case "procedureList":
                setProceduresOpen(true);
                break;
            case "departmentIncharge":
                setDepartmentInchargeOpen(true);
                break;
            default:
                console.log('No matching key found in state');
                break;
        }
    };


    const handleModalClose = (modalName) => {
        switch (modalName) {
            case "branches":
                setBranchesOpen(false);
                break;
            case "codeAnnouncements":
                setCodeAnnouncementsOpen(false);
                break;
            default:
                break;
        }
    };

    const saveBranch = (values) => {
        console.log('values In saveBranch func are :', values);
        dispatch({ type: "SET_BRANCHES", payload: values.branches })
        handleModalClose('branches')
    }
    const saveCodeAnnouncement = (values) => {
        console.log('values In saveCodeAnnouncement func are :', values);
        dispatch({ type: "SET_CODE_ANNOUNCEMENTS", payload: values.codeAnnouncements })
        handleModalClose('codeAnnouncements')
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getDataFunc(`getHospitalByName/${hospitalName}`);
                if (response.success) {
                    toast.success(response.message);
                    const data = response.data;
                    console.log("Hospital data fetched....", data);

                    dispatch({ type: "SET_HOSPITAL", payload: data.name });
                    dispatch({ type: "SET_BRANCHES", payload: data.branches });
                    dispatch({ type: "SET_CODE_ANNOUNCEMENTS", payload: data.codeAnnouncements });
                    dispatch({ type: "SET_DEPARTMENTS", payload: data.departments });
                    dispatch({ type: "SET_EMPANELMENT_LIST", payload: data.empanelmentList });
                    dispatch({ type: "SET_TEST_LABS", payload: data.testLabs });
                    dispatch({ type: "SET_IPD_DETAILS", payload: data.ipdDetails });
                    dispatch({ type: "SET_DAY_CARE_DETAILS", payload: data.dayCareDetails });
                    dispatch({ type: "SET_PROCEDURES", payload: data.procedureList });
                    dispatch({ type: "SET_DEPARTMENT_INCHARGE", payload: data.departmentIncharge });

                    const dataArray = getTableArrayFunc({
                        hospital: data.name,
                        branches: data.branches,
                        codeAnnouncements: data.codeAnnouncements,
                        departments: data.departments,
                        empanelmentList: data.empanelmentList,
                        testLabs: data.testLabs,
                        ipdDetails: data.ipdDetails,
                        dayCareDetails: data.dayCareDetails,
                        procedures: data.procedureList,
                        departmentIncharge: data.departmentIncharge
                    });

                    dataArray.forEach(obj => { obj.id = nanoid(); });

                    // dispatch({ type: "SET_TABLE_ROW_ARRAY", payload: dataArray });
                    setTableRowArray(dataArray);
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                toast.error("Error fetching data: " + error.message);
            }
        };

        if (hospitalName) {
            fetchData();
        }
    }, [hospitalName]);
    //  Added dependency

    useEffect(() => {
        console.log('state is :', state);
        const dataArray = getTableArrayFunc({
            hospital: state.hospital,
            branches: state.branches,
            codeAnnouncements: state.codeAnnouncements,
            departments: state.departments,
            empanelmentList: state.empanelmentList,
            testLabs: state.testLabs,
            ipdDetails: state.ipdDetails,
            dayCareDetails: state.dayCareDetails,
            procedures: state.procedureList,
            departmentIncharge: state.departmentIncharge
        });

        dataArray.forEach(obj => { obj.id = nanoid(); });

        // dispatch({ type: "SET_TABLE_ROW_ARRAY", payload: dataArray });
        setTableRowArray(dataArray);
        console.log("table row array", tableRowArray);
    }, [state, branchesOpen])

    const columns = [
        {
            field: "key",
            headerName: "Key Name",
            flex: isSmallScreen ? undefined : 1,
            width: isSmallScreen ? 100 : 130,
            valueGetter: (params) => {
                return params.row?.key;
            }
        },
        {
            field: "value",
            headerName: "Value",
            flex: isSmallScreen ? undefined : 1,
            width: isSmallScreen ? 100 : 130,
            valueGetter: (params) => {
                return params.row?.value;
            }
        },
        {
            field: "type",
            headerName: "Type",
            flex: isSmallScreen ? undefined : 1,
            width: isSmallScreen ? 100 : 130,
            valueGetter: (params) => {
                return params.row?.type;
            }
        },


        {
            field: "edit",
            headerName: "Edit",
            flex: isSmallScreen ? undefined : 1,
            width: isSmallScreen ? 100 : 100,
            renderCell: (params) => (
                <IconButton
                    color="primary"
                    onClick={() => handleModalOpen(params.row)}
                >
                    <EditIcon />
                </IconButton>
            )
        },



    ];

    return (
        <Formik
            initialValues={state}
            onSubmit={(values) => {
                dispatch({ type: 'SET_BRANCHES', payload: values.branches });
                dispatch({ type: 'SET_CODE_ANNOUNCEMENTS', payload: values.codeAnnouncements });
                dispatch({ type: 'SET_DEPARTMENTS', payload: values.departments });
                dispatch({ type: 'SET_EMPANELMENT_LIST', payload: values.empanelmentList });
            }}
        >
            {({ values, handleChange, handleSubmit }) => (
                <ScrollableForm>
                    <Toaster position="top-right" reverseOrder={false} />
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Header
                            title="Hospital Sections"
                            subtitle="List of Hospital Sections"
                        />
                    </Box>
                    <Box
                        m="8px 0 0 0"
                        height="75vh"
                        sx={{ /* Add your DataGrid styles here */ }}
                    >
                        {isTable && (
                            <DataGrid
                                rows={tableRowArray}
                                columns={columns}
                                paginationModel={paginationModel}
                                onPaginationModelChange={setPaginationModel}
                                sx={{ width: '100%' }}
                                pageSizeOptions={[15, 25, 50, 100]}
                                slots={{ toolbar: GridToolbar }}
                            />
                        )}

                        {/* Modal for Branches */}
                        <Modal
                            open={branchesOpen}
                            onClose={() => handleModalClose("branches")}
                            aria-labelledby="modal-title"
                            aria-describedby="modal-description"
                        >
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                // position="fixed"
                                // top={0}
                                // left={0}
                                // width="70vw"
                                // height="vh"
                                bgcolor="rgba(0, 0, 0, 0.5)" // Semi-transparent background
                            >
                                <FieldArray
                                    name="branches"
                                    render={({ push, remove }) => (


                                        <Box
                                            sx={{
                                                backgroundColor: colors.primary[800], // Change as needed
                                                padding: 3,
                                                borderRadius: 2,
                                                boxShadow: 3,
                                                width: "600px",
                                                maxWidth: "90vw",
                                                maxHeight: "80vh",
                                                overflowY: "auto",
                                                display: "flex",
                                                flexDirection: "column",
                                                marginTop: 4
                                            }}
                                        >
                                            {values.branches.map((branch, index) => (
                                                <Box key={index} mb={3}>
                                                    <BranchForm
                                                        branch={branch}
                                                        index={index}
                                                        handleChange={handleChange}
                                                        removeBranch={() => remove(index)} // Remove branch
                                                        onExit={() => handleModalClose('branches')}
                                                        onSubmit={() => saveBranch(values)}
                                                    />
                                                </Box>
                                            ))}
                                            <Box display="flex" justifyContent="space-between" mt={2}>
                                                {/* Exit button */}
                                                <Button onClick={() => handleModalClose('branches')} variant="outlined" color="error">
                                                    Exit
                                                </Button>

                                                <Button
                                                    onClick={() =>
                                                        push({
                                                            name: '',
                                                            location: '',
                                                            contactNumbers: [''],
                                                            code: '',
                                                            beds: ''
                                                        })
                                                    }
                                                    color="secondary"
                                                    variant="outlined"
                                                >
                                                    Add Branch
                                                </Button>

                                                {/* Submit Button */}
                                                <Button onClick={() => saveBranch(values)} variant="contained" color="primary">
                                                    Save
                                                </Button>

                                            </Box>
                                        </Box>

                                    )}
                                />
                            </Box>
                        </Modal>

                        {/* Modal for Code Announcements */}
                        <Modal
                            open={codeAnnouncementsOpen}
                            onClose={() => handleModalClose("codeAnnouncements")}
                            aria-labelledby="modal-title"
                            aria-describedby="modal-description"
                        >
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                // position="fixed"
                                // top={0}
                                // left={0}
                                // width="70vw"
                                // height="vh"
                                bgcolor="rgba(0, 0, 0, 0.5)" // Semi-transparent background
                            >
                                <FieldArray
                                    name="codeAnnouncements"
                                    render={({ push, remove }) => (


                                        <Box
                                            sx={{
                                                backgroundColor: colors.primary[800], // Change as needed
                                                padding: 3,
                                                borderRadius: 2,
                                                boxShadow: 3,
                                                width: "600px",
                                                maxWidth: "90vw",
                                                maxHeight: "80vh",
                                                overflowY: "auto",
                                                display: "flex",
                                                flexDirection: "column",
                                                marginTop: 4
                                            }}
                                        >
                                            {values.codeAnnouncements.map((codeAnnouncement, index) => (
                                                <Box key={index} mb={3}>
                                                    <CodeAnnouncementForm
                                                        codeAnnouncement={codeAnnouncement}
                                                        index={index}
                                                        handleChange={handleChange}
                                                        removeCodeAnnouncement={() => remove(index)} // Remove branch
                                                    />
                                                </Box>
                                            ))}
                                            <Box display="flex" justifyContent="space-between" mt={2}>
                                                {/* Exit button */}
                                                <Button onClick={() => handleModalClose('codeAnnouncements')} variant="outlined" color="error">
                                                    Exit
                                                </Button>

                                                <Button onClick={() => push({
                                                    name: '',
                                                    color: '',
                                                    description: '',
                                                    concernedPerson: '',
                                                    staff: [{ name: '', shift: '', contactNo: '' }],
                                                    shortCode: '',
                                                    timeAvailability: '',
                                                    enabled: false
                                                })} variant="outlined" color="secondary">
                                                    Add Code Announcement
                                                </Button>

                                                {/* Submit Button */}
                                                <Button onClick={() => saveCodeAnnouncement(values)} variant="contained" color="primary">
                                                    Save
                                                </Button>

                                            </Box>
                                        </Box>

                                    )}
                                />
                            </Box>
                        </Modal>
                    </Box>
                </ScrollableForm>
            )}
        </Formik>
    );
};
export default HospitalData;