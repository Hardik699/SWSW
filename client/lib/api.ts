/**
 * API Client for MongoDB operations
 * Centralized place to manage all API calls
 */

const API_BASE = "/api";

// Error handling helper
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// ============ EMPLOYEES ============
export const employees = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/employees`);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE}/employees/${id}`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE}/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/employees/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  getByDepartment: async (department: string) => {
    const response = await fetch(`${API_BASE}/employees/department/${department}`);
    return handleResponse(response);
  },

  getByStatus: async (status: string) => {
    const response = await fetch(`${API_BASE}/employees/status/${status}`);
    return handleResponse(response);
  },
};

// ============ DEPARTMENTS ============
export const departments = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/departments`);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE}/departments/${id}`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE}/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/departments/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },
};

// ============ IT ACCOUNTS ============
export const itAccounts = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/it-accounts`);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE}/it-accounts/${id}`);
    return handleResponse(response);
  },

  getByEmployeeId: async (employeeId: string) => {
    const response = await fetch(`${API_BASE}/it-accounts/employee/${employeeId}`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE}/it-accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE}/it-accounts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/it-accounts/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  getByDepartment: async (department: string) => {
    const response = await fetch(`${API_BASE}/it-accounts/department/${department}`);
    return handleResponse(response);
  },
};

// ============ ATTENDANCE ============
export const attendance = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/attendance`);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE}/attendance/${id}`);
    return handleResponse(response);
  },

  getByEmployeeId: async (employeeId: string, startDate?: string, endDate?: string) => {
    let url = `${API_BASE}/attendance/employee/${employeeId}`;
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    return handleResponse(response);
  },

  getByDate: async (date: string) => {
    const response = await fetch(`${API_BASE}/attendance/date/${date}`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE}/attendance/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/attendance/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },
};

// ============ LEAVE REQUESTS ============
export const leaveRequests = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/leave-requests`);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE}/leave-requests/${id}`);
    return handleResponse(response);
  },

  getByEmployeeId: async (employeeId: string, status?: string) => {
    let url = `${API_BASE}/leave-requests/employee/${employeeId}`;
    if (status) url += `?status=${status}`;

    const response = await fetch(url);
    return handleResponse(response);
  },

  getByStatus: async (status: string) => {
    const response = await fetch(`${API_BASE}/leave-requests/status/${status}`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE}/leave-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE}/leave-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/leave-requests/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },
};

// ============ SALARY RECORDS ============
export const salaryRecords = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/salary-records`);
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE}/salary-records/${id}`);
    return handleResponse(response);
  },

  getByEmployeeId: async (employeeId: string, year?: number) => {
    let url = `${API_BASE}/salary-records/employee/${employeeId}`;
    if (year) url += `?year=${year}`;

    const response = await fetch(url);
    return handleResponse(response);
  },

  getByMonth: async (month: string, year: number) => {
    const response = await fetch(`${API_BASE}/salary-records/month/${month}/${year}`);
    return handleResponse(response);
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE}/salary-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE}/salary-records/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/salary-records/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },
};
