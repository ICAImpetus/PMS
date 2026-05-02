import { createSlice } from "@reduxjs/toolkit";
import { initialBranchState as initialState } from "../scenes/hospitalform/formData";

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    // --- Top-level Branch Properties ---
    setBranch: (state, action) => {
      // Replaces the entire branch state with the payload
      return action.payload;
    },
    updateBranchField: (state, action) => {
      // Updates a top-level field (e.g., name, location, code, beds)
      const { field, value } = action.payload;
      state[field] = value;
    },
    addContactNumber: (state, action) => {
      // Adds a new contact number
      state.contactNumbers.push(action.payload);
    },
    removeContactNumber: (state, action) => {
      // Removes a contact number by its value
      state.contactNumbers = state.contactNumbers.filter(
        (number) => number !== action.payload
      );
    },

    // --- IPD Details ---
    updateIpdDetailsField: (state, action) => {
      // Updates a field within ipdDetails
      const { field, value } = action.payload;
      state.ipdDetails[field] = value;
    },

    // --- Day Care Details ---
    updateDayCareDetailsField: (state, action) => {
      // Updates a field within dayCareDetails
      const { field, value } = action.payload;
      state.dayCareDetails[field] = value;
    },

    // --- Doctors Array Management ---
    addDoctor: (state, action) => {
      // Adds a new doctor object to the doctors array
      state.doctors.push(action.payload);
    },
    updateDoctor: (state, action) => {
      // Updates a specific doctor by ID (or a unique key like opdNo if no ID)
      const { id, updates } = action.payload;
      console.log("action.payload in redux dcotor update", action.payload);
      //   console.log('  state ====== :',state);
      const index = state.doctors?.findIndex(
        (doctor) => doctor.id === id || doctor.opdNo === id
      );
      console.log(
        "index where action .paylaod upadte in updateDoctore reducer func:",
        index
      );
      if (index !== -1) {
        state.doctors[index] = { ...state.doctors[index], ...updates };
        // console.log('state after updateing doctor in redux ',state)
      }
    },
    removeDoctor: (state, action) => {
      // Soft delete a doctor by ID (or opdNo) by setting isDeleted: true
      const idToRemove = action.payload;
      state.doctors = state.doctors.map((doctor) => {
        if (doctor.id === idToRemove || doctor.opdNo === idToRemove) {
          return { ...doctor, isDeleted: true };
        }
        return doctor;
      });
    },
    // Reducers for nested doctor properties like videoConsultation
    updateDoctorVideoConsultationField: (state, action) => {
      const { id, field, value } = action.payload; // Changed doctorId to id
      const doctor = state.doctors.find((d) => d.id === id || d.opdNo === id);
      if (doctor && doctor.videoConsultation) {
        doctor.videoConsultation[field] = value;
      }
    },
    addDoctorSpecialty: (state, action) => {
      const { id, specialty } = action.payload; // Changed doctorId to id
      const doctor = state.doctors.find((d) => d.id === id || d.opdNo === id);
      if (
        doctor &&
        doctor.specialties &&
        !doctor.specialties.includes(specialty)
      ) {
        doctor.specialties.push(specialty);
      }
    },
    removeDoctorSpecialty: (state, action) => {
      const { id, specialty } = action.payload; // Changed doctorId to id
      const doctor = state.doctors.find((d) => d.id === id || d.opdNo === id);
      if (doctor && doctor.specialties) {
        doctor.specialties = doctor.specialties.filter((s) => s !== specialty);
      }
    },
    addDoctorEmpanelment: (state, action) => {
      const { id, empanelment } = action.payload; // Changed doctorId to id
      const doctor = state.doctors.find((d) => d.id === id || d.opdNo === id);
      if (
        doctor &&
        doctor.empanelmentList &&
        !doctor.empanelmentList.includes(empanelment)
      ) {
        doctor.empanelmentList.push(empanelment);
      }
    },
    removeDoctorEmpanelment: (state, action) => {
      const { id, empanelment } = action.payload; // Changed doctorId to id
      const doctor = state.doctors.find((d) => d.id === id || d.opdNo === id);
      if (doctor && doctor.empanelmentList) {
        doctor.empanelmentList = doctor.empanelmentList.filter(
          (e) => e !== empanelment
        );
      }
    },

    // --- Departments Array Management ---
    addDepartment: (state, action) => {
      state.departments.push(action.payload);
    },
    updateDepartment: (state, action) => {
      // Updates a specific department by ID (or name)
      const { id, updates } = action.payload;
      const index = state.departments.findIndex(
        (dept) => dept.id === id || dept.name === id
      );
      console.log("index when update departemt in reducer redx func:", index);
      if (index !== -1) {
        state.departments[index] = { ...state.departments[index], ...updates };
      }
    },
    removeDepartment: (state, action) => {
      // Soft delete a department by ID (or name) by setting isDeleted: true
      const idToRemove = action.payload;
      state.departments = state.departments.map((dept) => {
        if (dept.id === idToRemove || dept.name === idToRemove) {
          return { ...dept, isDeleted: true };
        }
        return dept;
      });
    },
    // Note: If you need to manage doctors *within* a department, you'd need more complex reducers
    // like updateDepartmentDoctor or removeDepartmentDoctor, which would involve finding the department
    // then finding the doctor within that department's doctors array.

    // --- Empanelment List Array Management ---
    addEmpanelmentPolicy: (state, action) => {
      state.empanelmentList.push(action.payload);
    },
    updateEmpanelmentPolicy: (state, action) => {
      // Updates a specific empanelment policy by ID (or policyName)
      const { id, updates } = action.payload;
      const index = state.empanelmentList.findIndex(
        (policy) => policy.id === id || policy.policyName === id
      );
      if (index !== -1) {
        state.empanelmentList[index] = {
          ...state.empanelmentList[index],
          ...updates,
        };
      }
    },
    removeEmpanelmentPolicy: (state, action) => {
      // Soft delete an empanelment policy by ID (or policyName) by setting isDeleted: true
      const idToRemove = action.payload;
      state.empanelmentList = state.empanelmentList.map((policy) => {
        if (policy.id === idToRemove || policy.policyName === idToRemove) {
          return { ...policy, isDeleted: true };
        }
        return policy;
      });
    },
    addEmpanelmentSpecialty: (state, action) => {
      const { policyId, specialty } = action.payload;
      const policy = state.empanelmentList.find(
        (p) => p.id === policyId || p.policyName === policyId
      );
      if (
        policy &&
        policy.coveringAreasOfSpeciality &&
        !policy.coveringAreasOfSpeciality.includes(specialty)
      ) {
        policy.coveringAreasOfSpeciality.push(specialty);
      }
    },
    removeEmpanelmentSpecialty: (state, action) => {
      const { policyId, specialty } = action.payload;
      const policy = state.empanelmentList.find(
        (p) => p.id === policyId || p.policyName === policyId
      );
      if (policy && policy.coveringAreasOfSpeciality) {
        policy.coveringAreasOfSpeciality =
          policy.coveringAreasOfSpeciality.filter((s) => s !== specialty);
      }
    },
    addEmpanelmentDoctorAvailable: (state, action) => {
      const { policyId, doctorName } = action.payload;
      const policy = state.empanelmentList.find(
        (p) => p.id === policyId || p.policyName === policyId
      );
      if (
        policy &&
        policy.doctorsAvailable &&
        !policy.doctorsAvailable.includes(doctorName)
      ) {
        policy.doctorsAvailable.push(doctorName);
      }
    },
    removeEmpanelmentDoctorAvailable: (state, action) => {
      const { policyId, doctorName } = action.payload;
      const policy = state.empanelmentList.find(
        (p) => p.id === policyId || p.policyName === policyId
      );
      if (policy && policy.doctorsAvailable) {
        policy.doctorsAvailable = policy.doctorsAvailable.filter(
          (d) => d !== doctorName
        );
      }
    },

    // --- Test Labs Array Management ---
    addTestLab: (state, action) => {
      state.testLabs.push(action.payload);
    },
    updateTestLab: (state, action) => {
      // Updates a specific test lab by ID (or testCode)
      const { id, updates } = action.payload;
      const index = state.testLabs.findIndex(
        (lab) => lab.id === id || lab.testCode === id
      );
      if (index !== -1) {
        state.testLabs[index] = { ...state.testLabs[index], ...updates };
      }
    },
    removeTestLab: (state, action) => {
      // Soft delete a test lab by ID (or testCode) by setting isDeleted: true
      const idToRemove = action.payload;
      state.testLabs = state.testLabs.map((lab) => {
        if (lab.id === idToRemove || lab.testCode === idToRemove) {
          return { ...lab, isDeleted: true };
        }
        return lab;
      });
    },
    addTestLabCategoryApplicability: (state, action) => {
      const { testLabId, category } = action.payload;
      const testLab = state.testLabs.find(
        (t) => t.id === testLabId || t.testCode === testLabId
      );
      if (
        testLab &&
        testLab.categoryApplicability &&
        !testLab.categoryApplicability.includes(category)
      ) {
        testLab.categoryApplicability.push(category);
      }
    },
    removeTestLabCategoryApplicability: (state, action) => {
      const { testLabId, category } = action.payload;
      const testLab = state.testLabs.find(
        (t) => t.id === testLabId || t.testCode === testLabId
      );
      if (testLab && testLab.categoryApplicability) {
        testLab.categoryApplicability = testLab.categoryApplicability.filter(
          (c) => c !== category
        );
      }
    },

    // --- Code Announcements Array Management ---
    addCodeAnnouncement: (state, action) => {
      state.codeAnnouncements.push(action.payload);
    },
    updateCodeAnnouncement: (state, action) => {
      // Updates a specific code announcement by ID (or shortCode)
      const { id, updates } = action.payload;
      const index = state.codeAnnouncements.findIndex(
        (announcement) =>
          announcement.id === id || announcement.shortCode === id
      );
      if (index !== -1) {
        state.codeAnnouncements[index] = {
          ...state.codeAnnouncements[index],
          ...updates,
        };
      }
    },
    removeCodeAnnouncement: (state, action) => {
      // Soft delete a code announcement by ID (or shortCode) by setting isDeleted: true
      const idToRemove = action.payload;
      state.codeAnnouncements = state.codeAnnouncements.map((announcement) => {
        if (announcement.id === idToRemove || announcement.shortCode === idToRemove) {
          return { ...announcement, isDeleted: true };
        }
        return announcement;
      });
    },
    addCodeAnnouncementStaff: (state, action) => {
      const { announcementId, staffMember } = action.payload;
      const announcement = state.codeAnnouncements.find(
        (a) => a.id === announcementId || a.shortCode === announcementId
      );
      if (announcement && announcement.staff) {
        announcement.staff.push(staffMember);
      }
    },
    updateCodeAnnouncementStaff: (state, action) => {
      const { announcementId, staffName, updates } = action.payload;
      const announcement = state.codeAnnouncements.find(
        (a) => a.id === announcementId || a.shortCode === announcementId
      );
      if (announcement && announcement.staff) {
        const staffIndex = announcement.staff.findIndex(
          (s) => s.name === staffName
        );
        if (staffIndex !== -1) {
          announcement.staff[staffIndex] = {
            ...announcement.staff[staffIndex],
            ...updates,
          };
        }
      }
    },
    removeCodeAnnouncementStaff: (state, action) => {
      const { announcementId, staffName } = action.payload;
      const announcement = state.codeAnnouncements.find(
        (a) => a.id === announcementId || a.shortCode === announcementId
      );
      if (announcement && announcement.staff) {
        announcement.staff = announcement.staff.filter(
          (s) => s.name !== staffName
        );
      }
    },

    // --- Procedure List Array Management ---
    addProcedure: (state, action) => {
      state.procedureList.push(action.payload);
    },
    updateProcedure: (state, action) => {
      // Updates a specific procedure by ID (or name)
      const { id, updates } = action.payload;
      const index = state.procedureList.findIndex(
        (proc) => proc.id === id || proc.name === id
      );
      if (index !== -1) {
        state.procedureList[index] = {
          ...state.procedureList[index],
          ...updates,
        };
      }
    },
    removeProcedure: (state, action) => {
      // Soft delete a procedure by ID (or name) by setting isDeleted: true
      const idToRemove = action.payload;
      state.procedureList = state.procedureList.map((proc) => {
        if (proc.id === idToRemove || proc.name === idToRemove) {
          return { ...proc, isDeleted: true };
        }
        return proc;
      });
    },
    addProcedureDoctor: (state, action) => {
      const { procedureId, doctorName } = action.payload;
      const procedure = state.procedureList.find(
        (p) => p.id === procedureId || p.name === procedureId
      );
      if (
        procedure &&
        procedure.doctorName &&
        !procedure.doctorName.includes(doctorName)
      ) {
        procedure.doctorName.push(doctorName);
      }
    },
    removeProcedureDoctor: (state, action) => {
      const { procedureId, doctorName } = action.payload;
      const procedure = state.procedureList.find(
        (p) => p.id === procedureId || p.name === procedureId
      );
      if (procedure && procedure.doctorName) {
        procedure.doctorName = procedure.doctorName.filter(
          (d) => d !== doctorName
        );
      }
    },
    addProcedureEmpanelmentType: (state, action) => {
      const { procedureId, empanelmentType } = action.payload;
      const procedure = state.procedureList.find(
        (p) => p.id === procedureId || p.name === procedureId
      );
      if (
        procedure &&
        procedure.empanelmentType &&
        !procedure.empanelmentType.includes(empanelmentType)
      ) {
        procedure.empanelmentType.push(empanelmentType);
      }
    },
    removeProcedureEmpanelmentType: (state, action) => {
      const { procedureId, empanelmentType } = action.payload;
      const procedure = state.procedureList.find(
        (p) => p.id === procedureId || p.name === procedureId
      );
      if (procedure && procedure.empanelmentType) {
        procedure.empanelmentType = procedure.empanelmentType.filter(
          (e) => e !== empanelmentType
        );
      }
    },
    addProcedureCoordinator: (state, action) => {
      const { procedureId, coordinatorName } = action.payload;
      const procedure = state.procedureList.find(
        (p) => p.id === procedureId || p.name === procedureId
      );
      if (
        procedure &&
        procedure.coordinatorName &&
        !procedure.coordinatorName.includes(coordinatorName)
      ) {
        procedure.coordinatorName.push(coordinatorName);
      }
    },
    removeProcedureCoordinator: (state, action) => {
      const { procedureId, coordinatorName } = action.payload;
      const procedure = state.procedureList.find(
        (p) => p.id === procedureId || p.name === procedureId
      );
      if (procedure && procedure.coordinatorName) {
        procedure.coordinatorName = procedure.coordinatorName.filter(
          (c) => c !== coordinatorName
        );
      }
    },

    // --- Department Incharge Array Management ---
    addDepartmentIncharge: (state, action) => {
      state.departmentIncharge.push(action.payload);
    },
    updateDepartmentIncharge: (state, action) => {
      // Updates a specific department in-charge by ID (or name)
      const { id, updates } = action.payload;
      const index = state.departmentIncharge.findIndex(
        (incharge) => incharge.id === id || incharge.name === id
      );
      if (index !== -1) {
        state.departmentIncharge[index] = {
          ...state.departmentIncharge[index],
          ...updates,
        };
      }
    },
    removeDepartmentIncharge: (state, action) => {
      // Soft delete a department in-charge by ID (or name) by setting isDeleted: true
      const idToRemove = action.payload;
      state.departmentIncharge = state.departmentIncharge.map((incharge) => {
        if (incharge.id === idToRemove || incharge.name === idToRemove) {
          return { ...incharge, isDeleted: true };
        }
        return incharge;
      });
    },
  },
});

export const {
  setBranch,
  updateBranchField,
  addContactNumber,
  removeContactNumber,
  updateIpdDetailsField,
  updateDayCareDetailsField,
  addDoctor,
  updateDoctor,
  removeDoctor,
  updateDoctorVideoConsultationField,
  addDoctorSpecialty,
  removeDoctorSpecialty,
  addDoctorEmpanelment,
  removeDoctorEmpanelment,
  addDepartment,
  updateDepartment,
  removeDepartment,
  addEmpanelmentPolicy,
  updateEmpanelmentPolicy,
  removeEmpanelmentPolicy,
  addEmpanelmentSpecialty,
  removeEmpanelmentSpecialty,
  addEmpanelmentDoctorAvailable,
  removeEmpanelmentDoctorAvailable,
  addTestLab,
  updateTestLab,
  removeTestLab,
  addTestLabCategoryApplicability,
  removeTestLabCategoryApplicability,
  addCodeAnnouncement,
  updateCodeAnnouncement,
  removeCodeAnnouncement,
  addCodeAnnouncementStaff,
  updateCodeAnnouncementStaff,
  removeCodeAnnouncementStaff,
  addProcedure,
  updateProcedure,
  removeProcedure,
  addProcedureDoctor,
  removeProcedureDoctor,
  addProcedureEmpanelmentType,
  removeProcedureEmpanelmentType,
  addProcedureCoordinator,
  removeProcedureCoordinator,
  addDepartmentIncharge,
  updateDepartmentIncharge,
  removeDepartmentIncharge,
} = branchSlice.actions;

export default branchSlice.reducer;
