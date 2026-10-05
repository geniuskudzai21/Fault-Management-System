const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem('token');
  }
  return authToken;
};

const fetchApi = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetchApi<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response;
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    area?: string;
  }) => {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => {
    return fetchApi<any>('/auth/me');
  },
};

export const usersApi = {
  getAll: async (params?: {
    role?: string;
    status?: string;
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
    isExternal?: boolean;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<any[]>(`/users${query ? `?${query}` : ''}`);
  },

  getStats: async () => {
    return fetchApi<any>('/users/stats');
  },

  getInspectors: async (area?: string) => {
    const query = area ? `?area=${area}` : '';
    return fetchApi<any[]>(`/users/inspectors${query}`);
  },

  create: async (userData: any) => {
    return fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id: string, userData: any) => {
    return fetchApi(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  updateStatus: async (id: string, status: string) => {
    return fetchApi(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: string) => {
    return fetchApi(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export const faultsApi = {
  getAll: async (params?: {
    status?: string;
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<any[]>(`/faults${query ? `?${query}` : ''}`);
  },

  getStats: async () => {
    return fetchApi<any>('/faults/stats');
  },

  getById: async (id: string) => {
    return fetchApi<any>(`/faults/${id}`);
  },

  create: async (faultData: {
    customerId?: string;
    technicianId?: string;
    address: string;
    category: string;
    priority: string;
    description: string;
    area: string;
  }) => {
    return fetchApi('/faults', {
      method: 'POST',
      body: JSON.stringify(faultData),
    });
  },

  update: async (id: string, faultData: {
    status?: string;
    technicianId?: string;
    assignedDate?: string;
    resolvedDate?: string;
    resolutionSteps?: string;
    materialsUsed?: string;
    timeSpent?: string;
    followUpRequired?: boolean;
    followUpNotes?: string;
  }) => {
    return fetchApi(`/faults/${id}`, {
      method: 'PUT',
      body: JSON.stringify(faultData),
    });
  },

  assign: async (id: string, technicianId: string) => {
    return fetchApi(`/faults/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ technicianId }),
    });
  },

  delete: async (id: string) => {
    return fetchApi(`/faults/${id}`, {
      method: 'DELETE',
    });
  },
};

export const schedulesApi = {
  getAll: async (params?: {
    status?: string;
    area?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<any[]>(`/schedules${query ? `?${query}` : ''}`);
  },

  getStats: async () => {
    return fetchApi<any>('/schedules/stats');
  },

  getById: async (id: string) => {
    return fetchApi<any>(`/schedules/${id}`);
  },

  getActive: async () => {
    return fetchApi<any[]>('/schedules/active');
  },

  create: async (scheduleData: {
    area: string;
    startTime: string;
    endTime: string;
    date: string;
    status?: string;
    reason: string;
    affectedCustomers: number;
    alternativeSupply?: boolean;
    notes?: string;
  }) => {
    return fetchApi('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  },

  update: async (id: string, scheduleData: {
    status?: string;
    startTime?: string;
    endTime?: string;
    reason?: string;
    affectedCustomers?: number;
    alternativeSupply?: boolean;
    notes?: string;
  }) => {
    return fetchApi(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
  },

  delete: async (id: string) => {
    return fetchApi(`/schedules/${id}`, {
      method: 'DELETE',
    });
  },
};

export const reportsApi = {
  getOverview: async () => {
    return fetchApi<any>('/reports/overview');
  },

  getLicenses: async (params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
    status?: string;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<any[]>(`/reports/licenses${query ? `?${query}` : ''}`);
  },

  getRequests: async (params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
    status?: string;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<any[]>(`/reports/requests${query ? `?${query}` : ''}`);
  },
};

export const notificationsApi = {
  getAll: async (unreadOnly?: boolean) => {
    const query = unreadOnly ? '?unreadOnly=true' : '';
    return fetchApi<any[]>(`/notifications${query}`);
  },

  markAsRead: async (id: string) => {
    return fetchApi(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return fetchApi('/notifications/read-all', {
      method: 'PUT',
    });
  },

  delete: async (id: string) => {
    return fetchApi(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};

export const auditLogsApi = {
  getAll: async (params?: {
    action?: string;
    entityType?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<any[]>(`/audit-logs${query ? `?${query}` : ''}`);
  },
};
