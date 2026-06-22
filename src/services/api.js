const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",

      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

 if (!response.ok) {
  throw new Error(
    data?.error
      ? `${data.message}: ${data.error}`
      : data?.message || "Lỗi kết nối API"
  );
}
  return data;
}

export const api = {
  reportDocument(data) {
  return request("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
},

getReports() {
  return request("/reports");
},

resolveReport(id, data) {
  return request(`/reports/${id}/resolve`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
},
  health() {
    return request("/health");
  },

  getUsers() {
    return request("/users");
  },

  login(email, password) {
    return request("/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });
  },

  register(user) {
    return request("/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: user.fullName,
        email: user.email,
        password: user.password,
      }),
    });
  },

  toggleUserStatus(id) {
    return request(`/users/${id}/toggle`, {
      method: "PUT",
    });
  },

  getDocuments() {
    return request("/documents");
  },

  addDocument(doc) {
    return request("/documents", {
      method: "POST",
      body: JSON.stringify(doc),
    });
  },

  approveDocument(id, data = {}) {
    return request(`/documents/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  rejectDocument(id) {
    return request(`/documents/${id}/reject`, {
      method: "PUT",
    });
  },

  rejectDocumentWithReason(id, data) {
    return request(`/documents/${id}/reject-with-reason`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteDocument(id) {
    return request(`/documents/${id}`, {
      method: "DELETE",
    });
  },

  markAsRead(id, data) {
    return request(`/documents/${id}/read`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  toggleFavorite(id, data) {
    return request(`/documents/${id}/favorite`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  rateDocument(id, data) {
    return request(`/documents/${id}/rate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getActivity() {
    return request("/activity");
  },

  addComment(data) {
    return request("/comments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteComment(id) {
    return request(`/comments/${id}`, {
      method: "DELETE",
    });
  },

  getNotifications(email) {
    return request(`/notifications/${encodeURIComponent(email)}`);
  },

  markNotificationAsRead(id) {
    return request(`/notifications/${id}/read`, {
      method: "PUT",
    });
  },

  saveInteraction(data) {
    return request("/interactions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getRecommendations(email) {
    return request(`/recommendations/${encodeURIComponent(email)}`);
  },

  askChatbot(userEmail, message) {
    return request("/chatbot", {
      method: "POST",
      body: JSON.stringify({
        userEmail,
        message,
      }),
    });
  },

  getHomeSections(email) {
    const query = email ? `?email=${encodeURIComponent(email)}` : "";

    return request(`/home-sections${query}`);
  },

  getDocumentPreview(id) {
    return request(`/documents/${id}/preview`);
  },
};
