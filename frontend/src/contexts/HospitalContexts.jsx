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

    const today = new Date();

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const { currentUser } = UserContextHook();
    const role = currentUser?.type?.toLowerCase();

    const isSuperAdmin = role === "superadmin";
    const isSuperManager = role === "supermanager";
    const isExecutive = role === "executive";
    const isDoctor = role === "doctor"
    const isAdmin = ["superadmin", "admin"].includes(role);
    const isNonAdmin = ["teamleader", "supermanager", "executive", "doctor"].includes(role);



    const [selectedHostpital, setSelectedHostpital] = useState(
        isNonAdmin
            ? currentUser?.hospitals?.[0]?.hospitalId?._id || null
            : null
    );

    const [selectedBranch, setSelectedBranch] = useState(isDoctor ? currentUser?.refId?.branch || null : null);
    const [branchCount, setBranchCount] = useState(0);

    const [pagination, setPagination] = useState({
        patients: { ...defaultPagination },
        users: { ...defaultPagination },
        forms: { ...defaultPagination },
        auditLogs: { ...defaultPagination }
    });

    const [filter, setFilter] = useState(
        filterOptions[0]?.value || ""
    );
    const [dateRangeFilter, setDateRangeFilter] = useState({
        startDate: "",
        endDate: ""
    });



    const mergePaginatedData = (oldData = [], newData = [], page = 1) => {
        if (page === 1) return newData;

        const oldIds = new Set(oldData.map((item) => item?._id));

        const filteredNew = newData.filter(
            (item) => !oldIds.has(item?._id)
        );

        return [...oldData, ...filteredNew];
    };



    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [pastappointments, setPastAppointments] = useState([]);
    const [users, setUsers] = useState([]);
    const [allLogs, setAllLogs] = useState([]);

    const [forms, setForms] = useState({
        today: [],
        appointments: [],
        followups: []
    });

    const [metrics, setMetrics] = useState({});

    const [dateFilter, setDateFilter] = useState("today");
    const [dateRange, setDateRange] = useState({
        startDate: startOfToday.toISOString(),
        endDate: endOfToday.toISOString(),
    });

    const getDateRange = (filter) => {
        const now = new Date();

        switch (filter) {
            case "today": {
                const startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(now);
                endDate.setHours(23, 59, 59, 999);

                return { startDate, endDate };
            }

            case "yesterday": {
                const startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(now);
                endDate.setDate(endDate.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);

                return { startDate, endDate };
            }

            case "last7": {
                const startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 6);
                startDate.setHours(0, 0, 0, 0);

                return {
                    startDate,
                    endDate: now,
                };
            }

            case "last30": {
                const startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 29);
                startDate.setHours(0, 0, 0, 0);

                return {
                    startDate,
                    endDate: now,
                };
            }

            case "last3M": {
                const startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 3);
                startDate.setHours(0, 0, 0, 0);

                return {
                    startDate,
                    endDate: now,
                };
            }

            default:
                return {
                    startDate: null,
                    endDate: null,
                };
        }
    };

    const handleFilterChange = (value) => {
        setFilter(value);

        const range = getDateRange(value);

        setDateRange({
            startDate: range.startDate?.toISOString(),
            endDate: range.endDate?.toISOString(),
        });

    };



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



    useEffect(() => {
        if (currentUser?.hospitals?.length) {
            setSelectedHostpital(
                currentUser?.hospitals?.[0]?.hospitalId?._id ||
                currentUser?.hospitals?.[0]?.hospitalId
            );
        }
    }, [isNonAdmin, currentUser]);



    const {
        data: hospitalsData,
        isFetching: hospitalsLoading,
        error: hospitalsError,
        refetch: refetchHospital
    } = useQuery({
        queryKey: ["hospitals"],
        queryFn: async () => {
            const res = await commonRoutes.getAllHospital();
            return res.data;
        },
        enabled: !isExecutive && !isDoctor,
        onError: () => toast.error("Failed to fetch hospitals")
    });

    useEffect(() => {
        if (hospitalsData?.data?.length && !selectedHostpital) {
            setSelectedHostpital(hospitalsData.data[0]?._id);
            setBranchCount(hospitalsData.data[0]?.branchCount);
        }
    }, [hospitalsData]);



    const {
        data: branchesData,
        isLoading: branchesLoading,
        error: branchesError
    } = useQuery({
        queryKey: ["branches", selectedHostpital, role],
        queryFn: async () => {

            const res = (isAdmin || isSuperManager)
                ? await commonRoutes.getHospitalBranchById(selectedHostpital)
                : await commonRoutes.branchesByRole(selectedHostpital);

            return res.data;
        },
        enabled: !!selectedHostpital && !isDoctor,
        onError: () => toast.error("Failed to fetch branches")
    });

    useEffect(() => {
        if (branchesData?.data?.length && !selectedBranch) {
            setSelectedBranch(branchesData.data[0]?._id);
        }
    }, [branchesData]);



    const {
        data: dashboardData,
        isFetching: dashboardLoading,
        refetch: refetchDashboard,
        error: dashboardError
    } = useQuery({
        queryKey: ["dashboard", selectedHostpital, selectedBranch, dateRange.startDate, dateRange.endDate],
        queryFn: async () => {
            const [dashboardRes, alertRes] = await Promise.all([
                commonRoutes.getDashboard(
                    selectedBranch,
                    selectedHostpital,
                    dateRange.startDate,
                    dateRange.endDate

                ),

                commonRoutes.getCreatedCodeAlerts(
                    selectedHostpital,
                    selectedBranch
                )
            ]);

            return {
                analytics:
                    dashboardRes?.data?.data?.analytics || {},

                branchFollowups:
                    dashboardRes?.data?.data?.branchFollowups || {},

                codeAlerts:
                    alertRes?.data?.data || []
            };
        },
        enabled: !!selectedHostpital && !!selectedBranch && !isDoctor,
        onError: () => toast.error("Dashboard load failed")
    });



    const {
        data: codeAlertsData,
        error: codeAlertsDataError,
        isFetching: codeAlertsDataRefetchLoader,
        refetch: refetchCodeAlertsData
    } = useQuery({
        queryKey: [
            "codeAlertsData",
            selectedHostpital,
            selectedBranch
        ],
        queryFn: async () => {

            const res = await commonRoutes.getCodeAlerts(
                selectedHostpital,
                selectedBranch
            );

            return res?.data?.data || [];
        },
        enabled:
            !!selectedHostpital &&
            !!selectedBranch &&
            isExecutive,

        onError: () =>
            toast.error("Failed to fetch Hospital Code")
    });

    const {
        data: patientsData,
        isLoading: patientsLoading,
        error: patientsError,
        isFetching: patientsRefetchLoader,
        refetch: refetchPatients
    } = useQuery({
        queryKey: [

            pagination.patients.page,
            selectedHostpital,
            selectedBranch,
            "patients",

        ],

        queryFn: async ({ queryKey }) => {
            const [
                page,
                selectedHostpital,
                selectedBranch,
            ] = queryKey;

            const res = await commonRoutes.getPatients(
                page,
                selectedHostpital,
                isNonAdmin ? selectedBranch : null,
            );

            return res?.data || {};
        },

        enabled:
            !isDoctor &&
            !!selectedHostpital &&
            (!!selectedBranch || !isNonAdmin),

        keepPreviousData: true,

        onError: () =>
            toast.error("Failed to fetch patients")
    });
    useEffect(() => {
        if (!patientsData?.data) return;

        const currentPage = patientsData?.pagination?.page || 1;

        console.log("pateutn", patients);


        setPatients((prev) => {
            //  If first page → replace data
            if (currentPage === 1) {
                return patientsData.data;
            }

            //  If next pages → append
            return [
                ...prev,
                ...patientsData.data.filter(
                    (newItem) =>
                        !prev.some((p) => p._id === newItem._id)
                ),
            ];
        });

        updatePagination("patients", patientsData.pagination);

    }, [patientsData]);


    const {
        data: usersData,
        isFetching: usersLoading,
        refetch: refetchUsers,
        error: usersError
    } = useQuery({
        queryKey: [
            "users",
            selectedHostpital,
            pagination.users.page
        ],
        queryFn: async () => {

            const res = await commonRoutes.getAllUsers(
                selectedHostpital,
                pagination.users
            );

            return res.data;
        },
        enabled: !!selectedHostpital && !isExecutive && !isDoctor,
        keepPreviousData: true,
        onError: () => toast.error("Users fetch failed")
    });

    useEffect(() => {

        if (!usersData) return;

        setUsers((prev) =>
            mergePaginatedData(
                prev,
                usersData?.data || [],
                pagination.users.page
            )
        );

        updatePagination(
            "users",
            usersData?.pagination
        );

    }, [usersData]);



    const {
        data: adminsData,
        isFetching: adminsLoading,
        refetch: refetchAdmins,
        error: adminsError
    } = useQuery({
        queryKey: ["admins"],
        queryFn: async () => {

            const res = await commonRoutes.getAllUsers(
                null,
                null,
                "admin"
            );

            return res.data;
        },
        enabled: isSuperAdmin,
        onError: () => toast.error("Admins fetch failed")
    });

    // doctor api
    const enabledQuery =
        !!selectedHostpital &&
        !!selectedBranch &&
        !!currentUser?._id &&
        isDoctor;

    const {
        data: appointmentData,
        isFetching: appointmentLoading,
        refetch: refetchAppointments,
        error: appointmentError,
    } = useQuery({
        queryKey: [
            "doctorAppointments",
            selectedHostpital,
            selectedBranch,
            currentUser?._id,
            dateFilter
        ],

        queryFn: async () => {
            const res = await commonRoutes.getDoctorAppointments(
                selectedHostpital,
                selectedBranch,
                currentUser?._id,
                dateFilter
            );

            return res.data?.data;
        },

        enabled: enabledQuery,
    });

    const {
        data: pastAppointmentData,
        isFetching: pastAppointmentLoading,
        refetch: refetchPastAppointments,
        error: pastAppointmentError,
    } = useQuery({
        queryKey: [
            "doctorPastAppointments",
            selectedHostpital,
            selectedBranch,
            currentUser?._id,
        ],

        queryFn: async () => {
            const res =
                await commonRoutes.getPastDoctorAppointments(
                    selectedHostpital,
                    selectedBranch,
                    currentUser?._id,
                    1, // page
                    10 // limit
                );

            return res.data?.data;
        },

        enabled: enabledQuery,
    });

    useEffect(() => {
        if (!pastAppointmentData) return;

        setPastAppointments(pastAppointmentData);
    }, [pastAppointmentData]);
    useEffect(() => {

        if (!appointmentData) return;

        // setAppointments((prev) =>
        //     mergePaginatedData(
        //         prev,
        //         patientsData?.data || [],
        //         pagination.patients.page
        //     )
        // );

        // updatePagination(
        //     "patients",
        //     patientsData?.pagination
        // );

        setAppointments(appointmentData)

    }, [appointmentData]);

    const {
        data: auditLogsData,
        isLoading: auditLogsLoading,
        error: auditLogsError
    } = useQuery({
        queryKey: [
            "auditLogs",
            pagination.auditLogs.page
        ],

        queryFn: async () => {

            const res =
                await commonRoutes.getAuditLogs(
                    pagination.auditLogs
                );

            return res.data;
        },

        enabled: isAdmin,

        keepPreviousData: true,

        onError: () =>
            toast.error("Audit logs failed")
    });

    useEffect(() => {

        if (!auditLogsData) return;

        setAllLogs((prev) =>
            mergePaginatedData(
                prev,
                auditLogsData?.data || [],
                pagination.auditLogs.page
            )
        );

        updatePagination(
            "auditLogs",
            auditLogsData?.pagination
        );

    }, [auditLogsData]);



    useEffect(() => {

        setPatients([]);

        setPagination((prev) => ({
            ...prev,
            patients: {
                ...prev.patients,
                page: 1
            }
        }));

    }, [selectedHostpital, selectedBranch, filter]);

    useEffect(() => {

        setForms({
            today: [],
            appointments: [],
            followups: []
        });

        setPagination((prev) => ({
            ...prev,
            forms: {
                ...prev.forms,
                page: 1
            }
        }));

    }, [selectedHostpital, selectedBranch, filter]);

    useEffect(() => {

        setUsers([]);

        setPagination((prev) => ({
            ...prev,
            users: {
                ...prev.users,
                page: 1
            }
        }));

    }, [selectedHostpital]);

    useEffect(() => {

        setAllLogs([]);

        setPagination((prev) => ({
            ...prev,
            auditLogs: {
                ...prev.auditLogs,
                page: 1
            }
        }));

    }, []);


    const hospitals = hospitalsData?.data || [];
    const branches = branchesData?.data || [];
    const admins = adminsData?.data || [];

    const analytics =
        dashboardData?.analytics || {};

    const branchFollowups =
        dashboardData?.branchFollowups || {};

    const codeAlerts =
        dashboardData?.codeAlerts || [];



    const loading = {
        hospitals: hospitalsLoading,
        branches: branchesLoading,
        dashboard: dashboardLoading,
        patients: patientsRefetchLoader,
        users: usersLoading,
        admins: adminsLoading,
        auditLogs: auditLogsLoading,
        appointmentLoading,
        pastAppointmentLoading,


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
        auditLogs: auditLogsError,
        appointmentError,
        pastAppointmentError
    };



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
        codeAlertsData,

        dateFilter,

        appointments,
        pastappointments,

        selectedHostpital,
        selectedBranch,

        pagination,
        filter,
        dateRange,

        filterOptions,


        setDateFilter,
        setSelectedHostpital,
        setAppointments,
        setSelectedBranch,
        setPagination,
        setFilter,
        setForms,
        setPatients,
        setDateRangeFilter,
        setDateRange,

        isSuperAdmin,
        isAdmin,
        isNonAdmin,
        role,

        loading,
        errors,

        refetchDashboard,
        refetchPatients,
        refetchHospital,
        refetchAdmins,
        refetchUsers,
        refetchAppointments,
        dateRangeFilter,
        handleFilterChange

    }), [
        hospitals,
        branches,
        users,
        admins,
        allLogs,
        branchCount,
        analytics,
        metrics,
        forms,
        codeAlerts,
        branchFollowups,
        codeAlertsData,
        selectedHostpital,
        selectedBranch,
        pagination,
        appointmentData,
        patients,
        patientsData,
        pastAppointmentData,
        filter,
        dateRangeFilter,
        isSuperAdmin,
        isAdmin,
        isNonAdmin,
        role,
        loading,
        errors,
        dateRange,
        handleFilterChange
    ]);
    return (
        <HospitalContext.Provider value={contextValue}>
            {children}
        </HospitalContext.Provider>
    );
};

export default HospitalContext;