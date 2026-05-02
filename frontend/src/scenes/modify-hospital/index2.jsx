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
// import { DataGridStyles } from "../outboundForm/DataGridStyles";
import { UserContextHook } from "../../contexts/UserContexts";
import { getTableArrayFunc } from "./utilityFuncs.js";
import BranchForm from "./components/BranchesNew.jsx";
import { ModalContainer } from "./ModalContainer.jsx";
import { Formik, Field, FieldArray, Form } from 'formik';
import CodeAnnouncementForm from "./components/CodeAnnouncementNew.jsx";
import DepartmentForm from "./components/Departments.jsx";
import EmpanelmentListForm from "./components/Emapanentlist.jsx";
import TestLabDialog from "./components/TestLabs.jsx";
import ProcedureListDialog from "./components/ProcedureList.jsx";
import DepartmentInchargeForm from "./components/DepartmentIncharge.jsx";
import IPDDetailsForm from "./components/IpdDetial.jsx";
import DayCareDetailsForm from "./components/DaycareDetail.jsx";
import PreviewList from "./components/ListPreview.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import { sendDataApiFunc } from "../../utils/services";
import PreviewCards from "./components/PreviewCards.jsx";
import DepartmentDialog from "./components/DepartmentsModified.jsx";



const ScrollableForm = styled(Box)({
    width: '100%',
    height: 'calc(100vh - 100px)', // Adjust height as needed based on your layout
    overflowY: 'auto',
    padding: '20px',
});

const initialState = {
    trimmedName: "",
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
        case "SET_TRIMMED_NAME":
            return { ...state, trimmedName: action.payload };
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
    const [dataFetched, setDataFetched] = useState(false);
    const [fetchErrorMsg, setFetchErrorMsg] = useState("");
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
        console.log('key is :', key);

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
            case "departments":
                setDepartmentsOpen(false);
                break;
            case "empanelmentList":
                setEmpanelmentListOpen(false);
                break;
            case "testLabs":
                setTestLabsOpen(false);
                break;
            case "ipdDetails":
                setIpdDetailsOpen(false);
                break;
            case "dayCareDetails":
                setDayCareDetailsOpen(false);
                break;
            case "procedureList":
                setProceduresOpen(false);
                break;
            case "departmentIncharge":
                setDepartmentInchargeOpen(false);
                break;
            default:
                break;
        }
    };

    const saveBranch = async (values) => {
        console.log('values In saveBranch func are :', values);
        dispatch({ type: "SET_BRANCHES", payload: values })
        const sendingObject = { trimmedName: state?.trimmedName, branches: values, keyToUpdate: "branches" }
        const response = await sendDataApiFunc('updateHospitals', sendingObject, 'post');
        if (response.success) {
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }

        // handleModalClose('branches')
    }
    const saveCodeAnnouncement = async (values) => {
        console.log('values In saveCodeAnnouncement func are :', values);
        dispatch({ type: "SET_CODE_ANNOUNCEMENTS", payload: values })
        const sendingObject = { trimmedName: state?.trimmedName, codeAnnouncements: values, keyToUpdate: "codeAnnouncements" };
        const response = await sendDataApiFunc('updateHospitals', sendingObject, 'post');
        if (response.success) {
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
        // handleModalClose('codeAnnouncements')
    }
    const saveDepartment = async (values) => {
        console.log('values In saveDepartment func are :', values);
        dispatch({ type: "SET_DEPARTMENTS", payload: values })
        // handleModalClose('departments')
        const sendingObject = { trimmedName: state?.trimmedName, departments: values, keyToUpdate: "departments" };
        const response = await sendDataApiFunc('updateHospitals', sendingObject, 'post');
        if (response.success) {
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
    }

    const saveEmpanelmentList = async (values) => {
        console.log('values In saveEmpanelmentList func are :', values);
        dispatch({ type: "SET_EMPANELMENT_LIST", payload: values });
        // handleModalClose('empanelmentList')
        const sendingObject = { trimmedName: state?.trimmedName, empanelmentList: values, keyToUpdate: "empanelmentList" };
        const response = await sendDataApiFunc('updateHospitals', sendingObject, 'post');
        if (response.success) {
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
    }

    const saveTestLabs = async (values) => {
        console.log('values In saveTestLabs func are :', values);
        dispatch({ type: "SET_TEST_LABS", payload: values })
        // handleModalClose('testLabs')
        const sendingObject = { trimmedName: state?.trimmedName, testLabs: values, keyToUpdate: "testLabs" };
        const response = await sendDataApiFunc('updateHospitals', sendingObject, 'post');
        if (response.success) {
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
    }

    const saveIpdDetails = async (values) => {
        console.log('values In saveIpdDetails func are :', values);
        dispatch({ type: "SET_IPD_DETAILS", payload: values })
        // handleModalClose('ipdDetails')
        const sendingObject = { trimmedName: state?.trimmedName, ipdDetails: values, keyToUpdate: "ipdDetails" };
        const response = await sendDataApiFunc('updateHospitals', sendingObject, 'post');
        if (response.success) {
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
    }

    const saveDayCareDetails = async (values) => {
        console.log('values In saveDayCareDetails func are :', values);
        dispatch({ type: "SET_DAY_CARE_DETAILS", payload: values })
        // handleModalClose('dayCareDetails')
        const sendingObject = { trimmedName: state?.trimmedName, dayCareDetails: values, keyToUpdate: "dayCareDetails" };
        const response = await sendDataApiFunc('updateHospitals', sendingObject, 'post');
        if (response.success) {
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
    }

    const saveProcedures = async (values) => {
        console.log('values In saveProcedures func are :', values);
        dispatch({ type: "SET_PROCEDURES", payload: values })
        // handleModalClose('procedures')
        const sendingObject = { trimmedName: state?.trimmedName, procedureList: values, keyToUpdate: "procedureList" };
        const response = await sendDataApiFunc('updateHospitals', sendingObject, 'post');
        if (response.success) {
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
    }

    const saveDepartmentIncharge = async (values) => {
        console.log('values In saveDepartmentIncharge func are :', values);
        dispatch({ type: "SET_DEPARTMENT_INCHARGE", payload: values })
        // handleModalClose('departmentIncharge')
        const sendingObject = { trimmedName: state?.trimmedName, departmentIncharge: values, keyToUpdate: "departmentIncharge" };
        const response = await sendDataApiFunc('updateHospitals', sendingObject, 'post');
        if (response.success) {
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
    }



    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getDataFunc(`getHospitalByName/${hospitalName}`);
                if (response.success) {
                    toast.success(response.message);
                    const data = response.data;
                    console.log("Hospital data fetched....", data);
                    dispatch({
                        type: 'SET_TRIMMED_NAME', payload: data.trimmedName
                    })
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
                        procedureList: data.procedureList,
                        departmentIncharge: data.departmentIncharge
                    });
                    console.log("dataArray in ", dataArray);

                    dataArray.forEach(obj => { obj.id = nanoid(); });

                    // dispatch({ type: "SET_TABLE_ROW_ARRAY", payload: dataArray });
                    setTableRowArray(dataArray);
                    setDataFetched(true);
                } else {
                    toast.error(response.message);
                    setFetchErrorMsg(response.message)
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
            procedureList: state.procedureList,
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

        <ScrollableForm>
            <Toaster position="top-right" reverseOrder={false} />
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <Header
                    // title="Hospital Sections"
                    title={hospitalName}
                    subtitle="List of Hospital Sections"
                />
            </Box>
            <Box
                m="8px 0 0 0"
                height="75vh"
                sx={{ /* Add your DataGrid styles here */ }}
            >
                {isTable && dataFetched && (
                    // <DataGrid
                    //     rows={tableRowArray}
                    //     columns={columns}
                    //     paginationModel={paginationModel}
                    //     onPaginationModelChange={setPaginationModel}
                    //     sx={{ width: '100%' }}
                    //     pageSizeOptions={[15, 25, 50, 100]}
                    //     slots={{ toolbar: GridToolbar }}
                    // />
                    // <PreviewList
                    //     rows={tableRowArray}
                    //     handleModalOpen={handleModalOpen}
                    // />
                    <PreviewCards
                        rows={tableRowArray}
                        handleModalOpen={handleModalOpen}
                    />
                )}

                {!dataFetched && <ErrorMessage message={fetchErrorMsg} />}


                {/* {state.branches.map((branch, index) => ( */}
                <Box mb={3}>
                    <BranchForm
                        open={branchesOpen}
                        onClose={() => handleModalClose("branches")}
                        onSave={saveBranch}
                        initialValues={state?.branches}
                        colors={colors}

                    />
                </Box>

                <Box mb={3}>
                    <CodeAnnouncementForm
                        open={codeAnnouncementsOpen}
                        onClose={() => handleModalClose("codeAnnouncements")}
                        onSave={saveCodeAnnouncement}
                        initialValues={state?.codeAnnouncements}
                        colors={colors}

                    />
                </Box>

                <Box mb={3}>
                    {/* <DepartmentForm
                        open={departmentsOpen}
                        onClose={() => handleModalClose("departments")}
                        onSave={saveDepartment}
                        initialValues={state?.departments}
                        colors={colors}
                    /> */}
                    <DepartmentDialog
                        open={departmentsOpen}
                        onClose={() => handleModalClose("departments")}
                        onSave={saveDepartment}
                        initialValues={state?.departments}
                        colors={colors}
                    />
                </Box>

                <Box mb={3}>
                    <EmpanelmentListForm
                        open={empanelmentListOpen}
                        onClose={() => handleModalClose("empanelmentList")}
                        onSave={saveEmpanelmentList}
                        initialValues={state?.empanelmentList}
                        colors={colors}
                    />
                </Box>

                <Box mb={3}>
                    <TestLabDialog
                        open={testLabsOpen}
                        onClose={() => handleModalClose("testLabs")}
                        onSave={saveTestLabs}
                        initialValues={state?.testLabs}
                        colors={colors}
                    />
                </Box>

                <Box mb={3}>
                    <ProcedureListDialog
                        open={proceduresOpen}
                        onClose={() => handleModalClose("procedureList")}
                        onSave={saveProcedures}
                        initialValues={state?.procedureList}
                        colors={colors}
                    />
                </Box>

                <Box mb={3}>
                    <DepartmentInchargeForm
                        open={departmentInchargeOpen}
                        onClose={() => handleModalClose("departmentIncharge")}
                        onSave={saveDepartmentIncharge}
                        initialValues={state?.departmentIncharge}
                        colors={colors}
                    />
                </Box>

                <Box mb={3}>
                    <IPDDetailsForm
                        open={ipdDetailsOpen}
                        onClose={() => handleModalClose("ipdDetails")}
                        onSave={saveIpdDetails}
                        initialValues={state?.ipdDetails}
                        colors={colors}
                    />
                </Box>

                <Box mb={3}>
                    <DayCareDetailsForm
                        open={dayCareDetailsOpen}
                        onClose={() => handleModalClose("dayCareDetails")}
                        onSave={saveDayCareDetails}
                        initialValues={state?.dayCareDetails}
                        colors={colors}
                    />
                </Box>

            </Box>
        </ScrollableForm>


    );
};
export default HospitalData;