const API_BASE = import.meta.env.VITE_API_BASE_URL

// NEW: Login API call
export const loginAdmin = async (username, password) => {
    const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) throw new Error("Invalid credentials");
    return response.json();
};

export const getSlots = async () => {
    const response = await fetch(`${API_BASE}/slots`);
    if (!response.ok) throw new Error("Failed to fetch slots");
    return response.json();
};

export const registerParticipant = async (data) => {
    const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "Registration failed");
    return result;
};

// UPDATED: Now requires a token
export const getParticipants = async (token) => {
    const response = await fetch(`${API_BASE}/participants`, {
        headers: {
            'Authorization': `Bearer ${token}` // Send token to backend
        }
    });
    
    if (response.status === 401) throw new Error("Unauthorized");
    if (!response.ok) throw new Error("Failed to fetch participants");
    return response.json();
};

export const saveTemplate = async (token, templateData) => {
    const response = await fetch(`${API_BASE}/admin/templates`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(templateData),
    });
    if (!response.ok) throw new Error("Failed to save template");
    return response.json();
};

export const getTemplate = async (token, track) => {
    const response = await fetch(`${API_BASE}/admin/templates/${track}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Failed to fetch template");
    return response.json();
};

export const dispatchEmail = async (token, dispatchData) => {
    const response = await fetch(`${API_BASE}/admin/emails/dispatch`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(dispatchData),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "Failed to dispatch email");
    return result;
};