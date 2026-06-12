import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import { toast } from "react-toastify";

export const statusStyles = {
    pending: {
        bg: "#ffcdd2",
        color: "#c62828",
    },
    success: {
        bg: "#c8e6c9",
        color: "#2e7d32",
    },
    inbound: {
        bg: "#c8e6c9",
        color: "#2e7d32",
    },
    outbound: {
        bg: "#ffccbc",
        color: "#ef6c00",
    },
};
export const PATIENT_AVAILABLE_COLUMNS = [
    { key: "patientName", label: "Patient Name" },
    { key: "patientMobile", label: "Patient Mobile No" },
    { key: "patientAge", label: "Patient Age" },
    { key: "gender", label: "Gender" },
    { key: "status", label: "Patient Status" },
    { key: "lastVisit.purpose", label: "POC / Purpose" },
    { key: "lastVisit.formData.appointmentSlot", label: "Appointment Slot" },
    { key: "lastVisit.formType", label: "Form Type" },
    { key: "lastVisit.doctor.name", label: "Doctor" },
    { key: "lastVisit.department.name", label: "Department" },
    { key: "createdAt", label: "Created At" },
];

export const FORMS_AVAILABLE_COLUMNS = [
    { key: "agentName", label: "Agent Name" },
    { key: "formType", label: "Form Type" },
    { key: "patientName", label: "Patient Name" },
    { key: "patientMobile", label: "Patient Mobile No" },
    { key: "patientStatus", label: "Patient Status" },
    { key: "gender", label: "Patient Gender" },
    { key: "callStatus", label: "Call Status" },
    { key: "purpose", label: "POC / Purpose" },
    { key: "appointmentSlot", label: "App. Slot" },
    { key: "formData.remarks", label: "Remarks" },
    { key: "createdAt", label: "Submitted At" },
    // Additional unique fields from second array
    { key: "doctor.name", label: "Doctor" },
    { key: "department.name", label: "Department" },
    { key: "formData.surgeryName", label: "Surgery Name" },
    { key: "formData.healthPackageName", label: "Health Package" },
    { key: "formData.healthSchemeName", label: "Health Scheme Name" },
    { key: "formData.govertHealthSchemeName", label: "On-Govt Health Scheme Name" },
    { key: "formData.nonGovtHealthSchemeName", label: "Non-Govt Health Scheme Name" },
    { key: "formData.reportName", label: "Report Name" },
    { key: "followupStatus", label: "Follow-up Status" },
    { key: "formData.referenceFrom", label: "Reference From" },
    { key: "formData.callerType", label: "Caller Type" },
];
export const getNestedValue = (obj, path) => {
    const value = path.split(".").reduce((acc, key) => acc?.[key], obj);

    return value === "" || value === null || value === undefined
        ? "-"
        : value;
};

export const generateExportData = (data, columns) => {
    const headers = columns.map((column) => column.label);

    const rows = data.map((item) =>
        columns.map((column) => {
            let value = getNestedValue(item, column.key);

            switch (column.key) {
                case "createdAt":
                    return value
                        ? moment(value).format("DD/MM/YYYY hh:mm A")
                        : "N/A";

                default:
                    return value ?? "N/A";
            }
        })
    );

    return { headers, rows };
};

export const handleExportCSV = (
    data,
    columns,
    fileName = "export"
) => {
    if (!data?.length) {
        toast.error("No data to export");
        return;
    }

    const { headers, rows } = generateExportData(data, columns);

    const csvContent = [headers, ...rows]
        .map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success("CSV exported successfully!");
};

export const handleExportExcel = (
    data,
    columns,
    fileName = "export"
) => {
    if (!data?.length) {
        toast.error("No data to export");
        return;
    }

    const { headers, rows } = generateExportData(data, columns);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Data");

    XLSX.writeFile(wb, `${fileName}.xlsx`);

    toast.success("Excel exported successfully!");
};

export const handleExportPDF = (
    data,
    columns,
    title = "Report",
    fileName = "export"
) => {
    if (!data?.length) {
        toast.error("No data to export");
        return;
    }

    const { headers, rows } = generateExportData(data, columns);

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(title, 14, 15);

    doc.setFontSize(10);
    doc.text(
        `Export Date: ${moment().format("DD/MM/YYYY hh:mm A")}`,
        14,
        22
    );

    autoTable(doc, {
        startY: 30,
        head: [headers],
        body: rows,
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: [33, 47, 61],
            textColor: 255,
            fontStyle: "bold",
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
    });

    doc.save(`${fileName}.pdf`);

    toast.success("PDF exported successfully!");
};

export const handleExport = ({
    format,
    data,
    columns,
    fileName = "export",
    title = "Report",
}) => {
    switch (format) {
        case "csv":
            return handleExportCSV(
                data,
                columns,
                fileName
            );

        case "excel":
            return handleExportExcel(
                data,
                columns,
                fileName
            );

        case "pdf":
            return handleExportPDF(
                data,
                columns,
                title,
                fileName
            );

        default:
            toast.error("Invalid export format");
    }
};