export const getAuthToken = () => localStorage.getItem('token');
export const getRole = () => localStorage.getItem('role');

export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('visitor_pass_id');
    window.location.href = '/';
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}, isSWD = false) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (isSWD) {
        headers['x-swd-api-key'] = 'secret-swd-api-key';
    } else {
        const token = getAuthToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, { ...options, headers });

    if (response.status === 401 && !isSWD) {
        clearAuth();
        return Promise.reject('Unauthorized');
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    return data;
};