import React, {
    createContext,
    useEffect,
    useMemo,
    useState
} from "react";

import { commonRoutes } from "../api/apiService";
import { UserContextHook } from "./UserContexts";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const HospitalContext = createContext();

const filterOptions = [
    { key: "Today", value: "today" },
    { key: "Yesterday", value: "yesterday" },
    { key: "Last 7 Days", value: "last7" },
    { key: "Last 30 Days", value: "last30" },
    { key: "Last 3 Month", value: "last3M" }
];



const defaultPagination = {
    page: 1,
    totalDocument: 0,
    totalPages: 0,
    limit: 10
};

export const GlobalHospitalContextProvider = ({ children }) => {

    const { currentUser } = UserContextHook();
    const role = currentUser?.type?.toLowerCase();

    const isSuperAdmin = role === "superadmin";
    const isSuperManager = role === "supermanager";
    const isExecutive = role === "executive";
    const isAdmin = ["superadmin", "admin"].includes(role);
    const isNonAdmin = ["supermanager", "teamleader", "executive"].includes(role);

    // ---------------- STATE ----------------
    const [selectedHostpital, setSelectedHostpital] = useState(
        isNonAdmin ? currentUser?.hospitals?.[0]?.hospitalId?._id || null : null
    );

    const [selectedBranch, setSelectedBranch] = useState(null);
    const [branchCount, setBranchCount] = useState(0)

    const [pagination, setPagination] = useState({
        patients: { ...defaultPagination },
        users: { ...defaultPagination },
        forms: { ...defaultPagination },
        auditLogs: { ...defaultPagination }
    });
    const [filter, setFilter] = useState(filterOptions[0]?.value || "");


    const updatePagination = (key, newPagination) => {
        if (!newPagination) return;

        setPagination((prev) => {
            const prevData = prev[key];
            if (
                prevData.page === newPagination.page &&
                prevData.totalPages === newPagination.totalPages &&
                prevData.totalDocument === newPagination.totalDocument
            ) {
                return prev;
            }

            return {
                ...prev,
                [key]: {
                    ...prevData,
                    ...newPagination
                }
            };
        });
    };

    // ---------------- QUERIES (DESTRUCTURED) ----------------

    const {
        data: hospitalsData,
        isLoading: hospitalsLoading,
        error: hospitalsError
    } = useQuery({
        queryKey: ["hospitals"],
        queryFn: async () => {
            const res = await commonRoutes.getAllHospital();
            return res.data;
        },
        enabled: !isExecutive,
        onError: () => toast.error("Failed to fetch hospitals")
    });

    useEffect(() => {
        if (hospitalsData?.data?.length && !selectedHostpital) {
            setSelectedHostpital(hospitalsData.data[0]?._id);
            setBranchCount(hospitalsData.data[0]?.branchCount)
        }
    }, [hospitalsData]);

    const {
        data: branchesData,
        isLoading: branchesLoading,
        error: branchesError
    } = useQuery({
        queryKey: ["branches", selectedHostpital, role],
        queryFn: async () => {
            const res = isSuperManager
                ? await commonRoutes.getHospitalBranchById(selectedHostpital)
                : await commonRoutes.branchesByRole(selectedHostpital);
            return res.data;
        },
        enabled: !!selectedHostpital,

        onError: () => toast.error("Failed to fetch branches")
    });

    useEffect(() => {
        if (branchesData?.data?.length && !selectedBranch) {
            setSelectedBranch(branchesData.data[0]?._id);
        }
    }, [branchesData]);

    const {
        data: dashboardData,
        isLoading: dashboardLoading,
        error: dashboardError
    } = useQuery({
        queryKey: ["dashboard", selectedHostpital, selectedBranch],
        queryFn: async () => {
            const [dashboardRes, alertRes] = await Promise.all([
                commonRoutes.getDashboard(selectedBranch, selectedHostpital),
                commonRoutes.getCreatedCodeAlerts(selectedHostpital, selectedBranch)
            ]);

            return {
                analytics: dashboardRes?.data?.data?.analytics || {},
                branchFollowups: dashboardRes?.data?.data?.branchFollowups || {},
                codeAlerts: alertRes?.data?.data || []
            };
        },
        enabled: !!selectedHostpital && (!!selectedBranch || !isNonAdmin),
        onError: () => toast.error("Dashboard load failed")
    });

    const {
        data: patientsData,
        isLoading: patientsLoading,
        error: patientsError,
        isFetching: patientsRefetchLoader,
        refetch: refetchPatients
    } = useQuery({
        queryKey: [
            "patients",
            selectedHostpital,
            selectedBranch,
            pagination.patients?.page,
            filter
        ],
        queryFn: async () => {
            const res = await commonRoutes.getPatients(
                filter,
                pagination.patients,
                isNonAdmin ? selectedBranch : null,
                selectedHostpital
            );
            return res?.data || {};
        },
        enabled: !!selectedHostpital && (!!selectedBranch || !isNonAdmin),
        onError: () => toast.error("Failed to fetch patients")
    });

    console.log("patientsLoading", patientsLoading);

    const {
        data: usersData,
        isLoading: usersLoading,
        error: usersError
    } = useQuery({
        queryKey: ["users", selectedHostpital],
        queryFn: async () => {
            const res = await commonRoutes.getAllUsers(selectedHostpital);
            return res.data;
        },
        enabled: !!selectedHostpital && !isExecutive,
        onError: () => toast.error("Users fetch failed")
    });

    const {
        data: adminsData,
        isLoading: adminsLoading,
        error: adminsError
    } = useQuery({
        queryKey: ["admins"],
        queryFn: async () => {
            const res = await commonRoutes.getAllUsers(null, null, "admin");
            return res.data;
        },
        enabled: isSuperAdmin,
        onError: () => toast.error("Admins fetch failed")
    });

    const {
        data: formsData,
        isLoading: formsLoading,
        error: formsError
    } = useQuery({
        queryKey: ["forms", selectedHostpital, filter, pagination.forms.page],
        queryFn: async () => {
            const res = await commonRoutes.getFilledForms(
                filter,
                pagination.forms,
                null,
                selectedHostpital
            );
            // console.log("res", res);

            return res.data?.data;
        },
        enabled: !!selectedHostpital,
        onError: () => toast.error("Forms fetch failed")
    });

    const {
        data: auditLogsData,
        isLoading: auditLogsLoading,
        error: auditLogsError
    } = useQuery({
        queryKey: ["auditLogs"],
        queryFn: async () => {
            const res = await commonRoutes.getAuditLogs();
            return res.data;
        },
        enabled: isAdmin,
        onError: () => toast.error("Audit logs failed")
    });

    // ---------------- DERIVED ----------------

    useEffect(() => {
        updatePagination("patients", patientsData?.pagination);
    }, [patientsData]);

    useEffect(() => {
        updatePagination("forms", formsData?.pagination);
    }, [formsData]);

    useEffect(() => {
        updatePagination("users", usersData?.pagination);
    }, [usersData]);

    useEffect(() => {
        updatePagination("auditLogs", auditLogsData?.pagination);
    }, [auditLogsData]);

    const hospitals = hospitalsData?.data || [];
    const branches = branchesData?.data || [];
    const patients = patientsData?.data || [];

    const users = usersData?.data || [];
    const admins = adminsData?.data || [];
    const allLogs = auditLogsData?.data || [];

    console.log("dashboardData", dashboardData);

    const analytics = dashboardData?.analytics || {};
    const branchFollowups = dashboardData?.branchFollowups || {};
    const codeAlerts = dashboardData?.codeAlerts || [];

    console.log("formsData", formsData);
    const forms = {
        today: formsData?.forms?.today || [],
        appointments: formsData?.forms?.appointments || [],
        followups: formsData?.forms?.followups || []
    };



    const metrics = formsData?.metrics || {};

    // ---------------- LOADING & ERRORS ----------------

    const loading = {
        hospitals: hospitalsLoading,
        branches: branchesLoading,
        dashboard: dashboardLoading,
        patients: patientsRefetchLoader,

        users: usersLoading,
        admins: adminsLoading,
        forms: formsLoading,
        auditLogs: auditLogsLoading,

        isAnyLoading:
            hospitalsLoading ||
            branchesLoading ||
            dashboardLoading ||
            patientsLoading
    };

    const errors = {
        hospitals: hospitalsError,
        branches: branchesError,
        dashboard: dashboardError,
        patients: patientsError,
        users: usersError,
        admins: adminsError,
        forms: formsError,
        auditLogs: auditLogsError
    };

    // ---------------- CONTEXT ----------------

    const contextValue = useMemo(() => ({
        hospitals,
        branches,
        patients,
        userData: users,
        admins,
        allLogs,
        branchCount,

        analytics,
        metrics,
        forms,
        codeAlerts,
        branchFollowups,

        selectedHostpital,
        selectedBranch,

        pagination,
        filter,

        filterOptions,



        setSelectedHostpital,
        setSelectedBranch,
        setPagination,
        setFilter,

        isSuperAdmin,
        role,

        loading,
        errors,

        refetchPatients

    }), [
        hospitals,
        branches,
        patients,
        users,
        branchCount,
        admins,
        allLogs,
        analytics,
        metrics,
        forms,
        codeAlerts,
        branchFollowups,
        selectedHostpital,
        selectedBranch,
        pagination,
        filter,
        loading,
        errors
    ]);

    return (
        <HospitalContext.Provider value={contextValue}>
            {children}
        </HospitalContext.Provider>
    );
};

export default HospitalContext;
// 

// import React, {
//     createContext,
//     useCallback,
//     useEffect,
//     useMemo,
//     useRef,
//     useState
// } from "react";

// import { commonRoutes } from "../api/apiService";
// import { UserContextHook } from "./UserContexts";
// import { useApi } from "../api/useApi";
// import toast from "react-hot-toast";

// export const HospitalContext = createContext();

// const filterOptions = [
//     { key: "Today", value: "today" },
//     { key: "Yesterday", value: "yesterday" },
//     { key: "Last 7 Days", value: "last7" },
//     { key: "Last 30 Days", value: "last30" },
//     { key: "Last 3 Month", value: "last3M" }
// ];

// const defaultPagination = {
//     page: 1,
//     totalDocuments: 0,
//     totalPages: 0,
//     limit: 10
// };

// export const GlobalHospitalContextProvider = ({ children }) => {

//     const { currentUser } = UserContextHook();
//     const role = currentUser?.type?.toLowerCase();
//     const isSuperAdmin = role === "superadmin" ? true : false
//     const isSuperManager = role === "supermanager" ? true : false
//     const isAdmin = ["superadmin", "admin"].includes(role);
//     const isNonAdmin = ["supermanager", "teamleader", "executive"].includes(role);


//     // ---------------- STATES ----------------
//     const [hospitals, setHospitals] = useState([]);
//     const [branches, setBranches] = useState([])
//     const [branCount, setBranCount] = useState(0);
//     const [selectedHostpital, setSelectedHostpital] = useState(
//         isNonAdmin ? currentUser?.hospitals?.[0]?.hospitalId?._id || null : null);
//     const [selectedBranch, setSelectedBranch] = useState(null)
//     const [metrics, setMetrics] = useState({});
//     const [analytics, setAnalytics] = useState({});
//     const [branchFollowups, setBranchFollowups] = useState({ data: [], total: 0, page: 1, limit: 10 });
//     const [hospitalCodeAlerts, sethospitalCodeAlerts] = useState([]);
//     const [pagination, setPagination] = useState({
//         patients: { ...defaultPagination },
//         users: { ...defaultPagination },
//         forms: { ...defaultPagination },
//         auditLogs: { ...defaultPagination }
//     });

//     const [startDate, setStartDate] = useState({
//         auditLogs: ''
//     });
//     const [endDate, setEndDate] = useState({
//         auditLogs: ''
//     });

//     const [codeAlerts, setCodeAlerts] = useState([]);

//     const [userData, setUserData] = React.useState([]);
//     const [admins, setAdmins] = React.useState([])
//     const [patients, setPatients] = useState([]);

//     const [allLogs, setAllLogs] = useState([]);
//     const [error, setError] = useState(null);

//     const [filter, setFilter] = useState(
//         filterOptions[0]?.value || ""
//     );

//     const [forms, setForms] = useState({
//         today: [],
//         appointments: [],
//         followups: []
//     });

//     // ---------------- API ----------------

//     const {
//         loading: hospitalsLoading,
//         request: getHospitals,
//         error: hospitalsError
//     } = useApi(commonRoutes.getAllHospital);

//     const {
//         loading: dashboardLoading,
//         request: getDashboard,
//         error: dashError
//     } = useApi(commonRoutes.getDashboard);

//     const {
//         loading: alertLoading,
//         request: getCodeAlerts
//     } = useApi(commonRoutes.getCreatedCodeAlerts);

//     const {
//         loading: formLoading,
//         request: getForms,
//         error: formsError
//     } = useApi(commonRoutes.getFilledForms);


//     const {
//         request: getAllUsers,
//         loading: userLoading,
//         error: usersError,
//     } = useApi(commonRoutes.getAllUsers);


//     const {
//         loading: patientsLoading,
//         request: getPatients,
//         error: patientsError,
//     } = useApi(commonRoutes.getPatients);

//     const { request: fetchLogsRequest, loading: auditLogLoading, error: auditLogError } = useApi(commonRoutes.getAuditLogs);
//     const { loading: branchesLoading, request: getBranches, error: branchesError } = useApi(commonRoutes.branchesByRole)
//     const { loading: hosBranchesLoading, request: getHosBranches, error: hosBranchesError } = useApi(commonRoutes.getHospitalBranchById)


//     const fetchHospitals = useCallback(async () => {

//         try {

//             const res = await getHospitals();

//             const hospitalData = res?.data || [];

//             setHospitals(hospitalData);

//             if (hospitalData?.length) {

//                 const firstHospital = hospitalData[0];

//                 setSelectedHostpital(firstHospital?._id);

//                 setBranCount(firstHospital?.branchCount || 0);
//             }

//         } catch (err) {
//             console.error("Hospital Fetch Error:", err);
//         }

//     }, [getHospitals]);

//     const fetchData = useCallback(async () => {
//         try {
//             const [res] = await Promise.all([
//                 getBranches(selectedHostpital),
//             ]);

//             setBranches(res?.data || []);

//             if (res?.data?.length) {
//                 setSelectedBranch(res.data[0]?._id);
//             }

//         } catch (err) {
//             console.error("Fetch Error:", err);
//         }
//     }, [selectedHostpital]);

//     const fetchHospitalBranches = useCallback(async () => {
//         if (!selectedHostpital || !isSuperManager) return

//         try {
//             const [res] = await Promise.all([
//                 getHosBranches(selectedHostpital),
//             ]);

//             setBranches(res?.data || []);

//             if (res?.data?.length) {
//                 console.log("res.data[0]", res.data[0]);

//                 console.log("Setting branch id:", res.data[0]?._id);
//                 setSelectedBranch(res.data[0]?._id);
//                 console.log("Setting branch id:", selectedBranch);
//             }

//         } catch (err) {
//             console.error("Fetch Error:", err);
//         }

//     }, [selectedHostpital, selectedBranch, isSuperManager])
//     // ---------------- FETCH FORMS ----------------

//     const fetchForms = useCallback(async () => {

//         if (!selectedHostpital) return;

//         try {

//             const res = await getForms(
//                 filter,
//                 pagination.forms,
//                 null,
//                 selectedHostpital
//             );

//             if (res?.data) {

//                 const {
//                     metrics,
//                     forms: formsData
//                 } = res.data;

//                 setMetrics(metrics || {});

//                 setForms((prev) => ({

//                     today:
//                         pagination.forms === 1
//                             ? formsData?.today || []
//                             : [
//                                 ...prev.today,
//                                 ...(formsData?.today || [])
//                             ],

//                     appointments:
//                         pagination.forms === 1
//                             ? formsData?.appointments || []
//                             : [
//                                 ...prev.appointments,
//                                 ...(formsData?.appointments || [])
//                             ],

//                     followups:
//                         pagination.forms === 1
//                             ? formsData?.followups || []
//                             : [
//                                 ...prev.followups,
//                                 ...(formsData?.followups || [])
//                             ]

//                 }));
//             }

//         } catch (err) {
//             console.error("Forms Fetch Error:", err);
//         }

//     }, [
//         filter,
//         pagination.forms,
//         selectedHostpital,
//         getForms
//     ]);

//     // ---------------- FETCH DASHBOARD ----------------

//     const fetchDashboard = useCallback(async () => {

//         if (!selectedHostpital) return;
//         if (isNonAdmin && !selectedBranch) return;

//         try {

//             const [dashboardRes, alertRes] = await Promise.all([
//                 getDashboard(selectedBranch, selectedHostpital),
//                 getCodeAlerts(selectedHostpital, selectedBranch)
//             ]);

//             if (dashboardRes?.data) {
//                 const { analytics, branchFollowups } = dashboardRes.data;
//                 setAnalytics(
//                     analytics || {}
//                 );
//                 setBranchFollowups(branchFollowups)
//             }

//             setCodeAlerts(alertRes?.data || []);

//         } catch (err) {
//             console.error("Dashboard Fetch Error:", err);
//         }

//     }, [
//         selectedHostpital,
//         selectedBranch,
//         getDashboard,
//         getCodeAlerts
//     ]);

//     // ---------------- User Routes ----------------

//     const fetchUsers = React.useCallback(async (selectedHostpital = null) => {
//         try {
//             const res = await getAllUsers(selectedHostpital);


//             if (res.data) {
//                 setUserData(res.data || []);
//             }

//         } catch (err) {
//             console.error(err);
//         }
//     }, [selectedHostpital, getAllUsers]);

//     const fetchAdmins = React.useCallback(async () => {
//         try {
//             const res = await getAllUsers(null, null, "admin");


//             if (res.data) {
//                 setAdmins(res.data || []);
//             }

//         } catch (err) {
//             console.error(err);
//         }
//     }, [getAllUsers]);

//     const fetchPatients = useCallback(async () => {
//         if (!selectedHostpital) {
//             setError("Hospital ID not found. Please select a hospital.");
//             return;
//         }
//         if (isNonAdmin && !selectedBranch) {
//             setError("Branch Id is Required");
//             return;
//         }
//         try {
//             const response = await getPatients(
//                 null,
//                 pagination.patients,
//                 isNonAdmin ? selectedBranch : null,
//                 selectedHostpital
//             );

//             if (response?.success) {
//                 const flattenedData = response?.data || [];

//                 setPatients(flattenedData);

//                 // setPagination((prev) => ({
//                 //     ...prev,
//                 //     patients: 0,
//                 // }));
//             }
//         } catch (err) {
//             const errorMsg =
//                 err?.response?.data?.message ||
//                 err.message ||
//                 "Failed to fetch patients";

//             console.log(err);

//             setError("Internal Server Error Please. Try Again later !");
//             // toast.error(errorMsg);
//         }
//     }, [
//         selectedHostpital,
//         selectedBranch,
//         pagination.patients?.page,
//         isNonAdmin,
//         getPatients
//     ]);

//     const fetchAuditLog = useCallback(async () => {
//         try {
//             const res = await fetchLogsRequest();

//             if (res?.success) {
//                 setAllLogs(prev => {
//                     const newData = res.data || [];
//                     return JSON.stringify(prev) === JSON.stringify(newData)
//                         ? prev
//                         : newData;
//                 });
//             }
//         } catch (error) {
//             console.error("Audit Log Fetch Error:", error);
//         }
//     }, [fetchLogsRequest]);

//     React.useEffect(() => {
//         if (selectedHostpital && isNonAdmin && !isSuperManager) {
//             fetchData();
//         }
//     }, [selectedHostpital, isNonAdmin, isSuperManager, fetchData]);

//     React.useEffect(() => {
//         if (selectedHostpital && isSuperManager) {
//             fetchHospitalBranches();
//         }
//     }, [selectedHostpital, isSuperManager, fetchHospitalBranches]);

//     // Initial fetch
//     React.useEffect(() => {
//         fetchPatients();
//     }, [fetchPatients]);

//     React.useEffect(() => {
//         fetchHospitals();
//     }, [fetchHospitals]);


//     React.useEffect(() => {
//         if (selectedHostpital) {
//             fetchUsers(selectedHostpital);
//         }
//     }, [fetchUsers]);

//     React.useEffect(() => {
//         if (isSuperAdmin) {
//             fetchAdmins();
//         }
//     }, [fetchAdmins]);

//     React.useEffect(() => {
//         fetchForms();
//     }, [fetchForms]);

//     React.useEffect(() => {
//         if (isNonAdmin && selectedBranch) {
//             fetchDashboard();
//         }
//         else {
//             fetchDashboard();
//         }

//     }, [fetchDashboard]);

//     React.useEffect(() => {
//         if (isAdmin) {
//             fetchAuditLog();
//         }

//     }, [fetchAuditLog]);

//     // ---------------- LOADING ----------------

//     const errors = useMemo(() => ({
//         hospitals: hospitalsError,
//         dashboard: dashError,
//         forms: formsError,
//         usersError,
//         patientsError,
//         auditLogError,
//         branchesError
//     }), [
//         hospitalsError,
//         dashError,
//         formsError,
//         usersError,
//         branchesError,
//         patientsError,
//         auditLogError
//     ]);
//     const loading = React.useMemo(() => ({
//         hospitals: hospitalsLoading,
//         dashboard: dashboardLoading,
//         alerts: alertLoading,
//         forms: formLoading,
//         users: userLoading,
//         patientsLoading,
//         auditLogLoading,
//         branchesLoading,

//         isAnyLoading:
//             hospitalsLoading ||
//             dashboardLoading ||
//             alertLoading ||
//             formLoading ||
//             userLoading
//     }), [
//         hospitalsLoading,
//         dashboardLoading,
//         alertLoading,
//         formLoading,
//         userLoading,
//         patientsLoading,
//         auditLogLoading,
//         branchesLoading
//     ]);

//     // ---------------- CONTEXT VALUE ----------------

//     const contextValue = useMemo(() => ({
//         hospitals,
//         selectedHostpital,
//         branCount,

//         startDate,
//         endDate,

//         metrics,
//         analytics,

//         pagination,
//         filter,

//         codeAlerts,
//         forms,

//         allLogs,


//         loading,
//         errors,

//         hospitalsError,
//         dashError,
//         formsError,

//         patients,


//         userData,


//         admins,
//         branches,
//         branchFollowups,

//         filterOptions,

//         setBranches,
//         setBranchFollowups,
//         setStartDate,
//         setEndDate,
//         setPatients,
//         setUserData,
//         setAllLogs,
//         setAdmins,
//         setHospitals,
//         setPagination,
//         setFilter,
//         setSelectedHostpital,
//         setSelectedBranch,
//         isSuperAdmin,
//         role,
//         refetchLogs: fetchAuditLog,
//         refetchForms: fetchForms,
//         refetchDashboard: fetchDashboard,
//         refetchHospitals: fetchHospitals,
//         refreshPatients: fetchPatients

//     }), [

//         branches,
//         startDate,
//         endDate,
//         hospitals,
//         selectedHostpital,
//         selectedBranch,
//         branCount,
//         branchFollowups,
//         metrics,
//         analytics,
//         filterOptions,
//         filter,

//         codeAlerts,
//         forms,

//         loading,

//         hospitalsError,
//         dashError,
//         formsError,

//         role,
//         isSuperAdmin,

//         pagination,
//         fetchForms,
//         fetchDashboard,
//         fetchHospitals,
//         errors
//     ]);

//     return (
//         <HospitalContext.Provider value={contextValue}>
//             {children}
//         </HospitalContext.Provider>
//     );
// };

// export default HospitalContext;