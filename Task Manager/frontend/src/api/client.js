const API_URL = import.meta.env.VITE_API_URL || "/api";

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("ttm_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body
  });

  if (response.status === 401 && onUnauthorized) {
    onUnauthorized();
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = Array.isArray(data.details)
      ? data.details.map((item) => item.message).join(", ")
      : data.message;
    throw new Error(detail || "Request failed");
  }

  return data;
};
