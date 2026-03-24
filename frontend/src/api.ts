import axios from "axios";

const API_URL = "http://localhost:8000";

// AUTH

export const register = async (
  email: string,
  username: string,
  password: string
) => {
  const res = await axios.post(`${API_URL}/auth/register`, {
    email,
    username,
    password,
  });

  return res.data;
};

export const login = async (identifier: string, password: string) => {
  const res = await axios.post(`${API_URL}/auth/login`, {
    email: identifier, // backend принимает как email или username
    password,
  });

  return res.data;
};

export const getMe = async () => {
  const token = localStorage.getItem("access_token");

  const res = await axios.get(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// SCANS

export const getScans = async () => {
  const token = localStorage.getItem("access_token");

  const res = await axios.get(`${API_URL}/scans`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const uploadScan = async (file: File) => {
  const token = localStorage.getItem("access_token");

  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${API_URL}/scans/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const deleteScan = async (scanId: string) => {
  const token = localStorage.getItem("access_token");

  const res = await axios.delete(`${API_URL}/scans/${scanId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const downloadScan = async (scanId: string) => {
  const token = localStorage.getItem("access_token");

  const res = await axios.get(`${API_URL}/scans/${scanId}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });

  return res.data;
};

export const updateScanName = async (scanId: string, newName: string) => {
  const token = localStorage.getItem("access_token");

  const res = await axios.patch(
    `${API_URL}/scans/${scanId}`,
    { new_name: newName },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};