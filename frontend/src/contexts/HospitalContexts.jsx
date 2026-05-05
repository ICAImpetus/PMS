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
    totalDocuments: 0,
    totalPages: 0,
    limit: 10
};

export const GlobalHospitalContextProvider = ({ children }) => {

    const { currentUser } = UserContextHook();
    const role = currentUser?.type?.toLowerCase();

    const isSuperAdmin = role === "superadmin";
    const isSuperManager = role === "supermanager";
    const isAdmin = ["superadmin", "admin"].includes(role);
    const isNonAdmin = ["supermanager", "teamleader", "executive"].includes(role);

    // ---------------- STATE ----------------
    const [selectedHostpital, setSelectedHostpital] = useState(
        isNonAdmin ? currentUser?.hospitals?.[0]?.hospitalId?._id || null : null
    );
    const [selectedBranch, setSelectedBranch] = useState(null);

    const [pagination, setPagination] = useState({
        patients: { ...defaultPagination },
        users: { ...defaultPagination },
        forms: { ...defaultPagination },
        auditLogs: { ...defaultPagination }
    });

    const [filter, setFilter] = useState(filterOptions[0]?.value || "");

    // ---------------- QUERIES ----------------

    const hospitalsQuery = useQuery({
        queryKey: ["hospitals"],
        queryFn: async () => {
            const res = await commonRoutes.getAllHospital();
            return res.data;
        },
        onError: () => toast.error("Failed to fetch hospitals")
    });

    useEffect(() => {
        if (hospitalsQuery.data?.length && !selectedHostpital) {
            setSelectedHostpital(hospitalsQuery.data[0]?._id);
        }
    }, [hospitalsQuery.data]);

    const branchesQuery = useQuery({
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
        if (branchesQuery.data?.length && !selectedBranch) {
            setSelectedBranch(branchesQuery.data[0]?._id);
        }
    }, [branchesQuery.data]);

    const dashboardQuery = useQuery({
        queryKey: ["dashboard", selectedHostpital, selectedBranch],
        queryFn: async () => {
            const [dashboardRes, alertRes] = await Promise.all([
                commonRoutes.getDashboard(selectedBranch, selectedHostpital),
                commonRoutes.getCreatedCodeAlerts(selectedHostpital, selectedBranch)
            ]);

            return {
                analytics: dashboardRes?.data?.analytics || {},
                branchFollowups: dashboardRes?.data?.branchFollowups || {},
                codeAlerts: alertRes?.data || []
            };
        },
        enabled: !!selectedHostpital && (!!selectedBranch || !isNonAdmin),
        onError: () => toast.error("Dashboard load failed")
    });

    const patientsQuery = useQuery({
        queryKey: [
            "patients",
            selectedHostpital,
            selectedBranch,
            pagination.patients.page,
            filter
        ],
        queryFn: async () => {
            const res = await commonRoutes.getPatients(
                filter,
                pagination.patients,
                isNonAdmin ? selectedBranch : null,
                selectedHostpital
            );
            return res?.data || [];
        },
        enabled: !!selectedHostpital && (!!selectedBranch || !isNonAdmin),
        onError: () => toast.error("Failed to fetch patients")
    });

    const usersQuery = useQuery({
        queryKey: ["users", selectedHostpital],
        queryFn: async () => {
            const res = await commonRoutes.getAllUsers(selectedHostpital);
            return res.data;
        },
        enabled: !!selectedHostpital,
        onError: () => toast.error("Users fetch failed")
    });

    const adminsQuery = useQuery({
        queryKey: ["admins"],
        queryFn: async () => {
            const res = await commonRoutes.getAllUsers(null, null, "admin");
            return res.data;
        },
        enabled: isSuperAdmin,
        onError: () => toast.error("Admins fetch failed")
    });

    const formsQuery = useQuery({
        queryKey: ["forms", selectedHostpital, filter, pagination.forms.page],
        queryFn: async () => {
            const res = await commonRoutes.getFilledForms(
                filter,
                pagination.forms,
                null,
                selectedHostpital
            );
            return res.data;
        },
        enabled: !!selectedHostpital,
        onError: () => toast.error("Forms fetch failed")
    });

    const auditLogsQuery = useQuery({
        queryKey: ["auditLogs"],
        queryFn: async () => {
            const res = await commonRoutes.getAuditLogs();
            return res.data;
        },
        enabled: isAdmin,
        onError: () => toast.error("Audit logs failed")
    });

    // ---------------- DERIVED ----------------

    const analytics = dashboardQuery.data?.analytics || {};
    const branchFollowups = dashboardQuery.data?.branchFollowups || {};
    const codeAlerts = dashboardQuery.data?.codeAlerts || [];

    const forms = {
        today: formsQuery.data?.forms?.today || [],
        appointments: formsQuery.data?.forms?.appointments || [],
        followups: formsQuery.data?.forms?.followups || []
    };

    const metrics = formsQuery.data?.metrics || {};

    // ---------------- GLOBAL LOADING & ERROR ----------------

    const loading = {
        hospitals: hospitalsQuery.isLoading,
        branches: branchesQuery.isLoading,
        dashboard: dashboardQuery.isLoading,
        patients: patientsQuery.isLoading,
        users: usersQuery.isLoading,
        admins: adminsQuery.isLoading,
        forms: formsQuery.isLoading,
        auditLogs: auditLogsQuery.isLoading,

        isAnyLoading:
            hospitalsQuery.isLoading ||
            branchesQuery.isLoading ||
            dashboardQuery.isLoading ||
            patientsQuery.isLoading
    };

    const errors = {
        hospitals: hospitalsQuery.error,
        branches: branchesQuery.error,
        dashboard: dashboardQuery.error,
        patients: patientsQuery.error,
        users: usersQuery.error,
        admins: adminsQuery.error,
        forms: formsQuery.error,
        auditLogs: auditLogsQuery.error
    };

    // ---------------- CONTEXT ----------------

    const contextValue = useMemo(() => ({
        hospitals: hospitalsQuery.data || [],
        branches: branchesQuery.data || [],
        patients: patientsQuery.data || [],
        userData: usersQuery.data || [],
        admins: adminsQuery.data || [],
        allLogs: auditLogsQuery.data || [],

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
        errors

    }), [
        hospitalsQuery.data,
        branchesQuery.data,
        patientsQuery.data,
        usersQuery.data,
        adminsQuery.data,
        auditLogsQuery.data,
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