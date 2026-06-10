// import { updateLabTest } from "../../../backend/controllers/hospitalController";
// import { updateLabTest } from "../../../backend/controllers/hospitalController";
import API from "./axiosInstance";

export const commonRoutes = {

  login: (data) => API.post("api/login", data),
  getMe: () => API.get("/api/getMe"),

  updateUserPassword: (username, newPassword) => {
    return API.put("/api/updatePassword", { username, newPassword })
  },
  getAllUsers: (hosId = null, branchId = null, filterType = null) => {
    const params = {};

    if (hosId) params.hosId = hosId;
    if (branchId) params.branchId = branchId;
    if (filterType) params.filterType = filterType;

    return API.get(`/api/getAllUsers`, { params });
  },
  getAllHospital: () => API.get(`api/getAllHospitals`),

  addBranch: (hosId, data) => API.post(`api/add-branch/${hosId}`, data),
  updateBranch: (hosId, branchId, data) => API.post(`api/update-branch`, data, {
    params: {
      hosId,
      branchId

    }
  }),
  deleteBranch: (hosId, branchId) => API.delete(`api/hospitals/${hosId}/branch/${branchId}`),


  checkUserName: (username) =>
    API.get(`api/check-user-name?username=${username}`),

  getHospitalBranchById: (id) => API.get(`api/all-hospital-branches/${id}`),
  getBranchById: (id, hosId) => API.get(`api/single-branch/${hosId}/${id}`),
  branchesByRole: (hosId) => API.get(`api/getBranchesByRole`, {
    params: {
      hosId
    }
  }),

  getSingleDoctor: (hosId, docId) => API.get(`api/doctor-profile/${docId}`, {
    params: {
      hosId
    }
  }),

  uploadBranchCSV: (hosId, branchId, formdata) => {
    return API.post(`api/upload-branch-csv`, formdata, {
      params: {
        hosId,
        branchId
      }
    })
  },
  addDoctor: (hosId, branchId, data) => {
    return API.post(`api/add-doctor`, data, {
      params: {
        hosId, branchId
      }
    })
  },


  removeDoc: (hosId, docId) =>
    API.delete(`api/remove-doctor/${docId}`, {
      params: {
        hosId
      }
    }),

  updateDoctor: (hosId, docId, data) =>
    API.put(`api/update-doctor/${docId}`, data, {
      params: {
        hosId
      }
    }),

  updateDoctorStatus: (hosId, docId, currentStatus, unavailableDates = []) =>
    API.put(`api/update-doctor-status/${docId}`, { unavailableDates }, {
      params: {
        hosId,
        currentStatus
      }
    }),

  getDoctors: (hosId, branchId, depId) =>
    API.get(`api/get-doctors/${hosId}/${branchId}/${depId}`),



  addUsers: (data) =>
    API.post(`api/addUsers`, data),

  updateUser: (id, data) => {
    return API.put(`api/updateUser/${id}`, data)
  },

  addDep: (hosId, branchId, data) =>
    API.post(`api/add-dep`, data, {
      params: {
        hosId, branchId
      }
    }),

  removeDep: (hosId, depId) =>
    API.delete(`api/remove-dep/${depId}`, {
      params: {
        hosId
      }
    }),

  updateDep: (hosId, depId, data) =>
    API.put(`api/update-dep/${depId}`, data, {
      params: {
        hosId
      }
    }),

  addEmpanelment: (hosId, branchId, data) =>
    API.post(`api/add-empanelment`, data, {
      params: {
        hosId,
        branchId
      }
    }),

  updateEmpanelment: (hosId, empId, data) =>
    API.put(`api/update-empanelment/${empId}`, data, {
      params: {
        hosId
      }
    }),

  removeEmp: (hosId, empId) =>
    API.delete(`api/remove-empanelment/${empId}`, {
      params: {
        hosId
      }
    }),



  addLabtest: (hosId, branchId, data) =>
    API.post(`api/add-labtest`, data, {
      params: {
        hosId, branchId
      }
    }),

  updateLabTest: (hosId, labTestId, data) =>
    API.put(`api/update-labtest/${labTestId}`, data, {
      params: {
        hosId
      }
    }),

  removeLabtest: (hosId, labTestId) =>
    API.delete(`api/remove-labtest/${labTestId}`, {
      params: {
        hosId
      }
    }),



  addIPDandDayCare: (hosId, branchId, type, data) =>
    API.post(`api/add-ipd-day-care`, data, {
      params: {
        hosId,
        branchId,
        type
      }
    }),

  updateIPDAndDayCare: (hosId, id, type, data) =>
    API.put(`api/update-ipd-day-care/${id}`, data, {
      params: {
        hosId,
        type
      }
    }),

  removeIPDandDayCare: (hosId, id, type) =>
    API.delete(`api/remove-iPDandDayCare/${id}`, {
      params: {
        hosId,
        type
      }
    }),



  addProcedure: (hosId, branchId, data) =>
    API.post(`api/add-procedure`, data, {
      params: {
        hosId,
        branchId,
      }
    }),

  updateProcedure: (hosId, procedureId, type, data) =>
    API.put(`api/update-procedure/${procedureId}`, data, {
      params: {
        hosId,
        type,
      }
    }),

  removeProcedure: (hosId, procedureId) =>
    API.delete(`api/remove-procedure/${procedureId}`, {
      params: {
        hosId,
      }
    }),



  addIncharge: (hosId, branchId, data) =>
    API.post(`api/add-incharge`, data, {
      params: {
        hosId,
        branchId
      }
    }),

  updateIncharge: (hosId, inchargeId, data) =>
    API.put(`api/update-incharge/${inchargeId}`, data, {
      params: {
        hosId,
      }
    }),

  removeIncharge: (hosId, inchargeId) =>
    API.delete(`api/remove-incharge/${inchargeId}`, {
      params: {
        hosId,
      }
    }),



  addCodeAnnouncement: (hosId, branchId, data) =>
    API.post(`api/add-code-announcement`, data, {
      params: {
        hosId,
        branchId
      }
    }),

  updateCodeAnnouncement: (hosId, codeAnnouncementId, data) =>
    API.put(`api/update-code-announcement/${codeAnnouncementId}`, data, {
      params: {
        hosId,
      }
    }),

  removeCodeAnnouncement: (hosId, codeAnnouncementId) =>
    API.delete(`api/remove-code-announcement/${codeAnnouncementId}`, {
      params: {
        hosId,
      }
    }),



  createCodeAlert: (hosId, data) =>
    API.post(`api/add-code-alert`, data, {
      params: {
        hosId
      }
    }),


  getFilledForms: (
    filter,
    page,
    branchId = null,
    hospitalId = null,
    isExport = false,
    startDate = null,
    endDate = null,
    searchName = ""
  ) => {
    const params = {
      filter,
      page,
      isExport,
    };

    if (branchId) params.branchId = branchId;
    if (hospitalId) params.hospitalId = hospitalId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (searchName?.trim()) params.searchName = searchName.trim();

    console.log("params", params);

    return API.get("api/filled-forms", { params });
  },


  saveFilledForm: (hosId, branchId, data) =>

    API.post(`api/filled-forms`, data, {
      params: {
        hosId,
        branchId
      }
    }),



  getSuggestions: (hosId) =>
    API.get(`api/getSuggestions/${hosId}`),

  getCodeAlerts: (hospitalId, branchId) => {

    return API.get(`api/getCodeAlert`, {
      params: {
        hospitalId, branchId
      }
    })

  },


  toggleCodeAlertStatus: (hosId, id) => {

    return API.put(`api/toggle-alert/${id}`, null, {
      params: {
        hosId
      }
    })
  }

  ,
  getCreatedCodeAlerts: (hospitalId, branchId) => {
    return API.get(`api/get-created-code-alert`, {
      params: {
        hospitalId,
        branchId
      }
    })
  },

  getPatients: (
    filter = null,
    page,
    branchId = null,
    hospitalId = null,
    startDate = null,
    endDate = null,
    searchInput = null,
    isExport = false
  ) => {
    const params = { page, isExport };

    if (filter != null) params.filter = filter;
    if (branchId != null) params.branchId = branchId;
    if (hospitalId) params.hospitalId = hospitalId;
    if (searchInput) params.searchInput = searchInput;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return API.get("api/get-patients", { params });
  },

  getSinglePatientsHistory: (
    hospitalId,
    patientId,
    page,
    startDate,
    endDate,
    searchInput,
    isExport = false
  ) => {

    const params = {
      hospitalId,
      patientId,
      page,
      isExport,
    };

    console.log("params", params);


    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (searchInput) params.searchInput = searchInput;

    console.log("paramr", params);


    return API.get(`api/single-patient-history/`, { params });
  },

  getBookedSlotsApi: (hosId, branchId, data) =>

    API.post(`api/booked-slots`, data, {
      params: {
        hosId,
        branchId
      }
    }),

  updateFormApi: (hosId, branchId, data) =>
    API.put(`api/update-form`, data, {
      params: {
        hosId,
        branchId
      }
    }),

  getPatientByMobile: (hospitalId, branchId, patientMobile) =>
    API.get(`api/getpatientByMobile`, {
      params: {
        hospitalId,
        branchId,
        patientMobile
      }
    }),
  getDoctorAppointments: (
    hospitalId,
    branchId,
    doctorId,
    dateFilter
  ) => {
    return API.get("api/doctor-appointments", {
      params: {
        hospitalId,
        branchId,
        doctorId,
        dateFilter
      },
    })
  },
  getPastDoctorAppointments: (
    hospitalId,
    branchId,
    doctorId,
    page = 1,
    limit = 10
  ) =>
    API.get("api/doctor-past-appointments", {
      params: {
        hospitalId,
        branchId,
        doctorId,
        page,
        limit,
      },
    }),
  getAuditLogs: () => API.get(`api/get-audit-logs`),

  getSelectedBranches: (hospitalId) => {
    return API.get(`api/get-branches`, {
      params: {
        hospitalId
      },
    });
  },
  getDashboard: (branch = null, hospitalId = null) => {
    const params = {};

    if (branch != null) params.branch = branch;
    if (hospitalId != null && hospitalId !== '' && hospitalId !== "") params.hospitalId = hospitalId;

    return API.get("api/dashboard", { params });
  }
  ,
  assignData: (migraterId, migratedId) => API.put(`api/assign-data?from=${migraterId}&to=${migratedId}`),
  getNotifications: () => API.get("api/get-notifications"),
  markNotificationsRead: () => API.put("api/mark-notifications-read"),
  clearNotifications: () => API.delete("api/clear-notifications")

}

export const superAdminRoutes = {
  getAllHospital: () => API.get(`api/getAllHospitals`),
  addHospital: (data) => API.post(`api/addOrUpdateHospital`, data),
  updateHospital: (id, data) => API.put(`api/updateHospital/${id}`, data),
  getMasterSuggestions: (type) => API.get(`api/get-master-suggestions`, { params: { type } }),
  deleteUser: (id) => API.delete(`api/deleteUser/${id}`),
  getAllUsers: (hosId = null, branchId = null, filterType = null) => {
    const params = {};

    if (hosId) params.hosId = hosId;
    if (branchId) params.branchId = branchId;
    if (filterType) params.filterType = filterType;

    return API.get(`/api/getAllUsers`, { params });
  }
};
