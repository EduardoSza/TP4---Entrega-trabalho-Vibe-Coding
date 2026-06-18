const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro de conexão' }));
    throw new Error(error.error || `Erro ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    register: (data: { name: string; email: string; password: string; role: string; registrationNumber?: string; course?: string }) =>
      request<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<any>('/auth/me'),
  },
  dashboard: {
    student: () => request<any>('/dashboard/student'),
    advisor: () => request<any>('/dashboard/advisor'),
  },
  students: {
    list: (params?: string) => request<any[]>(`/students${params ? `?${params}` : ''}`),
    get: (id: string) => request<any>(`/students/${id}`),
    update: (id: string, data: any) =>
      request<any>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  documents: {
    list: (params?: string) => request<any[]>(`/documents${params ? `?${params}` : ''}`),
    upload: (formData: FormData) =>
      request<any>('/documents/upload', { method: 'POST', body: formData }),
    approve: (id: string) =>
      request<any>(`/documents/${id}/approve`, { method: 'PATCH' }),
    reject: (id: string, notes?: string) =>
      request<any>(`/documents/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
      }),
    categories: () => request<string[]>('/documents/categories'),
  },
  companies: {
    list: () => request<any[]>('/companies'),
    get: (id: string) => request<any>(`/companies/${id}`),
    create: (data: any) =>
      request<any>('/companies', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  notifications: {
    list: () => request<any[]>('/notifications'),
    unreadCount: () => request<{ count: number }>('/notifications/unread-count'),
    markRead: (id: string) =>
      request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      request<any>('/notifications/read-all', { method: 'PATCH' }),
  },
};
