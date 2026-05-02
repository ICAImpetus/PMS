const handleChange = (field, value) => {
    dispatch({ type: `SET_${field.toUpperCase()}`, payload: value });
};

const handleBranchChange = (index, field, value) => {
    const updatedBranches = state.branches.map((branch, i) => 
        i === index ? { ...branch, [field]: value } : branch
    );
    dispatch({ type: "SET_BRANCHES", payload: updatedBranches });
};

const handleCodeAnnouncementChange = (index, field, value) => {
    const updatedAnnouncements = state.codeAnnouncements.map((announcement, i) => 
        i === index ? { ...announcement, [field]: value } : announcement
    );
    dispatch({ type: "SET_CODE_ANNOUNCEMENTS", payload: updatedAnnouncements });
};

const handleDepartmentChange = (index, field, value) => {
    const updatedDepartments = state.departments.map((dept, i) => 
        i === index ? { ...dept, [field]: value } : dept
    );
    dispatch({ type: "SET_DEPARTMENTS", payload: updatedDepartments });
};

const handleDoctorChange = (deptIndex, docIndex, field, value) => {
    const updatedDepartments = state.departments.map((dept, i) => 
        i === deptIndex 
            ? { 
                ...dept, 
                doctors: dept.doctors.map((doc, j) => 
                    j === docIndex ? { ...doc, [field]: value } : doc
                )
            }
            : dept
    );
    dispatch({ type: "SET_DEPARTMENTS", payload: updatedDepartments });
};

const handleEmpanelmentChange = (index, field, value) => {
    const updatedList = state.empanelmentList.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
    );
    dispatch({ type: "SET_EMPANELMENT_LIST", payload: updatedList });
};

const handleTestLabChange = (index, field, value) => {
    const updatedLabs = state.testLabs.map((lab, i) => 
        i === index ? { ...lab, [field]: value } : lab
    );
    dispatch({ type: "SET_TEST_LABS", payload: updatedLabs });
};

const handleProcedureChange = (index, field, value) => {
    const updatedProcedures = state.procedures.map((procedure, i) => 
        i === index ? { ...procedure, [field]: value } : procedure
    );
    dispatch({ type: "SET_PROCEDURES", payload: updatedProcedures });
};

const handleDepartmentInchargeChange = (index, field, value) => {
    const updatedIncharges = state.departmentIncharge.map((incharge, i) => 
        i === index ? { ...incharge, [field]: value } : incharge
    );
    dispatch({ type: "SET_DEPARTMENT_INCHARGE", payload: updatedIncharges });
};