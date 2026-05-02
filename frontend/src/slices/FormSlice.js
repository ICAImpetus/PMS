import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    formData: {
        name: '',
        contactNumbers: [''],
        branches: [],
        departments: [],
        empanelmentList: [],
        testLabs: [],
        codeAnnouncements: [],
        ipdDetails: { noOfBeds: '', charges: '', location: '', category: '', serviceType: '' },
        dayCareDetails: { noOfBeds: '', charges: '', location: '', category: '', serviceType: '' },
        procedureList: [],
        departmentIncharge: []
    },
    loading: false,
    error: null
};

// Slice for form data
const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
        updateHospitalData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload };
        },

        addNewDepartment: (state, action) => {
            state.formData.departments.push(action.payload);
        },

        // You can add actions for other sections as needed (e.g., addNewDoctor, etc.)
        submitForm: (state) => {
            state.loading = true;
            state.error = null;
        },

        submitFormSuccess: (state) => {
            state.loading = false;
            state.error = null;
        },

        submitFormFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const { updateHospitalData, addNewDepartment, submitForm, submitFormSuccess, submitFormFailure } = formSlice.actions;

export default formSlice.reducer;
