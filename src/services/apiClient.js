const API_BASE_URL = 'http://192.168.100.123:3000';

export const apiClient = {
  async request(path, method = 'GET', body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
      let errorBody = {};
      try {
        errorBody = await res.json();
      } catch {
        // ignore
      }
      throw new Error(errorBody.message || 'Erreur API');
    }

    return res.json();
  },
  get(path, token) {
    return this.request(path, 'GET', null, token);
  },
  post(path, body, token) {
    return this.request(path, 'POST', body, token);
  },
  put(path, body, token) {
    return this.request(path, 'PUT', body, token);
  }
};

