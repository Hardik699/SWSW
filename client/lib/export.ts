/**
 * Export utility functions for HR Dashboard data
 */

interface ExportEmployee {
  "Employee ID": string;
  "Full Name": string;
  Email: string;
  Department: string;
  Position: string;
  "Mobile Number": string;
  "Joining Date": string;
  Status: string;
  "Bank Account": string;
  "IFSC Code": string;
  "Aadhaar Number": string;
  "PAN Number": string;
  "Address": string;
}

/**
 * Convert employees data to CSV format
 */
export const exportToCSV = (
  employees: any[],
  departments?: any[],
  filename: string = "hr-data.csv"
) => {
  if (employees.length === 0) {
    alert("No data to export");
    return;
  }

  // Prepare employee data for export
  const csvData = employees.map((emp) => ({
    "Employee ID": emp.employeeId || "",
    "Full Name": emp.fullName || "",
    Email: emp.email || "",
    Department: emp.department || "",
    Position: emp.position || "",
    "Mobile Number": emp.mobileNumber || "",
    "Emergency Mobile": emp.emergencyMobileNumber || "",
    "Joining Date": emp.joiningDate || "",
    Status: emp.status || "",
    "Father Name": emp.fatherName || "",
    "Mother Name": emp.motherName || "",
    "Birth Date": emp.birthDate || "",
    "Blood Group": emp.bloodGroup || "",
    "Address": emp.address || "",
    "Permanent Address": emp.permanentAddress || "",
    "Bank Account": emp.accountNumber || "",
    "IFSC Code": emp.ifscCode || "",
    "Aadhaar Number": emp.aadhaarNumber || "",
    "PAN Number": emp.panNumber || "",
    "UAN Number": emp.uanNumber || "",
    "Salary": emp.salary || "",
    "Table Number": emp.tableNumber || "",
  }));

  // Get headers
  const headers = Object.keys(csvData[0]);

  // Create CSV content
  let csvContent = headers.join(",") + "\n";

  // Add data rows
  csvData.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header as keyof typeof row];
      // Escape quotes and wrap in quotes if contains comma
      if (value && typeof value === "string" && value.includes(",")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || "";
    });
    csvContent += values.join(",") + "\n";
  });

  // Create and download file
  downloadFile(csvContent, filename, "text/csv");
};

/**
 * Convert employees data to Excel format using a simple approach
 * For production, consider using libraries like xlsx or exceljs
 */
export const exportToExcel = (
  employees: any[],
  departments?: any[],
  filename: string = "hr-data.xlsx"
) => {
  if (employees.length === 0) {
    alert("No data to export");
    return;
  }

  // For now, we'll use a CSV-based approach that can be opened in Excel
  // In production, you might want to use the 'xlsx' library for true Excel format
  const csvData = employees.map((emp) => ({
    "Employee ID": emp.employeeId || "",
    "Full Name": emp.fullName || "",
    Email: emp.email || "",
    Department: emp.department || "",
    Position: emp.position || "",
    "Mobile Number": emp.mobileNumber || "",
    "Emergency Mobile": emp.emergencyMobileNumber || "",
    "Joining Date": emp.joiningDate || "",
    Status: emp.status || "",
    "Father Name": emp.fatherName || "",
    "Mother Name": emp.motherName || "",
    "Birth Date": emp.birthDate || "",
    "Blood Group": emp.bloodGroup || "",
    "Address": emp.address || "",
    "Permanent Address": emp.permanentAddress || "",
    "Bank Account": emp.accountNumber || "",
    "IFSC Code": emp.ifscCode || "",
    "Aadhaar Number": emp.aadhaarNumber || "",
    "PAN Number": emp.panNumber || "",
    "UAN Number": emp.uanNumber || "",
    "Salary": emp.salary || "",
    "Table Number": emp.tableNumber || "",
  }));

  const headers = Object.keys(csvData[0]);
  let csvContent = headers.join("\t") + "\n";

  csvData.forEach((row) => {
    const values = headers.map((header) => row[header as keyof typeof row] || "");
    csvContent += values.join("\t") + "\n";
  });

  // For Excel, create a more proper format with BOM for UTF-8
  const BOM = "\uFEFF";
  downloadFile(BOM + csvContent, filename, "application/vnd.ms-excel");
};

/**
 * Export department-wise employee summary
 */
export const exportDepartmentSummary = (
  employees: any[],
  departments: any[],
  filename: string = "department-summary.csv"
) => {
  const summary = departments.map((dept) => {
    const deptEmployees = employees.filter(
      (emp) => emp.department === dept.name
    );
    return {
      Department: dept.name,
      Manager: dept.manager || "",
      "Total Employees": deptEmployees.length,
      "Active Employees": deptEmployees.filter((e) => e.status === "active")
        .length,
      "Inactive Employees": deptEmployees.filter((e) => e.status === "inactive")
        .length,
    };
  });

  const headers = Object.keys(summary[0]);
  let csvContent = headers.join(",") + "\n";

  summary.forEach((row) => {
    const values = headers.map((header) => row[header as keyof typeof row] || "");
    csvContent += values.join(",") + "\n";
  });

  downloadFile(csvContent, filename, "text/csv");
};

/**
 * Helper function to download file
 */
const downloadFile = (
  content: string,
  filename: string,
  mimeType: string
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
