export const getTableArrayFunc = (tableObject = {}) => {
    if (Object.keys(tableObject).length === 0) {
        return [];
    }

    const keyMappings = {
        codeAnnouncements: "Code Annoucements",
        departments: "Departments",
        branches: "Branches",
        empanelmentList: "Empanelment List",
        testLabs: "Test Labs",
        ipdDetails: "IPD Details",
        procedureList: "Procedure List",
        departmentIncharge: "Department Incharge",
        dayCareDetails: "Day Care Details"
    };


    return Object.entries(tableObject).map(([key, value]) => {
        let result = { key, value, type: typeof value };
        let modifiedKey = keyMappings[key] || key;


        if (Array.isArray(value)) {
            result = { key, key2: modifiedKey, content: `No of ${key}`, value: `${value.length}` };
        } else if (typeof value === "object" && value !== null) {
            result = { key, key2: modifiedKey, content: `No of Fields`, value: `${Object.keys(value).length}` };
        }

        return result;
    });
}


export const handleModalOpen = (rowdata) => {
    console.log('rowData is :', rowdata?.key);
    const key = rowdata?.key;

    switch (key) {
        case "branches":
            setBranchesOpen(true);
            break;
        case "codeAnnouncements":
            setCodeAnnouncementsOpen(true);
            break;
        case "departments":
            setDepartmentsOpen(true);
            break;
        case "empanelmentList":
            setEmpanelmentListOpen(true);
            break;
        case "testLabs":
            setTestLabsOpen(true);
            break;
        case "ipdDetails":
            setIpdDetailsOpen(true);
            break;
        case "dayCareDetails":
            setDayCareDetailsOpen(true);
            break;
        case "procedureList":
            setProceduresOpen(true);
            break;
        case "departmentIncharge":
            setDepartmentInchargeOpen(true);
            break;
        default:
            console.log('No matching key found in state');
            break;
    }
};


export const handleModalClose = (modalName) => {
    switch (modalName) {
        case "branches":
            setBranchesOpen(false);
            break;
        case "codeAnnouncements":
            setCodeAnnouncementsOpen(false);
            break;
        default:
            break;
    }
};