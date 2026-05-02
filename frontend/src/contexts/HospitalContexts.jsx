import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { commonRoutes } from "../api/apiService";
import { UserContextHook } from "./UserContexts";
import { useApi } from "../api/useApi";
import toast from "react-hot-toast";

export const HospitalContext = createContext();

const filterOptions = [
    { key: "Today", value: "today" },
    { key: "Yesterday", value: "yesterday" },
    { key: "Last 7 Days", value: "last7" },
    { key: "Last 30 Days", value: "last30" },
    { key: "Last 3 Month", value: "last3M" }
];

export const GlobalHospitalContextProvider = ({ children }) => {

    const { currentUser } = UserContextHook();

    const role = currentUser?.type?.toLowerCase();
    const isSuperAdmin = role === "superadmin" ? true : false
    const isAdmin = ["superadmin", "admin"].includes(role);
    const isNonAdmin = ["supermanager", "teamleader", "executive"].includes(role);

    // ---------------- STATES ----------------

    const [hospitals, setHospitals] = useState([]);
    const [branCount, setBranCount] = useState(0);
    const [selectedHostpital, setSelectedHostpital] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null)

    const [metrics, setMetrics] = useState({});
    const [analytics, setAnalytics] = useState({});

    const [pagination, setPagination] = useState({
        patients: 1,
        users: 1,
        forms: 1,
    });

    const [codeAlerts, setCodeAlerts] = useState([]);

    const [userData, setUserData] = React.useState([]);
    const [admins, setAdmins] = React.useState([])
    const [patients, setPatients] = useState([]);

    const [allLogs, setAllLogs] = useState([]);
    const [error, setError] = useState(null);

    const [filter, setFilter] = useState(
        filterOptions[0]?.value || ""
    );

    const [forms, setForms] = useState({
        today: [],
        appointments: [],
        followups: []
    });

    // ---------------- API ----------------

    const {
        loading: hospitalsLoading,
        request: getHospitals,
        error: hospitalsError
    } = useApi(commonRoutes.getAllHospital);

    const {
        loading: dashboardLoading,
        request: getDashboard,
        error: dashError
    } = useApi(commonRoutes.getDashboard);

    const {
        loading: alertLoading,
        request: getCodeAlerts
    } = useApi(commonRoutes.getCreatedCodeAlerts);

    const {
        loading: formLoading,
        request: getForms,
        error: formsError
    } = useApi(commonRoutes.getFilledForms);


    const {
        request: getAllUsers,
        loading: userLoading,
        error: usersError,
    } = useApi(commonRoutes.getAllUsers);


    const {
        loading: patientsLoading,
        request: getPatients,
        error: patientsError,
    } = useApi(commonRoutes.getPatients);

    const { request: fetchLogsRequest, loading: auditLogSystem } = useApi(commonRoutes.getAuditLogs);




    // ---------------- CACHE ----------------

    const hospitalsCache = useRef(null);

    // ---------------- FETCH HOSPITALS ----------------

    const fetchHospitals = useCallback(async () => {

        try {

            // use cache if exists
            if (hospitalsCache.current) {
                setHospitals(hospitalsCache.current);

                if (hospitalsCache.current?.length) {
                    const firstHospital = hospitalsCache.current[0];

                    setSelectedHostpital(firstHospital?._id);
                    setBranCount(firstHospital?.branchCount || 0);
                }

                return;
            }

            const res = await getHospitals();

            const hospitalData = res?.data || [];

            hospitalsCache.current = hospitalData;

            setHospitals(hospitalData);

            if (hospitalData?.length) {

                const firstHospital = hospitalData[0];

                setSelectedHostpital(firstHospital?._id);

                setBranCount(firstHospital?.branchCount || 0);
            }

        } catch (err) {
            console.error("Hospital Fetch Error:", err);
        }

    }, [getHospitals]);

    // ---------------- FETCH FORMS ----------------

    const fetchForms = useCallback(async () => {

        if (!selectedHostpital) return;

        try {

            const res = await getForms(
                filter,
                pagination.forms,
                null,
                selectedHostpital
            );

            if (res?.data) {

                const {
                    metrics,
                    forms: formsData
                } = res.data;

                setMetrics(metrics || {});

                setForms((prev) => ({

                    today:
                        pagination.forms === 1
                            ? formsData?.today || []
                            : [
                                ...prev.today,
                                ...(formsData?.today || [])
                            ],

                    appointments:
                        pagination.forms === 1
                            ? formsData?.appointments || []
                            : [
                                ...prev.appointments,
                                ...(formsData?.appointments || [])
                            ],

                    followups:
                        pagination.forms === 1
                            ? formsData?.followups || []
                            : [
                                ...prev.followups,
                                ...(formsData?.followups || [])
                            ]

                }));
            }

        } catch (err) {
            console.error("Forms Fetch Error:", err);
        }

    }, [
        filter,
        pagination.forms,
        selectedHostpital,
        getForms
    ]);

    // ---------------- FETCH DASHBOARD ----------------

    const fetchDashboard = useCallback(async () => {

        if (!selectedHostpital) return;

        try {

            const [dashboardRes, alertRes] = await Promise.all([
                getDashboard(null, selectedHostpital),
                getCodeAlerts(selectedHostpital)
            ]);

            if (dashboardRes?.data) {
                setAnalytics(
                    dashboardRes?.data?.analytics || {}
                );
            }

            setCodeAlerts(alertRes?.data || []);

        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
        }

    }, [
        selectedHostpital,
        getDashboard,
        getCodeAlerts
    ]);

    // ---------------- User Routes ----------------

    const fetchUsers = React.useCallback(async (selectedHostpital = null) => {
        try {
            const res = await getAllUsers(selectedHostpital);


            if (res.data) {
                setUserData(res.data || []);
            }

        } catch (err) {
            console.error(err);
        }
    }, [selectedHostpital, getAllUsers]);

    const fetchAdmins = React.useCallback(async () => {
        try {
            const res = await getAllUsers(null, null, "admin");


            if (res.data) {
                setAdmins(res.data || []);
            }

        } catch (err) {
            console.error(err);
        }
    }, [getAllUsers]);

    const fetchPatients = useCallback(async () => {
        if (!selectedHostpital) {
            setError("Hospital ID not found. Please select a hospital.");
            return;
        }
        if (isNonAdmin && !selectedBranch) {
            setError("Branch Id is Required");
            return;
        }
        try {
            const response = await getPatients(
                null,
                pagination.patients,
                isNonAdmin ? selectedBranch : null,
                selectedHostpital
            );

            if (response?.success) {
                const flattenedData = response?.data || [];

                setPatients(flattenedData);

                setPagination((prev) => ({
                    ...prev,
                    patients: 0,
                }));
            }
        } catch (err) {
            const errorMsg =
                err?.response?.data?.message ||
                err.message ||
                "Failed to fetch patients";

            console.log(err);

            setError("Internal Server Error Please. Try Again later !");
            // toast.error(errorMsg);
        }
    }, [
        selectedHostpital,
        selectedBranch,
        pagination.patients,
        isNonAdmin,
        getPatients
    ]);


    const fetchAuditLog = useCallback(async () => {
        const res = await fetchLogsRequest();
        if (res.success) {
            setAllLogs(res.data || []);
        }

    })

    // Initial fetch
    React.useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    React.useEffect(() => {
        if (isAdmin) {
            fetchHospitals();
        }
    }, [isAdmin, fetchHospitals]);


    React.useEffect(() => {
        if (selectedHostpital) {
            fetchUsers(selectedHostpital);
        }
    }, [fetchUsers]);

    React.useEffect(() => {
        if (isSuperAdmin) {
            fetchAdmins();
        }
    }, [fetchAdmins]);

    React.useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    React.useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    React.useEffect(() => {
        if (isAdmin) {
            fetchAuditLog();
        }

    }, [isAdmin, fetchAuditLog]);

    // ---------------- LOADING ----------------

    const errors = useMemo(() => ({
        hospitals: hospitalsError,
        dashboard: dashError,
        forms: formsError,
        usersError,
        patientsError
    }), [
        hospitalsError,
        dashError,
        formsError,
        usersError,
        patientsError
    ]);
    const loading = React.useMemo(() => ({
        hospitals: hospitalsLoading,
        dashboard: dashboardLoading,
        alerts: alertLoading,
        forms: formLoading,
        users: userLoading,
        patients: patientsLoading,

        isAnyLoading:
            hospitalsLoading ||
            dashboardLoading ||
            alertLoading ||
            formLoading ||
            userLoading
    }), [
        hospitalsLoading,
        dashboardLoading,
        alertLoading,
        formLoading,
        userLoading,
        patientsLoading
    ]);

    // ---------------- CONTEXT VALUE ----------------

    const contextValue = useMemo(() => ({
        hospitals,
        selectedHostpital,
        branCount,

        metrics,
        analytics,

        pagination,
        filter,

        codeAlerts,
        forms,

        loading,
        errors,

        hospitalsError,
        dashError,
        formsError,

        patients,
        setPatients,

        userData,
        setUserData,

        admins,
        setAdmins,

        setHospitals,
        setPagination,
        setFilter,
        setSelectedHostpital,

        isSuperAdmin,
        role,
        refetchLogs: fetchAuditLog,
        refetchForms: fetchForms,
        refetchDashboard: fetchDashboard,
        refetchHospitals: fetchHospitals,
        refreshPatients: fetchPatients

    }), [

        hospitals,
        selectedHostpital,
        branCount,

        metrics,
        analytics,

        filter,

        codeAlerts,
        forms,

        loading,

        hospitalsError,
        dashError,
        formsError,

        role,
        isSuperAdmin,

        pagination,
        fetchForms,
        fetchDashboard,
        fetchHospitals,
        errors
    ]);

    return (
        <HospitalContext.Provider value={contextValue}>
            {children}
        </HospitalContext.Provider>
    );
};

export default HospitalContext;