const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const isFormData = (value) => typeof FormData !== 'undefined' && value instanceof FormData;

async function request(path, options = {}) {
  const { body, headers = {}, method = 'GET', ...rest } = options;
  const multipart = isFormData(body);

  const config = {
    method,
    credentials: 'include',
    headers: {
      ...(multipart ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...rest,
  };

  if (body !== undefined && body !== null) {
    config.body = multipart ? body : JSON.stringify(body);
  }

  if (multipart) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || 'Something went wrong. Please try again.';
    throw new Error(message);
  }

  return data;
}

export default {
  get: (path, options) => request(path, { method: 'GET', ...options }),
  post: (path, body, options) => request(path, { method: 'POST', body, ...options }),
  put: (path, body, options) => request(path, { method: 'PUT', body, ...options }),
  delete: (path, options) => request(path, { method: 'DELETE', ...options }),
};

