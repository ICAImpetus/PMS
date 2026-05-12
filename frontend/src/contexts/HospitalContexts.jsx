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



    const [selectedHostpital, setSelectedHostpital] = useState(
        isNonAdmin
            ? currentUser?.hospitals?.[0]?.hospitalId?._id || null
            : null
    );

    const [selectedBranch, setSelectedBranch] = useState(null);
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



    const mergePaginatedData = (oldData = [], newData = [], page = 1) => {
        if (page === 1) return newData;

        const oldIds = new Set(oldData.map((item) => item?._id));

        const filteredNew = newData.filter(
            (item) => !oldIds.has(item?._id)
        );

        return [...oldData, ...filteredNew];
    };



    const [patients, setPatients] = useState([]);
    const [users, setUsers] = useState([]);
    const [allLogs, setAllLogs] = useState([]);

    const [forms, setForms] = useState({
        today: [],
        appointments: [],
        followups: []
    });

    const [metrics, setMetrics] = useState({});



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
        enabled: !isExecutive,
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

            const res = isAdmin
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
        isFetching: dashboardLoading,
        refetch: refetchDashboard,
        error: dashboardError
    } = useQuery({
        queryKey: ["dashboard", selectedHostpital, selectedBranch],
        queryFn: async () => {

            const [dashboardRes, alertRes] = await Promise.all([
                commonRoutes.getDashboard(
                    selectedBranch,
                    selectedHostpital
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
        enabled: !!selectedHostpital && !!selectedBranch,
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

            return res?.data || {};
        },
        enabled:
            !!selectedHostpital &&
            (!!selectedBranch || !isNonAdmin),

        keepPreviousData: true,

        onError: () =>
            toast.error("Failed to fetch patients")
    });

    useEffect(() => {

        if (!patientsData) return;

        setPatients((prev) =>
            mergePaginatedData(
                prev,
                patientsData?.data || [],
                pagination.patients.page
            )
        );

        updatePagination(
            "patients",
            patientsData?.pagination
        );

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
        enabled: !!selectedHostpital && !isExecutive,
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



    const {
        data: formsData,
        isFetching: formsLoading,
        refetch: refetchForms,
        error: formsError
    } = useQuery({
        queryKey: [
            "forms",
            selectedHostpital,
            selectedBranch,
            filter,
            pagination.forms.page
        ],

        queryFn: async () => {

            const res = await commonRoutes.getFilledForms(
                filter,
                pagination.forms.page,
                isAdmin ? null : selectedBranch,
                selectedHostpital
            );

            return res.data?.data;
        },

        enabled: !!selectedHostpital,

        keepPreviousData: true,

        onError: () =>
            toast.error("Forms fetch failed")
    });

    useEffect(() => {

        if (!formsData) return;

        setForms((prev) => ({
            today: mergePaginatedData(
                prev.today,
                formsData?.forms?.today || [],
                pagination.forms.page
            ),

            appointments: mergePaginatedData(
                prev.appointments,
                formsData?.forms?.appointments || [],
                pagination.forms.page
            ),

            followups: mergePaginatedData(
                prev.followups,
                formsData?.forms?.followups || [],
                pagination.forms.page
            )
        }));

        setMetrics(formsData?.metrics || {});

        updatePagination(
            "forms",
            formsData?.metrics?.pagination
        );

    }, [formsData]);



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

        refetchDashboard,
        refetchPatients,
        refetchHospital,
        refetchAdmins,
        refetchUsers,
        refetchForms

    }), [
        hospitals,
        branches,
        patients,
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