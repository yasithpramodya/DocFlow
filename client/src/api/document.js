import axios from './axios';

export const getInbox = async () => {
    const response = await axios.get('/documents/received');
    return response.data;
};

// Get Outbox (Sent Documents)
export const getOutbox = async () => {
    const response = await axios.get('/documents/sent');
    return response.data;
};

// Create New Document
export const createDocument = async (docData) => {
    const response = await axios.post('/documents', docData);
    return response.data;
};

// Update Document Status (Approve/Reject)
export const updateDocumentStatus = async (id, status, comment) => {
    const response = await axios.put(`/documents/${id}/status`, { status, comment });
    return response.data;
};

// Get Single Document Detail
export const getDocument = async (id) => {
    const response = await axios.get(`/documents/${id}`);
    return response.data;
};

// Forward Document
export const forwardDocument = async (id, receiverEmail, comment) => {
    const response = await axios.put(`/documents/${id}/forward`, { receiverEmail, comment });
    return response.data;
};
