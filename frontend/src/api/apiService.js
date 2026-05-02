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
    console.log("hosId", formdata);

    return API.post(`api/upload-branch-csv`, formdata, {
      params: {
        hosId,
        branchId
      }
    })
  },
  addDoctor: (hosId, branchId, data) => {
    console.log("hosId", branchId,);

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

  updateDoctorStatus: (hosId, docId, currentStatus) =>
    API.put(`api/update-doctor-status/${docId}`, {
      params: {
        hosId,
        currentStatus
      }
    }),

  getDoctors: (hosId, branchId, depId) =>
    API.get(`api/get-doctors/${hosId}/${branchId}/${depId}`),



  addUsers: (data) =>
    API.post(`api/addUsers`, data),

  updateUser: (id, data) =>
    API.put(`api/updateUser/${id}`, data),



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



  getFilledForms: (filter, page, branchId = null, hospitalId = null) => {
    // console.log("branchId", branchId);
    // console.log("hospitalId", hospitalId);

    const params = { filter, page };

    if (branchId != null) params.branchId = branchId;
    if (hospitalId) params.hospitalId = hospitalId;

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
    hospitalId = null
  ) => {
    // consosle.log("hospitalId", hospitalId);

    const params = { page };

    if (filter != null) params.filter = filter;
    if (branchId != null) params.branchId = branchId;
    if (hospitalId) params.hospitalId = hospitalId;

    return API.get("api/get-patients", { params });
  },

  getSinglePatientsHistory: (hospitalId, patientId, page) =>
    API.get(`api/single-patient-history/`, {
      params: {
        hospitalId,
        patientId,
        page
      }
    }),

  // addDoctor: (branchid, data) => API.post(`api/add-doctor/${branchid}`, data),
  // removeDoc: (docId) => API.delete(`api/remove-doctor/${docId}`),
  // updateDoctor: (docId, data) => API.put(`api/update-doctor/${docId}`, data),
  // getDoctors: (depId) => API.get(`api/get-doctors/${depId}`),

  // addUsers: (data) => API.post(`api/addUsers`, data),

  // updateUser: (id, data) => API.put(`api/updateUser/${id}`, data),

  // addDep: (hosId, branchId, data) => API.post(`api/add-dep/${hosId}/${branchId}`, data),
  // removeDep: (depId) => API.delete(`api/remove-dep/${depId}`),
  // updateDep: (depId, data) => API.put(`api/update-dep/${depId}`, data),

  // addEmpanelment: (branchid, data) =>
  //   API.post(`api/add-empanelment/${branchid}`, data),
  // updateEmpanelment: (empId, data) =>
  //   API.put(`api/update-empanelment/${empId}`, data),
  // removeEmp: (empId) => API.delete(`api/remove-empanelment/${empId}`),

  // addLabtest: (branchid, data) => API.post(`api/add-labtest/${branchid}`, data),
  // updateLabTest: (labTestId, data) => API.put(`api/update-labtest/${labTestId}`, data),
  // removeLabtest: (labTestId) => API.delete(`api/remove-labtest/${labTestId}`),

  // addIPDandDayCare: (iPDandDayCareId, type, data) => API.post(`api/add-ipd-day-care/${iPDandDayCareId}?type=${type}`, data),
  // updateIPDAndDayCare: (iPDandDayCareId, type, data) =>
  //   API.put(`api/update-ipd-day-care/${iPDandDayCareId}?type=${type}`, data),
  // removeIPDandDayCare: (iPDandDayCareId, type) => API.delete(`api/remove-iPDandDayCare/${iPDandDayCareId}?type=${type}`),

  // addProcedure: (procedureId, type, data) => API.post(`api/add-procedure/${procedureId}?type=${type}`, data),
  // updateProcedure: (procedureId, type, data) => API.put(`api/update-procedure/${procedureId}?type=${type}`, data),
  // removeProcedure: (procedureId) => API.delete(`api/remove-procedure/${procedureId}`),

  // addIncharge: (inchargeId, type, data) => API.post(`api/add-incharge/${inchargeId}?type=${type}`, data),
  // updateIncharge: (inchargeId, type, data) => API.put(`api/update-incharge/${inchargeId}?type=${type}`, data),
  // removeIncharge: (inchargeId, type) => API.delete(`api/remove-incharge/${inchargeId}?type=${type}`),


  // addCodeAnnouncement: (codeAnnouncementId, data) => API.post(`api/add-code-announcement/${codeAnnouncementId}`, data),
  // updateCodeAnnouncement: (codeAnnouncementId, data) => API.put(`api/update-code-announcement/${codeAnnouncementId}`, data),
  // removeCodeAnnouncement: (codeAnnouncementId) => API.delete(`api/remove-code-announcement/${codeAnnouncementId}`),
  // getFilledForms: (filter, page, branchId = null, hospitalId = null) => {
  //   const params = { filter, page };

  //   if (branchId != null) params.branchId = branchId;
  //   if (hospitalId != null && hospitalId !== '' && hospitalId !== "") params.hospitalId = hospitalId;

  //   return API.get("api/filled-forms", { params });
  // },
  // saveFilledForm: (data) => API.post(`api/filled-forms`, data),

  // createCodeAlert: (branchId, data) => API.post(`api/add-code-alert/${branchId}`, data),

  // getSuggestions: () => API.get(`api/getSuggestions`),
  // getCodeAlerts: () => API.get(`api/getCodeAlert`),
  // toggleCodeAlertStatus: (id) => API.put(`api/toggle-alert/${id}`),
  // getCreatedCodeAlerts: () => API.get(`api/get-created-code-alert`),

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
